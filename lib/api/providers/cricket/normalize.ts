export function normalizeCricketMatchStatus(status: { code: number; description: string; type: string } | string): "scheduled" | "live" | "halftime" | "finished" | "postponed" | "cancelled" | "abandoned" | "break" {
  if (typeof status === "object" && status !== null) {
    const code = status.code;
    const type = status.type.toLowerCase();

    if (code === 0 || type === "notstarted") {
      return "scheduled";
    }

    if (code === 31 || type === "break" || type === "interval") {
      return "break";
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
  if (normalized.includes("break") || normalized.includes("interval")) {
    return "break";
  }
  if (normalized.includes("finished") || normalized.includes("ended")) {
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

export function normalizeCricketScore(
  homeScore: {
    current: number | null;
    display: number | null;
    innings?: Record<string, { score: number | null; wickets: number | null; overs: number | string | null }> | null;
  } | null | undefined,
  awayScore: {
    current: number | null;
    display: number | null;
    innings?: Record<string, { score: number | null; wickets: number | null; overs: number | string | null }> | null;
  } | null | undefined
): { home: number | null; away: number | null; periodScores: Array<{ period: string; home: number | null; away: number | null }> } {
  if (!homeScore || !awayScore) {
    return { home: null, away: null, periodScores: [] };
  }

  const periodScores: Array<{ period: string; home: number | null; away: number | null }> = [];
  const inningsKeys = [
    "inning1", "inning2", "inning3", "inning4",
    "period1", "period2", "period3", "period4",
  ];

  const homeInnings = homeScore.innings;
  const awayInnings = awayScore.innings;

  if (homeInnings && awayInnings) {
    for (let i = 0; i < inningsKeys.length; i++) {
      const key = inningsKeys[i];
      const homeInn = homeInnings[key];
      const awayInn = awayInnings[key];
      if (homeInn || awayInn) {
        const periodLabel = `Innings ${i + 1}`;
        const homeScoreVal = homeInn?.score ?? null;
        const awayScoreVal = awayInn?.score ?? null;
        if (homeScoreVal != null || awayScoreVal != null) {
          periodScores.push({
            period: periodLabel,
            home: homeScoreVal,
            away: awayScoreVal,
          });
        }
      }
    }
  }

  return {
    home: homeScore.current ?? homeScore.display ?? null,
    away: awayScore.current ?? awayScore.display ?? null,
    periodScores,
  };
}

export function normalizeCricketTeam(apiTeam: { id: number; name: string; country?: { id: number; name: string; alpha2: string } | null; logo?: string | null }): Team {
  return {
    id: String(apiTeam.id),
    name: apiTeam.name,
    shortName: apiTeam.name.length > 3 ? apiTeam.name.slice(0, 3).toUpperCase() : apiTeam.name.toUpperCase(),
    logo: safeString(apiTeam.logo),
    country: safeString(apiTeam.country?.name),
    sportId: "cricket",
  };
}

export function normalizeCricketLeague(apiLeague: { id: number | string; name: string; category?: { id: number; name: string } | null; country?: { id: number; name: string; alpha2: string } | null }): League {
  return {
    id: String(apiLeague.id),
    sportId: "cricket",
    name: apiLeague.name,
    country: safeString(apiLeague.country?.name ?? apiLeague.category?.name) ?? "",
    logo: undefined,
  };
}

export function normalizeCricketMatch(event: {
  id: number;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  homeScore: { current: number | null; display: number | null; innings?: Record<string, { score: number | null; wickets: number | null; overs: number | string | null }> | null };
  awayScore: { current: number | null; display: number | null; innings?: Record<string, { score: number | null; wickets: number | null; overs: number | string | null }> | null };
  status: { code: number; description: string; type: string };
  tournament?: { id?: number | string; name?: string } | string | null;
  startTimestamp: number | null;
  format?: string | null;
}): Match {
  const status = normalizeCricketMatchStatus(event.status);
  const { home, away, periodScores } = normalizeCricketScore(event.homeScore, event.awayScore);

  let tournamentId: number | string = 0;
  let tournamentName = "Unknown";
  if (typeof event.tournament === "string") {
    tournamentId = event.tournament;
    tournamentName = event.tournament;
  } else if (event.tournament && typeof event.tournament === "object") {
    tournamentId = event.tournament.id ?? event.tournament.name ?? 0;
    tournamentName = event.tournament.name ?? "Unknown";
  }

  return {
    id: String(event.id),
    sport: { id: "cricket", name: "Cricket", slug: "cricket" } as Sport,
    league: normalizeCricketLeague({
      id: tournamentId,
      name: tournamentName,
    }),
    homeTeam: normalizeCricketTeam(event.homeTeam),
    awayTeam: normalizeCricketTeam(event.awayTeam),
    score: { home, away, periodScores },
    status,
    startTime: event.startTimestamp ? new Date(event.startTimestamp * 1000).toISOString() : "",
    format: safeString(event.format) || undefined,
  };
}

function safeString(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

import type { Match, Team, League, Sport } from "@/lib/types/sports";
