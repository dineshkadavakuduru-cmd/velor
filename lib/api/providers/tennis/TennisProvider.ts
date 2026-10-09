import type { SportsProvider, GetMatchesParams, Match, League, Team, Player, Standing, MatchEvent, MatchStatistics, MatchLineup, SearchResult, GetMatchEventsParams, GetMatchStatisticsParams, GetMatchLineupsParams, SearchParams } from "../../types";
import { normalizeTennisMatch, normalizeTennisLeague, normalizeTennisTeam } from "./normalize";
import { buildSportsApiError, SportsApiError } from "@/lib/api/error";

const BASE_URL = "https://v2.tennis.sportsapipro.com";
const PROVIDER_NAME = "TennisProvider";

function api(path: string): string {
  return `${BASE_URL}/api${path.startsWith("/") ? path : `/${path}`}`;
}

interface TennisEvent {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    shortName?: string;
    ranking?: number | null;
    country?: { alpha2: string; name: string } | null;
    sport?: { id: number; name: string; slug: string } | null;
    type?: number;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName?: string;
    ranking?: number | null;
    country?: { alpha2: string; name: string } | null;
  };
  homeScore: {
    current: number | null;
    display: number | null;
    period1?: number | null;
    period2?: number | null;
    period3?: number | null;
    period4?: number | null;
    period5?: number | null;
    period1TieBreak?: number | null;
    point?: string | null;
  };
  awayScore: {
    current: number | null;
    display: number | null;
    period1?: number | null;
    period2?: number | null;
    period3?: number | null;
    period4?: number | null;
    period5?: number | null;
    period1TieBreak?: number | null;
    point?: string | null;
  };
  firstToServe?: number | null;
  groundType?: string | null;
  status: { code: number; type: string; description: string };
  tournament?: { name: string; slug: string; uniqueTournament?: { id: number | string } | null } | null;
  startTimestamp: number | null;
}

interface TennisMatchDetail {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    shortName?: string;
    ranking?: number | null;
    country?: { alpha2: string; name: string } | null;
    sport?: { id: number; name: string; slug: string } | null;
    type?: number;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName?: string;
    ranking?: number | null;
    country?: { alpha2: string; name: string } | null;
  };
  homeScore: {
    current: number | null;
    display: number | null;
    period1?: number | null;
    period2?: number | null;
    period3?: number | null;
    period4?: number | null;
    period5?: number | null;
    period1TieBreak?: number | null;
    point?: string | null;
  };
  awayScore: {
    current: number | null;
    display: number | null;
    period1?: number | null;
    period2?: number | null;
    period3?: number | null;
    period4?: number | null;
    period5?: number | null;
    period1TieBreak?: number | null;
    point?: string | null;
  };
  firstToServe?: number | null;
  groundType?: string | null;
  status: { code: number; type: string; description: string };
  tournament?: { name: string; slug: string; uniqueTournament?: { id: number | string } | null } | null;
  startTimestamp: number | null;
  round?: string | null;
  roundCode?: string | null;
}

interface TennisLeagueInfo {
  id: number;
  name: string;
  country?: { id: number; name: string; alpha2: string } | null;
  logo?: string | null;
  uniqueTournament?: { id: number; name: string } | null;
}

interface TennisTeamInfo {
  id: number;
  name: string;
  shortName?: string;
  country?: { id: number; name: string; alpha2: string } | null;
  logo?: string | null;
  ranking?: number | null;
}

interface TennisSearchResponse {
  events?: Array<{ id: number; homeTeam: { id: number; name: string }; awayTeam: { id: number; name: string }; tournament?: { name: string; uniqueTournament?: { id: number | string } | null } | null }>;
  teams?: Array<{ id: number; name: string; shortName?: string; country?: { name: string; alpha2: string } | null }>;
  tournaments?: Array<{ id: number; name: string; country?: { name: string } | null; uniqueTournament?: { id: number } | null }>;
}

interface TennisRankingResponse {
  data?: {
    rankings?: Array<{
      rowName: string;
      rank: number;
      points?: number;
      country?: { alpha2: string; name: string } | null;
      movement?: string | null;
    }>;
  } | null;
}

interface TennisStatisticsResponse {
  data?: Array<{
    team_id: number;
    team_name: string;
    statistics: Array<{ type: string; value: number | string | null }>;
  }> | null;
}

interface TennisPointByPointResponse {
  data?: Array<{
    seq: number;
    set: number;
    game: number;
    number: number;
    score?: { sets: number[]; games: number[] } | null;
    server: number | null;
    winner: number | null;
  }> | null;
}

async function tennisApiFetch<T>(url: string, apiKey: string, revalidate?: number): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: { "x-api-key": apiKey },
      cache: revalidate === 0 ? "no-store" : undefined,
      next: revalidate !== undefined && revalidate > 0 ? { revalidate } : undefined,
      signal: controller.signal,
    });

    if (res.status === 429) {
      throw new Error("RATE_LIMIT");
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error("AUTH_FAILURE");
    }

    if (!res.ok) {
      throw new Error(`API_ERROR:${res.status}`);
    }

    try {
      return (await res.json()) as T;
    } catch {
      throw new Error("MALFORMED_RESPONSE");
    }
  } catch (error) {
    throw buildSportsApiError(PROVIDER_NAME, url, error);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: Error | unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      const message = error instanceof Error ? error.message : String(error);
      if (message === "RATE_LIMIT" || message === "AUTH_FAILURE") {
        break;
      }
      if (message.startsWith("API_ERROR:")) {
        const statusStr = message.split(":")[1] ?? "0";
        const status = parseInt(statusStr, 10);
        if (status >= 400 && status < 500) break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw lastError;
}

function extractEvents(data: unknown): TennisEvent[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.events)) return obj.events as TennisEvent[];
  if (Array.isArray(obj.data)) return obj.data as TennisEvent[];
  if (Array.isArray(obj.response)) return obj.response as TennisEvent[];
  return [];
}

function extractSingle<T>(data: unknown): T | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    const inner = obj.data as Record<string, unknown>;
    if (inner.event && typeof inner.event === "object") return inner.event as T;
    if (inner.team && typeof inner.team === "object") return inner.team as T;
    return obj.data as T;
  }
  if (obj.response && typeof obj.response === "object" && !Array.isArray(obj.response)) return obj.response as T;
  if (obj.event && typeof obj.event === "object") return obj.event as T;
  return null;
}

export class TennisProvider implements SportsProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!apiKey || apiKey.trim().length === 0) {
      throw new SportsApiError({
        provider: PROVIDER_NAME,
        endpoint: "(missing)",
        kind: "AUTH_FAILURE",
        detail: "API key is not configured. Set VELOR_API_SPORTS_KEY on the server.",
      });
    }
  }

  async getLiveMatches(): Promise<Match[]> {
    const url = api("/live");
    const data = await withRetry<unknown>(() => tennisApiFetch(url, this.apiKey, 60));
    const events = extractEvents(data);
    return events.map((event) => normalizeTennisMatch(event));
  }

  async getMatches(_params?: GetMatchesParams): Promise<Match[]> {
    const params = new URLSearchParams();
    if (_params?.leagueId) params.set("tournament", _params.leagueId);

    let url: string;
    if (_params?.date) {
      url = api(`/schedule/${encodeURIComponent(_params.date)}`);
    } else {
      url = api("/today");
    }

    // "/today" uses a 60s shared cache window (same as the live endpoint)
    // so snapshots rendered seconds apart share identical upstream data
    // and pages cannot disagree with each other. 60s is standard
    // live-score granularity; the freshness line shows render time honestly.
    const data = await withRetry<unknown>(() => tennisApiFetch(url, this.apiKey, _params?.date ? 300 : 60));
    const events = extractEvents(data);
    let matches = events.map((event) => normalizeTennisMatch(event));

    if (_params?.status) {
      const targetStatus = _params.status;
      matches = matches.filter((m) => m.status === targetStatus);
    }

    return matches;
  }

  async getMatch(id: string): Promise<Match | null> {
    const url = api(`/match/${encodeURIComponent(id)}`);
    const data = await withRetry<unknown>(() => tennisApiFetch<TennisMatchDetail | { data?: TennisMatchDetail }>(url, this.apiKey, 60));
    const matchData = extractSingle<TennisMatchDetail>(data);
    if (!matchData) return null;
    return normalizeTennisMatch(matchData);
  }

  async getLeagues(): Promise<League[]> {
    const liveData = await withRetry<unknown>(() => tennisApiFetch(api("/live"), this.apiKey, 300));
    const liveEvents = extractEvents(liveData);
    const todayData = await withRetry<unknown>(() => tennisApiFetch(api("/today"), this.apiKey, 60));
    const todayEvents = extractEvents(todayData);

    const allEvents = [...liveEvents, ...todayEvents];
    const leagueMap = new Map<string, League>();
    for (const event of allEvents) {
      const tournament = event.tournament;
      if (!tournament) continue;
      let leagueId: number | string | undefined;
      let leagueName: string;
      if (typeof tournament === "string") {
        leagueId = tournament;
        leagueName = tournament;
      } else {
        leagueId = tournament.uniqueTournament?.id ?? tournament.name;
        leagueName = tournament.name ?? "Unknown";
      }
      if (!leagueId) continue;
      const league = normalizeTennisLeague({ id: leagueId, name: leagueName });
      leagueMap.set(String(league.id), league);
    }
    return Array.from(leagueMap.values());
  }

  async getLeague(id: string): Promise<League | null> {
    const url = api(`/tournament/${encodeURIComponent(id)}/info`);
    const data = await withRetry<{ data?: TennisLeagueInfo }>(() => tennisApiFetch(url, this.apiKey, 86400));
    const leagueData = extractSingle<TennisLeagueInfo>(data);
    if (!leagueData) return null;
    return normalizeTennisLeague(leagueData);
  }

  async getTeams(_params?: { leagueId?: string; search?: string }): Promise<Team[]> {
    if (_params?.search) {
      const url = api(`/search?q=${encodeURIComponent(_params.search)}`);
      const data = await withRetry<TennisSearchResponse>(() => tennisApiFetch(url, this.apiKey, 300));
      const teams: Team[] = [];
      if (data?.teams && Array.isArray(data.teams)) {
        for (const team of data.teams) {
          teams.push(normalizeTennisTeam(team));
        }
      }
      return teams;
    }
    return [];
  }

  async getTeam(id: string): Promise<Team | null> {
    const url = api(`/teams/${encodeURIComponent(id)}`);
    const data = await withRetry<{ data?: TennisTeamInfo }>(() => tennisApiFetch(url, this.apiKey, 86400));
    const teamData = extractSingle<TennisTeamInfo>(data);
    if (!teamData) return null;
    return normalizeTennisTeam(teamData);
  }

  async getPlayers(_params?: { teamId?: string; search?: string }): Promise<Player[]> {
    if (_params?.teamId) {
      const url = api(`/teams/${encodeURIComponent(_params.teamId)}`);
      const data = await withRetry<{ data?: TennisTeamInfo }>(() => tennisApiFetch(url, this.apiKey, 86400));
      const playerData = extractSingle<TennisTeamInfo>(data);
      if (!playerData) return [];
      return [
        {
          id: String(playerData.id),
          name: playerData.name,
          position: undefined,
          teamId: _params.teamId,
          stats: {},
        },
      ];
    }
    if (_params?.search) {
      const url = api(`/search?q=${encodeURIComponent(_params.search)}`);
      const data = await withRetry<TennisSearchResponse>(() => tennisApiFetch(url, this.apiKey, 300));
      const players: Player[] = [];
      if (data?.teams && Array.isArray(data.teams)) {
        for (const team of data.teams) {
          players.push({
            id: String(team.id),
            name: team.name,
            position: undefined,
            teamId: undefined,
            stats: {},
          });
        }
      }
      return players;
    }
    return [];
  }

  async getStandings(_params: { leagueId: string; season?: string }): Promise<Standing[]> {
    void _params;
    const url = api("/rankings");
    const data = await withRetry<TennisRankingResponse>(() => tennisApiFetch(url, this.apiKey, 300));
    const rankings = data?.data?.rankings;
    if (!rankings || !Array.isArray(rankings)) return [];
    return rankings.map((r, index) => ({
      teamId: String(index),
      position: r.rank,
      points: r.points ?? 0,
      played: 0,
      won: 0,
      lost: 0,
      sportId: "tennis",
    }));
  }

  async search(params: SearchParams): Promise<SearchResult[]> {
    const query = params.query.trim();
    if (!query || query.length < 2) {
      return [];
    }

    const url = api(`/search?q=${encodeURIComponent(query)}`);
    const data = await withRetry<TennisSearchResponse>(() => tennisApiFetch(url, this.apiKey, 60));
    const results: SearchResult[] = [];
    const limit = params.limit ?? 10;

    if (data?.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        if (results.length >= limit) break;
        results.push({
          type: "match",
          id: String(event.id),
          name: `${event.homeTeam.name} vs ${event.awayTeam.name}`,
          subtitle: event.tournament?.name,
          href: `/match/${event.id}`,
        });
      }
    }

    if (data?.teams && Array.isArray(data.teams)) {
      const addedTeamIds = new Set<string>();
      for (const team of data.teams) {
        if (results.length >= limit) break;
        if (!addedTeamIds.has(String(team.id))) {
          results.push({
            type: "team",
            id: String(team.id),
            name: team.name,
            subtitle: team.country?.name,
            href: `/team/${team.id}`,
          });
          addedTeamIds.add(String(team.id));
        }
      }
    }

    if (data?.tournaments && Array.isArray(data.tournaments)) {
      const addedTournamentIds = new Set<string>();
      for (const tournament of data.tournaments) {
        if (results.length >= limit) break;
        const tid = String(tournament.uniqueTournament?.id ?? tournament.id);
        if (!addedTournamentIds.has(tid)) {
          results.push({
            type: "league",
            id: tid,
            name: tournament.name,
            subtitle: tournament.country?.name,
            href: `/league/${tid}`,
          });
          addedTournamentIds.add(tid);
        }
      }
    }

    return results.slice(0, limit);
  }

  async getMatchEvents(_params: GetMatchEventsParams): Promise<MatchEvent[]> {
    const url = api(`/match/${encodeURIComponent(_params.matchId)}/point-by-point`);
    const data = await withRetry<TennisPointByPointResponse>(() => tennisApiFetch(url, this.apiKey, 60));
    const points = data?.data;
    if (!points || !Array.isArray(points)) return [];
    return points.map((point, index) => ({
      id: `${_params.matchId}-${point.seq ?? index}`,
      matchId: _params.matchId,
      type: "period_end" as MatchEvent["type"],
      minute: point.game ?? 0,
      teamId: point.server === 1 ? "1" : point.server === 2 ? "2" : "0",
      playerName: "",
      detail: point.score ? `Set ${point.set}: ${JSON.stringify(point.score)}` : undefined,
    }));
  }

  async getMatchStatistics(_params: GetMatchStatisticsParams): Promise<MatchStatistics[]> {
    const url = api(`/match/${encodeURIComponent(_params.matchId)}/statistics`);
    const data = await withRetry<TennisStatisticsResponse>(() => tennisApiFetch(url, this.apiKey, 60));
    const stats = data?.data;
    if (!stats || !Array.isArray(stats)) return [];
    return stats.map((teamStats) => ({
      matchId: _params.matchId,
      teamId: String(teamStats.team_id),
      teamName: teamStats.team_name,
      stats: teamStats.statistics
        .filter((s) => s.value != null && s.value !== "")
        .map((s) => ({
          type: s.type,
          value: s.value ?? 0,
          opponentValue: 0,
        })),
    }));
  }

  async getMatchLineups(_params: GetMatchLineupsParams): Promise<MatchLineup[]> {
    void _params;
    return [];
  }
}
