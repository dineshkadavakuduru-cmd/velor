export type ApiSportsStatus =
  | "Not Started"
  | "First Half"
  | "Halftime"
  | "Second Half"
  | "Extra Time"
  | "Penalty"
  | "Match Finished"
  | "Finished"
  | "Postponed"
  | "Cancelled"
  | "Abandoned"
  | "Suspended"
  | "TBD"
  | string;

export function normalizeMatchStatus(status: ApiSportsStatus): "scheduled" | "live" | "halftime" | "finished" | "postponed" | "cancelled" {
  const normalized = status.toLowerCase();
  if (normalized.includes("not started") || normalized.includes("tbd") || normalized === "ns") {
    return "scheduled";
  }
  if (normalized.includes("halftime") || normalized === "ht") {
    return "halftime";
  }
  if (normalized.includes("finished") || normalized === "ft" || normalized === "aet" || normalized.includes("fulltime")) {
    return "finished";
  }
  if (normalized.includes("postponed")) {
    return "postponed";
  }
  if (normalized.includes("cancel") || normalized.includes("abandon")) {
    return "cancelled";
  }
  if (normalized.includes("suspend")) {
    return "postponed";
  }
  return "live";
}

export function normalizeScore(score: {
    halftime?: { home: number | null; away: number | null } | null;
    fulltime?: { home: number | null; away: number | null } | null;
    extratime?: { home: number | null; away: number | null } | null;
    penalty?: { home: number | null; away: number | null } | null;
  } | null): { home: number | null; away: number | null; periodScores: { period: string; home: number; away: number }[] } {
  if (!score) {
    return { home: null, away: null, periodScores: [] };
  }

  const periodScores: { period: string; home: number; away: number }[] = [];

  if (score.halftime && score.halftime.home !== null && score.halftime.away !== null) {
    periodScores.push({ period: "HT", home: score.halftime.home, away: score.halftime.away });
  }

  if (score.extratime && score.extratime.home !== null && score.extratime.away !== null) {
    periodScores.push({ period: "ET", home: score.extratime.home, away: score.extratime.away });
  }

  if (score.penalty && score.penalty.home !== null && score.penalty.away !== null) {
    periodScores.push({ period: "PEN", home: score.penalty.home, away: score.penalty.away });
  }

  return { home: score.fulltime?.home ?? null, away: score.fulltime?.away ?? null, periodScores };
}
