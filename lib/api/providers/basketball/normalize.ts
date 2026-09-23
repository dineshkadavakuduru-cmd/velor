export type ApiBasketballStatus =
  | "Scheduled"
  | "In Play"
  | "Halftime"
  | "Q1"
  | "Q2"
  | "Q3"
  | "Q4"
  | "OT"
  | "OT1"
  | "OT2"
  | "OT3"
  | "OT4"
  | "OT5"
  | "OT6"
  | "Finished"
  | "FT"
  | "Postponed"
  | "Cancelled"
  | "Suspended"
  | "TBD"
  | "Delayed"
  | string;

export function normalizeBasketballMatchStatus(status: ApiBasketballStatus): "scheduled" | "live" | "halftime" | "finished" | "postponed" | "cancelled" {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("not started") ||
    normalized.includes("scheduled") ||
    normalized === "tbd" ||
    normalized === "ns"
  ) {
    return "scheduled";
  }

  if (normalized.includes("halftime") || normalized === "ht") {
    return "halftime";
  }

  if (
    normalized.includes("finished") ||
    normalized === "ft"
  ) {
    return "finished";
  }

  if (normalized.includes("postponed")) {
    return "postponed";
  }

  if (normalized.includes("cancel") || normalized.includes("abandon")) {
    return "cancelled";
  }

  if (normalized.includes("suspend") || normalized.includes("delay")) {
    return "postponed";
  }

  return "live";
}

export function normalizeBasketballScore(scores: {
  home: { total: number | null; quarter_1?: number | null; quarter_2?: number | null; quarter_3?: number | null; quarter_4?: number | null; over_time?: number | null } | null;
  away: { total: number | null; quarter_1?: number | null; quarter_2?: number | null; quarter_3?: number | null; quarter_4?: number | null; over_time?: number | null } | null;
} | null): { home: number | null; away: number | null; periodScores: { period: string; home: number; away: number }[] } {
  if (!scores || !scores.home || !scores.away) {
    return { home: null, away: null, periodScores: [] };
  }

  const periodScores: { period: string; home: number; away: number }[] = [];

  if (
    scores.home.quarter_1 != null &&
    scores.away.quarter_1 != null
  ) {
    periodScores.push({ period: "Q1", home: scores.home.quarter_1, away: scores.away.quarter_1 });
  }

  if (
    scores.home.quarter_2 != null &&
    scores.away.quarter_2 != null
  ) {
    periodScores.push({ period: "Q2", home: scores.home.quarter_2, away: scores.away.quarter_2 });
  }

  if (
    scores.home.quarter_3 != null &&
    scores.away.quarter_3 != null
  ) {
    periodScores.push({ period: "Q3", home: scores.home.quarter_3, away: scores.away.quarter_3 });
  }

  if (
    scores.home.quarter_4 != null &&
    scores.away.quarter_4 != null
  ) {
    periodScores.push({ period: "Q4", home: scores.home.quarter_4, away: scores.away.quarter_4 });
  }

  if (
    scores.home.over_time != null &&
    scores.away.over_time != null
  ) {
    periodScores.push({ period: "OT", home: scores.home.over_time, away: scores.away.over_time });
  }

  return {
    home: scores.home.total ?? null,
    away: scores.away.total ?? null,
    periodScores,
  };
}
