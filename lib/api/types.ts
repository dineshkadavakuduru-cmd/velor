import type {
  Match,
  League,
  Team,
  Player,
  Standing,
  MatchEvent,
  MatchStatistics,
  MatchLineup,
  SearchResult,
} from "@/lib/types/sports";

export interface GetMatchesParams {
  sport?: string;
  leagueId?: string;
  teamId?: string;
  date?: string;
  status?: "live" | "scheduled" | "finished";
}

export interface GetLeaguesParams {
  sportId?: string;
}

export interface GetTeamsParams {
  leagueId?: string;
  search?: string;
}

export interface GetPlayersParams {
  teamId?: string;
  search?: string;
}

export interface GetStandingsParams {
  leagueId: string;
  season?: string;
}

export interface GetMatchEventsParams {
  matchId: string;
}

export interface GetMatchStatisticsParams {
  matchId: string;
}

export interface GetMatchLineupsParams {
  matchId: string;
}

export interface SearchParams {
  query: string;
  limit?: number;
}

export interface SportsProvider {
  getLiveMatches(): Promise<Match[]>;
  getMatches(params?: GetMatchesParams): Promise<Match[]>;
  getMatch(id: string): Promise<Match | null>;
  getLeagues(params?: GetLeaguesParams): Promise<League[]>;
  getLeague(id: string): Promise<League | null>;
  getTeams(params?: GetTeamsParams): Promise<Team[]>;
  getTeam(id: string): Promise<Team | null>;
  getPlayers(params?: GetPlayersParams): Promise<Player[]>;
  getStandings(params: GetStandingsParams): Promise<Standing[]>;
  search(params: SearchParams): Promise<SearchResult[]>;
  getMatchEvents(params: GetMatchEventsParams): Promise<MatchEvent[]>;
  getMatchStatistics(params: GetMatchStatisticsParams): Promise<MatchStatistics[]>;
  getMatchLineups(params: GetMatchLineupsParams): Promise<MatchLineup[]>;
}

export interface SportsProviderFactory {
  create(): SportsProvider;
}

export type {
  Match,
  League,
  Team,
  Player,
  Standing,
  MatchEvent,
  MatchStatistics,
  MatchLineup,
  SearchResult,
} from "@/lib/types/sports";
