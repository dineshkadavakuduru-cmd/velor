import { describe, it } from "node:test";
import assert from "node:assert";
import {
  validateMatchFilters,
  validateSearchQuery,
  validateLeagueId,
  validateTeamId,
  validateMatchId,
} from "./validate";

describe("validateMatchFilters", () => {
  it("returns empty object for empty input", () => {
    const result = validateMatchFilters({});
    assert.deepStrictEqual(result, {});
  });

  it("validates sport", () => {
    const result = validateMatchFilters({ sport: "football" });
    assert.deepStrictEqual(result, { sport: "football" });
  });

  it("rejects invalid sport", () => {
    const result = validateMatchFilters({ sport: "../../../etc/passwd" });
    assert.deepStrictEqual(result, {});
  });

  it("rejects sport with special characters", () => {
    const result = validateMatchFilters({ sport: "football'; DROP TABLE; --" });
    assert.deepStrictEqual(result, {});
  });

  it("validates league id", () => {
    const result = validateMatchFilters({ leagueId: "39" });
    assert.deepStrictEqual(result, { leagueId: "39" });
  });

  it("validates league id with hyphens", () => {
    const result = validateMatchFilters({ leagueId: "premier-league" });
    assert.deepStrictEqual(result, { leagueId: "premier-league" });
  });

  it("rejects invalid league id", () => {
    const result = validateMatchFilters({ leagueId: "'; DROP TABLE; --" });
    assert.deepStrictEqual(result, {});
  });

  it("validates date in YYYY-MM-DD format", () => {
    const result = validateMatchFilters({ date: "2026-08-22" });
    assert.deepStrictEqual(result, { date: "2026-08-22" });
  });

  it("rejects invalid date format", () => {
    const result = validateMatchFilters({ date: "08/22/2026" });
    assert.deepStrictEqual(result, {});
  });

  it("rejects injection-prone date", () => {
    const result = validateMatchFilters({ date: "2026-08-22 OR 1=1" });
    assert.deepStrictEqual(result, {});
  });

  it("handles array values from searchParams", () => {
    const result = validateMatchFilters({ sport: ["football"], leagueId: ["39"] });
    assert.deepStrictEqual(result, { sport: "football", leagueId: "39" });
  });

  it("ignores empty string values", () => {
    const result = validateMatchFilters({ sport: "", leagueId: "", date: "" });
    assert.deepStrictEqual(result, {});
  });

  it("validates combined filters", () => {
    const result = validateMatchFilters({
      sport: "football",
      leagueId: "39",
      date: "2026-08-22",
    });
    assert.deepStrictEqual(result, {
      sport: "football",
      leagueId: "39",
      date: "2026-08-22",
    });
  });

  it("validates status filter", () => {
    const result = validateMatchFilters({ status: "live" });
    assert.deepStrictEqual(result, { status: "live" });
  });

  it("rejects invalid status filter", () => {
    const result = validateMatchFilters({ status: "invalid" });
    assert.deepStrictEqual(result, {});
  });

  it("validates team id", () => {
    const result = validateMatchFilters({ teamId: "arsenal" });
    assert.deepStrictEqual(result, { teamId: "arsenal" });
  });

  it("rejects invalid team id", () => {
    const result = validateMatchFilters({ teamId: "'; DROP TABLE; --" });
    assert.deepStrictEqual(result, {});
  });
});

describe("validateSearchQuery", () => {
  it("returns empty string for empty input", () => {
    assert.strictEqual(validateSearchQuery(""), "");
    assert.strictEqual(validateSearchQuery("   "), "");
  });

  it("returns empty string for queries shorter than 2 chars", () => {
    assert.strictEqual(validateSearchQuery("a"), "");
  });

  it("trims whitespace", () => {
    assert.strictEqual(validateSearchQuery("  bar  "), "bar");
  });

  it("truncates queries longer than 100 chars", () => {
    const long = "a".repeat(101);
    const result = validateSearchQuery(long);
    assert.strictEqual(result.length, 100);
  });

  it("returns valid queries unchanged", () => {
    assert.strictEqual(validateSearchQuery("Barcelona"), "Barcelona");
  });
});

describe("validateLeagueId", () => {
  it("returns null for empty string", () => {
    assert.strictEqual(validateLeagueId(""), null);
    assert.strictEqual(validateLeagueId("   "), null);
  });

  it("returns null for non-string", () => {
    assert.strictEqual(validateLeagueId(null as unknown as string), null);
    assert.strictEqual(validateLeagueId(undefined as unknown as string), null);
  });

  it("validates alphanumeric ids with hyphens", () => {
    assert.strictEqual(validateLeagueId("premier-league"), "premier-league");
    assert.strictEqual(validateLeagueId("39"), "39");
  });

  it("rejects invalid characters", () => {
    assert.strictEqual(validateLeagueId("'; DROP TABLE; --"), null);
  });
});

describe("validateTeamId", () => {
  it("returns null for empty string", () => {
    assert.strictEqual(validateTeamId(""), null);
  });

  it("validates alphanumeric ids with hyphens", () => {
    assert.strictEqual(validateTeamId("barcelona"), "barcelona");
    assert.strictEqual(validateTeamId("man-city"), "man-city");
  });

  it("rejects invalid characters", () => {
    assert.strictEqual(validateTeamId("team/../etc"), null);
  });
});

describe("validateMatchId", () => {
  it("returns null for empty string", () => {
    assert.strictEqual(validateMatchId(""), null);
  });

  it("validates numeric and hyphenated ids", () => {
    assert.strictEqual(validateMatchId("123"), "123");
    assert.strictEqual(validateMatchId("match-1"), "match-1");
  });

  it("rejects invalid characters", () => {
    assert.strictEqual(validateMatchId("match?id=1"), null);
  });
});
