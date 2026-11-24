import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Last-known-good fallback store ("stale-while-error").
 *
 * Every upstream provider fetch goes through `fetchWithLastGood`:
 *
 *   SUCCESS          -> record payload in an in-memory store, except for
 *                       empty arrays (never cache "the world is empty")
 *                       when a previous good payload already exists.
 *   FAILURE          -> if a last-known-good payload exists and is fresh
 *                       enough, serve it and record the endpoint in the
 *                       request-local stale collector so the snapshot and
 *                       UI can honestly say "showing last-known data".
 *                      If no fallback exists, the original error rethrows.
 *
 * The store is keyed by provider + endpoint and holds ONLY successful
 * payloads, so an error response can never enter (or pollute) any cache.
 * API keys travel in headers, never in the endpoint key.
 *
 * Stale recording uses a request-local AsyncLocalStorage context, so
 * concurrent snapshot requests cannot mark each other stale.
 */

interface LastGoodEntry {
  data: unknown;
  storedAt: number;
}

const store = new Map<string, LastGoodEntry>();
const liveRequests = new Map<string, Promise<LastGoodEntry>>();
export const LIVE_CACHE_SECONDS = 60;

/** In-memory cache TTL for last-known-good payloads. */
export const LAST_GOOD_MAX_AGE_MS =
  Number(process.env.VELOR_LAST_GOOD_MAX_AGE_MS) || 6 * 60 * 60 * 1000;

/**
 * A cached empty payload describes "no data right now", which is valid live
 * information — but overwriting a good payload with an empty one, or seeding
 * the fallback store with an empty result, would bake "empty" into every
 * later degraded response. Empty arrays are therefore not cached; a payload
 * with content always is.
 */
function isWorthCaching(data: unknown): boolean {
  if (Array.isArray(data)) return data.length > 0;
  if (data && typeof data === "object") return true;
  return data != null;
}

export interface LastGoodFetchOptions<T> {
  /** Provider identifier, e.g. "ApiSportsProvider". */
  provider: string;
  /** Endpoint URL (contains no secrets — keys travel in headers). */
  endpoint: string;
  /** The actual (timeout/retry-augmented) upstream fetch. */
  run: () => Promise<T>;
  /** How long a fallback payload stays servable. */
  maxAgeMs?: number;
  /** Opt-in, blocking expiry for mutable scores; callers must bypass Next's fetch cache. */
  freshForMs?: number;
}

export async function fetchWithLastGood<T>(options: LastGoodFetchOptions<T>): Promise<T> {
  const key = `${options.provider}:${options.endpoint}`;
  if (options.freshForMs !== undefined) {
    const previous = store.get(key);
    if (previous && Date.now() - previous.storedAt < options.freshForMs) {
      observations.getStore()?.set(key, previous.storedAt);
      return previous.data as T;
    }
    let pending = liveRequests.get(key);
    if (!pending) {
      pending = Promise.resolve().then(async () => {
        const entry = { data: await options.run(), storedAt: Date.now() };
        store.set(key, entry);
        return entry;
      }).finally(() => liveRequests.delete(key));
      liveRequests.set(key, pending);
    }
    try {
      const entry = await pending;
      observations.getStore()?.set(key, entry.storedAt);
      return entry.data as T;
    } catch (error) {
      if (!previous || Date.now() - previous.storedAt > (options.maxAgeMs ?? LAST_GOOD_MAX_AGE_MS)) throw error;
      staleCollector.getStore()?.add(key);
      observations.getStore()?.set(key, previous.storedAt);
      return previous.data as T;
    }
  }
  try {
    const data = await options.run();
    if (isWorthCaching(data)) {
      store.set(key, { data, storedAt: Date.now() });
    }
    return data;
  } catch (error) {
    const entry = store.get(key);
    if (entry && Date.now() - entry.storedAt <= (options.maxAgeMs ?? LAST_GOOD_MAX_AGE_MS)) {
      staleCollector.getStore()?.add(key);
      return entry.data as T;
    }
    throw error;
  }
}

const staleCollector = new AsyncLocalStorage<Set<string>>();
const observations = new AsyncLocalStorage<Map<string, number>>();

/**
 * Collect endpoint keys served from the last-good fallback **within this
 * request only**. Runs fetches in an AsyncLocalStorage context so
 * concurrent requests are isolated from each other.
 */
export function runWithStaleCollection<T>(store: Set<string>, fn: () => Promise<T>, observed?: Map<string, number>): Promise<T> {
  return observed ? observations.run(observed, () => staleCollector.run(store, fn)) : staleCollector.run(store, fn);
}

// --- Test hooks (not used by application code) -----------------------------

export function __resetLastGoodStore(): void {
  store.clear();
}

export function __lastGoodStoreSize(): number {
  return store.size;
}

export function __peekLastGood(key: string): LastGoodEntry | undefined {
  return store.get(key);
}

export function __setLastGoodForTest(key: string, data: unknown, storedAt: number): void {
  store.set(key, { data, storedAt });
}
