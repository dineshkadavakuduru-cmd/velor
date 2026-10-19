import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { ApiSportsProvider } from "./ApiSportsProvider";
import { __resetLastGoodStore, __setLastGoodForTest } from "../../last-good";

let failFetch = false;

beforeEach(() => {
  __resetLastGoodStore();
  failFetch = false;
  global.fetch = (async () => {
    if (failFetch) {
      return new Response(
        JSON.stringify({ get: "fixtures", errors: ["Sorry, your account exceeded the quota"], results: 0, response: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        get: "fixtures",
        errors: [],
        results: 1,
        response: [
          {
            fixture: { id: 1, status: { long: "NS", short: "NS", elapsed: null }, date: "2026-10-19T18:00:00Z", venue: { name: "Test Arena" } },
            league: { id: 39, name: "Premier League", country: "England", logo: null, season: 2026 },
            teams: { home: { id: 1, name: "Alpha", logo: null }, away: { id: 2, name: "Beta", logo: null } },
            score: { halftime: { home: null, away: null }, fulltime: { home: null, away: null }, extratime: { home: null, away: null }, penalty: { home: null, away: null } },
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }) as typeof fetch;
});

describe("ApiSportsProvider quota-error handling", () => {
  it("treats HTTP 200 with quota errors as a failure when no good data exists", async () => {
    failFetch = true;
    const provider = new ApiSportsProvider("test-key");
    await assert.rejects(provider.getMatches());
  });

  it("serves last-known-good data instead of the quota-errored body", async () => {
    const endpointSuffix = `https://v3.football.api-sports.io/fixtures?sport=football`;
    // Seed last-known-good exactly as a prior successful call would.
    __setLastGoodForTest(`ApiSportsProvider:${endpointSuffix}`, [], Date.now());

    failFetch = true;
    const provider = new ApiSportsProvider("test-key");
    const matches = await provider.getMatches({ sport: "football" });
    assert.deepStrictEqual(matches, []);
  });
});
