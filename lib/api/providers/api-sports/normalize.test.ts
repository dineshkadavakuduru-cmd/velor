import { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeMatchStatus, normalizeScore } from "./normalize";

describe("normalizeMatchStatus", () => {
  it("maps Not Started to scheduled", () => {
    assert.strictEqual(normalizeMatchStatus("Not Started"), "scheduled");
  });

  it("maps NS to scheduled", () => {
    assert.strictEqual(normalizeMatchStatus("NS"), "scheduled");
  });

  it("maps TBD to scheduled", () => {
    assert.strictEqual(normalizeMatchStatus("TBD"), "scheduled");
  });

  it("maps Halftime to halftime", () => {
    assert.strictEqual(normalizeMatchStatus("Halftime"), "halftime");
  });

  it("maps HT to halftime", () => {
    assert.strictEqual(normalizeMatchStatus("HT"), "halftime");
  });

  it("maps Match Finished to finished", () => {
    assert.strictEqual(normalizeMatchStatus("Match Finished"), "finished");
  });

  it("maps FT to finished", () => {
    assert.strictEqual(normalizeMatchStatus("FT"), "finished");
  });

  it("maps AET to finished", () => {
    assert.strictEqual(normalizeMatchStatus("AET"), "finished");
  });

  it("maps Postponed to postponed", () => {
    assert.strictEqual(normalizeMatchStatus("Postponed"), "postponed");
  });

  it("maps Cancelled to cancelled", () => {
    assert.strictEqual(normalizeMatchStatus("Cancelled"), "cancelled");
  });

  it("maps Abandoned to cancelled", () => {
    assert.strictEqual(normalizeMatchStatus("Abandoned"), "cancelled");
  });

  it("falls back to live for First Half", () => {
    assert.strictEqual(normalizeMatchStatus("First Half"), "live");
  });

  it("falls back to live for Second Half", () => {
    assert.strictEqual(normalizeMatchStatus("Second Half"), "live");
  });

  it("falls back to live for unknown status", () => {
    assert.strictEqual(normalizeMatchStatus("Something Weird"), "live");
  });

  it("maps Suspended to postponed", () => {
    assert.strictEqual(normalizeMatchStatus("Suspended"), "postponed");
  });
});

describe("normalizeScore", () => {
  it("returns nulls for null input", () => {
    const result = normalizeScore(null);
    assert.strictEqual(result.home, null);
    assert.strictEqual(result.away, null);
    assert.deepStrictEqual(result.periodScores, []);
  });

  it("returns nulls for empty object", () => {
    const result = normalizeScore({});
    assert.strictEqual(result.home, null);
    assert.strictEqual(result.away, null);
    assert.deepStrictEqual(result.periodScores, []);
  });

  it("normalizes fulltime and halftime scores", () => {
    const result = normalizeScore({
      halftime: { home: 1, away: 2 },
      fulltime: { home: 3, away: 4 },
    });
    assert.strictEqual(result.home, 3);
    assert.strictEqual(result.away, 4);
    assert.deepStrictEqual(result.periodScores, [
      { period: "HT", home: 1, away: 2 },
    ]);
  });

  it("ignores null halftime scores", () => {
    const result = normalizeScore({
      halftime: { home: null, away: null },
      fulltime: { home: 2, away: 1 },
    });
    assert.strictEqual(result.home, 2);
    assert.strictEqual(result.away, 1);
    assert.deepStrictEqual(result.periodScores, []);
  });

  it("includes extratime and penalty scores", () => {
    const result = normalizeScore({
      fulltime: { home: 1, away: 1 },
      extratime: { home: 2, away: 2 },
      penalty: { home: 4, away: 3 },
    });
    assert.strictEqual(result.home, 1);
    assert.strictEqual(result.away, 1);
    assert.deepStrictEqual(result.periodScores, [
      { period: "ET", home: 2, away: 2 },
      { period: "PEN", home: 4, away: 3 },
    ]);
  });
});
