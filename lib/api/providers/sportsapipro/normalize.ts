import type { League, Match, MatchStatus, PeriodScore, Sport, Team } from "../../../types/sports";
import type {
  SportsApiProEvent,
  SportsApiProScore,
  SportsApiProTeam,
  SportsApiProTournament,
} from "./types";

/**
 * Normalizers for the API-Sports Pro platform, shared by the football and
 * basketball providers. The event/team/tournament shapes are identical
 * across sports, so only the sport identity and period labels differ.
 */

const PERIOD_KEYS = ["period1", "period2", "period3", "period4", "period5", "overtime"] as const;

const PERIOD_LABELS: Record<string, readonly string[]> = {
  football: ["1H", "2H", "ET1", "ET2", "PEN", "AET"],
  basketball: ["Q1", "Q2", "Q3", "Q4", "OT", "OT2"],
};

function periodLabel(sportId: string, index: number): string {
  return PERIOD_LABELS[sportId]?.[index] ?? `P${index + 1}`;
}

function safeString(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function shortNameOf(name: string, shortName?: string | null, nameCode?: string | null): string {
  const explicit = safeString(shortName) ?? safeString(nameCode);
  if (explicit) return explicit;
  return name.length > 3 ? name.slice(0, 3).toUpperCase() : name.toUpperCase();
}

export function normalizeSportsApiProStatus(status: SportsApiProStatusLike): MatchStatus {
  if (status && typeof status === "object") {
    const code = status.code ?? null;
    const type = (status.type ?? "").toLowerCase();
    const description = (status.description ?? "").toLowerCase();

    if (code === 0 || type === "notstarted") return "scheduled";
    if (type === "postponed" || code === 60) return "postponed";
    if (type === "canceled" || type === "cancelled" || code === 70) return "cancelled";
    if (type === "finished" || code === 100) return "finished";
    if (type === "abandoned" || (code != null && code >= 80)) return "abandoned";
    if (type === "suspended") return "suspended";
    if (type === "delayed") return "delayed";
    if (description === "halftime" || description === "half time" || description === "ht") return "halftime";
    return "live";
  }

  const normalized = String(status ?? "").toLowerCase();
  if (normalized.includes("not started") || normalized === "ns" || normalized === "tbd") return "scheduled";
  if (normalized.includes("halftime") || normalized.includes("half time") || normalized === "ht") return "halftime";
  if (normalized.includes("finished") || normalized.includes("ended") || normalized === "ft") return "finished";
  if (normalized.includes("postponed")) return "postponed";
  if (normalized.includes("cancel")) return "cancelled";
  if (normalized.includes("abandon")) return "abandoned";
  if (normalized.includes("suspend")) return "suspended";
  if (normalized.includes("delay")) return "delayed";
  return "live";
}

type SportsApiProStatusLike =
  | { code?: number | null; description?: string | null; type?: string | null }
  | string
  | null
  | undefined;

function scoreValue(score: SportsApiProScore | number | null | undefined): number | null {
  if (typeof score === "number") return score;
  if (score && typeof score === "object") {
    return score.current ?? score.display ?? score.normaltime ?? null;
  }
  return null;
}

export function normalizeSportsApiProScore(
  homeScore: SportsApiProScore | number | null | undefined,
  awayScore: SportsApiProScore | number | null | undefined,
  sportId: string
): { home: number | null; away: number | null; periodScores: PeriodScore[] } {
  const home = scoreValue(homeScore);
  const away = scoreValue(awayScore);

  const periodScores: PeriodScore[] = [];
  if (homeScore && awayScore && typeof homeScore === "object" && typeof awayScore === "object") {
    PERIOD_KEYS.forEach((key, index) => {
      const homeValue = homeScore[key] ?? null;
      const awayValue = awayScore[key] ?? null;
      if (homeValue != null || awayValue != null) {
        periodScores.push({ period: periodLabel(sportId, index), home: homeValue, away: awayValue });
      }
    });
  }

  return { home, away, periodScores };
}

export function normalizeSportsApiProTeam(
  team: SportsApiProTeam | string | null | undefined,
  sportId: string
): Team {
  if (typeof team === "string") {
    return { id: "", name: team, shortName: shortNameOf(team), sportId };
  }
  if (!team || typeof team !== "object") {
    return { id: "", name: "Unknown", shortName: "UNK", sportId };
  }
  const name = safeString(team.name) ?? "Unknown";
  const primary = safeString(team.teamColors?.primary);
  const gender = team.gender === "M" ? "Men’s" : team.gender === "F" ? "Women’s" : undefined;
  const ageGroup = /\bU\d{2}\b/i.exec(name)?.[0].toUpperCase();
  const squadCategory = [gender, ageGroup, team.national === true ? "national team" : "team"]
    .filter(Boolean).join(" ");
  return {
    id: team.id != null ? String(team.id) : "",
    name,
    shortName: shortNameOf(name, team.shortName, team.nameCode),
    country: safeString(team.country?.name) ?? safeString(team.category?.name),
    squadCategory: gender || ageGroup || team.national === true ? squadCategory : undefined,
    competition: safeString(team.primaryUniqueTournament?.name),
    colors: primary ? { primary, secondary: safeString(team.teamColors?.secondary) } : undefined,
    sportId,
  };
}

export function normalizeSportsApiProLeague(
  tournament: SportsApiProTournament | string | null | undefined,
  sportId: string
): League {
  if (typeof tournament === "string") {
    return { id: tournament, sportId, name: tournament, country: "" };
  }
  if (!tournament || typeof tournament !== "object") {
    return { id: "0", sportId, name: "Unknown", country: "" };
  }
  const id = tournament.uniqueTournament?.id ?? tournament.id ?? tournament.name ?? "0";
  const name = safeString(tournament.uniqueTournament?.name) ?? safeString(tournament.name) ?? "Unknown";
  const country = safeString(tournament.category?.country?.name) ?? safeString(tournament.category?.name) ?? "";
  return { id: String(id), sportId, name, country };
}

export function normalizeSportsApiProMatch(
  event: SportsApiProEvent,
  sportId: string,
  sportName: string
): Match {
  const status = normalizeSportsApiProStatus(event.status);
  const { home, away, periodScores } = normalizeSportsApiProScore(event.homeScore, event.awayScore, sportId);
  const round = event.roundInfo?.round;

  return {
    id: String(event.id ?? ""),
    sport: { id: sportId, name: sportName, slug: sportId } as Sport,
    league: normalizeSportsApiProLeague(event.tournament, sportId),
    homeTeam: normalizeSportsApiProTeam(event.homeTeam, sportId),
    awayTeam: normalizeSportsApiProTeam(event.awayTeam, sportId),
    score: { home, away, periodScores },
    status,
    startTime: event.startTimestamp ? new Date(event.startTimestamp * 1000).toISOString() : "",
    venue: safeString(event.venue?.name),
    round: round != null ? `Round ${round}` : undefined,
  };
}

/**
 * Best-effort sport slug extraction from any platform entity (event,
 * team, tournament, search entity). Returns undefined when the payload
 * does not state a sport.
 */
export function extractSportSlug(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const sport = obj.sport as { slug?: string | null } | undefined;
  if (safeString(sport?.slug)) return sport?.slug ?? undefined;

  const category = obj.category as { sport?: { slug?: string | null } | null } | undefined;
  if (safeString(category?.sport?.slug)) return category?.sport?.slug ?? undefined;

  const tournament = obj.tournament as
    | { category?: { sport?: { slug?: string | null } | null } | null; uniqueTournament?: { category?: { sport?: { slug?: string | null } | null } | null } | null }
    | undefined;
  if (safeString(tournament?.category?.sport?.slug)) return tournament?.category?.sport?.slug ?? undefined;
  if (safeString(tournament?.uniqueTournament?.category?.sport?.slug)) {
    return tournament?.uniqueTournament?.category?.sport?.slug ?? undefined;
  }

  const unique = obj.uniqueTournament as { category?: { sport?: { slug?: string | null } | null } | null } | undefined;
  if (safeString(unique?.category?.sport?.slug)) return unique?.category?.sport?.slug ?? undefined;

  return undefined;
}

/**
 * True when an entity positively belongs to a different sport. The guard is
 * lenient: an entity whose payload does not state a sport is accepted, so
 * partial mocks and by-id payloads without a sport still resolve.
 */
export function isForeignSport(value: unknown, expectedSlug: string): boolean {
  const found = extractSportSlug(value);
  return typeof found === "string" && found.length > 0 && found !== expectedSlug;
}
