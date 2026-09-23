import { describe, it } from "node:test";
import assert from "node:assert";
import { MockSportsProvider } from "./MockSportsProvider";

describe("MockSportsProvider.getTeams", () => {
  it("returns all teams without params", async () => {
    const provider = new MockSportsProvider();
    const teams = await provider.getTeams();
    assert.ok(teams.length > 0);
    assert.ok(teams.some((t) => t.id === "arsenal"));
    assert.ok(teams.some((t) => t.id === "chelsea"));
  });

  it("filters teams by search query", async () => {
    const provider = new MockSportsProvider();
    const teams = await provider.getTeams({ search: "arsenal" });
    assert.ok(teams.length > 0);
    assert.ok(teams.every((t) => t.name.toLowerCase().includes("arsenal")));
  });

  it("is case-insensitive for search", async () => {
    const provider = new MockSportsProvider();
    const teams = await provider.getTeams({ search: "ARSENAL" });
    assert.ok(teams.length > 0);
    assert.ok(teams.some((t) => t.id === "arsenal"));
  });

  it("filters teams by league", async () => {
    const provider = new MockSportsProvider();
    const teams = await provider.getTeams({ leagueId: "premier-league" });
    assert.ok(teams.length > 0);
    assert.ok(
      teams.every((t) =>
        ["arsenal", "chelsea", "man-city", "liverpool"].includes(t.id)
      )
    );
  });

  it("returns empty array for non-matching search", async () => {
    const provider = new MockSportsProvider();
    const teams = await provider.getTeams({ search: "xyznonexistent" });
    assert.deepStrictEqual(teams, []);
  });

  it("returns empty array for non-matching league", async () => {
    const provider = new MockSportsProvider();
    const teams = await provider.getTeams({ leagueId: "nonexistent-league" });
    assert.deepStrictEqual(teams, []);
  });

  it("deduplicates teams appearing in multiple matches", async () => {
    const provider = new MockSportsProvider();
    const teams = await provider.getTeams();
    const ids = teams.map((t) => t.id);
    assert.strictEqual(ids.length, new Set(ids).size);
  });
});

describe("MockSportsProvider.search", () => {
  it("returns empty array for short queries", async () => {
    const provider = new MockSportsProvider();
    const results = await provider.search({ query: "ab" });
    assert.ok(Array.isArray(results));
  });

  it("returns empty array for empty query", async () => {
    const provider = new MockSportsProvider();
    const results = await provider.search({ query: "" });
    assert.deepStrictEqual(results, []);
  });

  it("finds teams by name", async () => {
    const provider = new MockSportsProvider();
    const results = await provider.search({ query: "Arsenal" });
    assert.ok(results.some((r) => r.type === "team" && r.id === "arsenal"));
  });

  it("finds leagues by name", async () => {
    const provider = new MockSportsProvider();
    const results = await provider.search({ query: "Premier" });
    assert.ok(results.some((r) => r.type === "league" && r.id === "premier-league"));
  });

  it("finds matches by team name", async () => {
    const provider = new MockSportsProvider();
    const results = await provider.search({ query: "Arsenal" });
    assert.ok(results.some((r) => r.type === "match"));
  });

  it("respects limit", async () => {
    const provider = new MockSportsProvider();
    const results = await provider.search({ query: "a", limit: 2 });
    assert.ok(results.length <= 2);
  });
});

describe("MockSportsProvider.getMatches", () => {
  it("returns all matches without params", async () => {
    const provider = new MockSportsProvider();
    const matches = await provider.getMatches();
    assert.ok(matches.length > 0);
  });

  it("filters by sport", async () => {
    const provider = new MockSportsProvider();
    const matches = await provider.getMatches({ sport: "football" });
    assert.ok(matches.every((m) => m.sport.id === "football"));
  });

  it("filters by league", async () => {
    const provider = new MockSportsProvider();
    const matches = await provider.getMatches({ leagueId: "premier-league" });
    assert.ok(matches.every((m) => m.league.id === "premier-league"));
  });

  it("filters by date", async () => {
    const provider = new MockSportsProvider();
    const matches = await provider.getMatches({ date: "2026-08-22" });
    assert.ok(matches.length > 0);
  });

  it("filters by status", async () => {
    const provider = new MockSportsProvider();
    const matches = await provider.getMatches({ status: "live" });
    assert.ok(matches.every((m) => m.status === "live" || m.status === "halftime"));
  });
});

describe("MockSportsProvider.getMatchEvents", () => {
  it("returns empty array", async () => {
    const provider = new MockSportsProvider();
    const events = await provider.getMatchEvents({ matchId: "match-1" });
    assert.deepStrictEqual(events, []);
  });
});

describe("MockSportsProvider.getMatchStatistics", () => {
  it("returns empty array", async () => {
    const provider = new MockSportsProvider();
    const stats = await provider.getMatchStatistics({ matchId: "match-1" });
    assert.deepStrictEqual(stats, []);
  });
});

describe("MockSportsProvider.getMatchLineups", () => {
  it("returns empty array", async () => {
    const provider = new MockSportsProvider();
    const lineups = await provider.getMatchLineups({ matchId: "match-1" });
    assert.deepStrictEqual(lineups, []);
  });
});
