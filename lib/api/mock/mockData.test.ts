import { describe, it } from "node:test";
import assert from "node:assert";

describe("date navigation utilities", () => {
  function addDays(iso: string, days: number): string {
    const date = new Date(iso + "T00:00:00");
    date.setDate(date.getDate() + days);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  it("adds positive days", () => {
    assert.strictEqual(addDays("2026-08-22", 1), "2026-08-23");
  });

  it("subtracts days", () => {
    assert.strictEqual(addDays("2026-08-22", -1), "2026-08-21");
  });

  it("handles month boundary", () => {
    assert.strictEqual(addDays("2026-08-31", 1), "2026-09-01");
  });

  it("handles year boundary", () => {
    assert.strictEqual(addDays("2026-12-31", 1), "2027-01-01");
  });

  it("handles leap year", () => {
    assert.strictEqual(addDays("2026-02-28", 1), "2026-03-01");
  });

  it("zero days returns same date", () => {
    assert.strictEqual(addDays("2026-08-22", 0), "2026-08-22");
  });
});

describe("favorites filtering", () => {
  type FilterType = "all" | "teams" | "leagues" | "matches";

  function createStore(teams: number, leagues: number, matches: number) {
    return {
      teams: Array.from({ length: teams }, (_, i) => ({ id: `t${i}`, type: "team" as const, name: `Team ${i}` })),
      leagues: Array.from({ length: leagues }, (_, i) => ({ id: `l${i}`, type: "league" as const, name: `League ${i}` })),
      matches: Array.from({ length: matches }, (_, i) => ({ id: `m${i}`, type: "match" as const, name: `Match ${i}` })),
    };
  }

  function getVisible(filter: FilterType, store: ReturnType<typeof createStore>) {
    const visibleTeams = filter === "all" || filter === "teams" ? store.teams : [];
    const visibleLeagues = filter === "all" || filter === "leagues" ? store.leagues : [];
    const visibleMatches = filter === "all" || filter === "matches" ? store.matches : [];
    return { visibleTeams, visibleLeagues, visibleMatches };
  }

  it("shows all items when filter is all", () => {
    const store = createStore(2, 3, 4);
    const { visibleTeams, visibleLeagues, visibleMatches } = getVisible("all", store);
    assert.strictEqual(visibleTeams.length, 2);
    assert.strictEqual(visibleLeagues.length, 3);
    assert.strictEqual(visibleMatches.length, 4);
  });

  it("shows only teams when filter is teams", () => {
    const store = createStore(2, 3, 4);
    const { visibleTeams, visibleLeagues, visibleMatches } = getVisible("teams", store);
    assert.strictEqual(visibleTeams.length, 2);
    assert.strictEqual(visibleLeagues.length, 0);
    assert.strictEqual(visibleMatches.length, 0);
  });

  it("shows only leagues when filter is leagues", () => {
    const store = createStore(2, 3, 4);
    const { visibleTeams, visibleLeagues, visibleMatches } = getVisible("leagues", store);
    assert.strictEqual(visibleTeams.length, 0);
    assert.strictEqual(visibleLeagues.length, 3);
    assert.strictEqual(visibleMatches.length, 0);
  });

  it("shows only matches when filter is matches", () => {
    const store = createStore(2, 3, 4);
    const { visibleTeams, visibleLeagues, visibleMatches } = getVisible("matches", store);
    assert.strictEqual(visibleTeams.length, 0);
    assert.strictEqual(visibleLeagues.length, 0);
    assert.strictEqual(visibleMatches.length, 4);
  });
});
