import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { BasketballProvider } from "./BasketballProvider";

describe("BasketballProvider", () => {
  const originalFetch = global.fetch;
  const provider = new BasketballProvider("test-basketball-key");

  beforeEach(() => {
    global.fetch = originalFetch;
  });

  function mockFetch(body: unknown, status = 200) {
    global.fetch = async () =>
      new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }) as Response;
  }

  describe("getMatches", () => {
    it("returns normalized matches on valid response", async () => {
      mockFetch({
        get: "games",
        parameters: [],
        errors: [],
        results: 1,
        response: [
          {
            id: 1,
            date: "2026-08-22T19:45:00+00:00",
            time: "19:45:00",
            timestamp: 1724345100,
            week: "Regular Season",
            status: { long: "Game Finished", short: "FT", elapsed: 48 },
            country: { id: 1, name: "USA", flag: null },
            league: { id: 1, name: "NBA", slug: "nba", season: "2025-2026", country: { id: 1, name: "USA", code: "US", flag: null }, logo: null },
            stage: "Regular Season",
            venue: { name: "Test Arena", city: "Los Angeles" },
            teams: {
              home: { id: 1, name: "Lakers", slug: "lakers", abbr: "LAL", logo: null },
              away: { id: 2, name: "Celtics", slug: "celtics", abbr: "BOS", logo: null },
            },
            scores: {
              home: { total: 108, quarter_1: 28, quarter_2: 25, quarter_3: 30, quarter_4: 25 },
              away: { total: 95, quarter_1: 22, quarter_2: 24, quarter_3: 26, quarter_4: 23 },
            },
          },
        ],
      });

      const matches = await provider.getMatches();
      assert.strictEqual(matches.length, 1);
      assert.strictEqual(matches[0].id, "1");
      assert.strictEqual(matches[0].status, "finished");
      assert.strictEqual(matches[0].sport.id, "basketball");
      assert.strictEqual(matches[0].sport.name, "Basketball");
      assert.strictEqual(matches[0].homeTeam.name, "Lakers");
      assert.strictEqual(matches[0].awayTeam.name, "Celtics");
      assert.strictEqual(matches[0].score.home, 108);
      assert.strictEqual(matches[0].score.away, 95);
      assert.ok((matches[0].score.periodScores?.length ?? 0) > 0);
    });

    it("returns empty array for missing response field", async () => {
      mockFetch({ errors: [] });
      const matches = await provider.getMatches();
      assert.deepStrictEqual(matches, []);
    });

    it("returns empty array for non-array response", async () => {
      mockFetch({ get: "games", response: null });
      const matches = await provider.getMatches();
      assert.deepStrictEqual(matches, []);
    });

    it("filters by status", async () => {
      mockFetch({
        get: "games",
        parameters: {},
        errors: [],
        results: 1,
        response: [
          {
            id: 1,
            date: "2026-08-22T19:45:00+00:00",
            time: "19:45:00",
            timestamp: 1724345100,
            week: "Regular Season",
            status: { long: "Not Started", short: "NS", elapsed: null },
            country: { id: 1, name: "USA", flag: null },
            league: { id: 1, name: "NBA", slug: "nba", season: "2025-2026", country: { id: 1, name: "USA", code: "US", flag: null }, logo: null },
            stage: "Regular Season",
            venue: null,
            teams: {
              home: { id: 1, name: "Lakers", slug: "lakers", abbr: "LAL", logo: null },
              away: { id: 2, name: "Celtics", slug: "celtics", abbr: "BOS", logo: null },
            },
            scores: {
              home: { total: null },
              away: { total: null },
            },
          },
        ],
      });

      const matches = await provider.getMatches({ status: "scheduled" });
      assert.ok(matches.length > 0);
      assert.strictEqual(matches[0].status, "scheduled");
    });
  });

  describe("getLiveMatches", () => {
    it("returns live matches", async () => {
      mockFetch({
        get: "games",
        parameters: {},
        errors: [],
        results: 1,
        response: [
          {
            id: 1,
            date: "2026-08-22T19:45:00+00:00",
            time: "19:45:00",
            timestamp: 1724345100,
            week: "Regular Season",
            status: { long: "Q3", short: "Q3", elapsed: 3 },
            country: { id: 1, name: "USA", flag: null },
            league: { id: 1, name: "NBA", slug: "nba", season: "2025-2026", country: { id: 1, name: "USA", code: "US", flag: null }, logo: null },
            stage: "Regular Season",
            venue: null,
            teams: {
              home: { id: 1, name: "Lakers", slug: "lakers", abbr: "LAL", logo: null },
              away: { id: 2, name: "Celtics", slug: "celtics", abbr: "BOS", logo: null },
            },
            scores: {
              home: { total: 75, quarter_1: 20, quarter_2: 25, quarter_3: 30 },
              away: { total: 70, quarter_1: 18, quarter_2: 22, quarter_3: 30 },
            },
          },
        ],
      });

      const matches = await provider.getLiveMatches();
      assert.ok(matches.length > 0);
      assert.strictEqual(matches[0].status, "live");
    });
  });

  describe("getMatch", () => {
    it("returns match by id", async () => {
      mockFetch({
        get: "games",
        parameters: {},
        errors: [],
        results: 1,
        response: [
          {
            id: 123,
            date: "2026-08-22T19:45:00+00:00",
            time: "19:45:00",
            timestamp: 1724345100,
            week: "Regular Season",
            status: { long: "Game Finished", short: "FT", elapsed: 48 },
            country: { id: 1, name: "USA", flag: null },
            league: { id: 1, name: "NBA", slug: "nba", season: "2025-2026", country: { id: 1, name: "USA", code: "US", flag: null }, logo: null },
            stage: "Regular Season",
            venue: null,
            teams: {
              home: { id: 1, name: "Lakers", slug: "lakers", abbr: "LAL", logo: null },
              away: { id: 2, name: "Celtics", slug: "celtics", abbr: "BOS", logo: null },
            },
            scores: {
              home: { total: 108 },
              away: { total: 95 },
            },
          },
        ],
      });

      const match = await provider.getMatch("123");
      assert.ok(match);
      assert.strictEqual(match!.id, "123");
      assert.strictEqual(match!.status, "finished");
    });

    it("returns null for non-existent match", async () => {
      mockFetch({ get: "games", parameters: {}, errors: [], results: 0, response: [] });
      const match = await provider.getMatch("999999999");
      assert.strictEqual(match, null);
    });
  });

  describe("getLeagues", () => {
    it("returns normalized leagues", async () => {
      mockFetch({
        get: "leagues",
        parameters: {},
        errors: [],
        results: 2,
        response: [
          { id: 1, name: "NBA", slug: "nba", season: "2025-2026", country: { id: 1, name: "USA", code: "US", flag: null }, logo: null },
          { id: 2, name: "EuroLeague", slug: "euroleague", season: "2025-2026", country: { id: 2, name: "Europe", code: "EU", flag: null }, logo: null },
        ],
      });

      const leagues = await provider.getLeagues();
      assert.strictEqual(leagues.length, 2);
      assert.strictEqual(leagues[0].id, "1");
      assert.strictEqual(leagues[0].name, "NBA");
      assert.strictEqual(leagues[0].sportId, "basketball");
    });

    it("returns empty array for empty response", async () => {
      mockFetch({ get: "leagues", parameters: {}, errors: [], results: 0, response: [] });
      const leagues = await provider.getLeagues();
      assert.deepStrictEqual(leagues, []);
    });
  });

  describe("getLeague", () => {
    it("returns league by id", async () => {
      mockFetch({
        get: "leagues",
        parameters: {},
        errors: [],
        results: 1,
        response: [
          { id: 1, name: "NBA", slug: "nba", season: "2025-2026", country: { id: 1, name: "USA", code: "US", flag: null }, logo: null },
        ],
      });

      const league = await provider.getLeague("1");
      assert.ok(league);
      assert.strictEqual(league!.id, "1");
      assert.strictEqual(league!.name, "NBA");
    });

    it("returns null for missing league", async () => {
      mockFetch({ get: "leagues", parameters: {}, errors: [], results: 0, response: [] });
      const league = await provider.getLeague("999");
      assert.strictEqual(league, null);
    });
  });

  describe("getTeams", () => {
    it("returns teams", async () => {
      mockFetch({
        response: [
          { id: 1, name: "Lakers", slug: "lakers", abbr: "LAL", country: { id: 1, name: "USA", code: "US", flag: null }, national: false, logo: null },
          { id: 2, name: "Celtics", slug: "celtics", abbr: "BOS", country: { id: 1, name: "USA", code: "US", flag: null }, national: false, logo: null },
        ],
      });

      const teams = await provider.getTeams();
      assert.strictEqual(teams.length, 2);
      assert.strictEqual(teams[0].id, "1");
      assert.strictEqual(teams[0].name, "Lakers");
      assert.strictEqual(teams[0].sportId, "basketball");
    });

    it("filters by search", async () => {
      mockFetch({
        response: [
          { id: 1, name: "Lakers", slug: "lakers", abbr: "LAL", country: { id: 1, name: "USA", code: "US", flag: null }, national: false, logo: null },
        ],
      });

      const teams = await provider.getTeams({ search: "Lakers" });
      assert.strictEqual(teams.length, 1);
      assert.strictEqual(teams[0].name, "Lakers");
    });
  });

  describe("getTeam", () => {
    it("returns team by id", async () => {
      mockFetch({
        response: [
          { id: 1, name: "Lakers", slug: "lakers", abbr: "LAL", country: { id: 1, name: "USA", code: "US", flag: null }, national: false, logo: null },
        ],
      });

      const team = await provider.getTeam("1");
      assert.ok(team);
      assert.strictEqual(team!.id, "1");
      assert.strictEqual(team!.name, "Lakers");
    });

    it("returns null for missing team", async () => {
      mockFetch({ response: [] });
      const team = await provider.getTeam("999");
      assert.strictEqual(team, null);
    });
  });

  describe("getStandings", () => {
    it("returns normalized standings without football-specific fields", async () => {
      mockFetch({
        get: "standings",
        parameters: {},
        errors: [],
        results: 1,
        response: [
          {
            id: 1,
            name: "NBA",
            season: "2025-2026",
            country: { id: 1, name: "USA", code: "US", flag: null },
            standings: [
              {
                rank: 1,
                team_id: 1,
                team_name: "Lakers",
                points: 60,
                games_played: 50,
                wins: 40,
                losses: 10,
                win_percentage: 0.8,
                points_for: 5000,
                points_against: 4500,
                streak: 5,
                streak_type: "wins",
              },
            ],
          },
        ],
      });

      const standings = await provider.getStandings({ leagueId: "1" });
      assert.strictEqual(standings.length, 1);
      assert.strictEqual(standings[0].teamId, "1");
      assert.strictEqual(standings[0].position, 1);
      assert.strictEqual(standings[0].points, 60);
      assert.strictEqual(standings[0].played, 50);
      assert.strictEqual(standings[0].won, 40);
      assert.strictEqual(standings[0].lost, 10);
      assert.strictEqual(standings[0].sportId, "basketball");
      assert.strictEqual((standings[0] as { goalsFor?: number }).goalsFor, undefined);
      assert.strictEqual((standings[0] as { goalsAgainst?: number }).goalsAgainst, undefined);
    });
  });

  describe("search", () => {
    it("returns empty array for short queries", async () => {
      const results = await provider.search({ query: "a" });
      assert.deepStrictEqual(results, []);
    });

    it("returns empty array for empty query", async () => {
      const results = await provider.search({ query: "" });
      assert.deepStrictEqual(results, []);
    });
  });

  describe("getMatchStatistics", () => {
    it("returns normalized statistics", async () => {
      mockFetch({
        get: "games/statistics",
        parameters: {},
        errors: [],
        results: 1,
        response: [
          {
            team_id: 1,
            team_name: "Lakers",
            statistics: [
              { type: "fieldGoalsPercentage", value: "45%" },
              { type: "threePointsPercentage", value: "38%" },
            ],
          },
        ],
      });

      const stats = await provider.getMatchStatistics({ matchId: "1" });
      assert.strictEqual(stats.length, 1);
      assert.strictEqual(stats[0].teamId, "1");
      assert.strictEqual(stats[0].teamName, "Lakers");
      assert.ok(stats[0].stats.length > 0);
    });

    it("returns empty array for missing response", async () => {
      mockFetch({ get: "games/statistics", parameters: {}, errors: [], results: 0, response: null });
      const stats = await provider.getMatchStatistics({ matchId: "1" });
      assert.deepStrictEqual(stats, []);
    });
  });

  describe("getMatchEvents", () => {
    it("returns normalized events", async () => {
      mockFetch({
        get: "games/events",
        parameters: {},
        errors: [],
        results: 1,
        response: [
          {
            id: 1,
            quarter: 1,
            time: "05:32",
            event_type: "points",
            player: { id: 1, name: "LeBron James", number: 23 },
            team: { id: 1, name: "Lakers" },
            points: 2,
            detail: "Layup",
          },
        ],
      });

      const events = await provider.getMatchEvents({ matchId: "1" });
      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].matchId, "1");
      assert.strictEqual(events[0].teamId, "1");
      assert.strictEqual(events[0].playerName, "LeBron James");
      assert.strictEqual(events[0].type, "points");
    });
  });

  describe("getMatchLineups", () => {
    it("returns normalized lineups", async () => {
      mockFetch({
        get: "games/lineups",
        parameters: {},
        errors: [],
        results: 1,
        response: [
          {
            team_id: 1,
            team_name: "Lakers",
            starting_lineups: [
              { player_id: 1, player_name: "LeBron James", position: "SF", number: 23 },
            ],
            bench: [
              { player_id: 2, player_name: "Austin Reaves", position: "SG", number: 15 },
            ],
          },
        ],
      });

      const lineups = await provider.getMatchLineups({ matchId: "1" });
      assert.strictEqual(lineups.length, 1);
      assert.strictEqual(lineups[0].teamId, "1");
      assert.strictEqual(lineups[0].teamName, "Lakers");
      assert.strictEqual(lineups[0].startXI.length, 1);
      assert.strictEqual(lineups[0].substitutes.length, 1);
      assert.strictEqual(lineups[0].startXI[0].name, "LeBron James");
      assert.strictEqual(lineups[0].substitutes[0].isSubstitute, true);
    });

    it("returns empty array for missing response", async () => {
      mockFetch({ get: "games/lineups", parameters: {}, errors: [], results: 0, response: null });
      const lineups = await provider.getMatchLineups({ matchId: "1" });
      assert.deepStrictEqual(lineups, []);
    });
  });

  describe("error handling", () => {
    it("throws on 401", async () => {
      global.fetch = async () =>
        new Response("Unauthorized", { status: 401, headers: { "Content-Type": "text/plain" } }) as Response;

      let threw = false;
      try {
        await provider.getMatches();
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, true);
    });

    it("throws on 403", async () => {
      global.fetch = async () =>
        new Response("Forbidden", { status: 403, headers: { "Content-Type": "text/plain" } }) as Response;

      let threw = false;
      try {
        await provider.getMatches();
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, true);
    });

    it("throws on 404", async () => {
      global.fetch = async () =>
        new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain" } }) as Response;

      let threw = false;
      try {
        await provider.getMatches();
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, true);
    });

    it("throws on 429", async () => {
      global.fetch = async () =>
        new Response("Rate Limit", { status: 429, headers: { "Content-Type": "text/plain" } }) as Response;

      let threw = false;
      try {
        await provider.getMatches();
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, true);
    });

    it("throws on 500 after retries", async () => {
      global.fetch = async () =>
        new Response("Server Error", { status: 500, headers: { "Content-Type": "text/plain" } }) as Response;

      let threw = false;
      try {
        await provider.getMatches();
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, true);
    });

    it("throws on timeout", async () => {
      global.fetch = async () => {
        await new Promise((resolve) => setTimeout(resolve, 15000));
        return new Response("OK", { status: 200 }) as Response;
      };

      let threw = false;
      try {
        await provider.getMatches();
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, true);
    });

    it("handles malformed JSON", async () => {
      global.fetch = async () =>
        new Response("not-json", { status: 200, headers: { "Content-Type": "application/json" } }) as Response;

      let threw = false;
      try {
        await provider.getMatches();
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, true);
    });

    it("handles null response body", async () => {
      global.fetch = async () =>
        new Response(null, { status: 200, headers: { "Content-Type": "application/json" } }) as Response;

      let threw = false;
      try {
        await provider.getMatches();
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, true);
    });
  });

  describe("caching headers", () => {
    it("sends correct API-Sports key header", async () => {
      let capturedHeaders: Record<string, string> = {};
      global.fetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
        capturedHeaders = ((init as Record<string, unknown> | undefined)?.headers as Record<string, string>) ?? {};
        return new Response(
          JSON.stringify({ get: "games", parameters: [], errors: [], results: 0, response: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        ) as Response;
      };

      await provider.getMatches();
      assert.strictEqual(capturedHeaders["x-apisports-key"], "test-basketball-key");
    });
  });
});
