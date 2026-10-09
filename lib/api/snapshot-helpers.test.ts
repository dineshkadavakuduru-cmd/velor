import { describe, it } from "node:test";
import assert from "node:assert";
import {
  isLiveMatch,
  shouldAcceptLivePayload,
  deriveTeamsFromMatches,
  deriveLeaguesFromMatches,
  rankFeaturedLeagues,
  rankFeaturedTeams,
} from "./snapshot-helpers";
import type { Match, League, Team } from "@/lib/types/sports";

function makeTeam(id: string, name: string, sportId = "football"): Team {
  return { id, name, shortName: id.slice(0, 3).toUpperCase(), sportId };
}

function makeLeague(id: string, name: string, sportId = "football"): League {
  return { id, name, country: "Test", sportId };
}

function makeMatch(
  id: string,
  status: Match["status"],
  league: League,
  home: Team,
  away: Team
): Match {
  return {
    id,
    sport: { id: league.sportId, name: league.sportId, slug: league.sportId },
    league,
    homeTeam: home,
    awayTeam: away,
    score: { home: 0, away: 0 },
    status,
    startTime: "2026-08-22T19:45:00Z",
  };
}

describe("isLiveMatch", () => {
  it("treats live and halftime as live (homepage, /live, /matches agree)", () => {
    const league = makeLeague("l1", "League 1");
    const home = makeTeam("h", "Home");
    const away = makeTeam("a", "Away");
    assert.strictEqual(isLiveMatch(makeMatch("1", "live", league, home, away)), true);
    assert.strictEqual(isLiveMatch(makeMatch("2", "halftime", league, home, away)), true);
    assert.strictEqual(isLiveMatch(makeMatch("3", "scheduled", league, home, away)), false);
    assert.strictEqual(isLiveMatch(makeMatch("4", "finished", league, home, away)), false);
    assert.strictEqual(isLiveMatch(makeMatch("5", "postponed", league, home, away)), false);
  });
});

describe("shouldAcceptLivePayload", () => {
  it("accepts any payload when every provider succeeded", () => {
    assert.strictEqual(shouldAcceptLivePayload(25, 25, false), true);
    assert.strictEqual(shouldAcceptLivePayload(25, 0, false), true);
    assert.strictEqual(shouldAcceptLivePayload(0, 0, false), true);
  });

  it("rejects a thinner degraded payload (provider failure, not an empty world)", () => {
    assert.strictEqual(shouldAcceptLivePayload(25, 0, true), false);
    assert.strictEqual(shouldAcceptLivePayload(25, 10, true), false);
  });

  it("accepts a degraded payload that is not thinner", () => {
    assert.strictEqual(shouldAcceptLivePayload(25, 25, true), true);
    assert.strictEqual(shouldAcceptLivePayload(0, 0, true), true);
    assert.strictEqual(shouldAcceptLivePayload(5, 9, true), true);
  });
});

describe("deriveTeamsFromMatches", () => {
  it("returns deduplicated participants with sportId fallback", () => {
    const league = makeLeague("l1", "League 1");
    const arsenal = makeTeam("arsenal", "Arsenal");
    const chelsea = makeTeam("chelsea", "Chelsea");
    const matches = [
      makeMatch("1", "live", league, arsenal, chelsea),
      makeMatch("2", "scheduled", league, arsenal, chelsea),
    ];
    const teams = deriveTeamsFromMatches(matches);
    assert.strictEqual(teams.length, 2);
    assert.deepStrictEqual(
      teams.map((t) => t.id).sort(),
      ["arsenal", "chelsea"]
    );
  });

  it("fills missing sportId from the match sport", () => {
    const league = makeLeague("l1", "League 1", "cricket");
    const home: Team = { id: "h", name: "Home", shortName: "HOM" };
    const away: Team = { id: "a", name: "Away", shortName: "AWY" };
    const teams = deriveTeamsFromMatches([makeMatch("1", "live", league, home, away)]);
    assert.strictEqual(teams[0].sportId, "cricket");
    assert.strictEqual(teams[1].sportId, "cricket");
  });
});

describe("deriveLeaguesFromMatches", () => {
  it("returns deduplicated leagues", () => {
    const l1 = makeLeague("l1", "League 1");
    const l2 = makeLeague("l2", "League 2");
    const matches = [
      makeMatch("1", "live", l1, makeTeam("h", "H"), makeTeam("a", "A")),
      makeMatch("2", "live", l1, makeTeam("h", "H"), makeTeam("a", "A")),
      makeMatch("3", "live", l2, makeTeam("h", "H"), makeTeam("a", "A")),
    ];
    const leagues = deriveLeaguesFromMatches(matches);
    assert.strictEqual(leagues.length, 2);
  });
});

describe("rankFeaturedLeagues", () => {
  it("orders by live activity first, then total matches — never hardcoded", () => {
    const quiet = makeLeague("quiet", "Quiet League");
    const busy = makeLeague("busy", "Busy League");
    const live = makeLeague("live", "Live League");
    const h = makeTeam("h", "H");
    const a = makeTeam("a", "A");
    const matches = [
      makeMatch("1", "finished", quiet, h, a),
      makeMatch("2", "finished", quiet, h, a),
      makeMatch("3", "finished", quiet, h, a),
      makeMatch("4", "scheduled", busy, h, a),
      makeMatch("5", "live", live, h, a),
    ];
    const ranked = rankFeaturedLeagues([quiet, busy, live], matches, 3);
    // Live league wins despite fewer total matches; busy beats quiet on total.
    assert.deepStrictEqual(
      ranked.map((l) => l.id),
      ["live", "quiet", "busy"]
    );
  });

  it("respects the limit", () => {
    const leagues = Array.from({ length: 10 }, (_, i) => makeLeague(`l${i}`, `L${i}`));
    assert.strictEqual(rankFeaturedLeagues(leagues, [], 6).length, 6);
  });
});

describe("rankFeaturedTeams", () => {
  it("prefers teams involved in live matches", () => {
    const star = makeTeam("star", "Star");
    const bench = makeTeam("bench", "Bench");
    const other = makeTeam("other", "Other");
    const filler = makeTeam("filler", "Filler");
    const league = makeLeague("l1", "League 1");
    const matches = [
      makeMatch("1", "finished", league, bench, filler),
      makeMatch("2", "finished", league, bench, filler),
      makeMatch("3", "live", league, star, filler),
      makeMatch("4", "live", league, star, other),
    ];
    const ranked = rankFeaturedTeams([bench, other, star, filler], matches, 4);
    assert.strictEqual(ranked[0].id, "star");
  });
});
