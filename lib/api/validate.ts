export interface MatchFilterParams {
  sport?: string;
  leagueId?: string;
  teamId?: string;
  date?: string;
  status?: "live" | "scheduled" | "finished";
}

const SPORT_ID_PATTERN = /^[a-z0-9-]+$/i;
const LEAGUE_ID_PATTERN = /^[a-zA-Z0-9-]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateMatchFilters(params: Record<string, string | string[] | undefined>): MatchFilterParams {
  const result: MatchFilterParams = {};

  const sport = getFirstValue(params.sport);
  if (sport && SPORT_ID_PATTERN.test(sport)) {
    result.sport = sport;
  }

  const league = getFirstValue(params.leagueId);
  if (league && LEAGUE_ID_PATTERN.test(league)) {
    result.leagueId = league;
  }

  const team = getFirstValue(params.teamId);
  if (team && LEAGUE_ID_PATTERN.test(team)) {
    result.teamId = team;
  }

  const date = getFirstValue(params.date);
  if (date && DATE_PATTERN.test(date)) {
    result.date = date;
  }

  const status = getFirstValue(params.status);
  if (status && ["live", "scheduled", "finished"].includes(status)) {
    result.status = status as MatchFilterParams["status"];
  }

  return result;
}

export function validateSearchQuery(query: string): string {
  const trimmed = query.trim();
  if (trimmed.length < 2) return "";
  if (trimmed.length > 100) return trimmed.slice(0, 100);
  return trimmed;
}

export function validateLeagueId(id: string): string | null {
  if (!id || typeof id !== "string") return null;
  const trimmed = id.trim();
  if (trimmed.length === 0) return null;
  if (!LEAGUE_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function validateTeamId(id: string): string | null {
  if (!id || typeof id !== "string") return null;
  const trimmed = id.trim();
  if (trimmed.length === 0) return null;
  if (!LEAGUE_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function validateMatchId(id: string): string | null {
  if (!id || typeof id !== "string") return null;
  const trimmed = id.trim();
  if (trimmed.length === 0) return null;
  if (!LEAGUE_ID_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function getFirstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
