import type { SportsProvider, GetMatchesParams, Match, League, Team, Player, Standing, MatchEvent, MatchStatistics, MatchLineup, SearchResult, GetMatchEventsParams, GetMatchStatisticsParams, GetMatchLineupsParams, SearchParams } from "../../types";
import type { Sport } from "@/lib/types/sports";
import { normalizeMatchStatus, normalizeScore } from "./normalize";
import { buildSportsApiError, SportsApiError } from "@/lib/api/error";

const BASE_URL = "https://v3.football.api-sports.io";
const PROVIDER_NAME = "ApiSportsProvider";

interface ApiSportsFixture {
  fixture: {
    id: number;
    status: { long: string | null; short: string | null; elapsed: number | null };
    date: string | null;
    venue: { name: string | null } | null;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string | null; country?: string | null; venue?: string | null } | null;
    away: { id: number; name: string; logo: string | null; country?: string | null; venue?: string | null } | null;
  };
  score: {
    halftime: { home: number | null; away: number | null } | null;
    fulltime: { home: number | null; away: number | null } | null;
    extratime: { home: number | null; away: number | null } | null;
    penalty: { home: number | null; away: number | null } | null;
  } | null;
}

interface ApiSportsTeamSearchResponse {
  response: {
    team: { id: number; name: string; logo: string | null };
    country?: { name: string } | null;
  }[];
}

interface ApiSportsLeagueSearchResponse {
  response: {
    league: { id: number; name: string; country: string; logo: string | null };
  }[];
}

interface ApiSportsFixtureSearchResponse {
  response: ApiSportsFixture[];
}

interface ApiSportsEventResponse {
  response: {
    player: { id: number; name: string };
    team: { id: number; name: string; logo: string | null } | null;
    time: { elapsed: number | null; extra?: number | null };
    type: string;
    detail: string;
    assist?: { id: number; name: string } | null;
  }[];
}

interface ApiSportsStatisticsResponse {
  response: {
    team: { id: number; name: string; logo: string | null } | null;
    statistics: Array<{ type: string; value: number | string | null }>;
  }[];
}

interface ApiSportsLineupsResponse {
  response: {
    team: { id: number; name: string; logo: string | null } | null;
    coach: { id: number; name: string } | null;
    formation: string;
    startXI: Array<{ player: { id: number; name: string; pos?: string | null; number?: number | null } }>;
    substitutes: Array<{ player: { id: number; name: string; pos?: string | null; number?: number | null } }>;
  }[];
}

interface ApiSportsResponse {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: ApiSportsFixture[];
}

function safeString(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function normalizeTeam(apiTeam: { id: number; name: string; logo: string | null; country?: string | null; venue?: string | null }, sportId: string = "football"): Team {
  return {
    id: String(apiTeam.id),
    name: apiTeam.name,
    shortName: apiTeam.name.length > 3 ? apiTeam.name.slice(0, 3).toUpperCase() : apiTeam.name.toUpperCase(),
    logo: safeString(apiTeam.logo),
    country: safeString(apiTeam.country),
    venue: safeString(apiTeam.venue),
    sportId,
  };
}

function normalizeLeague(apiLeague: { id: number; name: string; country: string; logo: string | null }): League {
  return {
    id: String(apiLeague.id),
    sportId: "football",
    name: apiLeague.name,
    country: apiLeague.country,
    logo: safeString(apiLeague.logo),
  };
}

function normalizeMatch(fixture: ApiSportsFixture): Match {
  const status = normalizeMatchStatus(fixture.fixture.status?.long ?? "");
  const { home, away, periodScores } = normalizeScore(fixture.score);
  const elapsed = fixture.fixture.status?.elapsed;
  const period = elapsed != null ? `${elapsed}'` : undefined;

  return {
    id: String(fixture.fixture.id),
    sport: { id: "football", name: "Football", slug: "football" } as Sport,
    league: normalizeLeague(fixture.league),
    homeTeam: normalizeTeam(fixture.teams?.home ?? { id: 0, name: "Unknown", logo: null }, "football"),
    awayTeam: normalizeTeam(fixture.teams?.away ?? { id: 0, name: "Unknown", logo: null }, "football"),
    score: { home, away, periodScores },
    status,
    startTime: fixture.fixture.date ?? "",
    venue: safeString(fixture.fixture.venue?.name) || undefined,
    period,
  };
}

async function apiFetch<T>(url: string, apiKey: string, revalidate?: number): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: { "x-apisports-key": apiKey },
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
      if (error instanceof SportsApiError) {
        if (error.meta.kind === "RATE_LIMIT" || error.meta.kind === "AUTH_FAILURE") break;
        const status = error.meta.status;
        if (typeof status === "number" && status >= 400 && status < 500) break;
        if (error.meta.kind === "MALFORMED_RESPONSE") break;
      } else {
        const message = error instanceof Error ? error.message : String(error);
        if (message === "RATE_LIMIT" || message === "AUTH_FAILURE") break;
        if (message.startsWith("API_ERROR:")) {
          const statusStr = message.split(":")[1] ?? "0";
          const status = parseInt(statusStr, 10);
          if (status >= 400 && status < 500) break;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw lastError;
}

export class ApiSportsProvider implements SportsProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getLiveMatches(): Promise<Match[]> {
    const url = `${BASE_URL}/fixtures?live=all`;
    const data = await withRetry(() => apiFetch<ApiSportsResponse>(url, this.apiKey, 60));
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.map(normalizeMatch);
  }

  async getMatches(_params?: GetMatchesParams): Promise<Match[]> {
    const params = new URLSearchParams();
    if (_params?.leagueId) params.set("league", _params.leagueId);
    if (_params?.sport) params.set("sport", _params.sport);
    if (_params?.teamId) params.set("team", _params.teamId);
    if (_params?.date) params.set("date", _params.date);
    if (_params?.status) {
      const statusMap: Record<string, string> = {
        live: "live",
        scheduled: "ns",
        finished: "ft",
      };
      params.set("status", statusMap[_params.status] ?? _params.status);
    }

    const url = `${BASE_URL}/fixtures?${params.toString()}`;
    const data = await withRetry(() => apiFetch<ApiSportsResponse>(url, this.apiKey, 300));
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.map(normalizeMatch);
  }

  async getMatch(id: string): Promise<Match | null> {
    const url = `${BASE_URL}/fixtures?id=${encodeURIComponent(id)}`;
    const data = await withRetry(() => apiFetch<ApiSportsResponse>(url, this.apiKey, 60));
    if (!data?.response || !Array.isArray(data.response) || data.response.length === 0) return null;
    return normalizeMatch(data.response[0]);
  }

  async getLeagues(): Promise<League[]> {
    const url = `${BASE_URL}/leagues`;
    const data = await withRetry(() => apiFetch<{ response: ApiSportsResponse["response"] }>(url, this.apiKey, 86400));
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    const leagues = data.response.map((item) => normalizeLeague(item.league));
    const unique = new Map(leagues.map((l) => [l.id, l]));
    return Array.from(unique.values());
  }

  async getLeague(id: string): Promise<League | null> {
    const url = `${BASE_URL}/leagues?id=${encodeURIComponent(id)}`;
    const data = await withRetry(() => apiFetch<{ response: { league: { id: number; name: string; country: string; logo: string | null } }[] }>(url, this.apiKey, 86400));
    if (!data?.response || !Array.isArray(data.response) || data.response.length === 0) return null;
    return normalizeLeague(data.response[0].league);
  }

  async getTeams(_params?: { leagueId?: string; search?: string }): Promise<Team[]> {
    const params = new URLSearchParams();
    if (_params?.leagueId) params.set("league", _params.leagueId);
    if (_params?.search) params.set("search", _params.search);

    const url = `${BASE_URL}/teams?${params.toString()}`;
    const data = await withRetry(() => apiFetch<{ response: { team: { id: number; name: string; logo: string | null; country?: string | null; venue?: string | null } }[] }>(url, this.apiKey, 86400));
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.map((item) => normalizeTeam(item.team, "football"));
  }

  async getTeam(id: string): Promise<Team | null> {
    const url = `${BASE_URL}/teams?id=${encodeURIComponent(id)}`;
    const data = await withRetry(() => apiFetch<{ response: { team: { id: number; name: string; logo: string | null; country?: string | null; venue?: string | null } }[] }>(url, this.apiKey, 86400));
    if (!data?.response || !Array.isArray(data.response) || data.response.length === 0) return null;
    return normalizeTeam(data.response[0].team);
  }

  async getPlayers(_params?: { teamId?: string; search?: string }): Promise<Player[]> {
    const params = new URLSearchParams();
    if (_params?.teamId) params.set("team", _params.teamId);
    if (_params?.search) params.set("search", _params.search);

    const url = `${BASE_URL}/players?${params.toString()}`;
    const data = await withRetry(() => apiFetch<{ response: unknown[] }>(url, this.apiKey, 86400));
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    const players: Player[] = [];
    for (const item of data.response) {
      const player = (item as { player: { id: number; name: string; position: string | null } }).player;
      players.push({
        id: String(player.id),
        name: player.name,
        position: safeString(player.position),
        teamId: "",
        stats: {},
      });
    }
    return players;
  }

  async getStandings(_params: { leagueId: string; season?: string }): Promise<Standing[]> {
    const season = _params.season ?? String(new Date().getFullYear());
    const url = `${BASE_URL}/standings?league=${encodeURIComponent(_params.leagueId)}&season=${encodeURIComponent(season)}`;
    interface StandingsResponse {
      response: {
        league: {
          standings: {
            team: { id: number };
            stats: Standing;
          }[][];
        };
      }[];
    }
    const data = await withRetry(() => apiFetch<StandingsResponse>(url, this.apiKey, 300));
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    const standings: Standing[] = [];
    for (const leagueStandings of data.response) {
      if (!leagueStandings?.league?.standings) continue;
      for (const standingGroup of leagueStandings.league.standings) {
        for (const standing of standingGroup) {
          standings.push({
            teamId: String(standing.team.id),
            position: standing.stats.position,
            points: standing.stats.points,
            played: standing.stats.played,
            won: standing.stats.won,
            drawn: standing.stats.drawn,
            lost: standing.stats.lost,
            goalsFor: standing.stats.goalsFor,
            goalsAgainst: standing.stats.goalsAgainst,
          });
        }
      }
    }
    return standings;
  }

  async search(params: SearchParams): Promise<SearchResult[]> {
    const query = params.query.trim();
    if (!query || query.length < 2) {
      return [];
    }

    const results: SearchResult[] = [];
    const limit = params.limit ?? 10;

    const [teams, leagues, fixtures] = await Promise.all([
      this.searchTeams(query, limit),
      this.searchLeagues(query, limit),
      this.searchFixtures(query, limit),
    ]);

    results.push(...teams, ...leagues, ...fixtures);

    return results.slice(0, limit);
  }

  private async searchTeams(query: string, limit: number): Promise<SearchResult[]> {
    const data = await withRetry<ApiSportsTeamSearchResponse>(() =>
      apiFetch(`${BASE_URL}/teams?search=${encodeURIComponent(query)}`, this.apiKey, 60)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.slice(0, limit).map((item) => ({
      type: "team" as const,
      id: item.team ? String(item.team.id) : "0",
      name: item.team?.name ?? "Unknown",
      subtitle: item.country?.name,
      href: item.team ? `/team/${item.team.id}` : "#",
      logo: safeString(item.team?.logo),
    }));
  }

  private async searchLeagues(query: string, limit: number): Promise<SearchResult[]> {
    const data = await withRetry<ApiSportsLeagueSearchResponse>(() =>
      apiFetch(`${BASE_URL}/leagues?search=${encodeURIComponent(query)}`, this.apiKey, 86400)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.slice(0, limit).map((item) => ({
      type: "league" as const,
      id: String(item.league.id),
      name: item.league.name,
      subtitle: item.league.country,
      href: `/league/${item.league.id}`,
      logo: safeString(item.league.logo),
    }));
  }

  private async searchFixtures(query: string, limit: number): Promise<SearchResult[]> {
    const data = await withRetry<ApiSportsFixtureSearchResponse>(() =>
      apiFetch(`${BASE_URL}/fixtures?search=${encodeURIComponent(query)}`, this.apiKey, 60)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.slice(0, limit).map((fixture) => ({
      type: "match" as const,
      id: fixture.fixture ? String(fixture.fixture.id) : "0",
      name: `${fixture.teams?.home?.name ?? "Unknown"} vs ${fixture.teams?.away?.name ?? "Unknown"}`,
      subtitle: fixture.league?.name,
      href: fixture.fixture ? `/match/${fixture.fixture.id}` : "#",
    }));
  }

  async getMatchEvents(_params: GetMatchEventsParams): Promise<MatchEvent[]> {
    const url = `${BASE_URL}/fixtures/events?fixture=${encodeURIComponent(_params.matchId)}`;
    const data = await withRetry<ApiSportsEventResponse>(() => apiFetch(url, this.apiKey, 60));
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.map((event, index) => ({
      id: `${_params.matchId}-${event.player?.id ?? 0}-${event.time?.elapsed ?? index}-${event.type}`,
      matchId: _params.matchId,
      type: (event.type ?? "unknown") as MatchEvent["type"],
      minute: event.time?.elapsed ?? 0,
      teamId: event.team ? String(event.team.id) : "0",
      playerName: event.player?.name ?? "Unknown",
      detail: event.detail,
      assistPlayerName: event.assist?.name,
    }));
  }

  async getMatchStatistics(_params: GetMatchStatisticsParams): Promise<MatchStatistics[]> {
    const url = `${BASE_URL}/fixtures/statistics?fixture=${encodeURIComponent(_params.matchId)}`;
    const data = await withRetry<ApiSportsStatisticsResponse>(() => apiFetch(url, this.apiKey, 60));
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }

    const response = data.response;
    const teamStatsMap = new Map<string, Map<string, number | string>>();
    for (const teamStats of response) {
      if (!teamStats.team) continue;
      const teamId = String(teamStats.team.id);
      const statsMap = new Map<string, number | string>();
      for (const s of teamStats.statistics) {
        if (s.value != null && s.value !== "") {
          statsMap.set(s.type, s.value);
        }
      }
      teamStatsMap.set(teamId, statsMap);
    }

    return response.map((teamStats) => {
      const teamId = teamStats.team ? String(teamStats.team.id) : "0";
      const opponentIds = Array.from(teamStatsMap.keys()).filter((id) => id !== teamId);
      const opponentStatsMap = opponentIds.length > 0 ? teamStatsMap.get(opponentIds[0]) : undefined;

      const mappedStats = teamStats.statistics
        .filter((s) => s.value != null && s.value !== "")
        .map((s) => ({
          type: s.type,
          value: s.value ?? 0,
          opponentValue: opponentStatsMap?.get(s.type) ?? 0,
        }));

      return {
        matchId: _params.matchId,
        teamId: teamId,
        teamName: teamStats.team?.name ?? "Unknown",
        stats: mappedStats,
      };
    });
  }

  async getMatchLineups(_params: GetMatchLineupsParams): Promise<MatchLineup[]> {
    const url = `${BASE_URL}/fixtures/lineups?fixture=${encodeURIComponent(_params.matchId)}`;
    const data = await withRetry<ApiSportsLineupsResponse>(() => apiFetch(url, this.apiKey, 60));
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.map((teamLineup) => ({
      matchId: _params.matchId,
      teamId: teamLineup.team ? String(teamLineup.team.id) : "0",
      teamName: teamLineup.team?.name ?? "Unknown",
      formation: teamLineup.formation,
      startXI: teamLineup.startXI.map((player) => ({
        id: String(player.player?.id ?? 0),
        name: player.player?.name ?? "Unknown",
        position: player.player?.pos ?? "",
        number: player.player?.number ?? undefined,
        teamId: teamLineup.team ? String(teamLineup.team.id) : "0",
      })),
      substitutes: teamLineup.substitutes.map((player) => ({
        id: String(player.player?.id ?? 0),
        name: player.player?.name ?? "Unknown",
        position: player.player?.pos ?? "",
        number: player.player?.number ?? undefined,
        teamId: teamLineup.team ? String(teamLineup.team.id) : "0",
        isSubstitute: true,
      })),
    }));
  }
}
