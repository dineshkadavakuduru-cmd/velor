import { cache } from "react";
import { connection } from "next/server";
import { createRegistry } from "@/lib/api";
import { getEnabledSports } from "@/lib/api/sports";
import {
  assembleSnapshot,
  classifyError,
  emptySnapshot,
} from "./snapshot-helpers";
import type { GetMatchesParams } from "@/lib/api/types";
import type { SportFetchInput, SportsSnapshot } from "./snapshot-helpers";

export {
  isLiveMatch,
  rankFeaturedLeagues,
  rankFeaturedTeams,
  shouldAcceptLivePayload,
  classifyError,
  emptySnapshot,
  assembleSnapshot,
} from "./snapshot-helpers";
export type {
  SportSyncState,
  PerSportSync,
  SportsSnapshotStats,
  SportsSnapshot,
  Settled,
  SportFetchInput,
} from "./snapshot-helpers";

/**
 * Canonical sports data source for VELOR.
 *
 * Every page (homepage, /live, /matches, /teams, /leagues, /sports) must
 * derive its numbers from `getSportsSnapshot()` instead of maintaining
 * independent provider calls and hardcoded counters. Fetching happens here;
 * all derivation lives in pure `assembleSnapshot()` (unit-tested), so every
 * consumer provably sees the same numbers from the same inputs.
 */

/**
 * Fetch the canonical snapshot. React `cache()` dedupes concurrent calls
 * within a single request so homepage hero, ticker, and sections — which
 * render in separate Suspense boundaries — all see identical numbers.
 */
export const getSportsSnapshot = cache(
  async (filters?: GetMatchesParams): Promise<SportsSnapshot> => {
    // Request-time rendering only: this snapshot must NEVER be baked into a
    // build-time prerender or served as a stale static generation. Every
    // page (/live, /matches, /teams, …) renders the current assembly over
    // shared Data-Cache upstream payloads, so pages cannot disagree.
    // (Upstream fetch revalidation windows still apply — this only defers
    // rendering to request time; it does not bypass the fetch cache.)
    await connection();
    const syncedAt = new Date().toISOString();

    let registry: ReturnType<typeof createRegistry>;
    try {
      registry = createRegistry();
    } catch (error) {
      const classified = classifyError(error);
      const snapshot = emptySnapshot(
        classified.state === "misconfigured" ? "misconfigured" : "unavailable",
        syncedAt
      );
      return snapshot;
    }

    const allSports = getEnabledSports();
    const sports =
      filters?.sport != null
        ? allSports.filter((s) => s.id === filters.sport)
        : allSports;

    // Unknown/unsupported sport filter: return an empty (but honest) snapshot
    // rather than leaking another sport's data into the filtered view.
    if (filters?.sport != null && sports.length === 0) {
      return {
        ...emptySnapshot("unavailable", syncedAt),
        perSport: [],
      };
    }

    const results = await Promise.allSettled(
      sports.map(async (sport) => {
        const provider = registry.getProvider(sport.id);
        // Union of the live endpoint AND the general fixtures endpoint.
        // Some providers only return data from one of them (e.g. football's
        // general fixtures endpoint needs date/league params while
        // ?live=all works unauthenticated-param-free). The union — deduped
        // by match id — is the canonical dataset every page derives from,
        // so no page can disagree about live counts again.
        const [liveResult, fixturesResult, leaguesResult, teamsResult] = await Promise.allSettled([
          provider.getLiveMatches(),
          provider.getMatches(filters),
          provider.getLeagues(),
          provider.getTeams(),
        ]);
        const input: SportFetchInput = {
          sportId: sport.id,
          sportName: sport.name,
          liveResult,
          fixturesResult,
          leaguesResult,
          teamsResult,
        };
        return input;
      })
    );

    const inputs: SportFetchInput[] = results.map((result) => {
      if (result.status === "fulfilled") return result.value;
      // Whole-sport fetch rejected (getProvider threw): record an unknown
      // sport whose every endpoint failed with the same reason.
      const rejected = { status: "rejected" as const, reason: result.reason };
      return {
        sportId: "unknown",
        sportName: "Unknown sport",
        liveResult: rejected,
        fixturesResult: rejected,
        leaguesResult: rejected,
        teamsResult: rejected,
      };
    });

    return assembleSnapshot(inputs, filters, syncedAt);
  }
);
