import { describe, it } from "node:test";
import assert from "node:assert";
import { normalizeCricketMatchStatus, normalizeCricketScore, normalizeCricketTeam, normalizeCricketLeague, normalizeCricketMatch } from "./normalize";

describe("cricket normalize unit tests", () => {
  describe("normalizeCricketMatchStatus", () => {
    it("maps code 0 to scheduled", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 0, description: "Not started", type: "notstarted" }), "scheduled");
    });

    it("maps code 21 to live", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 21, description: "1st Innings", type: "inprogress" }), "live");
    });

    it("maps code 22 to live", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 22, description: "2nd Innings", type: "inprogress" }), "live");
    });

    it("maps code 31 to break", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 31, description: "Innings Break", type: "break" }), "break");
    });

    it("maps code 100 to finished", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 100, description: "Ended", type: "finished" }), "finished");
    });

    it("maps code 60 to postponed", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 60, description: "Postponed", type: "postponed" }), "postponed");
    });

    it("maps code 70 to cancelled", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 70, description: "Cancelled", type: "cancelled" }), "cancelled");
    });

    it("maps code 80 to abandoned", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 80, description: "Retired", type: "abandoned" }), "abandoned");
    });

    it("maps code 85 to abandoned", () => {
      assert.strictEqual(normalizeCricketMatchStatus({ code: 85, description: "Walkover", type: "abandoned" }), "abandoned");
    });
  });

  describe("normalizeCricketScore", () => {
    it("maps innings to periodScores", () => {
      const result = normalizeCricketScore(
        { current: 287, display: 287, innings: { inning1: { score: 287, wickets: 6, overs: 42.3 } } },
        { current: 150, display: 150, innings: { inning1: { score: 150, wickets: 4, overs: 18.2 } } }
      );
      assert.strictEqual(result.home, 287);
      assert.strictEqual(result.away, 150);
      assert.ok(result.periodScores.length > 0);
      assert.strictEqual(result.periodScores[0].period, "Innings 1");
    });

    it("returns empty periodScores when innings missing", () => {
      const result = normalizeCricketScore(
        { current: 100, display: 100 },
        { current: 50, display: 50 }
      );
      assert.strictEqual(result.home, 100);
      assert.strictEqual(result.away, 50);
      assert.deepStrictEqual(result.periodScores, []);
    });

    it("handles null inputs", () => {
      const result = normalizeCricketScore(null, null);
      assert.strictEqual(result.home, null);
      assert.strictEqual(result.away, null);
      assert.deepStrictEqual(result.periodScores, []);
    });
  });

  describe("normalizeCricketTeam", () => {
    it("normalizes team from API shape", () => {
      const team = normalizeCricketTeam({
        id: 4021,
        name: "India",
        country: { id: 1, name: "India", alpha2: "IN" },
        logo: "/logos/india.png",
      });
      assert.strictEqual(team.id, "4021");
      assert.strictEqual(team.name, "India");
      assert.strictEqual(team.shortName, "IND");
      assert.strictEqual(team.sportId, "cricket");
    });
  });

  describe("normalizeCricketLeague", () => {
    it("normalizes league from API shape", () => {
      const league = normalizeCricketLeague({
        id: 11156,
        name: "ICC World Cup",
        country: { id: 1, name: "International", alpha2: "INT" },
      });
      assert.strictEqual(league.id, "11156");
      assert.strictEqual(league.name, "ICC World Cup");
      assert.strictEqual(league.sportId, "cricket");
    });
  });

  describe("normalizeCricketMatch", () => {
    it("normalizes full match event", () => {
      const match = normalizeCricketMatch({
        id: 12345678,
        homeTeam: { id: 4021, name: "India" },
        awayTeam: { id: 4022, name: "Australia" },
        homeScore: { current: 287, display: 287, innings: { inning1: { score: 287, wickets: 6, overs: 42.3 } } },
        awayScore: { current: 150, display: 150, innings: { inning1: { score: 150, wickets: 4, overs: 18.2 } } },
        status: { code: 21, description: "1st Innings", type: "inprogress" },
        tournament: { id: 11156, name: "ICC World Cup" },
        startTimestamp: 1737331200,
      });
      assert.strictEqual(match.id, "12345678");
      assert.strictEqual(match.status, "live");
      assert.strictEqual(match.sport.id, "cricket");
      assert.strictEqual(match.homeTeam.name, "India");
      assert.strictEqual(match.awayTeam.name, "Australia");
      assert.ok((match.score.periodScores?.length ?? 0) > 0);
    });
  });
});
