import { describe, it, beforeEach } from "node:test";
import { beforeEach as __lgb } from "node:test";
import { __resetLastGoodStore, __setLastGoodForTest } from "../../last-good";
__lgb(() => { __resetLastGoodStore(); });
import assert from "node:assert";
import { SportsApiProProvider, type SportsApiProConfig } from "./provider";

const CONFIG: SportsApiProConfig = {
  baseUrl: "https://v2.football.sportsapipro.com",
  providerName: "TestProvider",
  sportId: "football",
  sportName: "Football",
  sportSlug: "football",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const LIVE_EVENT = {
  id: 16318004,
  tournament: { name: "Liga MX, Apertura", uniqueTournament: { id: 11621 }, category: { sport: { slug: "football" } } },
  status: { code: 6, type: "inprogress", description: "1st half" },
  homeTeam: { id: 1933, name: "Pumas UNAM", nameCode: "UNAM" },
  awayTeam: { id: 1940, name: "Tigres UANL", nameCode: "UANL" },
  homeScore: { current: 1, display: 1 },
  awayScore: { current: 0, display: 0 },
  startTimestamp: 1792897800,
};

const SCHEDULED_EVENT = {
  id: 999,
  tournament: { name: "Premier League", uniqueTournament: { id: 1 } },
  status: { code: 0, type: "notstarted", description: "Not started" },
  homeTeam: { id: 42, name: "Arsenal", nameCode: "ARS" },
  awayTeam: { id: 50, name: "Chelsea", nameCode: "CHE" },
  homeScore: null,
  awayScore: null,
  startTimestamp: 1792900000,
};

describe("SportsApiProProvider", () => {
  const provider = new SportsApiProProvider(CONFIG, "test-key");

  let handler: (url: URL) => Response;

  beforeEach(() => {
    handler = () => json({ success: true, events: [] });
    global.fetch = (async (input: RequestInfo | URL) => {
      const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      return handler(new URL(href));
    }) as typeof fetch;
  });

  describe("getMatches / getLiveMatches", () => {
    it("normalizes the /today list", async () => {
      handler = () => json({ success: true, events: [LIVE_EVENT, SCHEDULED_EVENT] });
      const matches = await provider.getMatches();
      assert.strictEqual(matches.length, 2);
      assert.strictEqual(matches[0].sport.id, "football");
      assert.strictEqual(matches[0].league.id, "11621");
      assert.strictEqual(matches[0].homeTeam.name, "Pumas UNAM");
      assert.strictEqual(matches[1].status, "scheduled");
    });

    it("returns only live matches from getLiveMatches", async () => {
      handler = () => json({ success: true, events: [LIVE_EVENT, SCHEDULED_EVENT] });
      const live = await provider.getLiveMatches();
      assert.strictEqual(live.length, 1);
      assert.strictEqual(live[0].id, "16318004");
      assert.strictEqual(live[0].status, "live");
    });

    it("filters by status", async () => {
      handler = () => json({ success: true, events: [LIVE_EVENT, SCHEDULED_EVENT] });
      const scheduled = await provider.getMatches({ status: "scheduled" });
      assert.deepStrictEqual(scheduled.map((m) => m.id), ["999"]);
    });

    it("filters by league id", async () => {
      handler = () => json({ success: true, events: [LIVE_EVENT, SCHEDULED_EVENT] });
      const laliga = await provider.getMatches({ leagueId: "11621" });
      assert.deepStrictEqual(laliga.map((m) => m.id), ["16318004"]);
    });

    it("returns an empty array when the response has no events", async () => {
      handler = () => json({ success: true, events: null });
      assert.deepStrictEqual(await provider.getMatches(), []);
    });
  });

  describe("getMatch", () => {
    it("returns a normalized match for a valid id", async () => {
      handler = (url) => {
        if (url.pathname.endsWith("/match/16318004")) return json({ success: true, data: { event: LIVE_EVENT } });
        return json({}, 404);
      };
      const match = await provider.getMatch("16318004");
      assert.ok(match);
      assert.strictEqual(match!.id, "16318004");
      assert.strictEqual(match!.sport.name, "Football");
    });

    it("returns null for a missing id (404)", async () => {
      handler = () => json({}, 404);
      assert.strictEqual(await provider.getMatch("999999999"), null);
    });

    it("returns null for another sport's match (cross-sport gateway)", async () => {
      handler = (url) => {
        if (url.pathname.endsWith("/match/16824745")) {
          return json({
            success: true,
            data: { event: { id: 16824745, tournament: { category: { sport: { slug: "basketball" } } } } },
          });
        }
        return json({}, 404);
      };
      assert.strictEqual(await provider.getMatch("16824745"), null);
    });
  });

  describe("leagues / teams", () => {
    it("derives leagues from today's events", async () => {
      handler = () => json({ success: true, events: [LIVE_EVENT, SCHEDULED_EVENT] });
      const leagues = await provider.getLeagues();
      assert.deepStrictEqual(leagues.map((l) => l.id).sort(), ["1", "11621"]);
    });

    it("returns a league for a matching sport and null for a foreign one", async () => {
      handler = (url) => {
        if (url.pathname.includes("/tournament/11621/info")) {
          return json({ success: true, data: { uniqueTournament: { id: 11621, name: "Liga MX, Apertura", category: { country: { name: "Mexico" }, sport: { slug: "football" } } } } });
        }
        if (url.pathname.includes("/tournament/132/info")) {
          return json({ success: true, data: { uniqueTournament: { id: 132, name: "NBA", category: { sport: { slug: "basketball" } } } } });
        }
        return json({}, 404);
      };
      const league = await provider.getLeague("11621");
      assert.strictEqual(league?.name, "Liga MX, Apertura");
      assert.strictEqual(await provider.getLeague("132"), null);
    });

    it("returns a team, and rejects a foreign team", async () => {
      handler = (url) => {
        if (url.pathname.includes("/team/42")) {
          return json({ success: true, data: { team: { id: 42, name: "Arsenal", sport: { slug: "football" }, country: { name: "England" } } } });
        }
        if (url.pathname.includes("/team/3417")) {
          return json({ success: true, data: { team: { id: 3417, name: "Denver Nuggets", sport: { slug: "basketball" } } } });
        }
        return json({}, 404);
      };
      const team = await provider.getTeam("42");
      assert.strictEqual(team?.name, "Arsenal");
      assert.strictEqual(await provider.getTeam("3417"), null);
    });

    it("derives teams for a league from today's events", async () => {
      handler = () => json({ success: true, events: [LIVE_EVENT, SCHEDULED_EVENT] });
      const teams = await provider.getTeams({ leagueId: "11621" });
      assert.deepStrictEqual(teams.map((t) => t.name).sort(), ["Pumas UNAM", "Tigres UANL"]);
    });

    it("maps players for a team", async () => {
      handler = (url) => {
        if (url.pathname.includes("/team/42/players")) {
          return json({ success: true, data: { players: [{ player: { id: 100, name: "Bukayo Saka", position: "F" } }] } });
        }
        return json({}, 404);
      };
      const players = await provider.getPlayers({ teamId: "42" });
      assert.strictEqual(players.length, 1);
      assert.strictEqual(players[0].name, "Bukayo Saka");
    });
  });

  describe("search", () => {
    it("deduplicates before applying the limit and labels distinct Belgium squads", async () => {
      const men = { id: 4717, name: "Belgium", gender: "M", national: true, country: { name: "Belgium" }, sport: { slug: "football" } };
      const women = { ...men, id: 38081, gender: "F" };
      handler = () => json({ data: { results: [men, men, women].map((entity) => ({ type: "team", entity })) } });
      const results = await provider.search({ query: "Belgium", limit: 2 });
      assert.deepStrictEqual(results.map(({ id, subtitle }) => [id, subtitle]), [
        ["4717", "Football · Men’s national team · Belgium"],
        ["38081", "Football · Women’s national team · Belgium"],
      ]);
    });

    it("maps team and player results and drops foreign sports", async () => {
      handler = () => json({
        success: true,
        data: {
          results: [
            { type: "team", entity: { id: 42, name: "Arsenal", sport: { slug: "football" }, country: { name: "England" } } },
            { type: "team", entity: { id: 3417, name: "Denver Nuggets", sport: { slug: "basketball" } } },
            { type: "player", entity: { id: 804508, name: "Viktor Gyökeres", sport: { slug: "football" } } },
          ],
        },
      });
      const results = await provider.search({ query: "arsenal" });
      assert.deepStrictEqual(results.map((r) => r.id), ["42", "804508"]);
      assert.strictEqual(results[0].href, "/team/42?sport=football");
      assert.strictEqual(results[1].type, "player");
    });
  });

  describe("standings", () => {
    it("resolves the current season then maps standings", async () => {
      handler = (url) => {
        if (url.pathname.includes("/tournament/11621/seasons")) {
          return json({ success: true, seasons: [{ id: 96191, name: "Liga MX 2026", year: "2026" }] });
        }
        if (url.pathname.includes("/tournament/11621/season/96191/standings")) {
          return json({ success: true, standings: [{ position: 1, teamId: 1939, teamName: "Club América", played: 12, won: 8, drawn: 3, lost: 1, goalsFor: 32, goalsAgainst: 16, points: 27 }] });
        }
        return json({}, 404);
      };
      const standings = await provider.getStandings({ leagueId: "11621" });
      assert.strictEqual(standings.length, 1);
      assert.strictEqual(standings[0].teamId, "1939");
      assert.strictEqual(standings[0].points, 27);
      assert.strictEqual(standings[0].sportId, "football");
    });
  });

  describe("match detail tabs", () => {
    const matchPayload = () => json({ success: true, data: { event: LIVE_EVENT } });

    it("maps incidents with the resolving team id", async () => {
      handler = (url) => {
        if (url.pathname.endsWith("/match/16318004/incidents")) {
          return json({ success: true, data: { incidents: [{ id: 5, incidentType: "goal", time: 23, isHome: true, player: { id: 7, name: "Scorer" }, text: "Goal" }] } });
        }
        if (url.pathname.endsWith("/match/16318004")) return matchPayload();
        return json({}, 404);
      };
      const events = await provider.getMatchEvents({ matchId: "16318004" });
      assert.strictEqual(events.length, 1);
      assert.strictEqual(events[0].teamId, "1933");
      assert.strictEqual(events[0].playerName, "Scorer");
      assert.strictEqual(events[0].type, "goal");
    });

    it("maps statistics into one entry per team", async () => {
      handler = (url) => {
        if (url.pathname.endsWith("/match/16318004/statistics")) {
          return json({
            success: true,
            data: {
              statistics: [
                { period: "ALL", groups: [{ groupName: "Match overview", statisticsItems: [{ name: "Ball possession", home: "54%", away: "46%", homeValue: 54, awayValue: 46 }] }] },
              ],
            },
          });
        }
        if (url.pathname.endsWith("/match/16318004")) return matchPayload();
        return json({}, 404);
      };
      const stats = await provider.getMatchStatistics({ matchId: "16318004" });
      assert.strictEqual(stats.length, 2);
      assert.strictEqual(stats[0].teamId, "1933");
      assert.strictEqual(stats[0].teamName, "Pumas UNAM");
      assert.deepStrictEqual(stats[0].stats[0], { type: "Ball possession", value: 54, opponentValue: 46 });
      assert.strictEqual(stats[1].stats[0].value, 46);
    });

    it("maps lineups for both teams", async () => {
      handler = (url) => {
        if (url.pathname.endsWith("/match/16318004/lineups")) {
          return json({
            success: true,
            data: {
              home: { formation: "4-3-3", players: [{ player: { id: 100, name: "Keeper", position: "G", jerseyNumber: "1" } }] },
              away: { formation: "4-4-2", players: [{ player: { id: 200, name: "Striker", position: "F", jerseyNumber: 9 } }] },
            },
          });
        }
        if (url.pathname.endsWith("/match/16318004")) return matchPayload();
        return json({}, 404);
      };
      const lineups = await provider.getMatchLineups({ matchId: "16318004" });
      assert.strictEqual(lineups.length, 2);
      assert.strictEqual(lineups[0].teamId, "1933");
      assert.strictEqual(lineups[0].formation, "4-3-3");
      assert.strictEqual(lineups[0].startXI[0].name, "Keeper");
      assert.strictEqual(lineups[1].startXI[0].number, 9);
    });
  });

  describe("error handling", () => {
    it("throws on malformed JSON", async () => {
      handler = () => new Response("not-json", { status: 200, headers: { "Content-Type": "application/json" } });
      await assert.rejects(provider.getMatches());
    });

    it("throws without retrying on a 4xx error", async () => {
      let calls = 0;
      handler = () => {
        calls++;
        return json({}, 400);
      };
      await assert.rejects(provider.getMatches());
      assert.strictEqual(calls, 1);
    });

    it("serves last-known-good data when the upstream rate-limits and a prior payload exists", async () => {
      const endpoint = "https://v2.football.sportsapipro.com/api/today";
      __setLastGoodForTest(`TestProvider:${endpoint}`, { success: true, events: [LIVE_EVENT] }, Date.now());
      handler = () => json({}, 429);
      const matches = await provider.getMatches();
      assert.strictEqual(matches.length, 1);
    });

    it("rejects a rate-limit with no last-known-good payload", async () => {
      handler = () => json({}, 429);
      await assert.rejects(provider.getMatches());
    });
  });
});
