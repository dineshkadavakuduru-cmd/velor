import { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeTennisMatchStatus, normalizeTennisScore, normalizeTennisTeam, normalizeTennisLeague, normalizeTennisMatch } from "./normalize";

describe("tennis normalize unit tests", () => {
  describe("normalizeTennisMatchStatus", () => {
    it("maps code 0 to scheduled", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 0, description: "Not started", type: "notstarted" }), "scheduled");
    });

    it("maps code 8 to live", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 8, description: "1st set", type: "inprogress" }), "live");
    });

    it("maps code 9 to live", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 9, description: "2nd set", type: "inprogress" }), "live");
    });

    it("maps code 100 to finished", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 100, description: "Ended", type: "finished" }), "finished");
    });

    it("maps code 60 to postponed", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 60, description: "Postponed", type: "postponed" }), "postponed");
    });

    it("maps code 70 to cancelled", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 70, description: "Cancelled", type: "cancelled" }), "cancelled");
    });

    it("maps code 80 to abandoned", () => {
      assert.strictEqual(normalizeTennisMatchStatus({ code: 80, description: "Retired", type: "abandoned" }), "abandoned");
    });
  });

  describe("normalizeTennisScore", () => {
    it("maps period1-5 to set labels", () => {
      const result = normalizeTennisScore(
        { current: 2, display: 2, period1: 6, period2: 4, period3: 7 },
        { current: 1, display: 1, period1: 4, period2: 6, period3: 5 }
      );
      assert.strictEqual(result.home, 2);
      assert.strictEqual(result.away, 1);
      assert.strictEqual(result.periodScores.length, 3);
      assert.strictEqual(result.periodScores[0].period, "Set 1");
      assert.strictEqual(result.periodScores[1].period, "Set 2");
      assert.strictEqual(result.periodScores[2].period, "Set 3");
    });

    it("returns empty periodScores when scores missing", () => {
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
      assert.strictEqual(result.periodScores.length, 2);
      assert.strictEqual(result.periodScores[0].period, "Set 1");
      assert.strictEqual(result.periodScores[1].period, "Set 3");
    });
  });

  describe("normalizeTennisTeam", () => {
    it("normalizes team from API shape", () => {
      const team = normalizeTennisTeam({
        id: 275923,
        name: "Carlos Alcaraz",
        shortName: "C. Alcaraz",
        country: { name: "Spain", alpha2: "ES" },
        ranking: 2,
      });
      assert.strictEqual(team.id, "275923");
      assert.strictEqual(team.name, "Carlos Alcaraz");
      assert.strictEqual(team.shortName, "C. Alcaraz");
      assert.strictEqual(team.sportId, "tennis");
    });
  });

  describe("normalizeTennisLeague", () => {
    it("normalizes league from API shape", () => {
      const league = normalizeTennisLeague({
        id: 2519,
        name: "ATP Finals",
        country: { id: 1, name: "International", alpha2: "INT" },
      });
      assert.strictEqual(league.id, "2519");
      assert.strictEqual(league.name, "ATP Finals");
      assert.strictEqual(league.sportId, "tennis");
    });
  });

  describe("normalizeTennisMatch", () => {
    it("normalizes full match event", () => {
      const match = normalizeTennisMatch({
        id: 15625024,
        homeTeam: { id: 275923, name: "Carlos Alcaraz", shortName: "C. Alcaraz", ranking: 2, country: { alpha2: "ES", name: "Spain" } },
        awayTeam: { id: 119248, name: "Casper Ruud", ranking: 3, country: { alpha2: "NO", name: "Norway" } },
        homeScore: { current: 2, display: 2, period1: 6, period2: 6, period3: 7 },
        awayScore: { current: 1, display: 1, period1: 4, period2: 7, period3: 5 },
        firstToServe: 1,
        groundType: "Clay",
        status: { code: 100, description: "Ended", type: "finished" },
        tournament: { name: "ATP Finals", slug: "atp-finals", uniqueTournament: { id: 2519 } },
        startTimestamp: 1737331200,
        round: "Final",
        roundCode: "F",
      });
      assert.strictEqual(match.id, "15625024");
      assert.strictEqual(match.status, "finished");
      assert.strictEqual(match.sport.id, "tennis");
      assert.strictEqual(match.homeTeam.name, "Carlos Alcaraz");
      assert.strictEqual(match.awayTeam.name, "Casper Ruud");
      assert.ok((match.score.periodScores?.length ?? 0) > 0);
      assert.strictEqual(match.surface, "Clay");
    });
  });
});
