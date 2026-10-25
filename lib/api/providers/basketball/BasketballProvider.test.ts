import { describe, it, beforeEach } from "node:test";
import { beforeEach as __lgb } from "node:test";
import { __resetLastGoodStore } from "../../last-good";
__lgb(() => { __resetLastGoodStore(); });
import assert from "node:assert";
import { BasketballProvider } from "./BasketballProvider";

describe("BasketballProvider", () => {
  const provider = new BasketballProvider("test-basketball-key");

  beforeEach(() => {
    global.fetch = (async () =>
      new Response(
        JSON.stringify({
          success: true,
          events: [
            {
              id: 16824745,
              tournament: { name: "NBA", uniqueTournament: { id: 132 }, category: { sport: { slug: "basketball" } } },
              status: { code: 6, type: "inprogress", description: "3rd quarter" },
              homeTeam: { id: 3417, name: "Denver Nuggets", nameCode: "DEN" },
              awayTeam: { id: 5539, name: "New Orleans Pelicans", nameCode: "NOP" },
              homeScore: { current: 78, display: 78, period1: 24, period2: 33, period3: 21 },
              awayScore: { current: 76, display: 76, period1: 38, period2: 35, period3: 3 },
              startTimestamp: 1792890000,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )) as typeof fetch;
  });

  it("binds the basketball sport identity and quarter period labels", async () => {
    const matches = await provider.getLiveMatches();
    assert.strictEqual(matches.length, 1);
    assert.strictEqual(matches[0].sport.id, "basketball");
    assert.strictEqual(matches[0].sport.name, "Basketball");
    assert.strictEqual(matches[0].league.id, "132");
    assert.strictEqual(matches[0].homeTeam.name, "Denver Nuggets");
    assert.strictEqual(matches[0].score.home, 78);
    assert.deepStrictEqual(
      matches[0].score.periodScores?.map((p) => p.period),
      ["Q1", "Q2", "Q3"]
    );
  });

  it("queries the basketball API-Sports Pro host", async () => {
    let requested = "";
    global.fetch = (async (input: RequestInfo | URL) => {
      requested = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      return new Response(JSON.stringify({ success: true, events: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    await provider.getMatches();
    assert.ok(requested.startsWith("https://v2.basketball.sportsapipro.com/api/"), requested);
  });
});
