import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { BasketballProvider } from "./BasketballProvider";

describe("BasketballProvider edge cases", () => {
  const originalFetch = global.fetch;
  const provider = new BasketballProvider("test-basketball-key");

  beforeEach(() => {
    global.fetch = originalFetch;
  });

  it("handles missing home team gracefully", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
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
              venue: null,
              teams: {
                home: null,
                away: { id: 2, name: "Away Team", slug: "away-team", abbr: "AWY", logo: null },
              },
              scores: {
                home: { total: 1 },
                away: { total: 2 },
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as Response;

    const matches = await provider.getMatches();
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].homeTeam.name, "Unknown");
    assert.strictEqual(matches[0].awayTeam.name, "Away Team");
  });

  it("handles missing away team gracefully", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
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
              venue: null,
              teams: {
                home: { id: 1, name: "Home Team", slug: "home-team", abbr: "HOM", logo: null },
                away: null,
              },
              scores: {
                home: { total: 1 },
                away: { total: 2 },
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as Response;

    const matches = await provider.getMatches();
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].homeTeam.name, "Home Team");
    assert.strictEqual(matches[0].awayTeam.name, "Unknown");
  });

  it("handles missing scores gracefully", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
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
              status: { long: "Not Started", short: "NS", elapsed: null },
              country: { id: 1, name: "USA", flag: null },
              league: { id: 1, name: "NBA", slug: "nba", season: "2025-2026", country: { id: 1, name: "USA", code: "US", flag: null }, logo: null },
              stage: "Regular Season",
              venue: null,
              teams: {
                home: { id: 1, name: "Home", slug: "home", abbr: "HOM", logo: null },
                away: { id: 2, name: "Away", slug: "away", abbr: "AWY", logo: null },
              },
              scores: null,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as Response;

    const matches = await provider.getMatches();
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].score.home, null);
    assert.strictEqual(matches[0].score.away, null);
  });

  it("handles missing league logo gracefully", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
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
              venue: null,
              teams: {
                home: { id: 1, name: "Home", slug: "home", abbr: "HOM", logo: null },
                away: { id: 2, name: "Away", slug: "away", abbr: "AWY", logo: null },
              },
              scores: {
                home: { total: 1 },
                away: { total: 2 },
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as Response;

    const matches = await provider.getMatches();
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].league.logo, undefined);
  });

  it("handles events with missing player data", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          get: "games/events",
          parameters: [],
          errors: [],
          results: 1,
          response: [
            {
              id: 1,
              quarter: 1,
              time: "05:32",
              event_type: "points",
              player: null,
              team: { id: 1, name: "Lakers" },
              points: 2,
              detail: null,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as Response;

    const events = await provider.getMatchEvents({ matchId: "1" });
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].playerName, "Unknown");
    assert.strictEqual(events[0].teamId, "1");
  });

  it("handles statistics with missing team data", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          get: "games/statistics",
          parameters: [],
          errors: [],
          results: 1,
          response: [
            {
              team_id: 0,
              team_name: "",
              statistics: [],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as Response;

    const stats = await provider.getMatchStatistics({ matchId: "1" });
    assert.strictEqual(stats.length, 1);
    assert.strictEqual(stats[0].teamName, "");
    assert.deepStrictEqual(stats[0].stats, []);
  });

  it("handles lineups with missing player data", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          get: "games/lineups",
          parameters: [],
          errors: [],
          results: 1,
          response: [
            {
              team_id: 1,
              team_name: "Lakers",
              starting_lineups: [{ player_id: 0, player_name: "", position: "", number: null }],
              bench: [],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as Response;

    const lineups = await provider.getMatchLineups({ matchId: "1" });
    assert.strictEqual(lineups.length, 1);
    assert.strictEqual(lineups[0].startXI.length, 1);
    assert.strictEqual(lineups[0].startXI[0].name, "");
  });

  it("handles 400 error without retry", async () => {
    global.fetch = async () =>
      new Response("Bad Request", { status: 400, headers: { "Content-Type": "text/plain" } }) as Response;

    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      return new Response("Bad Request", { status: 400, headers: { "Content-Type": "text/plain" } }) as Response;
    };

    let threw = false;
    try {
      await provider.getMatches();
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true);
    assert.strictEqual(callCount, 1);
  });

  it("handles empty response body", async () => {
    global.fetch = async () =>
      new Response("", { status: 200, headers: { "Content-Type": "application/json" } }) as Response;

    let threw = false;
    try {
      await provider.getMatches();
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true);
  });
});
