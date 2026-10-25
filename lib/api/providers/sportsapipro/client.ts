import { buildSportsApiError, SportsApiError } from "../../error";
import { fetchWithLastGood } from "../../last-good";
import type { SportsApiProEvent, SportsApiProSearchResult } from "./types";

const REQUEST_TIMEOUT_MS = 10000;
const RETRY_BASE_DELAY_MS = 1000;

export interface SportsApiProClientOptions {
  /** Root host, e.g. `https://v2.football.sportsapipro.com`. */
  baseUrl: string;
  /** Provider identifier used in diagnostics and the last-good store. */
  providerName: string;
}

/** Build a full API-Sports Pro URL (`<baseUrl>/api<path>`). */
export function sportsApiProUrl(baseUrl: string, path: string): string {
  return `${baseUrl}/api${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Stale-while-error aware upstream fetch for API-Sports Pro.
 *
 * Auth is the `x-api-key` header (never in the URL, so endpoint keys in the
 * last-good store stay secret-free). 401/403 => AUTH_FAILURE, 429 =>
 * RATE_LIMIT, non-2xx => API_ERROR:<status>, unparseable body =>
 * MALFORMED_RESPONSE.
 */
export async function sportsApiProFetch<T>(
  options: SportsApiProClientOptions,
  path: string,
  apiKey: string,
  revalidate?: number
): Promise<T> {
  const url = sportsApiProUrl(options.baseUrl, path);
  return fetchWithLastGood<T>({
    provider: options.providerName,
    endpoint: url,
    run: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          headers: { "x-api-key": apiKey },
          cache: revalidate === 0 ? "no-store" : undefined,
          next: revalidate !== undefined && revalidate > 0 ? { revalidate } : undefined,
          signal: controller.signal,
        });

        if (res.status === 429) throw new Error("RATE_LIMIT");
        if (res.status === 401 || res.status === 403) throw new Error("AUTH_FAILURE");
        if (!res.ok) throw new Error(`API_ERROR:${res.status}`);

        try {
          return (await res.json()) as T;
        } catch {
          throw new Error("MALFORMED_RESPONSE");
        }
      } catch (error) {
        throw buildSportsApiError(options.providerName, url, error);
      } finally {
        clearTimeout(timeoutId);
      }
    },
  });
}

/** Retry transient failures; never retry auth, rate-limit, malformed, or 4xx errors. */
export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      if (shouldNotRetry(error)) break;
      await new Promise((resolve) => setTimeout(resolve, RETRY_BASE_DELAY_MS * (attempt + 1)));
    }
  }
  throw lastError;
}

function shouldNotRetry(error: unknown): boolean {
  if (error instanceof SportsApiError) {
    const { kind, status } = error.meta;
    if (kind === "RATE_LIMIT" || kind === "AUTH_FAILURE" || kind === "MALFORMED_RESPONSE") return true;
    return typeof status === "number" && status >= 400 && status < 500;
  }
  const message = error instanceof Error ? error.message : String(error);
  if (message === "RATE_LIMIT" || message === "AUTH_FAILURE" || message === "MALFORMED_RESPONSE") return true;
  if (message.startsWith("API_ERROR:")) {
    const status = parseInt(message.split(":")[1] ?? "0", 10);
    return status >= 400 && status < 500;
  }
  return false;
}

/** Pull the event array out of `{ events }`, `{ data: { events } }`, or `{ response }`. */
export function extractEvents(data: unknown): SportsApiProEvent[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.events)) return obj.events as SportsApiProEvent[];
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    const inner = obj.data as Record<string, unknown>;
    if (Array.isArray(inner.events)) return inner.events as SportsApiProEvent[];
  }
  if (Array.isArray(obj.response)) return obj.response as SportsApiProEvent[];
  return [];
}

/** Pull the search result array out of `{ data: { results } }` (or `{ results }`). */
export function extractSearchResults(data: unknown): SportsApiProSearchResult[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    const inner = obj.data as Record<string, unknown>;
    if (Array.isArray(inner.results)) return inner.results as SportsApiProSearchResult[];
  }
  if (Array.isArray(obj.results)) return obj.results as SportsApiProSearchResult[];
  return [];
}

/**
 * Read `key` from `{ data: { <key>: … } }`, falling back to the top level.
 * By-id endpoints nest the entity under `data` (e.g. `data.event`,
 * `data.team`, `data.uniqueTournament`); `/live` and `/today` are flat.
 */
export function extractEntity<T>(data: unknown, key: string): T | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const inner = obj.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    const value = (inner as Record<string, unknown>)[key];
    if (value && typeof value === "object") return value as T;
  }
  const direct = obj[key];
  if (direct && typeof direct === "object") return direct as T;
  return null;
}
