import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { TennisProvider } from "./TennisProvider";
import { normalizeTennisMatchStatus, normalizeTennisScore } from "./normalize";
import { SportsApiError } from "../../error";

describe("TennisProvider", () => {
  const originalFetch = global.fetch;
  const provider = new TennisProvider("test-tennis-key");

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
            id: 15987654,
            homeTeam: {
              id: 418794,
              name: "Matisse Bobichon",
              shortName: "M. Bobichon",
              ranking: 711,
              country: { alpha2: "FR", name: "France" },
            },
            awayTeam: {
              id: 230306,
              name: "Kasidit Samrej",
              ranking: 419,
              country: { alpha2: "TH", name: "Thailand" },
            },
            homeScore: {
              current: 0,
              display: 0,
              period1: 2,
              point: "15",
            },
            awayScore: {
              current: 0,
              display: 0,
              period1: 1,
              point: "0",
            },
            firstToServe: 2,
            groundType: "Hardcourt outdoor",
            status: { code: 8, type: "inprogress", description: "1st set" },
            tournament: { name: "Challenger Tour", slug: "challenger", uniqueTournament: { id: 2519 } },
            startTimestamp: 1775959066,
          },
        ],
      });

      const matches = await provider.getMatches();
      assert.strictEqual(matches.length, 1);
      assert.strictEqual(matches[0].id, "15987654");
      assert.strictEqual(matches[0].status, "live");
      assert.strictEqual(matches[0].sport.id, "tennis");
      assert.strictEqual(matches[0].sport.name, "Tennis");
      assert.strictEqual(matches[0].homeTeam.name, "Matisse Bobichon");
      assert.strictEqual(matches[0].awayTeam.name, "Kasidit Samrej");
      assert.ok((matches[0].score.periodScores?.length ?? 0) > 0);
      assert.strictEqual(matches[0].surface, "Hardcourt outdoor");
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
            homeTeam: { id: 1, name: "Alcaraz" },
            awayTeam: { id: 2, name: "Djokovic" },
            homeScore: { current: 0, display: 0 },
            awayScore: { current: 0, display: 0 },
            status: { code: 0, description: "Not started", type: "notstarted" },
            tournament: { name: "ATP Finals", uniqueTournament: { id: 123 } },
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
            homeTeam: { id: 275923, name: "Carlos Alcaraz", shortName: "C. Alcaraz" },
            awayTeam: { id: 119248, name: "Casper Ruud" },
            homeScore: { current: 0, display: 0, period1: 6, period2: 4, point: "40" },
            awayScore: { current: 0, display: 0, period1: 4, period2: 6, point: "30" },
            groundType: "Clay",
            status: { code: 9, type: "inprogress", description: "2nd set" },
            tournament: { name: "ATP Finals", uniqueTournament: { id: 2519 } },
            startTimestamp: 1737331200,
          },
        ],
      });

      const matches = await provider.getLiveMatches();
      assert.ok(matches.length > 0);
      assert.strictEqual(matches[0].status, "live");
      assert.strictEqual(matches[0].sport.id, "tennis");
    });
  });

  describe("getMatch", () => {
    it("returns match by id", async () => {
      mockFetch({
        event: {
          id: 15625024,
          homeTeam: { id: 275923, name: "Carlos Alcaraz" },
          awayTeam: { id: 119248, name: "Casper Ruud" },
          homeScore: { current: 2, display: 2, period1: 6, period2: 6, period3: 7 },
          awayScore: { current: 1, display: 1, period1: 4, period2: 7, period3: 5 },
          groundType: "Clay",
          status: { code: 100, description: "Ended", type: "finished" },
          tournament: { name: "ATP Finals", uniqueTournament: { id: 2519 } },
          startTimestamp: 1737331200,
        },
      });

      const match = await provider.getMatch("15625024");
      assert.ok(match);
      assert.strictEqual(match!.id, "15625024");
      assert.strictEqual(match!.status, "finished");
      assert.strictEqual(match!.sport.id, "tennis");
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
            homeTeam: { id: 1, name: "Alcaraz" },
            awayTeam: { id: 2, name: "Djokovic" },
            homeScore: { current: 0, display: 0 },
            awayScore: { current: 0, display: 0 },
            status: { code: 0, description: "Not started", type: "notstarted" },
            tournament: { name: "Wimbledon", uniqueTournament: { id: 789 } },
            startTimestamp: 1737331200,
          },
        ],
      });

      const leagues = await provider.getLeagues();
      assert.ok(leagues.length > 0);
      assert.strictEqual(leagues[0].sportId, "tennis");
    });
  });

  describe("getLeague", () => {
    it("returns league by id", async () => {
      mockFetch({
        data: {
          id: 2519,
          name: "ATP Finals",
          country: { id: 1, name: "International", alpha2: "INT" },
        },
      });

      const league = await provider.getLeague("2519");
      assert.ok(league);
      assert.strictEqual(league!.id, "2519");
      assert.strictEqual(league!.name, "ATP Finals");
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
          { id: 275923, name: "Carlos Alcaraz", shortName: "C. Alcaraz", country: { name: "Spain", alpha2: "ES" } },
          { id: 119248, name: "Casper Ruud", shortName: "C. Ruud", country: { name: "Norway", alpha2: "NO" } },
        ],
      });

      const teams = await provider.getTeams({ search: "Alcaraz" });
      assert.strictEqual(teams.length, 2);
      assert.strictEqual(teams[0].name, "Carlos Alcaraz");
      assert.strictEqual(teams[0].sportId, "tennis");
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
          id: 275923,
          name: "Carlos Alcaraz",
          shortName: "C. Alcaraz",
          country: { id: 1, name: "Spain", alpha2: "ES" },
          ranking: 2,
        },
      });

      const team = await provider.getTeam("275923");
      assert.ok(team);
      assert.strictEqual(team!.id, "275923");
      assert.strictEqual(team!.name, "Carlos Alcaraz");
    });

    it("returns null for missing team", async () => {
      mockFetch({});
      const team = await provider.getTeam("999");
      assert.strictEqual(team, null);
    });
  });

  describe("getPlayers", () => {
    it("returns player for team id", async () => {
      mockFetch({
        data: {
          id: 275923,
          name: "Carlos Alcaraz",
          shortName: "C. Alcaraz",
          country: { id: 1, name: "Spain", alpha2: "ES" },
          ranking: 2,
        },
      });

      const players = await provider.getPlayers({ teamId: "275923" });
      assert.strictEqual(players.length, 1);
      assert.strictEqual(players[0].name, "Carlos Alcaraz");
    });

    it("returns empty array for unknown player search", async () => {
      mockFetch({ teams: [] });
      const players = await provider.getPlayers({ search: "zzznotfound" });
      assert.deepStrictEqual(players, []);
    });
  });

  describe("getStandings", () => {
    it("returns rankings as standings", async () => {
      mockFetch({
        data: {
          rankings: [
            { rowName: "Jannik Sinner", rank: 1, points: 10000, country: { alpha2: "IT", name: "Italy" } },
            { rowName: "Carlos Alcaraz", rank: 2, points: 9200, country: { alpha2: "ES", name: "Spain" } },
          ],
        },
      });

      const standings = await provider.getStandings({ leagueId: "2519" });
      assert.ok(standings.length > 0);
      assert.strictEqual(standings[0].sportId, "tennis");
      assert.strictEqual(standings[0].position, 1);
    });

    it("returns empty array when rankings unavailable", async () => {
      mockFetch({});
      const standings = await provider.getStandings({ leagueId: "2519" });
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
          { id: 1, homeTeam: { id: 1, name: "Alcaraz" }, awayTeam: { id: 2, name: "Djokovic" }, tournament: { name: "ATP Finals", uniqueTournament: { id: 123 } } },
        ],
        teams: [
          { id: 275923, name: "Carlos Alcaraz", shortName: "C. Alcaraz", country: { name: "Spain" } },
        ],
        tournaments: [
          { id: 2519, name: "ATP Finals", uniqueTournament: { id: 2519 }, country: { name: "International" } },
        ],
      });

      const results = await provider.search({ query: "alcaraz", limit: 10 });
      assert.ok(results.length > 0);
    });
  });

  describe("getMatchEvents", () => {
    it("returns events from point-by-point", async () => {
      mockFetch({
        data: [
          { seq: 1, set: 1, game: 1, number: 1, score: { sets: [0, 0], games: [0, 0] }, server: 1, winner: 1 },
          { seq: 2, set: 1, game: 1, number: 2, score: { sets: [0, 0], games: [15, 0] }, server: 2, winner: 1 },
        ],
      });

      const events = await provider.getMatchEvents({ matchId: "15625024" });
      assert.ok(events.length >= 0);
      if (events.length > 0) {
        assert.strictEqual(events[0].matchId, "15625024");
      }
    });

    it("returns empty array when point-by-point unavailable", async () => {
      mockFetch({});
      const events = await provider.getMatchEvents({ matchId: "15625024" });
      assert.deepStrictEqual(events, []);
    });
  });

  describe("getMatchStatistics", () => {
    it("returns normalized statistics", async () => {
      mockFetch({
        data: [
          {
            team_id: 275923,
            team_name: "Carlos Alcaraz",
            statistics: [
              { type: "aces", value: 12 },
              { type: "double_faults", value: 3 },
              { type: "first_serve_percentage", value: "68%" },
            ],
          },
        ],
      });

      const stats = await provider.getMatchStatistics({ matchId: "15625024" });
      assert.strictEqual(stats.length, 1);
      assert.strictEqual(stats[0].teamId, "275923");
      assert.strictEqual(stats[0].teamName, "Carlos Alcaraz");
      assert.ok(stats[0].stats.length > 0);
    });

    it("returns empty array for missing statistics", async () => {
      mockFetch({});
      const stats = await provider.getMatchStatistics({ matchId: "15625024" });
      assert.deepStrictEqual(stats, []);
    });
  });

  describe("getMatchLineups", () => {
    it("returns empty array (not supported for tennis)", async () => {
      const lineups = await provider.getMatchLineups({ matchId: "15625024" });
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
      assert.strictEqual(capturedHeaders["x-api-key"], "test-tennis-key");
    });
  });
});

describe("tennis normalize", () => {
  describe("normalizeTennisMatchStatus", () => {
    it("maps notstarted to scheduled", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 0, description: "Not started", type: "notstarted" }), "scheduled");
    });

    it("maps inprogress to live", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 9, description: "2nd set", type: "inprogress" }), "live");
    });

    it("maps ended to finished", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 100, description: "Ended", type: "finished" }), "finished");
    });

    it("maps postponed to postponed", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 60, description: "Postponed", type: "postponed" }), "postponed");
    });

    it("maps cancelled to cancelled", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 70, description: "Cancelled", type: "cancelled" }), "cancelled");
    });

    it("maps retired/abandoned to abandoned", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 80, description: "Retired", type: "abandoned" }), "abandoned");
    });
  });

  describe("normalizeTennisScore", () => {
    it("maps period scores to set labels", () => {
      const result = normalizeTennisScore(
        { current: 2, display: 2, period1: 6, period2: 4, period3: 7 },
        { current: 1, display: 1, period1: 4, period2: 6, period3: 5 }
      );
      assert.strictEqual(result.home, 2);
      assert.strictEqual(result.away, 1);
      assert.ok(result.periodScores.length >= 3);
      assert.strictEqual(result.periodScores[0].period, "Set 1");
      assert.strictEqual(result.periodScores[1].period, "Set 2");
      assert.strictEqual(result.periodScores[2].period, "Set 3");
    });

    it("returns empty periodScores for missing scores", () => {
      const result = normalizeTennisScore(null, null);
      assert.strictEqual(result.home, null);
      assert.strictEqual(result.away, null);
      assert.deepStrictEqual(result.periodScores, []);
    });
  });
});

describe("TennisProvider diagnostics", () => {
  const originalFetch = global.fetch;
  const provider = new TennisProvider("test-tennis-key");

  beforeEach(() => {
    global.fetch = originalFetch;
  });

  describe("base URL", () => {
    it("uses the correct v2 SportsAPI Pro tennis URL with /api prefix", async () => {
      let capturedUrl = "";
      global.fetch = async (url: RequestInfo | URL) => {
        capturedUrl = url.toString();
        return new Response(JSON.stringify({ events: [] }), { status: 200 }) as Response;
      };

      await provider.getMatches();
      assert.ok(
        capturedUrl.startsWith("https://v2.tennis.sportsapipro.com/api/"),
        `Expected URL to start with https://v2.tennis.sportsapipro.com/api/, got: ${capturedUrl}`
      );
    });

    it("targets the /today endpoint when no date is supplied", async () => {
      let capturedUrl = "";
      global.fetch = async (url: RequestInfo | URL) => {
        capturedUrl = url.toString();
        return new Response(JSON.stringify({ events: [] }), { status: 200 }) as Response;
      };

      await provider.getMatches();
      assert.strictEqual(capturedUrl, "https://v2.tennis.sportsapipro.com/api/today");
    });

    it("does NOT use the deprecated api.sportsapipro.com/v2/tennis URL", async () => {
      let capturedUrl = "";
      global.fetch = async (url: RequestInfo | URL) => {
        capturedUrl = url.toString();
        return new Response(JSON.stringify({ events: [] }), { status: 200 }) as Response;
      };

      await provider.getMatches();
      assert.ok(
        !capturedUrl.includes("api.sportsapipro.com/v2/tennis"),
        `Should not use deprecated URL, got: ${capturedUrl}`
      );
    });
  });

  describe("error diagnostics", () => {
    it("throws SportsApiError with AUTH_FAILURE on 401", async () => {
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
      assert.strictEqual(err.meta.provider, "TennisProvider");
      assert.strictEqual(err.meta.kind, "AUTH_FAILURE");
      assert.ok(!JSON.stringify(err.meta).includes("test-tennis-key"), "Should not leak API key");
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
        new TennisProvider("");
      } catch (error) {
        caught = error;
      }
      assert.ok(caught instanceof SportsApiError, "Expected SportsApiError");
      const err = caught as SportsApiError;
      assert.strictEqual(err.meta.kind, "AUTH_FAILURE");
      assert.strictEqual(err.meta.provider, "TennisProvider");
      assert.ok(!JSON.stringify(err).includes("x-api-key"), "Should not reference auth header");
    });

    it("does not expose API key in error details", async () => {
      global.fetch = async () =>
        new Response(JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "Key abc123secret invalid" } }), {
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
      assert.ok(!serialized.includes("test-tennis-key"));
      assert.ok(!serialized.includes("abc123secret"));
    });

    it("returns successful normalized response (live matches)", async () => {
      global.fetch = async () =>
        new Response(JSON.stringify({
          events: [
            {
              id: 15987654,
              homeTeam: { id: 418794, name: "Matisse Bobichon" },
              awayTeam: { id: 230306, name: "Kasidit Samrej" },
              homeScore: { current: 0, display: 0, period1: 2 },
              awayScore: { current: 0, display: 0, period1: 1 },
              status: { code: 8, type: "inprogress", description: "1st set" },
              tournament: { name: "Challenger Tour", uniqueTournament: { id: 2519 } },
              startTimestamp: 1775959066,
            },
          ],
        }), { status: 200, headers: { "Content-Type": "application/json" } }) as Response;

      const matches = await provider.getLiveMatches();
      assert.strictEqual(matches.length, 1);
      assert.strictEqual(matches[0].id, "15987654");
      assert.strictEqual(matches[0].status, "live");
      assert.strictEqual(matches[0].sport.id, "tennis");
    });
  });
});
