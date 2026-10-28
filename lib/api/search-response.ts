import type { SearchResult } from "@/lib/types/sports";
import { classifyError } from "./availability";
import { matchSports } from "./sports";

/**
 * Response contract for /api/search (the command palette and /search page).
 *
 * Pure and side-effect free so the search-scope rules can be unit-tested
 * without a Next.js request context:
 *
 *  - Supported targets are teams, players, leagues, matches, and sports.
 *    A sport name resolves to a real destination (`/matches?sport=<id>`)
 *    instead of relying on provider entity search, which never returns a
 *    sport as an entity — that is why a plain "tennis" query looked empty.
 *  - A provider failure never blanks the palette. Failed sports are reported
 *    in `unavailableSports` so the UI can say which sources were not searched
 *    instead of implying "no such team/league/match exists".
 *  - No fabricated entities are produced: every result comes from a provider
 *    payload or from the static sport registry.
 */
export interface SearchUnavailableSource {
  id: string;
  name: string;
  errorKind?: string;
}

export interface SearchPayload {
  query: string;
  results: SearchResult[];
  total: number;
  /** Sports whose provider could not be searched for this query. */
  unavailableSports: SearchUnavailableSource[];
}

/** One provider's search outcome, mirroring Promise.allSettled entries. */
export interface SearchSourceOutcome {
  sportId: string;
  sportName: string;
  status: "fulfilled" | "rejected";
  results?: SearchResult[];
  reason?: unknown;
}

export const MIN_SEARCH_QUERY_LENGTH = 2;

/** Canonical destination for a sport result — the filtered match browser. */
export function sportSearchHref(sportId: string): string {
  return `/matches?sport=${encodeURIComponent(sportId)}`;
}

export function buildSearchPayload(query: string, outcomes: SearchSourceOutcome[]): SearchPayload {
  const trimmed = query.trim();
  if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
    return { query: trimmed, results: [], total: 0, unavailableSports: [] };
  }

  const unavailableSports: SearchUnavailableSource[] = outcomes
    .filter((outcome) => outcome.status === "rejected")
    .map((outcome) => ({
      id: outcome.sportId,
      name: outcome.sportName,
      errorKind: classifyError(outcome.reason).errorKind,
    }));
  const unavailableIds = new Set(unavailableSports.map((sport) => sport.id));

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  // Sport targets first: they are the direct answer to a query like "tennis".
  for (const sport of matchSports(trimmed)) {
    const key = `sport:${sport.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({
      type: "sport",
      id: sport.id,
      name: sport.name,
      subtitle: unavailableIds.has(sport.id)
        ? "Sport · live data unavailable"
        : "Sport · browse matches",
      href: sportSearchHref(sport.id),
    });
  }

  for (const outcome of outcomes) {
    if (outcome.status !== "fulfilled" || !outcome.results) continue;
    for (const item of outcome.results) {
      const key = `${item.type}:${item.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(item);
    }
  }

  return { query: trimmed, results, total: results.length, unavailableSports };
}
