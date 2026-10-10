import { describe, it } from "node:test";
import assert from "node:assert";
import {
  isLiveMatch,
  shouldAcceptLivePayload,
  deriveTeamsFromMatches,
  deriveLeaguesFromMatches,
  rankFeaturedLeagues,
  rankFeaturedTeams,
  assembleSnapshot,
  emptySnapshot,
  classifyError,
} from "./snapshot-helpers";
import type { Match, League, Team } from "@/lib/types/sports";
import type { SportFetchInput } from "./snapshot-helpers";
import { SportsApiError } from "./error";
import { buildLiveMatchesResponse } from "./live-response";
import { isStaleSync } from "../utils/freshness";

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

function ok<T>(value: T) {
  return { status: "fulfilled" as const, value };
}

function fail(reason: unknown) {
  return { status: "rejected" as const, reason };
}

function sportInput(
  sportId: string,
  sportName: string,
  overrides: Partial<Omit<SportFetchInput, "sportId" | "sportName">> = {}
): SportFetchInput {
  return {
    sportId,
    sportName,
    liveResult: ok([]),
    fixturesResult: ok([]),
    leaguesResult: ok([]),
    teamsResult: ok([]),
    ...overrides,
  };
}

const SYNCED_AT = "2026-10-09T06:00:00.000Z";

describe("assembleSnapshot — one canonical source", () => {
  it("same snapshot yields the same live count for homepage, /live and /matches", () => {
    const league = makeLeague("l1", "League 1", "cricket");
    const liveMatches: Match[] = Array.from({ length: 25 }, (_, i) =>
      makeMatch(`live-${i}`, "live", league, makeTeam(`h${i}`, `Home ${i}`), makeTeam(`a${i}`, `Away ${i}`))
    );
    const snapshot = assembleSnapshot(
      [sportInput("cricket", "Cricket", { fixturesResult: ok(liveMatches) })],
      undefined,
      SYNCED_AT
    );
    const homepageCount = snapshot.stats.liveMatches;
    const livePageCount = snapshot.liveMatches.length;
    const matchesPageCount = snapshot.matches.filter(isLiveMatch).length;
    const perSportSum = snapshot.perSport.reduce((sum, s) => sum + s.liveCount, 0);
    assert.strictEqual(homepageCount, 25);
    assert.strictEqual(livePageCount, 25);
    assert.strictEqual(matchesPageCount, 25);
    assert.strictEqual(perSportSum, 25);
  });

  it("zero live matches is reported consistently as zero (not unavailable)", () => {
    const league = makeLeague("l1", "League 1");
    const h = makeTeam("h", "H");
    const a = makeTeam("a", "A");
    const snapshot = assembleSnapshot(
      [
        sportInput("cricket", "Cricket", {
          fixturesResult: ok([
            makeMatch("1", "scheduled", league, h, a),
            makeMatch("2", "finished", league, h, a),
            makeMatch("3", "postponed", league, h, a),
          ]),
        }),
      ],
      undefined,
      SYNCED_AT
    );
    assert.deepStrictEqual(snapshot.liveMatches, []);
    assert.strictEqual(snapshot.stats.liveMatches, 0);
    assert.strictEqual(snapshot.hasAnySuccess, true);
    assert.deepStrictEqual(snapshot.unavailableSports, []);
  });

  it("counts multiple live matches including halftime", () => {
    const league = makeLeague("l1", "League 1");
    const h = makeTeam("h", "H");
    const a = makeTeam("a", "A");
    const snapshot = assembleSnapshot(
      [
        sportInput("tennis", "Tennis", {
          liveResult: ok([
            makeMatch("1", "live", league, h, a),
            makeMatch("2", "live", league, h, a),
            makeMatch("3", "halftime", league, h, a),
          ]),
        }),
      ],
      undefined,
      SYNCED_AT
    );
    assert.strictEqual(snapshot.stats.liveMatches, 3);
    assert.strictEqual(snapshot.liveMatches.length, 3);
  });

  it("derives leagues when the provider supplies none (missing league)", () => {
    const l1 = makeLeague("l1", "League 1");
    const l2 = makeLeague("l2", "League 2");
    const h = makeTeam("h", "H");
    const a = makeTeam("a", "A");
    const snapshot = assembleSnapshot(
      [
        sportInput("cricket", "Cricket", {
          fixturesResult: ok([
            makeMatch("1", "live", l1, h, a),
            makeMatch("2", "scheduled", l2, h, a),
          ]),
          leaguesResult: ok([]),
        }),
      ],
      undefined,
      SYNCED_AT
    );
    assert.strictEqual(snapshot.leaguesDerivedFromMatches, true);
    assert.strictEqual(snapshot.leagues.length, 2);
    assert.strictEqual(snapshot.stats.leagues, 2);
  });

  it("derives teams from match participants when the provider supplies none (missing team)", () => {
    const league = makeLeague("l1", "League 1");
    const snapshot = assembleSnapshot(
      [
        sportInput("tennis", "Tennis", {
          fixturesResult: ok([
            makeMatch("1", "live", league, makeTeam("p1", "Player 1"), makeTeam("p2", "Player 2")),
            makeMatch("2", "live", league, makeTeam("p1", "Player 1"), makeTeam("p3", "Player 3")),
          ]),
          teamsResult: ok([]),
        }),
      ],
      undefined,
      SYNCED_AT
    );
    assert.strictEqual(snapshot.teamsDerivedFromMatches, true);
    assert.deepStrictEqual(
      snapshot.teams.map((t) => t.id).sort(),
      ["p1", "p2", "p3"]
    );
    assert.strictEqual(snapshot.stats.teams, 3);
  });

  it("classifies every API failure kind without inventing data", () => {
    const kinds: Array<[unknown, string | undefined]> = [
      [new SportsApiError({ provider: "T", endpoint: "/live", kind: "TIMEOUT", detail: "d" }), "TIMEOUT"],
      [new SportsApiError({ provider: "T", endpoint: "/x", kind: "RATE_LIMIT", detail: "d" }), "RATE_LIMIT"],
      [new SportsApiError({ provider: "T", endpoint: "/x", kind: "AUTH_FAILURE", detail: "d" }), "AUTH_FAILURE"],
      [new SportsApiError({ provider: "T", endpoint: "/x", kind: "NETWORK_FAILURE", detail: "d" }), "NETWORK_FAILURE"],
      [new SportsApiError({ provider: "T", endpoint: "/x", kind: "MALFORMED_RESPONSE", detail: "d" }), "MALFORMED_RESPONSE"],
      [new SportsApiError({ provider: "T", endpoint: "/x", status: 500, kind: "API_ERROR", detail: "d" }), "API_ERROR"],
      [new Error("RATE_LIMIT"), "RATE_LIMIT"],
      [new Error("AUTH_FAILURE"), "AUTH_FAILURE"],
      [new Error("TIMEOUT"), "TIMEOUT"],
      [new Error("MALFORMED_RESPONSE"), "MALFORMED_RESPONSE"],
      [new Error("API_ERROR:500"), "API_ERROR_500"],
      [new TypeError("fetch failed"), "UNKNOWN"],
      [new Error("boom"), "UNKNOWN"],
    ];
    for (const [error, kind] of kinds) {
      assert.strictEqual(classifyError(error).errorKind, kind);
      assert.strictEqual(classifyError(error).state, "unavailable");
    }
    assert.strictEqual(
      classifyError(new Error("VELOR_SPORTS_PROVIDER=api is set but VELOR_API_SPORTS_KEY is missing")).state,
      "misconfigured"
    );
  });

  it("total API failure yields an empty snapshot with zero stats (empty snapshot)", () => {
    const snapshot = assembleSnapshot(
      [
        sportInput("cricket", "Cricket", {
          liveResult: fail(new Error("TIMEOUT")),
          fixturesResult: fail(new Error("TIMEOUT")),
          leaguesResult: fail(new Error("TIMEOUT")),
          teamsResult: fail(new Error("TIMEOUT")),
        }),
        sportInput("tennis", "Tennis", {
          liveResult: fail(new Error("API_ERROR:500")),
          fixturesResult: fail(new Error("API_ERROR:500")),
          leaguesResult: fail(new Error("API_ERROR:500")),
          teamsResult: fail(new Error("API_ERROR:500")),
        }),
      ],
      undefined,
      SYNCED_AT
    );
    assert.deepStrictEqual(snapshot.matches, []);
    assert.deepStrictEqual(snapshot.liveMatches, []);
    assert.deepStrictEqual(snapshot.stats, { liveMatches: 0, matches: 0, leagues: 0, teams: 0 });
    assert.strictEqual(snapshot.hasAnySuccess, false);
    assert.strictEqual(snapshot.degraded, false);
    assert.strictEqual(snapshot.unavailableSports.length, 2);
  });

  it("partial failure degrades honestly while keeping good data", () => {
    const league = makeLeague("l1", "League 1");
    const h = makeTeam("h", "H");
    const a = makeTeam("a", "A");
    const snapshot = assembleSnapshot(
      [
        sportInput("cricket", "Cricket", {
          fixturesResult: ok([makeMatch("1", "live", league, h, a)]),
        }),
        sportInput("football", "Football", {
          liveResult: fail(new Error("AUTH_FAILURE")),
          fixturesResult: fail(new Error("AUTH_FAILURE")),
          leaguesResult: fail(new Error("AUTH_FAILURE")),
          teamsResult: fail(new Error("AUTH_FAILURE")),
        }),
      ],
      undefined,
      SYNCED_AT
    );
    assert.strictEqual(snapshot.hasAnySuccess, true);
    assert.strictEqual(snapshot.degraded, true);
    assert.strictEqual(snapshot.stats.liveMatches, 1);
    assert.deepStrictEqual(
      snapshot.unavailableSports.map((s) => s.id),
      ["football"]
    );
  });

  it("fulfilled-but-empty endpoints are honest emptiness, not failure (stale snapshot carries its timestamp)", () => {    const snapshot = assembleSnapshot(
      [sportInput("cricket", "Cricket")],
      undefined,
      SYNCED_AT
    );
    assert.strictEqual(snapshot.hasAnySuccess, true);
    assert.deepStrictEqual(snapshot.unavailableSports, []);
    // The assembly timestamp is what every freshness/stale check consumes.
    assert.strictEqual(snapshot.syncedAt, SYNCED_AT);
    assert.deepStrictEqual(emptySnapshot("unavailable", SYNCED_AT).stats, {
      liveMatches: 0,
      matches: 0,
      leagues: 0,
      teams: 0,
    });
  });

  it("dedupes match ids globally across sports (no double-counting)", () => {
    const league = makeLeague("l1", "League 1");
    const h = makeTeam("h", "H");
    const a = makeTeam("a", "A");
    const shared = [
      makeMatch("dup-1", "live", league, h, a),
      makeMatch("dup-2", "scheduled", league, h, a),
    ];
    const snapshot = assembleSnapshot(
      [
        sportInput("football", "Football", { fixturesResult: ok(shared) }),
        sportInput("cricket", "Cricket", { fixturesResult: ok(shared) }),
      ],
      undefined,
      SYNCED_AT
    );
    // Same ids from two sports enter the dataset exactly once.
    assert.strictEqual(snapshot.matches.length, 2);
    assert.strictEqual(snapshot.stats.matches, 2);
    assert.strictEqual(snapshot.stats.liveMatches, 1);
    const perSportSum = snapshot.perSport.reduce((sum, s) => sum + s.liveCount, 0);
    assert.strictEqual(perSportSum, snapshot.stats.liveMatches);
  });
});

/**
 * Regression coverage for the production data-integrity incident: /live once
 * reported 0 live matches while /matches reported a non-zero live count, and
 * /teams reported no teams at all. These tests pin every route view to the
 * same canonical snapshot so the numbers can never diverge again.
 */
describe("regression — one canonical snapshot per route", () => {
  it("agrees across homepage, /live, /matches and /api/live-matches when the live and fixtures endpoints disagree", () => {
    const league = makeLeague("l1", "League 1");
    const h = makeTeam("h", "H");
    const a = makeTeam("a", "A");

    // A provider whose two endpoints return different live sets — exactly the
    // shape that used to make /live and /matches disagree.
    const snapshot = assembleSnapshot(
      [
        sportInput("tennis", "Tennis", {
          liveResult: ok([
            makeMatch("live-only-1", "live", league, h, a),
            makeMatch("live-only-2", "halftime", league, h, a),
            makeMatch("live-only-3", "live", league, h, a),
          ]),
          fixturesResult: ok([
            makeMatch("fixtures-only-1", "live", league, h, a),
            makeMatch("fixtures-only-2", "live", league, h, a),
            makeMatch("scheduled-1", "scheduled", league, h, a),
          ]),
        }),
      ],
      undefined,
      SYNCED_AT
    );

    // The union is the canonical dataset: 5 live + 1 scheduled.
    assert.strictEqual(snapshot.stats.liveMatches, 5);
    assert.strictEqual(snapshot.stats.matches, 6);
    assert.strictEqual(snapshot.liveMatches.length, 5);

    const routeViews = {
      homepageHero: snapshot.stats.liveMatches,
      livePage: snapshot.matches.filter(isLiveMatch).length,
      matchesPage: snapshot.matches.filter(isLiveMatch).length,
      liveApiPoller: buildLiveMatchesResponse(snapshot).body.matches.length,
      perSportSum: snapshot.perSport.reduce((sum, s) => sum + s.liveCount, 0),
    };

    for (const [route, view] of Object.entries(routeViews)) {
      assert.strictEqual(view, 5, `${route} disagrees with the canonical snapshot`);
    }
  });

  it("reports a healthy zero live count as an empty state (200), never as unavailable", () => {
    const league = makeLeague("l1", "League 1");
    const h = makeTeam("h", "H");
    const a = makeTeam("a", "A");
    const snapshot = assembleSnapshot(
      [
        sportInput("tennis", "Tennis", {
          liveResult: ok([]),
          fixturesResult: ok([
            makeMatch("1", "scheduled", league, h, a),
            makeMatch("2", "finished", league, h, a),
          ]),
        }),
      ],
      undefined,
      SYNCED_AT
    );

    assert.strictEqual(snapshot.hasAnySuccess, true);
    assert.strictEqual(snapshot.degraded, false);
    assert.deepStrictEqual(snapshot.unavailableSports, []);

    const response = buildLiveMatchesResponse(snapshot);
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body.matches, []);
    assert.strictEqual(response.body.degraded, false);
    assert.strictEqual(response.body.error, undefined);
  });

  it("never leaves /teams or /leagues empty while /matches has matches", () => {
    const l1 = makeLeague("l1", "League 1");
    const l2 = makeLeague("l2", "League 2");
    const snapshot = assembleSnapshot(
      [
        sportInput("cricket", "Cricket", {
          fixturesResult: ok([
            makeMatch("1", "live", l1, makeTeam("p1", "Player 1"), makeTeam("p2", "Player 2")),
            makeMatch("2", "scheduled", l2, makeTeam("p2", "Player 2"), makeTeam("p3", "Player 3")),
          ]),
          // Providers that expose no league/team directory endpoint at all.
          leaguesResult: ok([]),
          teamsResult: ok([]),
        }),
      ],
      undefined,
      SYNCED_AT
    );

    assert.strictEqual(snapshot.matches.length, 2);
    assert.strictEqual(snapshot.leagues.length, 2);
    assert.strictEqual(snapshot.teams.length, 3);
    assert.strictEqual(snapshot.leaguesDerivedFromMatches, true);
    assert.strictEqual(snapshot.teamsDerivedFromMatches, true);
    // Derived entities are honest fallbacks, not a degraded dataset.
    assert.strictEqual(snapshot.degraded, false);
  });

  it("returns honest error states on total API failure without inventing a single match", () => {
    const failed = sportInput("football", "Football", {
      liveResult: fail(new Error("TIMEOUT")),
      fixturesResult: fail(new Error("TIMEOUT")),
      leaguesResult: fail(new Error("TIMEOUT")),
      teamsResult: fail(new Error("TIMEOUT")),
    });
    const unavailable = assembleSnapshot([failed], undefined, SYNCED_AT);

    assert.strictEqual(unavailable.hasAnySuccess, false);
    assert.deepStrictEqual(unavailable.matches, []);
    assert.deepStrictEqual(unavailable.stats, { liveMatches: 0, matches: 0, leagues: 0, teams: 0 });
    const unavailableResponse = buildLiveMatchesResponse(unavailable);
    assert.strictEqual(unavailableResponse.status, 503);
    assert.deepStrictEqual(unavailableResponse.body.matches, []);
    assert.strictEqual(unavailableResponse.body.error, "SPORTS_DATA_UNAVAILABLE");

    const misconfigured = emptySnapshot("misconfigured", SYNCED_AT);
    const misconfiguredResponse = buildLiveMatchesResponse(misconfigured);
    assert.strictEqual(misconfiguredResponse.status, 500);
    assert.deepStrictEqual(misconfiguredResponse.body.matches, []);
    assert.strictEqual(misconfiguredResponse.body.error, "SPORTS_DATA_MISCONFIGURED");

    // A sport that failed must be reported as unavailable, not as zero matches.
    assert.deepStrictEqual(
      unavailable.unavailableSports.map((s) => s.id),
      ["football"]
    );
  });

  it("flags a stale snapshot as stale while keeping (not blanking) the live list", () => {
    const league = makeLeague("l1", "League 1");
    const h = makeTeam("h", "H");
    const a = makeTeam("a", "A");
    const snapshot = assembleSnapshot(
      [
        sportInput("football", "Football", {
          fixturesResult: ok([makeMatch("1", "live", league, h, a)]),
        }),
        sportInput("basketball", "Basketball", {
          liveResult: fail(new Error("AUTH_FAILURE")),
          fixturesResult: fail(new Error("AUTH_FAILURE")),
          leaguesResult: fail(new Error("AUTH_FAILURE")),
          teamsResult: fail(new Error("AUTH_FAILURE")),
        }),
      ],
      undefined,
      SYNCED_AT
    );

    // Stale + degraded: the freshness line must warn, the data must stay.
    assert.strictEqual(isStaleSync(snapshot.syncedAt, 15), true);
    assert.strictEqual(snapshot.degraded, true);
    const response = buildLiveMatchesResponse(snapshot);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.matches.length, 1);
    assert.strictEqual(response.body.degraded, true);

    // The poller keeps the stale-but-full list instead of blanking the screen…
    assert.strictEqual(shouldAcceptLivePayload(1, 0, true), false);
    // …and still trusts a genuine end of matches from healthy providers.
    assert.strictEqual(shouldAcceptLivePayload(1, 0, false), true);
  });

});
