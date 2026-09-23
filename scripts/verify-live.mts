import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.join(__dirname, "..", ".env.local") });

import { createRegistry } from "../lib/api/index.ts";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function probeProvider(sportId: string, label: string) {
  const registry = createRegistry();
  const provider = registry.getProvider(sportId);
  console.log(`\n##### ${label} #####`);
  console.log(`Provider: ${provider.constructor.name}`);
  console.log(`Sport: ${sportId}`);

  // 1. live
  let live: Awaited<ReturnType<typeof provider.getLiveMatches>> = [];
  let liveOk = false;
  let liveDetail = "";
  try {
    live = await provider.getLiveMatches();
    liveOk = true;
    liveDetail = `${live.length} matches`;
    console.log(`[PASS] getLiveMatches() returned ${live.length} matches`);
    if (live.length > 0) {
      const m = live[0];
      console.log(`         sample: id=${m.id} status=${m.status} ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.league.name})`);
    }
  } catch (err) {
    liveDetail = err instanceof Error ? err.message : String(err);
    console.log(`[FAIL] getLiveMatches() — ${liveDetail}`);
  }

  // 2. today/upcoming
  let today: Awaited<ReturnType<typeof provider.getMatches>> = [];
  let todayOk = false;
  let todayDetail = "";
  try {
    today = await provider.getMatches({ date: todayISO() });
    todayOk = true;
    todayDetail = `${today.length} matches on ${todayISO()}`;
    console.log(`[PASS] getMatches(today=${todayISO()}) returned ${today.length} matches`);
    if (today.length > 0) {
      const m = today[0];
      console.log(`         sample: id=${m.id} status=${m.status} ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.league.name})`);
    }
  } catch (err) {
    todayDetail = err instanceof Error ? err.message : String(err);
    console.log(`[FAIL] getMatches(today) — ${todayDetail}`);
  }

  // 3. detail for an ID
  let detailOk = false;
  let detailDetail = "no candidate id";
  try {
    const candidate = live[0] ?? today[0];
    if (candidate) {
      const detail = await provider.getMatch(candidate.id);
      if (detail) {
        detailOk = true;
        detailDetail = `id=${detail.id} ${detail.homeTeam.name} vs ${detail.awayTeam.name}`;
      }
    }
    console.log(`[${detailOk ? "PASS" : "FAIL"}] getMatch(id) ${detailDetail}`);
  } catch (err) {
    console.log(`[FAIL] getMatch(id) — ${err instanceof Error ? err.message : err}`);
  }

  // 4. leagues
  let leaguesOk = false;
  let leaguesCount = 0;
  let leaguesDetail = "";
  try {
    const leagues = await provider.getLeagues();
    leaguesCount = leagues.length;
    leaguesOk = true;
    leaguesDetail = `${leaguesCount} leagues`;
    console.log(`[PASS] getLeagues() returned ${leaguesCount} leagues`);
    if (leagues.length > 0) {
      const sample = leagues[0];
      console.log(`         sample: id=${sample.id} sportId=${sample.sportId} ${sample.name} (${sample.country})`);
    }
  } catch (err) {
    leaguesDetail = err instanceof Error ? err.message : String(err);
    console.log(`[FAIL] getLeagues() — ${leaguesDetail}`);
  }

  // 5. teams where supported
  let teamsOk = false;
  let teamsCount = -1;
  let teamsDetail = "";
  try {
    const teams = await provider.getTeams({ search: "United" });
    teamsCount = teams.length;
    teamsOk = true;
    teamsDetail = `${teamsCount} teams for search 'United'`;
    console.log(`[PASS] getTeams(search='United') returned ${teamsCount} teams`);
  } catch (err) {
    teamsDetail = err instanceof Error ? err.message : String(err);
    console.log(`[FAIL] getTeams() — ${teamsDetail}`);
  }

  // Print per-sport summary
  const liveVerdict = liveOk && todayOk && detailOk && leaguesOk && teamsOk ? "PASS" : "FAIL";
  console.log(`\n${label} VERDICT: ${liveVerdict}`);
  console.log(`  live=${liveOk ? "PASS" : "FAIL"} today=${todayOk ? "PASS" : "FAIL"} detail=${detailOk ? "PASS" : "FAIL"} leagues=${leaguesOk ? "PASS" : "FAIL"} teams=${teamsOk ? "PASS" : "FAIL"}`);
}

await probeProvider("football", "Football / API-Sports");
await probeProvider("basketball", "Basketball / API-Sports");
await probeProvider("cricket", "Cricket / SportsAPI Pro");
await probeProvider("tennis", "Tennis / SportsAPI Pro");