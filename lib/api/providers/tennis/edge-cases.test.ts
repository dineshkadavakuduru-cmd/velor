import { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeTennisMatchStatus, normalizeTennisScore } from "./normalize";

describe("tennis normalize edge cases", () => {
  describe("normalizeTennisMatchStatus", () => {
    it("handles unknown status code as live", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 50, description: "Unknown", type: "unknown" }), "live");
    });

    it("handles string input", () => {
      assert.strictEqual(normalizeTennisMatchStatus("Not started"), "scheduled");
      assert.strictEqual(normalizeTennisMatchStatus("inprogress"), "live");
      assert.strictEqual(normalizeTennisMatchStatus("finished"), "finished");
    });

    it("handles retired status", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 80, description: "Retired", type: "abandoned" }), "abandoned");
    });

    it("handles walkover status", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 85, description: "Walkover", type: "abandoned" }), "abandoned");
    });
  });

  describe("normalizeTennisScore", () => {
    it("handles null scores", () => {
      const result = normalizeTennisScore(null, null);
      assert.strictEqual(result.home, null);
      assert.strictEqual(result.away, null);
      assert.deepStrictEqual(result.periodScores, []);
    });

    it("handles partial periods", () => {
      const result = normalizeTennisScore(
        { current: 1, display: 1, period1: 6, period3: 7 },
        { current: 0, display: 0, period1: 4, period3: 5 }
      );
      assert.strictEqual(result.home, 1);
      assert.strictEqual(result.away, 0);
      assert.strictEqual(result.periodScores.length, 2);
      assert.strictEqual(result.periodScores[0].period, "Set 1");
      assert.strictEqual(result.periodScores[1].period, "Set 3");
    });

    it("handles tiebreak scores", () => {
      const result = normalizeTennisScore(
        { current: 1, display: 1, period1: 7, period1TieBreak: 7 },
        { current: 0, display: 0, period1: 6, period1TieBreak: 5 }
      );
      assert.strictEqual(result.home, 1);
      assert.strictEqual(result.away, 0);
      assert.strictEqual(result.periodScores[0].home, 7);
      assert.strictEqual(result.periodScores[0].away, 6);
    });

    it("prefers current over display", () => {
      const result = normalizeTennisScore(
        { current: 2, display: 1, period1: 6 },
        { current: 1, display: 0, period1: 4 }
      );
      assert.strictEqual(result.home, 2);
      assert.strictEqual(result.away, 1);
    });
  });
});
