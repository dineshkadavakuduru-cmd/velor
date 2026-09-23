import type { SportsProvider, GetMatchesParams, Match, League, Team, Player, Standing, MatchEvent, MatchStatistics, MatchLineup, SearchResult, GetMatchEventsParams, GetMatchStatisticsParams, GetMatchLineupsParams, SearchParams } from "../../types";
import type { Sport } from "@/lib/types/sports";
import { normalizeBasketballMatchStatus, normalizeBasketballScore } from "./normalize";
import { buildSportsApiError, SportsApiError } from "@/lib/api/error";

const BASE_URL = "https://v1.basketball.api-sports.io";
const PROVIDER_NAME = "BasketballProvider";

interface BasketballGameResponse {
  id: number;
  date: string | null;
  time: string | null;
  timestamp: number | null;
  week: string | null;
  status: { long: string | null; short: string | null; elapsed: number | null } | null;
  country: { id: number; name: string; flag: string | null } | null;
  league: {
    id: number;
    name: string;
    slug: string;
    season: string;
    country: { id: number; name: string; code: string; flag: string | null } | null;
    logo: string | null;
  };
  stage: string | null;
  venue: { name: string | null; city: string | null } | null;
  teams: {
    home: { id: number; name: string; slug: string; abbr: string; logo: string | null } | null;
    away: { id: number; name: string; slug: string; abbr: string; logo: string | null } | null;
  };
  scores: {
    home: { total: number | null; quarter_1?: number | null; quarter_2?: number | null; quarter_3?: number | null; quarter_4?: number | null; over_time?: number | null } | null;
    away: { total: number | null; quarter_1?: number | null; quarter_2?: number | null; quarter_3?: number | null; quarter_4?: number | null; over_time?: number | null } | null;
  } | null;
}

interface BasketballGamesResponse {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: BasketballGameResponse[];
}

interface BasketballTeamResponse {
  id: number;
  name: string;
  slug: string;
  abbr: string;
  country: { id: number; name: string; code: string; flag: string | null } | null;
  national: boolean;
  logo: string | null;
}

interface BasketballLeagueResponse {
  id: number;
  name: string;
  slug: string;
  season: string;
  country: { id: number; name: string; code: string; flag: string | null } | null;
  logo: string | null;
}

interface BasketballEventResponse {
  id: number;
  quarter: number | null;
  time: string | null;
  event_type: string;
  player: { id: number; name: string; number: number | null } | null;
  team: { id: number; name: string } | null;
  points: number | null;
  detail: string | null;
}

interface BasketballEventsResponse {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: BasketballEventResponse[];
}

interface BasketballStatisticResponse {
  team_id: number;
  team_name: string;
  statistics: Array<{ type: string; value: number | string | null }>;
}

interface BasketballStatisticsResponse {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: BasketballStatisticResponse[];
}

interface BasketballLineupResponse {
  team_id: number;
  team_name: string;
  starting_lineups: Array<{ player_id: number; player_name: string; position: string | null; number: number | null }>;
  bench: Array<{ player_id: number; player_name: string; position: string | null; number: number | null }>;
}

interface BasketballLineupsResponse {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: BasketballLineupResponse[];
}

interface BasketballStandingsResponse {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: Array<{
    id: number;
    name: string;
    season: string;
    country: { id: number; name: string; code: string; flag: string | null } | null;
    standings: Array<{
      rank: number;
      team_id: number;
      team_name: string;
      points: number;
      games_played: number;
      wins: number;
      losses: number;
      win_percentage: number | null;
      points_for: number | null;
      points_against: number | null;
      streak: number | null;
      streak_type: string | null;
    }>;
  }>;
}

function safeString(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function normalizeBasketballTeam(apiTeam: { id: number; name: string; logo: string | null; country?: { name: string | null } | null }): Team {
  return {
    id: String(apiTeam.id),
    name: apiTeam.name,
    shortName: apiTeam.name.length > 3 ? apiTeam.name.slice(0, 3).toUpperCase() : apiTeam.name.toUpperCase(),
    logo: safeString(apiTeam.logo),
    country: safeString(apiTeam.country?.name ?? null),
    sportId: "basketball",
  };
}

function normalizeBasketballLeague(apiLeague: { id: number; name: string; country?: { name: string | null; code?: string | null } | null; logo: string | null }): League {
  return {
    id: String(apiLeague.id),
    sportId: "basketball",
    name: apiLeague.name,
    country: safeString(apiLeague.country?.name ?? null) ?? "",
    logo: safeString(apiLeague.logo),
  };
}

function normalizeBasketballMatch(game: BasketballGameResponse): Match {
  const status = normalizeBasketballMatchStatus(game.status?.long ?? "");
  const { home, away, periodScores } = normalizeBasketballScore(game.scores);
  const elapsed = game.status?.elapsed;
  const period = elapsed != null ? `Q${elapsed}` : undefined;

  return {
    id: String(game.id),
    sport: { id: "basketball", name: "Basketball", slug: "basketball" } as Sport,
    league: normalizeBasketballLeague(game.league),
    homeTeam: normalizeBasketballTeam({
      id: game.teams?.home?.id ?? 0,
      name: game.teams?.home?.name ?? "Unknown",
      logo: game.teams?.home?.logo ?? null,
    }),
    awayTeam: normalizeBasketballTeam({
      id: game.teams?.away?.id ?? 0,
      name: game.teams?.away?.name ?? "Unknown",
      logo: game.teams?.away?.logo ?? null,
    }),
    score: { home, away, periodScores },
    status,
    startTime: game.date ?? "",
    venue: safeString(game.venue?.name) || safeString(game.venue?.city) || undefined,
    period,
  };
}

async function basketballApiFetch<T>(url: string, apiKey: string, revalidate?: number): Promise<T> {
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

export class BasketballProvider implements SportsProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getLiveMatches(): Promise<Match[]> {
    const url = `${BASE_URL}/games?live=true`;
    const data = await withRetry<BasketballGamesResponse>(() =>
      basketballApiFetch<BasketballGamesResponse>(url, this.apiKey, 60)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.map(normalizeBasketballMatch);
  }

  async getMatches(_params?: GetMatchesParams): Promise<Match[]> {
    const params = new URLSearchParams();
    if (_params?.leagueId) params.set("league", _params.leagueId);
    if (_params?.teamId) params.set("team", _params.teamId);
    if (_params?.date) params.set("date", _params.date);

    const url = `${BASE_URL}/games?${params.toString()}`;
    const data = await withRetry<BasketballGamesResponse>(() =>
      basketballApiFetch<BasketballGamesResponse>(url, this.apiKey, 300)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }

    let matches = data.response.map(normalizeBasketballMatch);

    if (_params?.status) {
      const statusMap: Record<string, string> = {
        live: "live",
        scheduled: "scheduled",
        finished: "finished",
      };
      const targetStatus = statusMap[_params.status] ?? _params.status;
      matches = matches.filter((m) => m.status === targetStatus);
    }

    return matches;
  }

  async getMatch(id: string): Promise<Match | null> {
    const url = `${BASE_URL}/games?id=${encodeURIComponent(id)}`;
    const data = await withRetry<BasketballGamesResponse>(() =>
      basketballApiFetch<BasketballGamesResponse>(url, this.apiKey, 60)
    );
    if (!data?.response || !Array.isArray(data.response) || data.response.length === 0) return null;
    return normalizeBasketballMatch(data.response[0]);
  }

  async getLeagues(): Promise<League[]> {
    const url = `${BASE_URL}/leagues`;
    const data = await withRetry<{ response: BasketballLeagueResponse[] }>(() =>
      basketballApiFetch<{ response: BasketballLeagueResponse[] }>(url, this.apiKey, 86400)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    const leagues = data.response.map((item) => normalizeBasketballLeague(item));
    const unique = new Map(leagues.map((l) => [l.id, l]));
    return Array.from(unique.values());
  }

  async getLeague(id: string): Promise<League | null> {
    const url = `${BASE_URL}/leagues?id=${encodeURIComponent(id)}`;
    const data = await withRetry<{ response: BasketballLeagueResponse[] }>(() =>
      basketballApiFetch<{ response: BasketballLeagueResponse[] }>(url, this.apiKey, 86400)
    );
    if (!data?.response || !Array.isArray(data.response) || data.response.length === 0) return null;
    return normalizeBasketballLeague(data.response[0]);
  }

  async getTeams(_params?: { leagueId?: string; search?: string }): Promise<Team[]> {
    const params = new URLSearchParams();
    if (_params?.leagueId) params.set("league", _params.leagueId);
    if (_params?.search) params.set("search", _params.search);

    const url = `${BASE_URL}/teams?${params.toString()}`;
    const data = await withRetry<{ response: BasketballTeamResponse[] }>(() =>
      basketballApiFetch<{ response: BasketballTeamResponse[] }>(url, this.apiKey, 86400)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.map((item) =>
      normalizeBasketballTeam({
        id: item.id,
        name: item.name,
        logo: item.logo,
        country: item.country,
      })
    );
  }

  async getTeam(id: string): Promise<Team | null> {
    const url = `${BASE_URL}/teams?id=${encodeURIComponent(id)}`;
    const data = await withRetry<{ response: BasketballTeamResponse[] }>(() =>
      basketballApiFetch<{ response: BasketballTeamResponse[] }>(url, this.apiKey, 86400)
    );
    if (!data?.response || !Array.isArray(data.response) || data.response.length === 0) return null;
    return normalizeBasketballTeam(data.response[0]);
  }

  async getPlayers(_params?: { teamId?: string; search?: string }): Promise<Player[]> {
    const params = new URLSearchParams();
    if (_params?.teamId) params.set("team", _params.teamId);
    if (_params?.search) params.set("search", _params.search);

    const url = `${BASE_URL}/players?${params.toString()}`;
    const data = await withRetry<{ response: unknown[] }>(() =>
      basketballApiFetch<{ response: unknown[] }>(url, this.apiKey, 86400)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    const players: Player[] = [];
    for (const item of data.response) {
      const player = (item as { player: { id: number; name: string } }).player;
      players.push({
        id: String(player.id),
        name: player.name,
        teamId: "",
        stats: {},
      });
    }
    return players;
  }

  async getStandings(_params: { leagueId: string; season?: string }): Promise<Standing[]> {
    const season = _params.season ?? String(new Date().getFullYear());
    const url = `${BASE_URL}/standings?league=${encodeURIComponent(_params.leagueId)}&season=${encodeURIComponent(season)}`;
    const data = await withRetry<BasketballStandingsResponse>(() =>
      basketballApiFetch<BasketballStandingsResponse>(url, this.apiKey, 300)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }

    const standings: Standing[] = [];
    for (const leagueStandings of data.response) {
      if (!leagueStandings?.standings) continue;
      for (const standing of leagueStandings.standings) {
        standings.push({
          teamId: String(standing.team_id),
          position: standing.rank,
          points: standing.points,
          played: standing.games_played,
          won: standing.wins,
          lost: standing.losses,
          sportId: "basketball",
        });
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

    const [teams, leagues, games] = await Promise.all([
      this.searchTeams(query, limit),
      this.searchLeagues(query, limit),
      this.searchGames(query, limit),
    ]);

    results.push(...teams, ...leagues, ...games);

    return results.slice(0, limit);
  }

  private async searchTeams(query: string, limit: number): Promise<SearchResult[]> {
    const data = await withRetry<{ response: BasketballTeamResponse[] }>(() =>
      basketballApiFetch<{ response: BasketballTeamResponse[] }>(`${BASE_URL}/teams?search=${encodeURIComponent(query)}`, this.apiKey, 60)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.slice(0, limit).map((item) => ({
      type: "team" as const,
      id: String(item.id),
      name: item.name,
      subtitle: item.country?.name,
      href: `/team/${item.id}`,
      logo: safeString(item.logo),
    }));
  }

  private async searchLeagues(query: string, limit: number): Promise<SearchResult[]> {
    const data = await withRetry<{ response: BasketballLeagueResponse[] }>(() =>
      basketballApiFetch<{ response: BasketballLeagueResponse[] }>(`${BASE_URL}/leagues?search=${encodeURIComponent(query)}`, this.apiKey, 86400)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.slice(0, limit).map((item) => ({
      type: "league" as const,
      id: String(item.id),
      name: item.name,
      subtitle: item.country?.name,
      href: `/league/${item.id}`,
      logo: safeString(item.logo),
    }));
  }

  private async searchGames(query: string, limit: number): Promise<SearchResult[]> {
    const data = await withRetry<{ response: BasketballGameResponse[] }>(() =>
      basketballApiFetch<{ response: BasketballGameResponse[] }>(`${BASE_URL}/games?search=${encodeURIComponent(query)}`, this.apiKey, 60)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.slice(0, limit).map((game) => ({
      type: "match" as const,
      id: String(game.id),
      name: `${game.teams?.home?.name ?? "Unknown"} vs ${game.teams?.away?.name ?? "Unknown"}`,
      subtitle: game.league?.name,
      href: `/match/${game.id}`,
    }));
  }

  async getMatchEvents(_params: GetMatchEventsParams): Promise<MatchEvent[]> {
    const url = `${BASE_URL}/games/events?id=${encodeURIComponent(_params.matchId)}`;
    const data = await withRetry<BasketballEventsResponse>(() =>
      basketballApiFetch<BasketballEventsResponse>(url, this.apiKey, 60)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.map((event) => ({
      id: `${_params.matchId}-${event.player?.id ?? 0}-${event.quarter ?? 0}-${event.time ?? "0"}-${event.event_type}`,
      matchId: _params.matchId,
      type: (event.event_type ?? "unknown") as MatchEvent["type"],
      minute: event.quarter ?? 0,
      teamId: event.team ? String(event.team.id) : "0",
      playerName: event.player?.name ?? "Unknown",
      detail: safeString(event.detail),
    }));
  }

  async getMatchStatistics(_params: GetMatchStatisticsParams): Promise<MatchStatistics[]> {
    const url = `${BASE_URL}/games/statistics?id=${encodeURIComponent(_params.matchId)}`;
    const data = await withRetry<BasketballStatisticsResponse>(() =>
      basketballApiFetch<BasketballStatisticsResponse>(url, this.apiKey, 60)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }

    const teamStatsMap = new Map<string, Map<string, number | string>>();
    for (const teamStats of data.response) {
      const teamId = String(teamStats.team_id);
      const statsMap = new Map<string, number | string>();
      for (const s of teamStats.statistics) {
        if (s.value != null && s.value !== "") {
          statsMap.set(s.type, s.value as number | string);
        }
      }
      teamStatsMap.set(teamId, statsMap);
    }

    return data.response.map((teamStats) => {
      const teamId = String(teamStats.team_id);
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
        teamName: teamStats.team_name,
        stats: mappedStats,
      };
    });
  }

  async getMatchLineups(_params: GetMatchLineupsParams): Promise<MatchLineup[]> {
    const url = `${BASE_URL}/games/lineups?id=${encodeURIComponent(_params.matchId)}`;
    const data = await withRetry<BasketballLineupsResponse>(() =>
      basketballApiFetch<BasketballLineupsResponse>(url, this.apiKey, 60)
    );
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }
    return data.response.map((teamLineup) => ({
      matchId: _params.matchId,
      teamId: String(teamLineup.team_id),
      teamName: teamLineup.team_name,
      formation: "",
      startXI: teamLineup.starting_lineups.map((player) => ({
        id: String(player.player_id),
        name: player.player_name,
        position: player.position ?? "",
        number: player.number ?? undefined,
        teamId: String(teamLineup.team_id),
      })),
      substitutes: teamLineup.bench.map((player) => ({
        id: String(player.player_id),
        name: player.player_name,
        position: player.position ?? "",
        number: player.number ?? undefined,
        teamId: String(teamLineup.team_id),
        isSubstitute: true,
      })),
    }));
  }
}
