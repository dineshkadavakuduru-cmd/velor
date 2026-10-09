import type { League, Match, Team } from "@/lib/types/sports";
import type { GetMatchesParams } from "@/lib/api/types";
import { SportsApiError } from "@/lib/api/error";

/**
 * Pure derivation helpers for the canonical sports snapshot.
 * Kept free of React/Next imports so they can be unit-tested in isolation.
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

/** One provider call outcome, mirroring Promise.allSettled entries. */
export type Settled<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

/** Resolved per-sport provider outputs ready for pure assembly. */
export interface SportFetchInput {
  sportId: string;
  sportName: string;
  liveResult: Settled<Match[]>;
  fixturesResult: Settled<Match[]>;
  leaguesResult: Settled<League[]>;
  teamsResult: Settled<Team[]>;
}

export function classifyError(error: unknown): { state: SportSyncState; errorKind?: string } {
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

export function emptySnapshot(reason: "misconfigured" | "unavailable", syncedAt: string): SportsSnapshot {
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

export function isLiveMatch(match: Match): boolean {
  return match.status === "live" || match.status === "halftime";
}

/**
 * Guard for the /live client poller: never replace a fuller good list with a
 * thinner degraded one. A degraded 200 response means at least one provider
 * failed — a thin/empty payload then describes the failure, not the world.
 * Trust an empty list only when every provider succeeded (degraded === false),
 * i.e. matches genuinely ended.
 */
export function shouldAcceptLivePayload(
  prevLiveCount: number,
  nextLiveCount: number,
  degraded: boolean
): boolean {
  if (!degraded) return true;
  return nextLiveCount >= prevLiveCount;
}

export function deriveTeamsFromMatches(matches: Match[]): Team[] {
  const unique = new Map<string, Team>();
  for (const match of matches) {
    for (const team of [match.homeTeam, match.awayTeam]) {
      if (!unique.has(team.id)) {
        unique.set(team.id, {
          ...team,
          sportId: team.sportId ?? match.sport.id,
        });
      }
    }
  }
  return Array.from(unique.values());
}

export function deriveLeaguesFromMatches(matches: Match[]): League[] {
  const unique = new Map<string, League>();
  for (const match of matches) {
    if (!unique.has(match.league.id)) {
      unique.set(match.league.id, match.league);
    }
  }
  return Array.from(unique.values());
}

/**
 * "Featured" ranking: leagues ordered by live activity first, then total
 * match involvement. Replaces hardcoded "popular league" lists with an
 * honest, data-driven order.
 */
export function rankFeaturedLeagues(leagues: League[], matches: Match[], limit = 6): League[] {
  const liveByLeague = new Map<string, number>();
  const totalByLeague = new Map<string, number>();
  for (const match of matches) {
    totalByLeague.set(match.league.id, (totalByLeague.get(match.league.id) ?? 0) + 1);
    if (isLiveMatch(match)) {
      liveByLeague.set(match.league.id, (liveByLeague.get(match.league.id) ?? 0) + 1);
    }
  }
  return [...leagues]
    .sort((a, b) => {
      const liveDiff = (liveByLeague.get(b.id) ?? 0) - (liveByLeague.get(a.id) ?? 0);
      if (liveDiff !== 0) return liveDiff;
      return (totalByLeague.get(b.id) ?? 0) - (totalByLeague.get(a.id) ?? 0);
    })
    .slice(0, limit);
}

export function rankFeaturedTeams(teams: Team[], matches: Match[], limit = 8): Team[] {
  const liveByTeam = new Map<string, number>();
  const totalByTeam = new Map<string, number>();
  for (const match of matches) {
    const live = isLiveMatch(match) ? 1 : 0;
    for (const team of [match.homeTeam, match.awayTeam]) {
      totalByTeam.set(team.id, (totalByTeam.get(team.id) ?? 0) + 1);
      if (live) liveByTeam.set(team.id, (liveByTeam.get(team.id) ?? 0) + 1);
    }
  }
  return [...teams]
    .sort((a, b) => {
      const liveDiff = (liveByTeam.get(b.id) ?? 0) - (liveByTeam.get(a.id) ?? 0);
      if (liveDiff !== 0) return liveDiff;
      return (totalByTeam.get(b.id) ?? 0) - (totalByTeam.get(a.id) ?? 0);
    })
    .slice(0, limit);
}

/**
 * Pure assembly of the canonical snapshot from resolved per-sport provider
 * outputs. This is THE single place where matches, liveMatches, leagues,
 * teams, stats, and availability are derived — every page consumes its
 * result, so pages cannot disagree with each other.
 */
export function assembleSnapshot(
  inputs: SportFetchInput[],
  filters: GetMatchesParams | undefined,
  syncedAt: string
): SportsSnapshot {
  const matches: Match[] = [];
  const leagues: League[] = [];
  const directTeams: Team[] = [];
  const perSport: PerSportSync[] = [];
  const unavailableSports: SportsSnapshot["unavailableSports"] = [];
  let misconfigured = false;
  let partialFailure = false;
  // Global id registry: match ids must be unique across the whole dataset.
  // Providers use independent id spaces (and mock/fallback providers repeat
  // the same fixtures per sport), so without this the same id would be
  // counted once per sport — inflating totals with unaddressable duplicates
  // (/match/[id] can only resolve one entity per id). First sport wins;
  // per-sport counters below reflect actual dataset contribution so every
  // number on every page adds up.
  const seenMatchIds = new Set<string>();

  for (const input of inputs) {
    const { sportId, sportName, liveResult, fixturesResult, leaguesResult, teamsResult } = input;

    // Merge live + general fixtures, deduped by id (live endpoint wins).
    const sportMatches = new Map<string, Match>();
    if (fixturesResult.status === "fulfilled") {
      for (const m of fixturesResult.value) sportMatches.set(m.id, m);
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
    const matchesOk = fixturesResult.status === "fulfilled";

    if (liveOk || matchesOk) {
      // Endpoints succeeded — even if filters leave zero matches, that is
      // an honest empty result, NOT an unavailable sport.
      // Global dedupe: skip ids already contributed by another sport.
      const contributed = sportMatchList.filter((m) => {
        if (seenMatchIds.has(m.id)) return false;
        seenMatchIds.add(m.id);
        return true;
      });
      matches.push(...contributed);
      perSport.push({
        sportId,
        sportName,
        state: "ok",
        matchCount: contributed.length,
        liveCount: contributed.filter(isLiveMatch).length,
      });
      if (!liveOk || !matchesOk) {
        // One endpoint failed — dataset for this sport is partial.
        partialFailure = true;
      }
    } else {
      // Neither endpoint returned matches: figure out why for honest messaging.
      const failure =
        fixturesResult.status === "rejected"
          ? fixturesResult.reason
          : liveResult.status === "rejected"
            ? liveResult.reason
            : new Error("EMPTY_RESPONSE");
      const classified = classifyError(failure);
      if (classified.state === "misconfigured") misconfigured = true;
      unavailableSports.push({
        id: sportId,
        name: sportName,
        errorKind: classified.errorKind,
      });
      perSport.push({
        sportId,
        sportName,
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
