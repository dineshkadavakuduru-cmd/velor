import type { SportsProvider, GetMatchesParams, GetTeamsParams, GetStandingsParams, SearchResult, MatchEvent, MatchStatistics, MatchLineup } from "../types";
import {
  mockLiveMatches,
  mockStandings,
} from "./mockData";

export class MockSportsProvider implements SportsProvider {
  async getLiveMatches() {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockLiveMatches.filter(
      (m) => m.status === "live" || m.status === "halftime"
    );
  }

  async getMatches(params?: GetMatchesParams) {
    await new Promise((resolve) => setTimeout(resolve, 600));

    let matches = [...mockLiveMatches];

    if (params?.teamId) {
      matches = matches.filter((m) => m.homeTeam.id === params.teamId || m.awayTeam.id === params.teamId);
    }

    if (params?.leagueId) {
      matches = matches.filter((m) => m.league.id === params.leagueId);
    }

    if (params?.sport) {
      matches = matches.filter((m) => m.sport.id === params.sport);
    }

    if (params?.date) {
      const target = new Date(params.date).toDateString();
      matches = matches.filter((m) => new Date(m.startTime).toDateString() === target);
    }

    if (params?.status) {
      matches = matches.filter((m) => m.status === params.status);
    }

    return matches;
  }

  async getMatch(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockLiveMatches.find((m) => m.id === id) ?? null;
  }

  async getLeagues() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const leagues = mockLiveMatches.map((m) => m.league);
    const unique = new Map(leagues.map((l) => [l.id, l]));
    return Array.from(unique.values());
  }

  async getLeague(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const leagues = mockLiveMatches.map((m) => m.league);
    const unique = new Map(leagues.map((l) => [l.id, l]));
    return unique.get(id) ?? null;
  }

  async getTeams(_params?: GetTeamsParams) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const teams = mockLiveMatches.flatMap((m) => [m.homeTeam, m.awayTeam]);
    const unique = new Map(teams.map((t) => [t.id, t]));
    let result = Array.from(unique.values()).map((t) => ({
      ...t,
      sportId: t.sportId ?? mockLiveMatches.find((m) => m.homeTeam.id === t.id || m.awayTeam.id === t.id)?.sport.id,
    }));

    if (_params?.search) {
      const q = _params.search.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q));
    }

    if (_params?.leagueId) {
      result = result.filter((t) =>
        mockLiveMatches.some(
          (m) =>
            (m.league.id === _params.leagueId) &&
            (m.homeTeam.id === t.id || m.awayTeam.id === t.id)
        )
      );
    }

    return result;
  }

  async getTeam(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const all = mockLiveMatches.flatMap((m) => [m.homeTeam, m.awayTeam]);
    const unique = new Map(all.map((t) => [t.id, t]));
    return unique.get(id) ?? null;
  }

  async getPlayers() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [];
  }

  async getStandings(_params: GetStandingsParams) {
    void _params;
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [...mockStandings];
  }

  async search(params: { query: string; limit?: number }): Promise<SearchResult[]> {
    const q = params.query.toLowerCase().trim();
    if (!q || q.length < 2) return [];

    const results: SearchResult[] = [];
    const limit = params.limit ?? 10;

    for (const match of mockLiveMatches) {
      if (results.length >= limit) break;
      if (
        match.homeTeam.name.toLowerCase().includes(q) ||
        match.awayTeam.name.toLowerCase().includes(q)
      ) {
        results.push({
          type: "match",
          id: match.id,
          name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
          subtitle: match.league.name,
          href: `/match/${match.id}`,
        });
      }
    }

    const addedTeamIds = new Set<string>();
    for (const match of mockLiveMatches) {
      for (const team of [match.homeTeam, match.awayTeam]) {
        if (results.length >= limit) break;
        if (team.name.toLowerCase().includes(q) && !addedTeamIds.has(team.id)) {
          results.push({
            type: "team",
            id: team.id,
            name: team.name,
            subtitle: team.country,
            href: `/team/${team.id}`,
            logo: team.logo,
          });
          addedTeamIds.add(team.id);
        }
      }
    }

    const addedLeagueIds = new Set<string>();
    for (const match of mockLiveMatches) {
      if (results.length >= limit) break;
      if (match.league.name.toLowerCase().includes(q) && !addedLeagueIds.has(match.league.id)) {
        results.push({
          type: "league",
          id: match.league.id,
          name: match.league.name,
          subtitle: match.league.country,
          href: `/league/${match.league.id}`,
          logo: match.league.logo,
        });
        addedLeagueIds.add(match.league.id);
      }
    }

    return results.slice(0, limit);
  }

  async getMatchEvents(_params: { matchId: string }): Promise<MatchEvent[]> {
    void _params;
    return [];
  }

  async getMatchStatistics(_params: { matchId: string }): Promise<MatchStatistics[]> {
    void _params;
    return [];
  }

  async getMatchLineups(_params: { matchId: string }): Promise<MatchLineup[]> {
    void _params;
    return [];
  }
}
