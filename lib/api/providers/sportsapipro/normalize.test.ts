import { describe, it } from "node:test";
import assert from "node:assert";
import {
  extractSportSlug,
  isForeignSport,
  normalizeSportsApiProLeague,
  normalizeSportsApiProMatch,
  normalizeSportsApiProScore,
  normalizeSportsApiProStatus,
  normalizeSportsApiProTeam,
} from "./normalize";

describe("normalizeSportsApiProStatus", () => {
  it("maps code 0 / notstarted to scheduled", () => {
    assert.strictEqual(normalizeSportsApiProStatus({ code: 0, type: "notstarted", description: "Not started" }), "scheduled");
    assert.strictEqual(normalizeSportsApiProStatus({ type: "notstarted" }), "scheduled");
  });

  it("maps an in-progress period to live", () => {
    assert.strictEqual(normalizeSportsApiProStatus({ code: 6, type: "inprogress", description: "1st half" }), "live");
  });

  it("maps finished (code 100 / type finished) to finished", () => {
    assert.strictEqual(normalizeSportsApiProStatus({ code: 100, type: "finished", description: "Ended" }), "finished");
  });

  it("maps halftime by description", () => {
    assert.strictEqual(normalizeSportsApiProStatus({ code: 7, type: "inprogress", description: "Halftime" }), "halftime");
    assert.strictEqual(normalizeSportsApiProStatus({ type: "inprogress", description: "HT" }), "halftime");
  });

  it("does not treat '1st half' as halftime", () => {
    assert.strictEqual(normalizeSportsApiProStatus({ type: "inprogress", description: "1st half" }), "live");
  });

  it("maps postponed / cancelled / abandoned", () => {
    assert.strictEqual(normalizeSportsApiProStatus({ code: 60, type: "postponed" }), "postponed");
    assert.strictEqual(normalizeSportsApiProStatus({ code: 70, type: "canceled" }), "cancelled");
    assert.strictEqual(normalizeSportsApiProStatus({ code: 90, type: "abandoned" }), "abandoned");
  });

  it("handles string fallbacks", () => {
    assert.strictEqual(normalizeSportsApiProStatus("Not Started"), "scheduled");
    assert.strictEqual(normalizeSportsApiProStatus("Match Finished"), "finished");
    assert.strictEqual(normalizeSportsApiProStatus("Some Weird State"), "live");
  });
});

describe("normalizeSportsApiProScore", () => {
  it("returns nulls for missing scores", () => {
    const result = normalizeSportsApiProScore(null, null, "football");
    assert.strictEqual(result.home, null);
    assert.strictEqual(result.away, null);
    assert.deepStrictEqual(result.periodScores, []);
  });

  it("uses football half labels and current totals", () => {
    const result = normalizeSportsApiProScore(
      { current: 2, display: 2, period1: 1, period2: 1 },
      { current: 1, display: 1, period1: 0, period2: 1 },
      "football"
    );
    assert.strictEqual(result.home, 2);
    assert.strictEqual(result.away, 1);
    assert.deepStrictEqual(result.periodScores, [
      { period: "1H", home: 1, away: 0 },
      { period: "2H", home: 1, away: 1 },
    ]);
  });

  it("uses basketball quarter labels", () => {
    const result = normalizeSportsApiProScore(
      { current: 80, display: 80, period1: 20, period2: 20, period3: 20, period4: 20 },
      { current: 76, display: 76, period1: 18, period2: 18, period3: 20, period4: 20 },
      "basketball"
    );
    assert.deepStrictEqual(result.periodScores.map((p) => p.period), ["Q1", "Q2", "Q3", "Q4"]);
    assert.strictEqual(result.home, 80);
  });

  it("accepts a flattened numeric score", () => {
    const result = normalizeSportsApiProScore(3, 1, "football");
    assert.strictEqual(result.home, 3);
    assert.strictEqual(result.away, 1);
  });
});

describe("normalizeSportsApiProTeam", () => {
  it("maps id, name, short name, country and colors", () => {
    const team = normalizeSportsApiProTeam(
      { id: 42, name: "Arsenal", nameCode: "ARS", country: { name: "England" }, teamColors: { primary: "#cc0000", secondary: "#ffffff" } },
      "football"
    );
    assert.strictEqual(team.id, "42");
    assert.strictEqual(team.name, "Arsenal");
    assert.strictEqual(team.shortName, "ARS");
    assert.strictEqual(team.country, "England");
    assert.deepStrictEqual(team.colors, { primary: "#cc0000", secondary: "#ffffff" });
    assert.strictEqual(team.sportId, "football");
  });

  it("tolerates a missing team", () => {
    const team = normalizeSportsApiProTeam(null, "football");
    assert.strictEqual(team.name, "Unknown");
    assert.strictEqual(team.id, "");
  });
});

describe("normalizeSportsApiProLeague", () => {
  it("prefers the unique tournament id", () => {
    const league = normalizeSportsApiProLeague(
      {
        id: 28,
        name: "Liga MX, Apertura",
        category: { name: "Mexico", country: { name: "Mexico" } },
        uniqueTournament: { id: 11621, name: "Liga MX, Apertura" },
      },
      "football"
    );
    assert.strictEqual(league.id, "11621");
    assert.strictEqual(league.name, "Liga MX, Apertura");
    assert.strictEqual(league.country, "Mexico");
    assert.strictEqual(league.sportId, "football");
  });
});

describe("normalizeSportsApiProMatch", () => {
  it("maps a full rich event into the domain model", () => {
    const match = normalizeSportsApiProMatch(
      {
        id: 16318004,
        tournament: { name: "Liga MX, Apertura", uniqueTournament: { id: 11621 } },
        status: { code: 6, type: "inprogress", description: "1st half" },
        homeTeam: { id: 1933, name: "Pumas UNAM", nameCode: "UNAM" },
        awayTeam: { id: 1940, name: "Tigres UANL", nameCode: "UANL" },
        homeScore: { current: 0, display: 0, period1: 0 },
        awayScore: { current: 1, display: 1, period1: 1 },
        startTimestamp: 1792897800,
        roundInfo: { round: 14 },
        venue: { name: "Estadio Olímpico" },
      },
      "football",
      "Football"
    );
    assert.strictEqual(match.id, "16318004");
    assert.strictEqual(match.sport.id, "football");
    assert.strictEqual(match.status, "live");
    assert.strictEqual(match.league.id, "11621");
    assert.strictEqual(match.homeTeam.name, "Pumas UNAM");
    assert.strictEqual(match.awayTeam.name, "Tigres UANL");
    assert.strictEqual(match.score.home, 0);
    assert.strictEqual(match.score.away, 1);
    assert.strictEqual(match.venue, "Estadio Olímpico");
    assert.strictEqual(match.round, "Round 14");
    assert.strictEqual(match.startTime, new Date(1792897800 * 1000).toISOString());
  });

  it("leaves an empty start time when the timestamp is absent", () => {
    const match = normalizeSportsApiProMatch({ id: 1, status: { code: 0, type: "notstarted" } }, "basketball", "Basketball");
    assert.strictEqual(match.startTime, "");
    assert.strictEqual(match.sport.id, "basketball");
    assert.strictEqual(match.status, "scheduled");
  });
});

describe("isForeignSport", () => {
  it("reads the sport slug from an event's tournament category", () => {
    const event = { tournament: { category: { sport: { slug: "basketball" } } } };
    assert.strictEqual(extractSportSlug(event), "basketball");
    assert.strictEqual(isForeignSport(event, "football"), true);
    assert.strictEqual(isForeignSport(event, "basketball"), false);
  });

  it("reads the sport slug from a team / search entity", () => {
    assert.strictEqual(isForeignSport({ sport: { slug: "tennis" } }, "football"), true);
    assert.strictEqual(isForeignSport({ sport: { slug: "football" } }, "football"), false);
  });

  it("accepts entities that do not state a sport", () => {
    assert.strictEqual(isForeignSport({ id: 1, name: "Unknown" }, "football"), false);
    assert.strictEqual(isForeignSport(null, "football"), false);
  });
});
