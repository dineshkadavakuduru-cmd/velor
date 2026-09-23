export function normalizeTennisMatchStatus(status: { code: number; description: string; type: string } | string): "scheduled" | "live" | "halftime" | "finished" | "postponed" | "cancelled" | "abandoned" | "break" {
  if (typeof status === "object" && status !== null) {
    const code = status.code;
    const type = status.type.toLowerCase();

    if (code === 0 || type === "notstarted") {
      return "scheduled";
    }

    if (code === 100 || type === "finished") {
      return "finished";
    }

    if (code === 60 || type === "postponed") {
      return "postponed";
    }

    if (code === 70 || type === "cancelled") {
      return "cancelled";
    }

    if (code && code >= 80) {
      return "abandoned";
    }

    if (type === "inprogress") {
      return "live";
    }

    return "live";
  }

  const normalized = String(status).toLowerCase();
  if (normalized.includes("not started") || normalized === "ns") {
    return "scheduled";
  }
  if (normalized.includes("finished")) {
    return "finished";
  }
  if (normalized.includes("postponed")) {
    return "postponed";
  }
  if (normalized.includes("cancel")) {
    return "cancelled";
  }
  if (normalized.includes("abandon")) {
    return "abandoned";
  }
  return "live";
}

export function normalizeTennisScore(
  homeScore: {
    current: number | null;
    display: number | null;
    period1?: number | null;
    period2?: number | null;
    period3?: number | null;
    period4?: number | null;
    period5?: number | null;
    period1TieBreak?: number | null;
    point?: string | null;
  } | null | undefined,
  awayScore: {
    current: number | null;
    display: number | null;
    period1?: number | null;
    period2?: number | null;
    period3?: number | null;
    period4?: number | null;
    period5?: number | null;
    period1TieBreak?: number | null;
    point?: string | null;
  } | null | undefined
): { home: number | null; away: number | null; periodScores: Array<{ period: string; home: number | null; away: number | null }> } {
  if (!homeScore || !awayScore) {
    return { home: null, away: null, periodScores: [] };
  }

  const periodScores: Array<{ period: string; home: number | null; away: number | null }> = [];
  const periods = [
    { key: "period1", label: "Set 1" },
    { key: "period2", label: "Set 2" },
    { key: "period3", label: "Set 3" },
    { key: "period4", label: "Set 4" },
    { key: "period5", label: "Set 5" },
  ];

  for (const p of periods) {
    const homeVal = (homeScore[p.key as keyof typeof homeScore] as number | null | undefined) ?? null;
    const awayVal = (awayScore[p.key as keyof typeof awayScore] as number | null | undefined) ?? null;
    if (homeVal != null || awayVal != null) {
      periodScores.push({
        period: p.label,
        home: homeVal,
        away: awayVal,
      });
    }
  }

  return {
    home: homeScore.current ?? homeScore.display ?? null,
    away: awayScore.current ?? awayScore.display ?? null,
    periodScores,
  };
}

export function normalizeTennisTeam(apiTeam: { id: number; name: string; shortName?: string; country?: { name: string; alpha2: string } | null; logo?: string | null; ranking?: number | null }): Team {
  return {
    id: String(apiTeam.id),
    name: apiTeam.name,
    shortName: safeString(apiTeam.shortName) ?? (apiTeam.name.length > 3 ? apiTeam.name.slice(0, 3).toUpperCase() : apiTeam.name.toUpperCase()),
    logo: safeString(apiTeam.logo),
    country: safeString(apiTeam.country?.name),
    sportId: "tennis",
  };
}

export function normalizeTennisLeague(apiLeague: { id: number | string; name: string; country?: { id: number; name: string; alpha2: string } | null }): League {
  return {
    id: String(apiLeague.id),
    sportId: "tennis",
    name: apiLeague.name,
    country: safeString(apiLeague.country?.name) ?? "",
    logo: undefined,
  };
}

export function normalizeTennisMatch(event: {
  id: number;
  homeTeam: { id: number; name: string; shortName?: string; ranking?: number | null; country?: { alpha2: string; name: string } | null; sport?: { id: number; name: string; slug: string } | null };
  awayTeam: { id: number; name: string; shortName?: string; ranking?: number | null; country?: { alpha2: string; name: string } | null };
  homeScore: { current: number | null; display: number | null; period1?: number | null; period2?: number | null; period3?: number | null; period4?: number | null; period5?: number | null; period1TieBreak?: number | null; point?: string | null };
  awayScore: { current: number | null; display: number | null; period1?: number | null; period2?: number | null; period3?: number | null; period4?: number | null; period5?: number | null; period1TieBreak?: number | null; point?: string | null };
  firstToServe?: number | null;
  groundType?: string | null;
  status: { code: number; description: string; type: string };
  tournament?: { name?: string; slug?: string; uniqueTournament?: { id: number | string } | null; id?: number | string } | string | null;
  startTimestamp: number | null;
  round?: string | null;
  roundCode?: string | null;
}): Match {
  const status = normalizeTennisMatchStatus(event.status);
  const { home, away, periodScores } = normalizeTennisScore(event.homeScore, event.awayScore);

  let leagueId: number | string = "0";
  let leagueName = "Unknown Tournament";
  if (typeof event.tournament === "string") {
    leagueId = event.tournament;
    leagueName = event.tournament;
  } else if (event.tournament && typeof event.tournament === "object") {
    leagueId = event.tournament.uniqueTournament?.id ?? event.tournament.id ?? event.tournament.name ?? "0";
    leagueName = event.tournament.name ?? "Unknown Tournament";
  }

  return {
    id: String(event.id),
    sport: { id: "tennis", name: "Tennis", slug: "tennis" } as Sport,
    league: normalizeTennisLeague({
      id: leagueId,
      name: leagueName,
    }),
    homeTeam: normalizeTennisTeam(event.homeTeam),
    awayTeam: normalizeTennisTeam(event.awayTeam),
    score: { home, away, periodScores },
    status,
    startTime: event.startTimestamp ? new Date(event.startTimestamp * 1000).toISOString() : "",
    surface: safeString(event.groundType) || undefined,
    round: safeString(event.round) || safeString(event.status.description) || undefined,
    roundCode: safeString(event.roundCode) || undefined,
  };
}

function safeString(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

import type { Match, Team, League, Sport } from "@/lib/types/sports";
