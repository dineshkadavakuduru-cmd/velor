import type { SportsProvider, GetMatchesParams, Match, League, Team, Player, Standing, MatchEvent, MatchStatistics, MatchLineup, SearchResult, GetMatchEventsParams, GetMatchStatisticsParams, GetMatchLineupsParams, SearchParams } from "../../types";
import { normalizeCricketMatch, normalizeCricketLeague, normalizeCricketTeam } from "./normalize";
import { buildSportsApiError, SportsApiError } from "@/lib/api/error";

const BASE_URL = "https://v2.cricket.sportsapipro.com";
const PROVIDER_NAME = "CricketProvider";

function api(path: string): string {
  return `${BASE_URL}/api${path.startsWith("/") ? path : `/${path}`}`;
}

interface CricketEvent {
  id: number;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  homeScore: {
    current: number | null;
    display: number | null;
    innings?: Record<string, { score: number | null; wickets: number | null; overs: number | string | null }> | null;
  };
  awayScore: {
    current: number | null;
    display: number | null;
    innings?: Record<string, { score: number | null; wickets: number | null; overs: number | string | null }> | null;
  };
  status: { code: number; description: string; type: string };
  tournament?: { id: number | string; name: string } | null;
  startTimestamp: number | null;
}

interface CricketMatchDetail {
  id: number;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  homeScore: {
    current: number | null;
    display: number | null;
    innings?: Record<string, { score: number | null; wickets: number | null; overs: number | string | null }> | null;
  };
  awayScore: {
    current: number | null;
    display: number | null;
    innings?: Record<string, { score: number | null; wickets: number | null; overs: number | string | null }> | null;
  };
  status: { code: number; description: string; type: string };
  tournament?: { id: number | string; name: string } | null;
  startTimestamp: number | null;
  format?: string | null;
}

interface CricketLeagueInfo {
  id: number;
  name: string;
  category?: { id: number; name: string } | null;
  country?: { id: number; name: string; alpha2: string } | null;
  logo?: string | null;
}

interface CricketTeamInfo {
  id: number;
  name: string;
  country?: { id: number; name: string; alpha2: string } | null;
  logo?: string | null;
}

interface CricketSearchResponse {
  events?: Array<{ id: number; homeTeam: { id: number; name: string }; awayTeam: { id: number; name: string }; tournament?: { name: string; id: number | string } | null }>;
  teams?: Array<{ id: number; name: string; sport?: { id: number; name: string } | null }>;
  tournaments?: Array<{ id: number; name: string; country?: { name: string } | null }>;
}

interface CricketStandingsResponse {
  data?: {
    standings?: Array<{
      position: number;
      team: { id: number; name: string };
      points: number;
      matches_played?: number;
      wins?: number;
      losses?: number;
      draws?: number;
      no_results?: number;
      runs_scored?: number;
      runs_conceded?: number;
    }>;
  } | null;
}

interface CricketIncidentResponse {
  data?: Array<{
    id: number | string;
    event_type?: string;
    description?: string;
    minute?: number | null;
    team?: { id: number; name: string } | null;
    player?: { id: number; name: string } | null;
    period?: number | null;
  }> | null;
}

interface CricketStatisticsResponse {
  data?: Array<{
    team_id: number;
    team_name: string;
    statistics: Array<{ type: string; value: number | string | null }>;
  }> | null;
}

interface CricketLineupsResponse {
  data?: Array<{
    team_id: number;
    team_name: string;
    players: Array<{ player_id: number; player_name: string; position: string | null; number: number | null }>;
  }> | null;
}

function safeString(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

async function cricketApiFetch<T>(url: string, apiKey: string, revalidate?: number): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: { "x-api-key": apiKey },
      next: revalidate !== undefined ? { revalidate } : undefined,
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

function extractEvents(data: unknown): CricketEvent[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.events)) return obj.events as CricketEvent[];
  if (Array.isArray(obj.data)) return obj.data as CricketEvent[];
  if (Array.isArray(obj.response)) return obj.response as CricketEvent[];
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

function normalizeCricketEvent(incident: { id: number | string; event_type?: string; type?: string; description?: string; minute?: number | null; team?: { id: number; name: string } | null; player?: { id: number; name: string } | null; period?: number | null } | null | undefined, matchId: string): MatchEvent | null {
  if (!incident) return null;
  const type = incident.event_type ?? incident.type ?? "unknown";
  const normalizedType = String(type).toLowerCase().replace(/\s+/g, "_");
  return {
    id: `${matchId}-${incident.id ?? incident.player?.id ?? 0}-${incident.minute ?? 0}-${normalizedType}`,
    matchId,
    type: normalizedType as MatchEvent["type"],
    minute: incident.minute ?? incident.period ?? 0,
    teamId: incident.team ? String(incident.team.id) : "0",
    playerName: incident.player?.name ?? incident.description ?? "Unknown",
    detail: safeString(incident.description),
  };
}

export class CricketProvider implements SportsProvider {
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
    const data = await withRetry<unknown>(() => cricketApiFetch(url, this.apiKey, 60));
    const events = extractEvents(data);
    return events.map((event) => normalizeCricketMatch(event));
  }

  async getMatches(_params?: GetMatchesParams): Promise<Match[]> {
    const params = new URLSearchParams();
    if (_params?.leagueId) params.set("tournament", _params.leagueId);
    if (_params?.date) params.set("date", _params.date);

    let url: string;
    if (_params?.date) {
      url = api(`/schedule/${encodeURIComponent(_params.date)}`);
    } else {
      url = api("/today");
    }

    const data = await withRetry<unknown>(() => cricketApiFetch(url, this.apiKey, 300));
    const events = extractEvents(data);
    let matches = events.map((event) => normalizeCricketMatch(event));

    if (_params?.status) {
      const targetStatus = _params.status;
      matches = matches.filter((m) => m.status === targetStatus);
    }

    return matches;
  }

  async getMatch(id: string): Promise<Match | null> {
    const url = api(`/match/${encodeURIComponent(id)}`);
    const data = await withRetry<unknown>(() => cricketApiFetch<CricketMatchDetail | { event?: CricketMatchDetail; data?: CricketMatchDetail }>(url, this.apiKey, 60));
    const matchData = extractSingle<CricketMatchDetail>(data);
    if (!matchData) return null;
    return normalizeCricketMatch(matchData);
  }

  async getLeagues(): Promise<League[]> {
    const liveData = await withRetry<unknown>(() => cricketApiFetch(api("/live"), this.apiKey, 300));
    const liveEvents = extractEvents(liveData);
    const todayData = await withRetry<unknown>(() => cricketApiFetch(api("/today"), this.apiKey, 300));
    const todayEvents = extractEvents(todayData);

    const allEvents = [...liveEvents, ...todayEvents];
    const leagueMap = new Map<string, League>();
    for (const event of allEvents) {
      const tournament = event.tournament;
      if (!tournament) continue;
      if (typeof tournament === "string") {
        if (!tournament) continue;
        const league = normalizeCricketLeague({ id: tournament, name: tournament });
        leagueMap.set(league.id, league);
        continue;
      }
      const tid = tournament.id ?? tournament.name;
      if (tid == null || tid === "") continue;
      const league = normalizeCricketLeague({ id: tid, name: tournament.name ?? "Unknown" });
      leagueMap.set(String(league.id), league);
    }
    return Array.from(leagueMap.values());
  }

  async getLeague(id: string): Promise<League | null> {
    const url = api(`/tournament/${encodeURIComponent(id)}/info`);
    const data = await withRetry<unknown>(() => cricketApiFetch<{ data?: CricketLeagueInfo }>(url, this.apiKey, 86400));
    const leagueData = extractSingle<CricketLeagueInfo>(data);
    if (!leagueData) return null;
    return normalizeCricketLeague(leagueData);
  }

  async getTeams(_params?: { leagueId?: string; search?: string }): Promise<Team[]> {
    if (_params?.search) {
      const url = api(`/search?q=${encodeURIComponent(_params.search)}`);
      const data = await withRetry<CricketSearchResponse>(() => cricketApiFetch(url, this.apiKey, 300));
      const teams: Team[] = [];
      if (data?.teams) {
        for (const team of data.teams) {
          teams.push(normalizeCricketTeam(team));
        }
      }
      return teams;
    }
    return [];
  }

  async getTeam(id: string): Promise<Team | null> {
    const url = api(`/teams/${encodeURIComponent(id)}`);
    const data = await withRetry<{ data?: CricketTeamInfo }>(() => cricketApiFetch(url, this.apiKey, 86400));
    const teamData = extractSingle<CricketTeamInfo>(data);
    if (!teamData) return null;
    return normalizeCricketTeam(teamData);
  }

  async getPlayers(_params?: { teamId?: string; search?: string }): Promise<Player[]> {
    if (_params?.teamId) {
      const url = api(`/teams/${encodeURIComponent(_params.teamId)}/players`);
      const data = await withRetry<{ data?: Array<{ id: number; name: string; position?: string | null }> }>(() => cricketApiFetch(url, this.apiKey, 86400));
      const playersData = data?.data;
      if (!playersData || !Array.isArray(playersData)) return [];
      return playersData.map((p) => ({
        id: String(p.id),
        name: p.name,
        position: safeString(p.position),
        teamId: _params.teamId,
        stats: {},
      }));
    }
    if (_params?.search) {
      const url = api(`/search?q=${encodeURIComponent(_params.search)}`);
      const data = await withRetry<CricketSearchResponse>(() => cricketApiFetch(url, this.apiKey, 300));
      const players: Player[] = [];
      if (data?.teams) {
        for (const team of data.teams) {
          players.push({
            id: String(team.id),
            name: team.name,
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
    const season = _params.season ?? String(new Date().getFullYear());
    const url = api(`/tournament/${encodeURIComponent(_params.leagueId)}/season/${encodeURIComponent(season)}/standings?type=total`);
    const data = await withRetry<CricketStandingsResponse>(() => cricketApiFetch(url, this.apiKey, 300));
    const standingsData = data?.data?.standings;
    if (!standingsData || !Array.isArray(standingsData)) return [];
    return standingsData.map((s) => ({
      teamId: String(s.team.id),
      position: s.position,
      points: s.points,
      played: s.matches_played ?? 0,
      won: s.wins ?? 0,
      lost: s.losses ?? 0,
      drawn: s.draws,
      goalsFor: s.runs_scored,
      goalsAgainst: s.runs_conceded,
      sportId: "cricket",
    }));
  }

  async search(params: SearchParams): Promise<SearchResult[]> {
    const query = params.query.trim();
    if (!query || query.length < 2) {
      return [];
    }

    const url = api(`/search?q=${encodeURIComponent(query)}`);
    const data = await withRetry<CricketSearchResponse>(() => cricketApiFetch(url, this.apiKey, 60));
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
        if (!addedTournamentIds.has(String(tournament.id))) {
          results.push({
            type: "league",
            id: String(tournament.id),
            name: tournament.name,
            subtitle: tournament.country?.name,
            href: `/league/${tournament.id}`,
          });
          addedTournamentIds.add(String(tournament.id));
        }
      }
    }

    return results.slice(0, limit);
  }

  async getMatchEvents(_params: GetMatchEventsParams): Promise<MatchEvent[]> {
    const url = api(`/match/${encodeURIComponent(_params.matchId)}/incidents`);
    const data = await withRetry<CricketIncidentResponse>(() => cricketApiFetch(url, this.apiKey, 60));
    const incidents = data?.data;
    if (!incidents || !Array.isArray(incidents)) return [];
    const events: MatchEvent[] = [];
    for (const incident of incidents) {
      const event = normalizeCricketEvent(incident, _params.matchId);
      if (event) events.push(event);
    }
    return events;
  }

  async getMatchStatistics(_params: GetMatchStatisticsParams): Promise<MatchStatistics[]> {
    const url = api(`/match/${encodeURIComponent(_params.matchId)}/statistics`);
    const data = await withRetry<CricketStatisticsResponse>(() => cricketApiFetch(url, this.apiKey, 60));
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
    const url = api(`/match/${encodeURIComponent(_params.matchId)}/lineups`);
    const data = await withRetry<CricketLineupsResponse>(() => cricketApiFetch(url, this.apiKey, 60));
    const lineups = data?.data;
    if (!lineups || !Array.isArray(lineups)) return [];
    return lineups.map((teamLineup) => ({
      matchId: _params.matchId,
      teamId: String(teamLineup.team_id),
      teamName: teamLineup.team_name,
      formation: "",
      startXI: teamLineup.players.map((player) => ({
        id: String(player.player_id),
        name: player.player_name,
        position: safeString(player.position) || "",
        number: player.number ?? undefined,
        teamId: String(teamLineup.team_id),
      })),
      substitutes: [],
    }));
  }
}
