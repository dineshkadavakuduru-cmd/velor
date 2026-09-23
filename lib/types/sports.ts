export type SportId = string;
export type LeagueId = string;
export type TeamId = string;
export type PlayerId = string;
export type MatchId = string;
export type SportCategory = "team" | "individual" | "dual";

export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed"
  | "cancelled"
  | "abandoned"
  | "suspended"
  | "delayed"
  | "retired"
  | "walkover"
  | "break"
  | "interval";

export type MatchEventType =
  | "goal"
  | "card"
  | "substitution"
  | "period_start"
  | "period_end"
  | "penalty"
  | "var"
  | "wicket"
  | "boundary"
  | "milestone"
  | "ace"
  | "double_fault"
  | "break_point"
  | "service_winner"
  | string;

export interface MatchEvent {
  id: string;
  matchId: MatchId;
  type: MatchEventType;
  minute: number;
  teamId: TeamId;
  playerName: string;
  detail?: string;
  assistPlayerName?: string;
}

export interface MatchStatistics {
  matchId: MatchId;
  teamId: TeamId;
  teamName: string;
  stats: Array<{
    type: string;
    value: number | string;
    opponentValue: number | string;
  }>;
}

export interface LineupPlayer {
  id: string;
  name: string;
  position: string;
  number?: number;
  teamId: TeamId;
  isSubstitute?: boolean;
}

export interface MatchLineup {
  matchId: MatchId;
  teamId: TeamId;
  teamName: string;
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface PlayerMatchStats {
  playerId: PlayerId;
  matchId: MatchId;
  teamId: TeamId;
  playerName: string;
  position?: string;
  stats: Record<string, number | string>;
}

export type SearchResultType = "team" | "league" | "match";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  name: string;
  subtitle?: string;
  href: string;
  logo?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

export interface Sport {
  id: SportId;
  name: string;
  slug: string;
  category?: SportCategory;
  shortName?: string;
}

export interface League {
  id: LeagueId;
  sportId: SportId;
  name: string;
  country: string;
  logo?: string;
}

export interface Team {
  id: TeamId;
  name: string;
  shortName: string;
  logo?: string;
  colors?: {
    primary: string;
    secondary?: string;
  };
  venue?: string;
  country?: string;
  sportId?: SportId;
}

export interface Player {
  id: PlayerId;
  name: string;
  position?: string;
  teamId?: TeamId;
  stats?: Record<string, unknown>;
}

export interface PeriodScore {
  period: string;
  home: number | null;
  away: number | null;
}

export interface Score {
  home: number | null;
  away: number | null;
  periodScores?: PeriodScore[];
}

export interface Participant {
  id: string;
  name: string;
  type: "team" | "player";
  logo?: string;
  shortName?: string;
}

export interface Match {
  id: MatchId;
  sport: Sport;
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  status: MatchStatus;
  startTime: string;
  venue?: string;
  period?: string;
  participants?: Participant[];
  format?: string;
  surface?: string;
  round?: string;
  roundCode?: string;
  innings?: Array<{
    teamId: TeamId;
    runs: number | null;
    wickets: number | null;
    overs: number | string | null;
  }>;
}

export interface Standing {
  teamId: TeamId;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  sportId?: SportId;
}

export interface Favorite {
  userId: string;
  entityType: "team" | "player" | "match" | "league";
  entityId: string;
}

export interface User {
  id: string;
  email?: string;
  preferences?: Record<string, unknown>;
}
