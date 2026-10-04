import { cache } from "react";
import { createRegistry } from "@/lib/api";
import { getEnabledSports } from "@/lib/api/sports";
import { SportsApiError } from "@/lib/api/error";
import {
  isLiveMatch,
  deriveTeamsFromMatches,
  deriveLeaguesFromMatches,
} from "./snapshot-helpers";
import type { GetMatchesParams } from "@/lib/api/types";
import type { League, Match, Team } from "@/lib/types/sports";

export { isLiveMatch, rankFeaturedLeagues, rankFeaturedTeams } from "./snapshot-helpers";

/**
 * Canonical sports data source for VELOR.
 *
 * Every page (homepage, /live, /matches, /teams, /leagues, /sports) must
 * derive its numbers from `getSportsSnapshot()` instead of maintaining
 * independent provider calls and hardcoded counters.
 *
 * Snapshot shape:
 *   matches     — union of each provider's live endpoint + general fixtures
 *                 endpoint, deduped by match id (the canonical dataset)
 *   liveMatches — matches.filter(isLiveMatch) — the SAME array /live and
 *                 /matches derive their live counts from
 *   leagues     — direct provider leagues, with fallback derivation from
 *                 matches when a provider returns none
 *   teams       — direct provider teams, with fallback derivation from
 *                 matches (cricket/tennis providers return [] for getTeams()
 *                 unless a search query is given — without the fallback the
 *                 /teams page would wrongly report "NO TEAMS FOUND")
 *   perSport    — per-sport availability so unavailable sports can be
 *                 communicated honestly instead of showing fake zeros
 */

export type SportSyncState = "ok" | "unavailable" | "misconfigured";

export interface PerSportSync {
  sportId: string;
  sportName: string;
  state: SportSyncState;
  /** Machine-readable failure kind for honest messaging (TIMEOUT, AUTH_FAILURE, RATE_LIMIT, ...). */
  errorKind?: string;
  matchCount: number;
  liveCount: number;
}

export interface SportsSnapshotStats {
  liveMatches: number;
  matches: number;
  leagues: number;
  teams: number;
}

export interface SportsSnapshot {
  matches: Match[];
  liveMatches: Match[];
  leagues: League[];
  teams: Team[];
  /** True when teams were derived from match participants (provider returned none). */
  teamsDerivedFromMatches: boolean;
  /** True when leagues were derived from matches (provider returned none). */
  leaguesDerivedFromMatches: boolean;
  perSport: PerSportSync[];
  /** Sports whose match data could not be loaded. */
  unavailableSports: { id: string; name: string; errorKind?: string }[];
  /** True when the server is missing API configuration (no fake data is substituted). */
  misconfigured: boolean;
  /** True when at least one sport failed but others succeeded. */
  degraded: boolean;
  /** True when at least one sport returned data. */
  hasAnySuccess: boolean;
  stats: SportsSnapshotStats;
  /** ISO timestamp of when this snapshot was assembled (last successful sync). */
  syncedAt: string;
}

function classifyError(error: unknown): { state: SportSyncState; errorKind?: string } {
  if (error instanceof SportsApiError) {
    return { state: "unavailable", errorKind: error.meta.kind };
  }
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("VELOR_API_SPORTS_KEY")) {
    return { state: "misconfigured" };
  }
  if (message.includes("RATE_LIMIT")) {
    return { state: "unavailable", errorKind: "RATE_LIMIT" };
  }
  if (message.includes("AUTH_FAILURE")) {
    return { state: "unavailable", errorKind: "AUTH_FAILURE" };
  }
  if (message.includes("TIMEOUT")) {
    return { state: "unavailable", errorKind: "TIMEOUT" };
  }
  if (message.includes("MALFORMED_RESPONSE")) {
    return { state: "unavailable", errorKind: "MALFORMED_RESPONSE" };
  }
  const apiError = message.match(/API_ERROR:(\d+)/);
  if (apiError) {
    return { state: "unavailable", errorKind: `API_ERROR_${apiError[1]}` };
  }
  return { state: "unavailable", errorKind: "UNKNOWN" };
}

function emptySnapshot(reason: "misconfigured" | "unavailable", syncedAt: string): SportsSnapshot {
  return {
    matches: [],
    liveMatches: [],
    leagues: [],
    teams: [],
    teamsDerivedFromMatches: false,
    leaguesDerivedFromMatches: false,
    perSport: [],
    unavailableSports: [],
    misconfigured: reason === "misconfigured",
    degraded: false,
    hasAnySuccess: false,
    stats: { liveMatches: 0, matches: 0, leagues: 0, teams: 0 },
    syncedAt,
  };
}

/**
 * Fetch the canonical snapshot. React `cache()` dedupes concurrent calls
 * within a single request so homepage hero, ticker, and sections — which
 * render in separate Suspense boundaries — all see identical numbers.
 */
export const getSportsSnapshot = cache(
  async (filters?: GetMatchesParams): Promise<SportsSnapshot> => {
    const syncedAt = new Date().toISOString();

    let registry: ReturnType<typeof createRegistry>;
    try {
      registry = createRegistry();
    } catch (error) {
      const classified = classifyError(error);
      const snapshot = emptySnapshot(
        classified.state === "misconfigured" ? "misconfigured" : "unavailable",
        syncedAt
      );
      return snapshot;
    }

    const allSports = getEnabledSports();
    const sports =
      filters?.sport != null
        ? allSports.filter((s) => s.id === filters.sport)
        : allSports;

    // Unknown/unsupported sport filter: return an empty (but honest) snapshot
    // rather than leaking another sport's data into the filtered view.
    if (filters?.sport != null && sports.length === 0) {
      return {
        ...emptySnapshot("unavailable", syncedAt),
        perSport: [],
      };
    }

    const matches: Match[] = [];
    const leagues: League[] = [];
    const directTeams: Team[] = [];
    const perSport: PerSportSync[] = [];
    const unavailableSports: SportsSnapshot["unavailableSports"] = [];
    let misconfigured = false;
    let partialFailure = false;

    const results = await Promise.allSettled(
      sports.map(async (sport) => {
        const provider = registry.getProvider(sport.id);
        // Union of the live endpoint AND the general fixtures endpoint.
        // Some providers only return data from one of them (e.g. football's
        // general fixtures endpoint needs date/league params while
        // ?live=all works unauthenticated-param-free). The union — deduped
        // by match id — is the canonical dataset every page derives from,
        // so no page can disagree about live counts again.
        const [liveResult, matchesResult, leaguesResult, teamsResult] = await Promise.allSettled([
          provider.getLiveMatches(),
          provider.getMatches(filters),
          provider.getLeagues(),
          provider.getTeams(),
        ]);
        return { sport, liveResult, matchesResult, leaguesResult, teamsResult };
      })
    );

    for (const result of results) {
      if (result.status === "rejected") {
        const classified = classifyError(result.reason);
        if (classified.state === "misconfigured") misconfigured = true;
        // Sport id/name unknown here (whole sport fetch rejected); record below via index fallback.
        unavailableSports.push({
          id: "unknown",
          name: "Unknown sport",
          errorKind: classified.errorKind,
        });
        perSport.push({
          sportId: "unknown",
          sportName: "Unknown sport",
          state: classified.state,
          errorKind: classified.errorKind,
          matchCount: 0,
          liveCount: 0,
        });
        continue;
      }

      const { sport, liveResult, matchesResult, leaguesResult, teamsResult } = result.value;

      // Merge live + general fixtures, deduped by id (live endpoint wins).
      const sportMatches = new Map<string, Match>();
      if (matchesResult.status === "fulfilled") {
        for (const m of matchesResult.value) sportMatches.set(m.id, m);
      }
      if (liveResult.status === "fulfilled") {
        for (const m of liveResult.value) sportMatches.set(m.id, m);
      }
      // Providers filter inconsistently (some ignore teamId/leagueId/date,
      // live endpoints ignore every filter), so enforce the requested
      // filters in-memory on the union. This keeps filtered views
      // (/matches?status=finished, ?teamId=…, ?date=…) consistent.
      let sportMatchList = Array.from(sportMatches.values());
      if (filters?.status === "live") {
        sportMatchList = sportMatchList.filter(isLiveMatch);
      } else if (filters?.status) {
        sportMatchList = sportMatchList.filter((m) => m.status === filters.status);
      }
      if (filters?.teamId) {
        sportMatchList = sportMatchList.filter(
          (m) => m.homeTeam.id === filters.teamId || m.awayTeam.id === filters.teamId
        );
      }
      if (filters?.leagueId) {
        sportMatchList = sportMatchList.filter((m) => m.league.id === filters.leagueId);
      }
      if (filters?.date) {
        const target = new Date(filters.date).toDateString();
        sportMatchList = sportMatchList.filter(
          (m) => m.startTime && new Date(m.startTime).toDateString() === target
        );
      }

      const liveOk = liveResult.status === "fulfilled";
      const matchesOk = matchesResult.status === "fulfilled";

      if (liveOk || matchesOk) {
        // Endpoints succeeded — even if filters leave zero matches, that is
        // an honest empty result, NOT an unavailable sport.
        matches.push(...sportMatchList);
        perSport.push({
          sportId: sport.id,
          sportName: sport.name,
          state: "ok",
          matchCount: sportMatchList.length,
          liveCount: sportMatchList.filter(isLiveMatch).length,
        });
        if (!liveOk || !matchesOk) {
          // One endpoint failed — dataset for this sport is partial.
          partialFailure = true;
        }
      } else {
        // Neither endpoint returned matches: figure out why for honest messaging.
        const failure =
          matchesResult.status === "rejected"
            ? matchesResult.reason
            : liveResult.status === "rejected"
              ? liveResult.reason
              : new Error("EMPTY_RESPONSE");
        const classified = classifyError(failure);
        if (classified.state === "misconfigured") misconfigured = true;
        unavailableSports.push({
          id: sport.id,
          name: sport.name,
          errorKind: classified.errorKind,
        });
        perSport.push({
          sportId: sport.id,
          sportName: sport.name,
          state: classified.state,
          errorKind: classified.errorKind,
          matchCount: 0,
          liveCount: 0,
        });
      }

      if (leaguesResult.status === "fulfilled") {
        leagues.push(...leaguesResult.value);
      } else {
        partialFailure = true;
      }
      if (teamsResult.status === "fulfilled") {
        directTeams.push(...teamsResult.value);
      } else {
        partialFailure = true;
      }
    }

    // Dedupe leagues across providers.
    const leagueMap = new Map<string, League>();
    for (const league of leagues) {
      if (!leagueMap.has(league.id)) leagueMap.set(league.id, league);
    }
    let finalLeagues = Array.from(leagueMap.values());
    let leaguesDerivedFromMatches = false;
    if (finalLeagues.length === 0 && matches.length > 0) {
      finalLeagues = deriveLeaguesFromMatches(matches);
      leaguesDerivedFromMatches = true;
    }

    // Dedupe direct teams; fall back to match participants so /teams never
    // reports "NO TEAMS FOUND" while /matches clearly contains teams.
    const teamMap = new Map<string, Team>();
    for (const team of directTeams) {
      if (!teamMap.has(team.id)) teamMap.set(team.id, team);
    }
    let finalTeams = Array.from(teamMap.values());
    let teamsDerivedFromMatches = false;
    if (finalTeams.length === 0 && matches.length > 0) {
      finalTeams = deriveTeamsFromMatches(matches);
      teamsDerivedFromMatches = true;
    }

    const liveMatches = matches.filter(isLiveMatch);
    const hasAnySuccess = perSport.some((s) => s.state === "ok");

    return {
      matches,
      liveMatches,
      leagues: finalLeagues,
      teams: finalTeams,
      teamsDerivedFromMatches,
      leaguesDerivedFromMatches,
      perSport,
      unavailableSports,
      misconfigured,
      degraded: (unavailableSports.length > 0 || partialFailure) && hasAnySuccess,
      hasAnySuccess,
      stats: {
        liveMatches: liveMatches.length,
        matches: matches.length,
        leagues: finalLeagues.length,
        teams: finalTeams.length,
      },
      syncedAt,
    };
  }
);
