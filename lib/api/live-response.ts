import type { SportsSnapshot } from "./snapshot-helpers";

/**
 * Response contract for /api/live-matches (the /live poller's data source).
 *
 * Pure and side-effect free so the honesty rules can be unit-tested without a
 * Next.js request context:
 *   200 — data (possibly partial; see `degraded` / `unavailableSports`)
 *   503 — no sport returned data (every provider failed)
 *   500 — misconfigured server (real-API mode without an API key)
 *
 * The payload always reflects the canonical snapshot's live matches — the same
 * numbers the /live page, homepage hero, and /matches render — so the poller
 * can never disagree with the server-rendered pages.
 */
export interface LiveMatchesPayload {
  matches: SportsSnapshot["liveMatches"];
  syncedAt: string;
  degraded: boolean;
  unavailableSports: SportsSnapshot["unavailableSports"];
  error?: string;
  message?: string;
}

export interface LiveMatchesResponse {
  status: number;
  body: LiveMatchesPayload;
}

export function buildLiveMatchesResponse(snapshot: SportsSnapshot): LiveMatchesResponse {
  if (snapshot.misconfigured && !snapshot.hasAnySuccess) {
    return {
      status: 500,
      body: {
        matches: [],
        syncedAt: snapshot.syncedAt,
        degraded: false,
        unavailableSports: snapshot.unavailableSports,
        error: "SPORTS_DATA_MISCONFIGURED",
        message: "Real API mode is requested but the API key is not configured on the server.",
      },
    };
  }

  if (!snapshot.hasAnySuccess) {
    return {
      status: 503,
      body: {
        matches: [],
        syncedAt: snapshot.syncedAt,
        degraded: false,
        unavailableSports: snapshot.unavailableSports,
        error: "SPORTS_DATA_UNAVAILABLE",
        message: "Live match data could not be loaded from any sport.",
      },
    };
  }

  return {
    status: 200,
    body: {
      matches: snapshot.liveMatches,
      syncedAt: snapshot.syncedAt,
      degraded: snapshot.degraded,
      unavailableSports: snapshot.unavailableSports,
    },
  };
}
