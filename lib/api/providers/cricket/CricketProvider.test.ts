import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { CricketProvider } from "./CricketProvider";
import { normalizeCricketMatchStatus, normalizeCricketScore } from "./normalize";
import { SportsApiError } from "../../error";

describe("CricketProvider", () => {
  const originalFetch = global.fetch;
  const provider = new CricketProvider("test-cricket-key");

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
        events: [
          {
            id: 12345678,
            homeTeam: { id: 4021, name: "India" },
            awayTeam: { id: 4022, name: "Australia" },
            homeScore: {
              current: 287,
              display: 287,
              innings: {
                inning1: { score: 287, wickets: 6, overs: 42.3 },
              },
            },
            awayScore: {
              current: 0,
              display: 0,
              innings: {
                inning1: { score: null, wickets: null, overs: null },
              },
            },
            status: { code: 21, description: "1st Innings", type: "inprogress" },
            tournament: { id: 11156, name: "ICC World Cup" },
            startTimestamp: 1737331200,
          },
        ],
      });

      const matches = await provider.getMatches();
      assert.strictEqual(matches.length, 1);
      assert.strictEqual(matches[0].id, "12345678");
      assert.strictEqual(matches[0].status, "live");
      assert.strictEqual(matches[0].sport.id, "cricket");
      assert.strictEqual(matches[0].sport.name, "Cricket");
      assert.strictEqual(matches[0].homeTeam.name, "India");
      assert.strictEqual(matches[0].awayTeam.name, "Australia");
      assert.strictEqual(matches[0].score.home, 287);
      assert.strictEqual(matches[0].score.away, 0);
      assert.ok((matches[0].score.periodScores?.length ?? 0) > 0);
      assert.strictEqual(matches[0].league.name, "ICC World Cup");
    });

    it("returns empty array for missing response field", async () => {
      mockFetch({ errors: [] });
      const matches = await provider.getMatches();
      assert.deepStrictEqual(matches, []);
    });

    it("returns empty array for non-array response", async () => {
      mockFetch({ events: null });
      const matches = await provider.getMatches();
      assert.deepStrictEqual(matches, []);
    });

    it("filters by status", async () => {
      mockFetch({
        events: [
          {
            id: 1,
            homeTeam: { id: 1, name: "India" },
            awayTeam: { id: 2, name: "Australia" },
            homeScore: { current: 0, display: 0, innings: {} },
            awayScore: { current: 0, display: 0, innings: {} },
            status: { code: 0, description: "Not started", type: "notstarted" },
            tournament: { id: 1, name: "IPL" },
            startTimestamp: 1737331200,
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
        events: [
          {
            id: 1,
            homeTeam: { id: 1, name: "India" },
            awayTeam: { id: 2, name: "Australia" },
            homeScore: { current: 150, display: 150, innings: { inning1: { score: 150, wickets: 4, overs: 18.2 } } },
            awayScore: { current: 0, display: 0, innings: {} },
            status: { code: 21, description: "1st Innings", type: "inprogress" },
            tournament: { id: 1, name: "IPL" },
            startTimestamp: 1737331200,
          },
        ],
      });

      const matches = await provider.getLiveMatches();
      assert.ok(matches.length > 0);
      assert.strictEqual(matches[0].status, "live");
      assert.strictEqual(matches[0].sport.id, "cricket");
    });
  });

  describe("getMatch", () => {
    it("returns match by id", async () => {
      mockFetch({
        event: {
          id: 123,
          homeTeam: { id: 1, name: "India" },
          awayTeam: { id: 2, name: "Australia" },
          homeScore: { current: 250, display: 250, innings: { inning1: { score: 250, wickets: 8, overs: 50 } } },
          awayScore: { current: 200, display: 200, innings: { inning1: { score: 200, wickets: 10, overs: 48.3 } } },
          status: { code: 100, description: "Ended", type: "finished" },
          tournament: { id: 1, name: "IPL" },
          startTimestamp: 1737331200,
        },
      });

      const match = await provider.getMatch("123");
      assert.ok(match);
      assert.strictEqual(match!.id, "123");
      assert.strictEqual(match!.status, "finished");
      assert.strictEqual(match!.sport.id, "cricket");
    });

    it("returns null for non-existent match", async () => {
      mockFetch({});
      const match = await provider.getMatch("999999999");
      assert.strictEqual(match, null);
    });
  });

  describe("getLeagues", () => {
    it("returns leagues from live and today data", async () => {
      mockFetch({
        events: [
          {
            id: 1,
            homeTeam: { id: 1, name: "India" },
            awayTeam: { id: 2, name: "Australia" },
            homeScore: { current: 0, display: 0, innings: {} },
            awayScore: { current: 0, display: 0, innings: {} },
            status: { code: 0, description: "Not started", type: "notstarted" },
            tournament: { id: 11156, name: "ICC World Cup" },
            startTimestamp: 1737331200,
          },
        ],
      });

      const leagues = await provider.getLeagues();
      assert.ok(leagues.length > 0);
      assert.strictEqual(leagues[0].sportId, "cricket");
    });
  });

  describe("getLeague", () => {
    it("returns league by id", async () => {
      mockFetch({
        data: {
          id: 11156,
          name: "ICC World Cup",
          country: { id: 1, name: "International", alpha2: "INT" },
        },
      });

      const league = await provider.getLeague("11156");
      assert.ok(league);
      assert.strictEqual(league!.id, "11156");
      assert.strictEqual(league!.name, "ICC World Cup");
    });

    it("returns null for missing league", async () => {
      mockFetch({});
      const league = await provider.getLeague("999");
      assert.strictEqual(league, null);
    });
  });

  describe("getTeams", () => {
    it("returns teams from search", async () => {
      mockFetch({
        teams: [
          { id: 4021, name: "India", country: { id: 1, name: "India", alpha2: "IN" } },
          { id: 4022, name: "Australia", country: { id: 2, name: "Australia", alpha2: "AU" } },
        ],
      });

      const teams = await provider.getTeams({ search: "India" });
      assert.strictEqual(teams.length, 2);
      assert.strictEqual(teams[0].name, "India");
      assert.strictEqual(teams[0].sportId, "cricket");
    });

    it("returns empty array for empty search", async () => {
      const teams = await provider.getTeams({});
      assert.deepStrictEqual(teams, []);
    });
  });

  describe("getTeam", () => {
    it("returns team by id", async () => {
      mockFetch({
        data: {
          id: 4021,
          name: "India",
          country: { id: 1, name: "India", alpha2: "IN" },
          logo: "/logos/india.png",
        },
      });

      const team = await provider.getTeam("4021");
      assert.ok(team);
      assert.strictEqual(team!.id, "4021");
      assert.strictEqual(team!.name, "India");
    });

    it("returns null for missing team", async () => {
      mockFetch({});
      const team = await provider.getTeam("999");
      assert.strictEqual(team, null);
    });
  });

  describe("getPlayers", () => {
    it("returns players for a team", async () => {
      mockFetch({
        data: [
          { id: 1, name: "Virat Kohli", position: "Batsman" },
          { id: 2, name: "Jasprit Bumrah", position: "Bowler" },
        ],
      });

      const players = await provider.getPlayers({ teamId: "4021" });
      assert.strictEqual(players.length, 2);
      assert.strictEqual(players[0].name, "Virat Kohli");
      assert.strictEqual(players[0].teamId, "4021");
    });

    it("returns empty array for missing team players", async () => {
      mockFetch({ data: null });
      const players = await provider.getPlayers({ teamId: "999" });
      assert.deepStrictEqual(players, []);
    });
  });

  describe("getStandings", () => {
    it("returns normalized standings", async () => {
      mockFetch({
        data: {
          standings: [
            {
              position: 1,
              team: { id: 4021, name: "India" },
              points: 12,
              matches_played: 8,
              wins: 7,
              losses: 1,
              runs_scored: 1800,
              runs_conceded: 1200,
            },
          ],
        },
      });

      const standings = await provider.getStandings({ leagueId: "11156" });
      assert.strictEqual(standings.length, 1);
      assert.strictEqual(standings[0].teamId, "4021");
      assert.strictEqual(standings[0].position, 1);
      assert.strictEqual(standings[0].points, 12);
      assert.strictEqual(standings[0].sportId, "cricket");
    });

    it("returns empty array for missing standings", async () => {
      mockFetch({});
      const standings = await provider.getStandings({ leagueId: "999" });
      assert.deepStrictEqual(standings, []);
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

    it("returns mixed results from search", async () => {
      mockFetch({
        events: [
          { id: 1, homeTeam: { id: 1, name: "India" }, awayTeam: { id: 2, name: "Australia" }, tournament: { name: "ICC World Cup", id: 11156 } },
        ],
        teams: [
          { id: 4021, name: "India" },
        ],
        tournaments: [
          { id: 11156, name: "ICC World Cup", country: { name: "International" } },
        ],
      });

      const results = await provider.search({ query: "world cup", limit: 10 });
      assert.ok(results.length > 0);
    });
  });

  describe("getMatchEvents", () => {
    it("returns normalized events from incidents", async () => {
      mockFetch({
        data: [
          { id: 1, event_type: "wicket", description: "Bowler takes wicket", minute: 15, team: { id: 1, name: "India" }, player: { id: 10, name: "Bumrah" } },
          { id: 2, event_type: "boundary", description: "Four runs", minute: 18, team: { id: 1, name: "India" }, player: { id: 20, name: "Kohli" } },
        ],
      });

      const events = await provider.getMatchEvents({ matchId: "123" });
      assert.strictEqual(events.length, 2);
      assert.strictEqual(events[0].matchId, "123");
      assert.strictEqual(events[0].teamId, "1");
      assert.strictEqual(events[0].playerName, "Bumrah");
    });

    it("returns empty array for missing incidents", async () => {
      mockFetch({});
      const events = await provider.getMatchEvents({ matchId: "123" });
      assert.deepStrictEqual(events, []);
    });
  });

  describe("getMatchStatistics", () => {
    it("returns normalized statistics", async () => {
      mockFetch({
        data: [
          {
            team_id: 4021,
            team_name: "India",
            statistics: [
              { type: "total_runs", value: 287 },
              { type: "wickets", value: 6 },
              { type: "overs", value: 42.3 },
            ],
          },
        ],
      });

      const stats = await provider.getMatchStatistics({ matchId: "123" });
      assert.strictEqual(stats.length, 1);
      assert.strictEqual(stats[0].teamId, "4021");
      assert.strictEqual(stats[0].teamName, "India");
      assert.ok(stats[0].stats.length > 0);
    });

    it("returns empty array for missing statistics", async () => {
      mockFetch({});
      const stats = await provider.getMatchStatistics({ matchId: "123" });
      assert.deepStrictEqual(stats, []);
    });
  });

  describe("getMatchLineups", () => {
    it("returns normalized lineups", async () => {
      mockFetch({
        data: [
          {
            team_id: 4021,
            team_name: "India",
            players: [
              { player_id: 1, player_name: "Virat Kohli", position: "Batsman", number: 18 },
              { player_id: 2, player_name: "Jasprit Bumrah", position: "Bowler", number: 93 },
            ],
          },
        ],
      });

      const lineups = await provider.getMatchLineups({ matchId: "123" });
      assert.strictEqual(lineups.length, 1);
      assert.strictEqual(lineups[0].teamId, "4021");
      assert.strictEqual(lineups[0].teamName, "India");
      assert.strictEqual(lineups[0].startXI.length, 2);
      assert.strictEqual(lineups[0].startXI[0].name, "Virat Kohli");
    });

    it("returns empty array for missing lineups", async () => {
      mockFetch({});
      const lineups = await provider.getMatchLineups({ matchId: "123" });
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
    it("sends correct API key header", async () => {
      let capturedHeaders: Record<string, string> = {};
      global.fetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
        capturedHeaders = ((init as Record<string, unknown> | undefined)?.headers as Record<string, string>) ?? {};
        return new Response(
          JSON.stringify({ events: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        ) as Response;
      };

      await provider.getMatches();
      assert.strictEqual(capturedHeaders["x-api-key"], "test-cricket-key");
    });
  });
});

describe("cricket normalize", () => {
  describe("normalizeCricketMatchStatus", () => {
    it("maps not started to scheduled", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 0, description: "Not started", type: "notstarted" }), "scheduled");
    });

    it("maps 1st innings to live", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 21, description: "1st Innings", type: "inprogress" }), "live");
    });

    it("maps innings break to break", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 31, description: "Innings Break", type: "break" }), "break");
    });

    it("maps ended to finished", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 100, description: "Ended", type: "finished" }), "finished");
    });

    it("maps postponed to postponed", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 60, description: "Postponed", type: "postponed" }), "postponed");
    });

    it("maps cancelled to cancelled", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 70, description: "Cancelled", type: "cancelled" }), "cancelled");
    });

    it("maps retired/abandoned to abandoned", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 80, description: "Retired", type: "abandoned" }), "abandoned");
    });
  });

  describe("normalizeCricketScore", () => {
    it("maps innings scores to periodScores", () => {
      const result = normalizeCricketScore(
        { current: 287, display: 287, innings: { inning1: { score: 287, wickets: 6, overs: 42.3 } } },
        { current: 150, display: 150, innings: { inning1: { score: 150, wickets: 4, overs: 18.2 } } }
      );
      assert.strictEqual(result.home, 287);
      assert.strictEqual(result.away, 150);
      assert.ok(result.periodScores.length > 0);
      assert.strictEqual(result.periodScores[0].period, "Innings 1");
    });

    it("returns empty periodScores for missing innings", () => {
      const result = normalizeCricketScore(null, null);
      assert.strictEqual(result.home, null);
      assert.strictEqual(result.away, null);
      assert.deepStrictEqual(result.periodScores, []);
    });
  });
});

describe("CricketProvider diagnostics", () => {
  const originalFetch = global.fetch;
  const provider = new CricketProvider("test-cricket-key");

  beforeEach(() => {
    global.fetch = originalFetch;
  });

  describe("base URL", () => {
    it("uses the correct v2 SportsAPI Pro cricket URL with /api prefix", async () => {
      let capturedUrl = "";
      global.fetch = async (url: RequestInfo | URL) => {
        capturedUrl = url.toString();
        return new Response(JSON.stringify({ events: [] }), { status: 200 }) as Response;
      };

      await provider.getMatches();
      assert.ok(
        capturedUrl.startsWith("https://v2.cricket.sportsapipro.com/api/"),
        `Expected URL to start with https://v2.cricket.sportsapipro.com/api/, got: ${capturedUrl}`
      );
    });

    it("targets the /today endpoint when no date is supplied", async () => {
      let capturedUrl = "";
      global.fetch = async (url: RequestInfo | URL) => {
        capturedUrl = url.toString();
        return new Response(JSON.stringify({ events: [] }), { status: 200 }) as Response;
      };

      await provider.getMatches();
      assert.strictEqual(capturedUrl, "https://v2.cricket.sportsapipro.com/api/today");
    });
  });

  describe("error diagnostics", () => {
    it("throws SportsApiError with AUTH_FAILURE on missing/empty key (401)", async () => {
      global.fetch = async () =>
        new Response(JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "Valid x-api-key header or Bearer token required" } }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }) as Response;

      let caught: unknown;
      try {
        await provider.getMatches();
      } catch (error) {
        caught = error;
      }
      assert.ok(caught instanceof SportsApiError, "Expected SportsApiError");
      const err = caught as SportsApiError;
      assert.strictEqual(err.meta.provider, "CricketProvider");
      assert.strictEqual(err.meta.kind, "AUTH_FAILURE");
      assert.ok(!JSON.stringify(err.meta).includes("test-cricket-key"), "Should not leak API key");
      assert.ok(!JSON.stringify(err.meta).includes("x-api-key"), "Should not reference auth header in detail");
    });

    it("throws SportsApiError with AUTH_FAILURE on 403", async () => {
      global.fetch = async () =>
        new Response(JSON.stringify({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }) as Response;

      let caught: unknown;
      try {
        await provider.getMatches();
      } catch (error) {
        caught = error;
      }
      assert.ok(caught instanceof SportsApiError);
      assert.strictEqual((caught as SportsApiError).meta.kind, "AUTH_FAILURE");
    });

    it("throws SportsApiError with RATE_LIMIT on 429", async () => {
      global.fetch = async () =>
        new Response(JSON.stringify({ success: false, error: { code: "RATE_LIMIT", message: "Too many requests" } }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }) as Response;

      let caught: unknown;
      try {
        await provider.getMatches();
      } catch (error) {
        caught = error;
      }
      assert.ok(caught instanceof SportsApiError);
      assert.strictEqual((caught as SportsApiError).meta.kind, "RATE_LIMIT");
    });

    it("throws SportsApiError with API_ERROR on 500", async () => {
      global.fetch = async () =>
        new Response("Internal Server Error", { status: 500, headers: { "Content-Type": "text/plain" } }) as Response;

      let caught: unknown;
      try {
        await provider.getMatches();
      } catch (error) {
        caught = error;
      }
      assert.ok(caught instanceof SportsApiError);
      assert.strictEqual((caught as SportsApiError).meta.kind, "API_ERROR");
      assert.strictEqual((caught as SportsApiError).meta.status, 500);
    });

    it("throws SportsApiError with TIMEOUT on abort", async () => {
      global.fetch = async () => {
        throw Object.assign(new Error("The operation was aborted"), { name: "AbortError" });
      };

      let caught: unknown;
      try {
        await provider.getMatches();
      } catch (error) {
        caught = error;
      }
      assert.ok(caught instanceof SportsApiError);
      assert.strictEqual((caught as SportsApiError).meta.kind, "TIMEOUT");
    });

    it("throws SportsApiError with MALFORMED_RESPONSE on invalid JSON", async () => {
      global.fetch = async () =>
        new Response("not-json", { status: 200, headers: { "Content-Type": "application/json" } }) as Response;

      let caught: unknown;
      try {
        await provider.getMatches();
      } catch (error) {
        caught = error;
      }
      assert.ok(caught instanceof SportsApiError);
      assert.strictEqual((caught as SportsApiError).meta.kind, "MALFORMED_RESPONSE");
    });

    it("throws SportsApiError with AUTH_FAILURE when constructed without a key", () => {
      let caught: unknown;
      try {
        new CricketProvider("");
      } catch (error) {
        caught = error;
      }
      assert.ok(caught instanceof SportsApiError, "Expected SportsApiError");
      const err = caught as SportsApiError;
      assert.strictEqual(err.meta.kind, "AUTH_FAILURE");
      assert.strictEqual(err.meta.provider, "CricketProvider");
      assert.ok(!JSON.stringify(err).includes("x-api-key"), "Should not reference auth header");
    });

    it("does not expose API key in error details", async () => {
      global.fetch = async () =>
        new Response(JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid key abc123secret" } }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }) as Response;

      let caught: unknown;
      try {
        await provider.getMatches();
      } catch (error) {
        caught = error;
      }
      const serialized = JSON.stringify(caught);
      assert.ok(!serialized.includes("test-cricket-key"));
      assert.ok(!serialized.includes("abc123secret"));
    });
  });
});
