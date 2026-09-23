import { describe, it } from "node:test";
import assert from "node:assert";
import type { Match } from "@/lib/types/sports";
import {
  getMatchIntelligence,
  getTeamPerformance,
  getScoreDifferenceLabel,
  getFormFromMatches,
} from "./derivedMetrics";

const FOOTBALL = { id: "football", name: "Football", slug: "football" } as const;
const PREMIER_LEAGUE = { id: "premier-league", sportId: "football", name: "Premier League", country: "England" } as const;
const ARSENAL = { id: "arsenal", name: "Arsenal", shortName: "ARS", logo: "/logos/arsenal.png", venue: "Emirates Stadium", country: "England", sportId: "football" } as const;
const CHELSEA = { id: "chelsea", name: "Chelsea", shortName: "CHE", logo: "/logos/chelsea.png", venue: "Stamford Bridge", country: "England", sportId: "football" } as const;
const MAN_CITY = { id: "man-city", name: "Manchester City", shortName: "MCI", logo: "/logos/man-city.png", venue: "Etihad Stadium", country: "England", sportId: "football" } as const;

function makeMatch(overrides: Partial<Match>): Match {
  return {
    id: "match-1",
    sport: FOOTBALL,
    league: PREMIER_LEAGUE,
    homeTeam: ARSENAL,
    awayTeam: CHELSEA,
    score: { home: null, away: null },
    status: "scheduled",
    startTime: "2026-08-22T19:45:00Z",
    ...overrides,
  } as Match;
}

describe("getMatchIntelligence", () => {
  it("returns null result for scheduled match", () => {
    const match = makeMatch({ status: "scheduled", score: { home: null, away: null } });
    const intel = getMatchIntelligence(match);
    assert.strictEqual(intel.result, null);
    assert.strictEqual(intel.resultLabel, "");
    assert.strictEqual(intel.isFinished, false);
    assert.strictEqual(intel.isLive, false);
  });

  it("returns home_win for finished home win", () => {
    const match = makeMatch({
      status: "finished",
      score: { home: 2, away: 1, periodScores: [{ period: "HT", home: 1, away: 0 }] },
    });
    const intel = getMatchIntelligence(match);
    assert.strictEqual(intel.result, "home_win");
    assert.strictEqual(intel.resultLabel, "HOME WIN");
    assert.strictEqual(intel.scoreDifference, 1);
    assert.strictEqual(intel.hasHalftimeScore, true);
    assert.strictEqual(intel.halftimeScore?.home, 1);
    assert.strictEqual(intel.halftimeScore?.away, 0);
  });

  it("returns away_win for finished away win", () => {
    const match = makeMatch({
      status: "finished",
      score: { home: 0, away: 3 },
    });
    const intel = getMatchIntelligence(match);
    assert.strictEqual(intel.result, "away_win");
    assert.strictEqual(intel.resultLabel, "AWAY WIN");
    assert.strictEqual(intel.scoreDifference, -3);
  });

  it("returns draw for finished draw", () => {
    const match = makeMatch({
      status: "finished",
      score: { home: 1, away: 1 },
    });
    const intel = getMatchIntelligence(match);
    assert.strictEqual(intel.result, "draw");
    assert.strictEqual(intel.resultLabel, "DRAW");
    assert.strictEqual(intel.scoreDifference, 0);
  });

  it("returns null scoreDifference for null scores", () => {
    const match = makeMatch({
      status: "scheduled",
      score: { home: null, away: null },
    });
    const intel = getMatchIntelligence(match);
    assert.strictEqual(intel.scoreDifference, null);
  });

  it("returns isLive true for live match", () => {
    const match = makeMatch({ status: "live", period: "67'", score: { home: 1, away: 1 } });
    const intel = getMatchIntelligence(match);
    assert.strictEqual(intel.isLive, true);
    assert.strictEqual(intel.isFinished, false);
    assert.strictEqual(intel.result, null);
  });

  it("returns isLive true for halftime match", () => {
    const match = makeMatch({ status: "halftime", score: { home: 1, away: 0 } });
    const intel = getMatchIntelligence(match);
    assert.strictEqual(intel.isLive, true);
    assert.strictEqual(intel.stateSummary, "HALFTIME");
  });
});

describe("getScoreDifferenceLabel", () => {
  it("returns LEVEL for equal scores", () => {
    const match = makeMatch({ score: { home: 1, away: 1 } });
    assert.strictEqual(getScoreDifferenceLabel(match), "LEVEL");
  });

  it("returns +N HOME for home lead", () => {
    const match = makeMatch({ score: { home: 3, away: 1 } });
    assert.strictEqual(getScoreDifferenceLabel(match), "+2 HOME");
  });

  it("returns -N AWAY for away lead", () => {
    const match = makeMatch({ score: { home: 0, away: 2 } });
    assert.strictEqual(getScoreDifferenceLabel(match), "-2 AWAY");
  });

  it("returns null for null scores", () => {
    const match = makeMatch({ score: { home: null, away: null } });
    assert.strictEqual(getScoreDifferenceLabel(match), null);
  });
});

describe("getTeamPerformance", () => {
  it("calculates performance from finished matches", () => {
    const matches: Match[] = [
      makeMatch({ id: "m1", status: "finished", score: { home: 2, away: 1 } }),
      makeMatch({ id: "m2", status: "finished", score: { home: 0, away: 0 } }),
      makeMatch({ id: "m3", status: "finished", score: { home: 1, away: 3 } }),
      makeMatch({ id: "m4", status: "scheduled", score: { home: null, away: null } }),
    ];
    const perf = getTeamPerformance(matches, "arsenal");
    assert.strictEqual(perf.matchesPlayed, 3);
    assert.strictEqual(perf.wins, 1);
    assert.strictEqual(perf.draws, 1);
    assert.strictEqual(perf.losses, 1);
    assert.strictEqual(perf.goalsFor, 3);
    assert.strictEqual(perf.goalsAgainst, 4);
    assert.strictEqual(perf.goalDifference, -1);
    assert.strictEqual(perf.cleanSheets, 1);
    assert.strictEqual(perf.failedToScore, 1);
  });

  it("returns zeros for no finished matches", () => {
    const matches: Match[] = [
      makeMatch({ id: "m1", status: "scheduled", score: { home: null, away: null } }),
    ];
    const perf = getTeamPerformance(matches, "arsenal");
    assert.strictEqual(perf.matchesPlayed, 0);
    assert.strictEqual(perf.wins, 0);
    assert.strictEqual(perf.draws, 0);
    assert.strictEqual(perf.losses, 0);
    assert.strictEqual(perf.goalsFor, 0);
    assert.strictEqual(perf.goalsAgainst, 0);
    assert.strictEqual(perf.goalDifference, 0);
  });

  it("calculates performance for away team", () => {
    const matches: Match[] = [
      makeMatch({
        id: "m1",
        status: "finished",
        homeTeam: MAN_CITY,
        awayTeam: ARSENAL,
        score: { home: 1, away: 2 },
      }),
    ];
    const perf = getTeamPerformance(matches, "arsenal");
    assert.strictEqual(perf.matchesPlayed, 1);
    assert.strictEqual(perf.wins, 1);
    assert.strictEqual(perf.goalsFor, 2);
    assert.strictEqual(perf.goalsAgainst, 1);
    assert.strictEqual(perf.goalDifference, 1);
  });

  it("returns zeros for no finished matches with valid scores", () => {
    const matches: Match[] = [
      makeMatch({ id: "m1", status: "finished", score: { home: null, away: null } }),
    ];
    const perf = getTeamPerformance(matches, "arsenal");
    assert.strictEqual(perf.matchesPlayed, 0);
  });
});

describe("getFormFromMatches", () => {
  it("returns form string from most recent finished matches", () => {
    const matches: Match[] = [
      makeMatch({ id: "m1", startTime: "2026-08-20T16:00:00Z", status: "finished", score: { home: 2, away: 1 } }),
      makeMatch({ id: "m2", startTime: "2026-08-21T16:00:00Z", status: "finished", score: { home: 0, away: 0 } }),
      makeMatch({ id: "m3", startTime: "2026-08-22T16:00:00Z", status: "finished", score: { home: 1, away: 3 } }),
      makeMatch({ id: "m4", startTime: "2026-08-23T16:00:00Z", status: "scheduled", score: { home: null, away: null } }),
    ];
    const form = getFormFromMatches(matches, "arsenal");
    assert.deepStrictEqual(form, ["L", "D", "W"]);
  });

  it("limits form to 5 results", () => {
    const matches: Match[] = Array.from({ length: 8 }, (_, i) =>
      makeMatch({
        id: `m${i}`,
        startTime: new Date(Date.now() - i * 86400000).toISOString(),
        status: "finished" as const,
        score: { home: i % 2 === 0 ? 1 : 0, away: i % 2 === 0 ? 0 : 1 },
      })
    );
    const form = getFormFromMatches(matches, "arsenal");
    assert.ok(form.length <= 5);
  });

  it("returns empty array when no finished matches", () => {
    const matches: Match[] = [
      makeMatch({ id: "m1", status: "scheduled", score: { home: null, away: null } }),
    ];
    const form = getFormFromMatches(matches, "arsenal");
    assert.deepStrictEqual(form, []);
  });
});
