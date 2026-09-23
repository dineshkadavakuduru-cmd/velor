import type { Match } from "@/lib/types/sports";

export type MatchResult = "home_win" | "draw" | "away_win" | null;

export interface MatchIntelligence {
  result: MatchResult;
  scoreDifference: number | null;
  resultLabel: string;
  stateSummary: string;
  isFinished: boolean;
  isLive: boolean;
  halftimeScore: { home: number | null; away: number | null } | null;
  hasHalftimeScore: boolean;
}

export interface TeamPerformance {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  cleanSheets: number;
  failedToScore: number;
}

export function getMatchIntelligence(match: Match): MatchIntelligence {
  const homeScore = match.score.home;
  const awayScore = match.score.away;
  const isFinished = match.status === "finished";
  const isLive = match.status === "live" || match.status === "halftime";

  const halftimePeriod = match.score.periodScores?.find((ps) => ps.period === "HT");
  const hasHalftimeScore = !!halftimePeriod;
  const halftimeScore = halftimePeriod
    ? { home: halftimePeriod.home, away: halftimePeriod.away }
    : null;

  let result: MatchResult = null;
  let resultLabel = "";

  if (isFinished && homeScore != null && awayScore != null) {
    if (homeScore > awayScore) {
      result = "home_win";
      resultLabel = "HOME WIN";
    } else if (homeScore < awayScore) {
      result = "away_win";
      resultLabel = "AWAY WIN";
    } else {
      result = "draw";
      resultLabel = "DRAW";
    }
  }

  const scoreDifference =
    homeScore != null && awayScore != null ? homeScore - awayScore : null;

  const stateSummary = getStateSummary(match.status, match.period, resultLabel);

  return {
    result,
    scoreDifference,
    resultLabel,
    stateSummary,
    isFinished,
    isLive,
    halftimeScore,
    hasHalftimeScore,
  };
}

export function getTeamPerformance(matches: Match[], teamId: string): TeamPerformance {
  const relevant: Match[] = [];

  for (const match of matches) {
    if (match.status !== "finished") continue;
    if (match.homeTeam.id !== teamId && match.awayTeam.id !== teamId) continue;

    const isHome = match.homeTeam.id === teamId;
    const teamScore = isHome ? match.score.home : match.score.away;
    const opponentScore = isHome ? match.score.away : match.score.home;

    if (teamScore == null || opponentScore == null) continue;
    relevant.push(match);
  }

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let cleanSheets = 0;
  let failedToScore = 0;

  for (const match of relevant) {
    const isHome = match.homeTeam.id === teamId;
    const teamScore = isHome ? match.score.home : match.score.away;
    const opponentScore = isHome ? match.score.away : match.score.home;

    if (teamScore == null || opponentScore == null) continue;

    goalsFor += teamScore;
    goalsAgainst += opponentScore;

    if (teamScore > opponentScore) wins++;
    else if (teamScore === opponentScore) draws++;
    else losses++;

    if (opponentScore === 0) cleanSheets++;
    if (teamScore === 0) failedToScore++;
  }

  return {
    matchesPlayed: relevant.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    cleanSheets,
    failedToScore,
  };
}

export function getScoreDifferenceLabel(match: Match): string | null {
  const homeScore = match.score.home;
  const awayScore = match.score.away;

  if (homeScore == null || awayScore == null) return null;

  const diff = homeScore - awayScore;
  if (diff === 0) return "LEVEL";
  if (diff > 0) return `+${diff} HOME`;
  return `${diff} AWAY`;
}

export function getFormFromMatches(matches: Match[], teamId: string): string[] {
  const results: string[] = [];

  const finished = matches
    .filter((m) => m.status === "finished")
    .filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  for (const match of finished) {
    if (results.length >= 5) break;

    const isHome = match.homeTeam.id === teamId;
    const teamScore = isHome ? match.score.home : match.score.away;
    const opponentScore = isHome ? match.score.away : match.score.home;

    if (teamScore == null || opponentScore == null) continue;

    if (teamScore > opponentScore) results.push("W");
    else if (teamScore === opponentScore) results.push("D");
    else results.push("L");
  }

  return results;
}

function getStateSummary(
  status: Match["status"],
  period: string | undefined,
  resultLabel: string
): string {
  switch (status) {
    case "live":
      return period ? `LIVE · ${period}` : "LIVE";
    case "halftime":
      return "HALFTIME";
    case "finished":
      return resultLabel || "FULL TIME";
    case "scheduled":
      return "UPCOMING";
    case "postponed":
      return "POSTPONED";
    case "cancelled":
      return "CANCELLED";
    default:
      return String(status).toUpperCase();
  }
}
