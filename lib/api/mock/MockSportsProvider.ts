import type { SportsProvider, GetMatchesParams, GetTeamsParams, GetStandingsParams, SearchResult, MatchEvent, MatchStatistics, MatchLineup, GetMatchEventsParams, GetPlayersParams } from "../types";
import type { Player, PlayerMatchStats } from "@/lib/types/sports";
import {
  mockLiveMatches,
  mockStandings,
  mockMatchEvents,
  mockMatchStatistics,
  mockMatchLineups,
  mockPlayers,
  mockPlayerStats,
} from "./mockData";

const mockTeamSquads: Record<string, string[]> = {
  arsenal: ["player-1", "player-2", "player-3", "player-4", "player-5", "player-6"],
  chelsea: ["player-7", "player-8", "player-9", "player-10", "player-11"],
  "boston-celtics": ["player-12", "player-13", "player-14"],
  "la-lakers": ["player-15", "player-16", "player-17"],
  "golden-state-warriors": ["player-18", "player-19"],
  india: ["player-20", "player-21", "player-22"],
  djokovic: ["player-23"],
  alcaraz: ["player-24"],
  inter: ["player-25", "player-26", "player-27", "player-28"],
  milan: ["player-29", "player-30", "player-31"],
  barcelona: ["player-32"],
};

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

  async getPlayers(params?: GetPlayersParams) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let result = [...mockPlayers];

    if (params?.teamId) {
      const squadIds = mockTeamSquads[params.teamId] ?? [];
      result = result.filter((p) => squadIds.includes(p.id));
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    return result;
  }

  async getPlayer(id: string): Promise<Player | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockPlayers.find((p) => p.id === id) ?? null;
  }

  async getTeamSquad(teamId: string): Promise<Player[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const squadIds = mockTeamSquads[teamId] ?? [];
    return mockPlayers.filter((p) => squadIds.includes(p.id));
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

    const addedPlayerIds = new Set<string>();
    for (const player of mockPlayers) {
      if (results.length >= limit) break;
      if (player.name.toLowerCase().includes(q) && !addedPlayerIds.has(player.id)) {
        results.push({
          type: "player",
          id: player.id,
          name: player.name,
          subtitle: player.teamId,
          href: `/player/${player.id}`,
        });
        addedPlayerIds.add(player.id);
      }
    }

    return results.slice(0, limit);
  }

  async getMatchEvents(params: GetMatchEventsParams): Promise<MatchEvent[]> {
    const match = mockLiveMatches.find((m) => m.id === params.matchId);
    if (!match) return [];
    return mockMatchEvents[params.matchId] ?? [];
  }

  async getMatchStatistics(params: { matchId: string }): Promise<MatchStatistics[]> {
    const match = mockLiveMatches.find((m) => m.id === params.matchId);
    if (!match) return [];
    return mockMatchStatistics[params.matchId] ?? [];
  }

  async getMatchLineups(params: { matchId: string }): Promise<MatchLineup[]> {
    const match = mockLiveMatches.find((m) => m.id === params.matchId);
    if (!match) return [];
    return mockMatchLineups[params.matchId] ?? [];
  }
}
