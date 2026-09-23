import { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeCricketMatchStatus, normalizeCricketScore } from "./normalize";

describe("cricket normalize edge cases", () => {
  describe("normalizeCricketMatchStatus", () => {
    it("handles unknown status code as live", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 50, description: "Unknown", type: "unknown" }), "live");
    });

    it("handles string input", () => {
      assert.strictEqual(normalizeCricketMatchStatus("Not started"), "scheduled");
      assert.strictEqual(normalizeCricketMatchStatus("1st Innings"), "live");
      assert.strictEqual(normalizeCricketMatchStatus("Ended"), "finished");
    });

    it("handles innings break variations", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 31, description: "Innings Break", type: "break" }), "break");
    });
  });

  describe("normalizeCricketScore", () => {
    it("handles null homeScore", () => {
      const result = normalizeCricketScore(null, { current: 0, display: 0, innings: {} });
      assert.strictEqual(result.home, null);
      assert.strictEqual(result.away, null);
    });

    it("handles partial innings data", () => {
      const result = normalizeCricketScore(
        { current: 100, display: 100, innings: { inning1: { score: 100, wickets: 2, overs: 12.1 }, inning2: { score: null, wickets: null, overs: null } } },
        { current: 50, display: 50, innings: { inning1: { score: 50, wickets: 1, overs: 6.3 } } }
      );
      assert.strictEqual(result.home, 100);
      assert.strictEqual(result.away, 50);
      assert.ok(result.periodScores.length >= 1);
    });

    it("handles missing innings objects", () => {
      const result = normalizeCricketScore(
        { current: 100, display: 100 },
        { current: 50, display: 50 }
      );
      assert.strictEqual(result.home, 100);
      assert.strictEqual(result.away, 50);
      assert.deepStrictEqual(result.periodScores, []);
    });

    it("prefers current over display", () => {
      const result = normalizeCricketScore(
        { current: 150, display: 100, innings: {} },
        { current: 80, display: 60, innings: {} }
      );
      assert.strictEqual(result.home, 150);
      assert.strictEqual(result.away, 80);
    });
  });
});
