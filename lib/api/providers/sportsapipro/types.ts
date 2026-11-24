/**
 * Raw response shapes for the API-Sports Pro platform
 * (v2.<sport>.sportsapipro.com), shared by the football and basketball
 * providers.
 *
 * The platform is a single gateway: list endpoints (`/live`, `/today`,
 * `/schedule/<date>`) are sport-scoped by the subdomain, while by-id
 * endpoints (`/match/<id>`, `/team/<id>`, `/tournament/<id>/info`) and
 * `/search` resolve entities from every sport. Callers must therefore
 * verify the entity's sport before accepting it (see `isForeignSport`).
 *
 * Only the fields VELOR consumes are typed; every field is optional so a
 * partial upstream payload degrades gracefully instead of throwing.
 */

export interface SportsApiProSportRef {
  id?: number | string | null;
  name?: string | null;
  slug?: string | null;
}

export interface SportsApiProTeam {
  id?: number | string | null;
  name?: string | null;
  shortName?: string | null;
  nameCode?: string | null;
  slug?: string | null;
  country?: { name?: string | null; alpha2?: string | null } | null;
  gender?: string | null;
  national?: boolean | null;
  category?: SportsApiProTournamentCategory | null;
  primaryUniqueTournament?: { name?: string | null } | null;
  teamColors?: { primary?: string | null; secondary?: string | null } | null;
  sport?: SportsApiProSportRef | null;
}

export interface SportsApiProTournamentCategory {
  name?: string | null;
  country?: { name?: string | null; alpha2?: string | null } | null;
  sport?: SportsApiProSportRef | null;
}

export interface SportsApiProTournament {
  id?: number | string | null;
  name?: string | null;
  slug?: string | null;
  category?: SportsApiProTournamentCategory | null;
  uniqueTournament?: {
    id?: number | string | null;
    name?: string | null;
    category?: SportsApiProTournamentCategory | null;
  } | null;
}

export interface SportsApiProScore {
  current?: number | null;
  display?: number | null;
  normaltime?: number | null;
  period1?: number | null;
  period2?: number | null;
  period3?: number | null;
  period4?: number | null;
  period5?: number | null;
  overtime?: number | null;
}

export interface SportsApiProStatus {
  code?: number | null;
  description?: string | null;
  type?: string | null;
}

export interface SportsApiProEvent {
  id?: number | string | null;
  tournament?: SportsApiProTournament | string | null;
  status?: SportsApiProStatus | string | null;
  homeTeam?: SportsApiProTeam | string | null;
  awayTeam?: SportsApiProTeam | string | null;
  homeScore?: SportsApiProScore | number | null;
  awayScore?: SportsApiProScore | number | null;
  startTimestamp?: number | null;
  venue?: { name?: string | null } | null;
  roundInfo?: { round?: number | null } | null;
  slug?: string | null;
}

export interface SportsApiProSearchResult {
  entity?: SportsApiProTeam | null;
  type?: string | null;
}

export interface SportsApiProIncident {
  id?: number | string | null;
  incidentType?: string | null;
  incidentClass?: string | null;
  isHome?: boolean | null;
  time?: number | null;
  text?: string | null;
  reason?: string | null;
  player?: { id?: number | string | null; name?: string | null } | null;
  playerName?: string | null;
  assist1?: { id?: number | string | null; name?: string | null } | null;
  homeScore?: number | null;
  awayScore?: number | null;
}

export interface SportsApiProStatisticItem {
  name?: string | null;
  home?: number | string | null;
  away?: number | string | null;
  homeValue?: number | string | null;
  awayValue?: number | string | null;
}

export interface SportsApiProStatisticsGroup {
  groupName?: string | null;
  statisticsItems?: SportsApiProStatisticItem[] | null;
}

export interface SportsApiProStatisticsPeriod {
  period?: string | null;
  groups?: SportsApiProStatisticsGroup[] | null;
}

export interface SportsApiProLineupPlayer {
  player?: {
    id?: number | string | null;
    name?: string | null;
    shortName?: string | null;
    position?: string | null;
    jerseyNumber?: string | number | null;
  } | null;
  substitute?: boolean | null;
}

export interface SportsApiProLineupTeam {
  players?: SportsApiProLineupPlayer[] | null;
  formation?: string | null;
}

export interface SportsApiProSeason {
  id?: number | string | null;
  name?: string | null;
  year?: string | null;
}

export interface SportsApiProStanding {
  position?: number | null;
  teamId?: number | string | null;
  teamName?: string | null;
  played?: number | null;
  won?: number | null;
  drawn?: number | null;
  lost?: number | null;
  goalsFor?: number | null;
  goalsAgainst?: number | null;
  points?: number | null;
}
