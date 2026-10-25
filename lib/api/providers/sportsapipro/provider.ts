import type {
  SportsProvider,
  GetMatchesParams,
  Match,
  League,
  Team,
  Player,
  Standing,
  MatchEvent,
  MatchStatistics,
  MatchLineup,
  SearchResult,
  GetMatchEventsParams,
  GetMatchStatisticsParams,
  GetMatchLineupsParams,
  SearchParams,
} from "../../types";
import { SportsApiError } from "../../error";
import {
  extractEntity,
  extractEvents,
  extractSearchResults,
  sportsApiProFetch,
  withRetry,
} from "./client";
import {
  isForeignSport,
  normalizeSportsApiProLeague,
  normalizeSportsApiProMatch,
  normalizeSportsApiProTeam,
} from "./normalize";
import type {
  SportsApiProEvent,
  SportsApiProIncident,
  SportsApiProLineupTeam,
  SportsApiProSearchResult,
  SportsApiProSeason,
  SportsApiProStanding,
  SportsApiProStatisticsPeriod,
  SportsApiProTeam,
  SportsApiProTournament,
} from "./types";

/**
 * A team sport on the API-Sports Pro platform (`v2.<sport>.sportsapipro.com`).
 *
 * The platform replaced the retired `*.api-sports.io` hosts (which now answer
 * HTTP 403 for every request). It is a single gateway: list endpoints
 * (`/live`, `/today`, `/schedule/<date>`) are scoped by the subdomain, but
 * by-id routes (`/match/<id>`, `/team/<id>`, `/tournament/<id>/info`) and
 * `/search` resolve entities from every sport. Every by-id lookup is
 * therefore guarded by `isForeignSport` so a match/team/league is never
 * mis-attributed to the wrong sport.
 */
export interface SportsApiProConfig {
  /** Root host, e.g. `https://v2.football.sportsapipro.com`. */
  baseUrl: string;
  /** Provider identifier for diagnostics and the last-good store. */
  providerName: string;
  sportId: string;
  sportName: string;
  /** Sport slug as stated by the platform (`football`, `basketball`, …). */
  sportSlug: string;
}

const TODAY_REVALIDATE = 60;
const MATCH_REVALIDATE = 60;
const SCHEDULE_REVALIDATE = 300;
const REFERENCE_REVALIDATE = 86400;

interface ListResponse<T> {
  events?: T[] | null;
  data?: { events?: T[] | null } | null;
}

function isNotFound(error: unknown): boolean {
  if (error instanceof SportsApiError) return error.meta.status === 404;
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("API_ERROR:404");
}

function optional(value: string | null | undefined): string | undefined {
  return value ?? undefined;
}

export class SportsApiProProvider implements SportsProvider {
  protected readonly config: SportsApiProConfig;
  private readonly apiKey: string;

  constructor(config: SportsApiProConfig, apiKey: string) {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new SportsApiError({
        provider: config.providerName,
        endpoint: "(missing)",
        kind: "AUTH_FAILURE",
        detail: "API key is not configured. Set VELOR_API_SPORTS_KEY on the server.",
      });
    }
    this.config = config;
    this.apiKey = apiKey;
  }

  private async fetchJson<T>(path: string, revalidate?: number): Promise<T> {
    return withRetry(() =>
      sportsApiProFetch<T>(
        { baseUrl: this.config.baseUrl, providerName: this.config.providerName },
        path,
        this.apiKey,
        revalidate
      )
    );
  }

  private async fetchEvents(path: string, revalidate?: number): Promise<SportsApiProEvent[]> {
    const data = await this.fetchJson<ListResponse<SportsApiProEvent>>(path, revalidate);
    return extractEvents(data);
  }

  /** Resolve a single event by id, rejecting 404s and other sports' matches. */
  private async fetchEvent(id: string): Promise<SportsApiProEvent | null> {
    let data: unknown;
    try {
      data = await this.fetchJson<unknown>(`/match/${encodeURIComponent(id)}`, MATCH_REVALIDATE);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
    const event = extractEntity<SportsApiProEvent>(data, "event");
    if (!event || isForeignSport(event, this.config.sportSlug)) return null;
    return event;
  }

  private async fetchTeamIds(
    id: string
  ): Promise<{ homeId: string; awayId: string; homeName: string; awayName: string }> {
    const event = await this.fetchEvent(id).catch(() => null);
    const home = event?.homeTeam && typeof event.homeTeam === "object" ? event.homeTeam : undefined;
    const away = event?.awayTeam && typeof event.awayTeam === "object" ? event.awayTeam : undefined;
    return {
      homeId: home?.id != null ? String(home.id) : "",
      awayId: away?.id != null ? String(away.id) : "",
      homeName: home?.name ?? "Unknown",
      awayName: away?.name ?? "Unknown",
    };
  }

  private toMatch(event: SportsApiProEvent): Match {
    return normalizeSportsApiProMatch(event, this.config.sportId, this.config.sportName);
  }

  async getLiveMatches(): Promise<Match[]> {
    // `/today` carries the rich, id-complete event shape (the flat `/live`
    // feed omits team ids). Live matches are by definition today's, so the
    // filtered `/today` set is both complete and consistent with
    // getMatches(): one shared upstream payload.
    const events = await this.fetchEvents("/today", TODAY_REVALIDATE);
    return events
      .map((event) => this.toMatch(event))
      .filter((match) => match.status === "live" || match.status === "halftime");
  }

  async getMatches(params?: GetMatchesParams): Promise<Match[]> {
    const path = params?.date ? `/schedule/${encodeURIComponent(params.date)}` : "/today";
    const revalidate = params?.date ? SCHEDULE_REVALIDATE : TODAY_REVALIDATE;
    const events = await this.fetchEvents(path, revalidate);
    let matches = events.map((event) => this.toMatch(event));

    if (params?.status) {
      const target = params.status;
      matches = matches.filter((m) =>
        target === "live" ? m.status === "live" || m.status === "halftime" : m.status === target
      );
    }
    if (params?.leagueId) {
      matches = matches.filter((m) => m.league.id === params.leagueId);
    }
    if (params?.teamId) {
      matches = matches.filter((m) => m.homeTeam.id === params.teamId || m.awayTeam.id === params.teamId);
    }
    return matches;
  }

  async getMatch(id: string): Promise<Match | null> {
    const event = await this.fetchEvent(id);
    return event ? this.toMatch(event) : null;
  }

  async getLeagues(): Promise<League[]> {
    const events = await this.fetchEvents("/today", TODAY_REVALIDATE);
    const leagues = new Map<string, League>();
    for (const event of events) {
      const league = normalizeSportsApiProLeague(event.tournament, this.config.sportId);
      if (league.id !== "0" && league.name !== "Unknown") {
        leagues.set(league.id, league);
      }
    }
    return Array.from(leagues.values());
  }

  async getLeague(id: string): Promise<League | null> {
    let data: unknown;
    try {
      data = await this.fetchJson<unknown>(`/tournament/${encodeURIComponent(id)}/info`, REFERENCE_REVALIDATE);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
    const tournament = extractEntity<SportsApiProTournament>(data, "uniqueTournament");
    if (!tournament || isForeignSport(tournament, this.config.sportSlug)) return null;
    return normalizeSportsApiProLeague(tournament, this.config.sportId);
  }

  async getTeams(params?: { leagueId?: string; search?: string }): Promise<Team[]> {
    if (params?.search) {
      const entities = await this.searchEntities(params.search);
      return entities
        .filter((result) => result.type === "team" && result.entity)
        .map((result) => normalizeSportsApiProTeam(result.entity as SportsApiProTeam, this.config.sportId));
    }

    if (params?.leagueId) {
      const events = await this.fetchEvents("/today", TODAY_REVALIDATE);
      const teams = new Map<string, Team>();
      for (const event of events) {
        const league = normalizeSportsApiProLeague(event.tournament, this.config.sportId);
        if (league.id !== params.leagueId) continue;
        for (const side of [event.homeTeam, event.awayTeam]) {
          const team = normalizeSportsApiProTeam(side, this.config.sportId);
          if (team.id) teams.set(team.id, team);
        }
      }
      return Array.from(teams.values());
    }

    return [];
  }

  async getTeam(id: string): Promise<Team | null> {
    let data: unknown;
    try {
      data = await this.fetchJson<unknown>(`/team/${encodeURIComponent(id)}`, REFERENCE_REVALIDATE);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
    const team = extractEntity<SportsApiProTeam>(data, "team");
    if (!team || isForeignSport(team, this.config.sportSlug)) return null;
    return normalizeSportsApiProTeam(team, this.config.sportId);
  }

  async getPlayers(params?: { teamId?: string; search?: string }): Promise<Player[]> {
    if (params?.teamId) {
      const data = await this.fetchJson<unknown>(
        `/team/${encodeURIComponent(params.teamId)}/players`,
        REFERENCE_REVALIDATE
      );
      const list = extractEntity<
        Array<{ player?: { id?: number | string | null; name?: string | null; position?: string | null } | null }>
      >(data, "players");
      if (!Array.isArray(list)) return [];
      return list
        .map((entry) => entry.player)
        .filter((player): player is NonNullable<typeof player> => Boolean(player))
        .map((player) => ({
          id: player.id != null ? String(player.id) : "",
          name: player.name ?? "Unknown",
          position: player.position ?? undefined,
          teamId: params.teamId,
          sportId: this.config.sportId,
          stats: {},
        }));
    }

    if (params?.search) {
      const entities = await this.searchEntities(params.search);
      return entities
        .filter((result) => result.type === "player" && result.entity)
        .map((result) => ({
          id: result.entity?.id != null ? String(result.entity.id) : "",
          name: result.entity?.name ?? "Unknown",
          sportId: this.config.sportId,
          stats: {},
        }));
    }

    return [];
  }

  getTeamSquad(teamId: string): Promise<Player[]> {
    return this.getPlayers({ teamId });
  }

  async getPlayer(id: string): Promise<Player | null> {
    let data: unknown;
    try {
      data = await this.fetchJson<unknown>(`/player/${encodeURIComponent(id)}`, REFERENCE_REVALIDATE);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
    const player = extractEntity<{ id?: number | string | null; name?: string | null; position?: string | null }>(
      data,
      "player"
    );
    if (!player) return null;
    return {
      id: player.id != null ? String(player.id) : id,
      name: player.name ?? "Unknown",
      position: player.position ?? undefined,
      sportId: this.config.sportId,
      stats: {},
    };
  }

  async getStandings(params: { leagueId: string; season?: string }): Promise<Standing[]> {
    const seasonsData = await this.fetchJson<{ seasons?: SportsApiProSeason[] | null }>(
      `/tournament/${encodeURIComponent(params.leagueId)}/seasons`,
      SCHEDULE_REVALIDATE
    );
    const seasons = seasonsData?.seasons ?? [];
    const requested = params.season;
    const season = seasons.find((s) => String(s.id) === requested || s.year === requested) ?? seasons[0];
    if (!season?.id) return [];

    const data = await this.fetchJson<{ standings?: SportsApiProStanding[] | null }>(
      `/tournament/${encodeURIComponent(params.leagueId)}/season/${encodeURIComponent(String(season.id))}/standings`,
      SCHEDULE_REVALIDATE
    );
    const standings = data?.standings;
    if (!Array.isArray(standings)) return [];
    return standings.map((standing) => ({
      teamId: standing.teamId != null ? String(standing.teamId) : "0",
      position: standing.position ?? 0,
      points: standing.points ?? 0,
      played: standing.played ?? 0,
      won: standing.won ?? 0,
      drawn: standing.drawn ?? undefined,
      lost: standing.lost ?? undefined,
      goalsFor: standing.goalsFor ?? undefined,
      goalsAgainst: standing.goalsAgainst ?? undefined,
      sportId: this.config.sportId,
    }));
  }

  async search(params: SearchParams): Promise<SearchResult[]> {
    const query = params.query.trim();
    if (!query || query.length < 2) return [];
    const entities = await this.searchEntities(query);
    const limit = params.limit ?? 10;
    const results: SearchResult[] = [];

    for (const result of entities) {
      if (results.length >= limit) break;
      const entity = result.entity;
      if (!entity || entity.id == null) continue;
      if (result.type === "team") {
        results.push({
          type: "team",
          id: String(entity.id),
          name: entity.name ?? "Unknown",
          subtitle: optional(entity.country?.name),
          href: `/team/${entity.id}`,
        });
      } else if (result.type === "player") {
        results.push({
          type: "player",
          id: String(entity.id),
          name: entity.name ?? "Unknown",
          subtitle: optional(entity.country?.name),
          href: `/player/${entity.id}`,
        });
      }
    }

    return results;
  }

  async getMatchEvents(params: GetMatchEventsParams): Promise<MatchEvent[]> {
    const [{ homeId, awayId }, data] = await Promise.all([
      this.fetchTeamIds(params.matchId),
      this.fetchJson<{ data?: { incidents?: SportsApiProIncident[] | null } | null }>(
        `/match/${encodeURIComponent(params.matchId)}/incidents`,
        MATCH_REVALIDATE
      ),
    ]);
    const incidents = data?.data?.incidents;
    if (!Array.isArray(incidents)) return [];
    return incidents.map((incident, index) => ({
      id: `${params.matchId}-${incident.id ?? index}`,
      matchId: params.matchId,
      type: incident.incidentType ?? "unknown",
      minute: incident.time ?? 0,
      teamId: incident.isHome === true ? homeId : incident.isHome === false ? awayId : "",
      playerName: incident.player?.name ?? incident.playerName ?? incident.text ?? "Unknown",
      playerId: incident.player?.id != null ? String(incident.player.id) : undefined,
      detail: optional(incident.text ?? incident.reason ?? incident.incidentClass),
      assistPlayerName: optional(incident.assist1?.name),
      assistPlayerId: incident.assist1?.id != null ? String(incident.assist1.id) : undefined,
    }));
  }

  async getMatchStatistics(params: GetMatchStatisticsParams): Promise<MatchStatistics[]> {
    const [{ homeId, awayId, homeName, awayName }, data] = await Promise.all([
      this.fetchTeamIds(params.matchId),
      this.fetchJson<{ data?: { statistics?: SportsApiProStatisticsPeriod[] | null } | null }>(
        `/match/${encodeURIComponent(params.matchId)}/statistics`,
        MATCH_REVALIDATE
      ),
    ]);
    const periods = data?.data?.statistics;
    if (!Array.isArray(periods) || periods.length === 0) return [];
    const overall = periods.find((period) => period.period === "ALL") ?? periods[0];
    const items = (overall?.groups ?? []).flatMap((group) => group.statisticsItems ?? []);
    if (items.length === 0) return [];

    const toPair = (side: "home" | "away") =>
      items.map((item) => {
        const value = side === "home" ? item.homeValue ?? item.home : item.awayValue ?? item.away;
        const opponent = side === "home" ? item.awayValue ?? item.away : item.homeValue ?? item.home;
        return { type: item.name ?? "Stat", value: value ?? 0, opponentValue: opponent ?? 0 };
      });

    return [
      { matchId: params.matchId, teamId: homeId, teamName: homeName, stats: toPair("home") },
      { matchId: params.matchId, teamId: awayId, teamName: awayName, stats: toPair("away") },
    ];
  }

  async getMatchLineups(params: GetMatchLineupsParams): Promise<MatchLineup[]> {
    const [{ homeId, awayId, homeName, awayName }, data] = await Promise.all([
      this.fetchTeamIds(params.matchId),
      this.fetchJson<{ data?: { home?: SportsApiProLineupTeam | null; away?: SportsApiProLineupTeam | null } | null }>(
        `/match/${encodeURIComponent(params.matchId)}/lineups`,
        MATCH_REVALIDATE
      ),
    ]);
    const home = data?.data?.home;
    const away = data?.data?.away;
    if (!home && !away) return [];

    const toLineup = (
      side: SportsApiProLineupTeam | null | undefined,
      teamId: string,
      teamName: string
    ): MatchLineup | null => {
      if (!side || !Array.isArray(side.players)) return null;
      return {
        matchId: params.matchId,
        teamId,
        teamName,
        formation: side.formation ?? "",
        startXI: side.players
          .filter((entry) => entry.player)
          .map((entry) => ({
            id: entry.player?.id != null ? String(entry.player.id) : "",
            name: entry.player?.name ?? "Unknown",
            position: entry.player?.position ?? "",
            number: entry.player?.jerseyNumber != null ? Number(entry.player.jerseyNumber) : undefined,
            teamId,
          })),
        substitutes: [],
      };
    };

    return [toLineup(home, homeId, homeName), toLineup(away, awayId, awayName)].filter(
      (lineup): lineup is MatchLineup => lineup !== null
    );
  }

  private async searchEntities(query: string): Promise<SportsApiProSearchResult[]> {
    // `/search` is a cross-sport gateway; keep only entities that explicitly
    // belong to this sport (or state no sport at all).
    const data = await this.fetchJson<unknown>(`/search?q=${encodeURIComponent(query)}`, TODAY_REVALIDATE);
    return extractSearchResults(data).filter(
      (result) => !result.entity || !isForeignSport(result.entity, this.config.sportSlug)
    );
  }
}
