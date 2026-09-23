import { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeBasketballMatchStatus, normalizeBasketballScore } from "./normalize";

describe("normalizeBasketballMatchStatus", () => {
  it("maps Scheduled to scheduled", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Scheduled"), "scheduled");
  });

  it("maps TBD to scheduled", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("TBD"), "scheduled");
  });

  it("maps NS to scheduled", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("NS"), "scheduled");
  });

  it("maps Halftime to halftime", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Halftime"), "halftime");
  });

  it("maps HT to halftime", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("HT"), "halftime");
  });

  it("maps Finished to finished", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Finished"), "finished");
  });

  it("maps FT to finished", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("FT"), "finished");
  });

  it("maps Q1 to live", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Q1"), "live");
  });

  it("maps Q2 to live", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Q2"), "live");
  });

  it("maps Q3 to live", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Q3"), "live");
  });

  it("maps Q4 to live", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Q4"), "live");
  });

  it("maps OT to live", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("OT"), "live");
  });

  it("maps In Play to live", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("In Play"), "live");
  });

  it("maps Postponed to postponed", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Postponed"), "postponed");
  });

  it("maps Cancelled to cancelled", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Cancelled"), "cancelled");
  });

  it("maps Suspended to postponed", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Suspended"), "postponed");
  });

  it("maps Delayed to postponed", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Delayed"), "postponed");
  });

  it("falls back to live for unknown status", () => {
    assert.strictEqual(normalizeBasketballMatchStatus("Something Weird"), "live");
  });
});

describe("normalizeBasketballScore", () => {
  it("returns nulls for null input", () => {
    const result = normalizeBasketballScore(null);
    assert.strictEqual(result.home, null);
    assert.strictEqual(result.away, null);
    assert.deepStrictEqual(result.periodScores, []);
  });

  it("returns nulls for null scores object", () => {
    const result = normalizeBasketballScore({ home: null, away: null });
    assert.strictEqual(result.home, null);
    assert.strictEqual(result.away, null);
    assert.deepStrictEqual(result.periodScores, []);
  });

  it("normalizes quarter scores with totals", () => {
    const result = normalizeBasketballScore({
      home: { total: 108, quarter_1: 28, quarter_2: 25, quarter_3: 30, quarter_4: 25 },
      away: { total: 95, quarter_1: 22, quarter_2: 24, quarter_3: 26, quarter_4: 23 },
    });
    assert.strictEqual(result.home, 108);
    assert.strictEqual(result.away, 95);
    assert.deepStrictEqual(result.periodScores, [
      { period: "Q1", home: 28, away: 22 },
      { period: "Q2", home: 25, away: 24 },
      { period: "Q3", home: 30, away: 26 },
      { period: "Q4", home: 25, away: 23 },
    ]);
  });

  it("includes overtime when present", () => {
    const result = normalizeBasketballScore({
      home: { total: 115, quarter_1: 25, quarter_2: 25, quarter_3: 25, quarter_4: 25, over_time: 15 },
      away: { total: 112, quarter_1: 25, quarter_2: 25, quarter_3: 25, quarter_4: 25, over_time: 12 },
    });
    assert.strictEqual(result.home, 115);
    assert.strictEqual(result.away, 112);
    assert.ok(result.periodScores.some((p) => p.period === "OT"));
  });

  it("ignores null quarter scores", () => {
    const result = normalizeBasketballScore({
      home: { total: 50, quarter_1: null, quarter_2: null, quarter_3: null, quarter_4: null },
      away: { total: 48, quarter_1: null, quarter_2: null, quarter_3: null, quarter_4: null },
    });
    assert.strictEqual(result.home, 50);
    assert.strictEqual(result.away, 48);
    assert.deepStrictEqual(result.periodScores, []);
  });
});
