import type { League, Match, Team } from "@/lib/types/sports";

/**
 * Pure derivation helpers for the canonical sports snapshot.
 * Kept free of React/Next imports so they can be unit-tested in isolation.
 */

export function isLiveMatch(match: Match): boolean {
  return match.status === "live" || match.status === "halftime";
}

export function deriveTeamsFromMatches(matches: Match[]): Team[] {
  const unique = new Map<string, Team>();
  for (const match of matches) {
    for (const team of [match.homeTeam, match.awayTeam]) {
      if (!unique.has(team.id)) {
        unique.set(team.id, {
          ...team,
          sportId: team.sportId ?? match.sport.id,
        });
      }
    }
  }
  return Array.from(unique.values());
}

export function deriveLeaguesFromMatches(matches: Match[]): League[] {
  const unique = new Map<string, League>();
  for (const match of matches) {
    if (!unique.has(match.league.id)) {
      unique.set(match.league.id, match.league);
    }
  }
  return Array.from(unique.values());
}

/**
 * "Featured" ranking: leagues ordered by live activity first, then total
 * match involvement. Replaces hardcoded "popular league" lists with an
 * honest, data-driven order.
 */
export function rankFeaturedLeagues(leagues: League[], matches: Match[], limit = 6): League[] {
  const liveByLeague = new Map<string, number>();
  const totalByLeague = new Map<string, number>();
  for (const match of matches) {
    totalByLeague.set(match.league.id, (totalByLeague.get(match.league.id) ?? 0) + 1);
    if (isLiveMatch(match)) {
      liveByLeague.set(match.league.id, (liveByLeague.get(match.league.id) ?? 0) + 1);
    }
  }
  return [...leagues]
    .sort((a, b) => {
      const liveDiff = (liveByLeague.get(b.id) ?? 0) - (liveByLeague.get(a.id) ?? 0);
      if (liveDiff !== 0) return liveDiff;
      return (totalByLeague.get(b.id) ?? 0) - (totalByLeague.get(a.id) ?? 0);
    })
    .slice(0, limit);
}

export function rankFeaturedTeams(teams: Team[], matches: Match[], limit = 8): Team[] {
  const liveByTeam = new Map<string, number>();
  const totalByTeam = new Map<string, number>();
  for (const match of matches) {
    const live = isLiveMatch(match) ? 1 : 0;
    for (const team of [match.homeTeam, match.awayTeam]) {
      totalByTeam.set(team.id, (totalByTeam.get(team.id) ?? 0) + 1);
      if (live) liveByTeam.set(team.id, (liveByTeam.get(team.id) ?? 0) + 1);
    }
  }
  return [...teams]
    .sort((a, b) => {
      const liveDiff = (liveByTeam.get(b.id) ?? 0) - (liveByTeam.get(a.id) ?? 0);
      if (liveDiff !== 0) return liveDiff;
      return (totalByTeam.get(b.id) ?? 0) - (totalByTeam.get(a.id) ?? 0);
    })
    .slice(0, limit);
}
