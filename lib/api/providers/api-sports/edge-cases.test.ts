import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { ApiSportsProvider } from "./ApiSportsProvider";

describe("ApiSportsProvider edge cases", () => {
  const originalFetch = global.fetch;
  const provider = new ApiSportsProvider("test-key");

  beforeEach(() => {
    global.fetch = originalFetch;
  });

  it("throws on malformed JSON response", async () => {
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

  it("throws on 500 error after retries", async () => {
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

  it("returns empty array for response missing response field", async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ errors: [] }), { status: 200, headers: { "Content-Type": "application/json" } }) as Response;

    const matches = await provider.getMatches();
    assert.deepStrictEqual(matches, []);
  });

  it("returns null for match not found", async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ response: [] }), { status: 200, headers: { "Content-Type": "application/json" } }) as Response;

    const match = await provider.getMatch("999999999");
    assert.strictEqual(match, null);
  });

  it("handles missing home team gracefully", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          response: [
            {
              fixture: { id: 1, status: { long: "Match Finished", short: "FT", elapsed: 90 }, date: "2026-08-22T19:45:00Z", venue: { name: "Test Stadium" } },
              league: { id: 1, name: "Test League", country: "Testland", logo: null, season: 2026 },
              teams: { home: null, away: { id: 2, name: "Away Team", logo: null } },
              score: { fulltime: { home: 1, away: 2 } },
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

  it("handles missing league country gracefully", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          response: [
            {
              fixture: { id: 1, status: { long: "Not Started", short: "NS", elapsed: null }, date: "2026-08-22T19:45:00Z", venue: null },
              league: { id: 1, name: "Test League", country: "", logo: null, season: 2026 },
              teams: { home: { id: 1, name: "Home Team", logo: null }, away: { id: 2, name: "Away Team", logo: null } },
              score: null,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as Response;

    const matches = await provider.getMatches();
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].league.country, "");
  });

  it("handles events with missing player data", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          response: [
            {
              player: null,
              team: { id: 1, name: "Home Team", logo: null },
              time: { elapsed: 10 },
              type: "goal",
              detail: "Normal Goal",
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
          response: [
            {
              team: null,
              statistics: [{ type: "Ball Possession", value: "50%" }],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as Response;

    const stats = await provider.getMatchStatistics({ matchId: "1" });
    assert.strictEqual(stats.length, 1);
    assert.strictEqual(stats[0].teamName, "Unknown");
  });

  it("handles lineups with missing player data", async () => {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          response: [
            {
              team: { id: 1, name: "Home Team", logo: null },
              coach: null,
              formation: "4-3-3",
              startXI: [{ player: null }],
              substitutes: [],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as Response;

    const lineups = await provider.getMatchLineups({ matchId: "1" });
    assert.strictEqual(lineups.length, 1);
    assert.strictEqual(lineups[0].startXI[0].name, "Unknown");
  });
});
