import { cache } from "react";
import { connection } from "next/server";
import { createRegistry } from "@/lib/api";
import { getEnabledSports } from "@/lib/api/sports";
import {
  assembleSnapshot,
  classifyError,
  emptySnapshot,
} from "./snapshot-helpers";
import { runWithStaleCollection } from "./last-good";
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
    // Request-time assembly over shared provider samples.
    await connection();

    let registry: ReturnType<typeof createRegistry>;
    try {
      registry = createRegistry();
    } catch (error) {
      const classified = classifyError(error);
      const snapshot = emptySnapshot(
        classified.state === "misconfigured" ? "misconfigured" : "unavailable",
        new Date().toISOString()
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
        ...emptySnapshot("unavailable", new Date().toISOString()),
        perSport: [],
      };
    }

    const results = await Promise.allSettled(
      sports.map(async (sport) => {
        const provider = registry.getProvider(sport.id);
        // Track freshness for scores separately from reference data, so a
        // stale team or league response cannot label a current score stale.
        const liveStale = new Set<string>();
        const fixturesStale = new Set<string>();
        const observations = new Map<string, number>();
        // Some sports expose live games and scheduled/finished fixtures on
        // separate endpoints. Assembly resolves both into one match record.
        const settled = await Promise.allSettled([
          runWithStaleCollection(liveStale, () => provider.getLiveMatches(), observations),
          runWithStaleCollection(fixturesStale, () => provider.getMatches(filters), observations),
          provider.getLeagues(),
          provider.getTeams(),
        ]);
        const [liveResult, fixturesResult, leaguesResult, teamsResult] = settled;
        const input: SportFetchInput = {
          sportId: sport.id,
          sportName: sport.name,
          liveResult,
          fixturesResult,
          leaguesResult,
          teamsResult,
          servedUpstreamStale: liveStale.size > 0 || fixturesStale.size > 0,
          liveStale: liveStale.size > 0,
          fixturesStale: fixturesStale.size > 0,
          syncedAt: observations.size
            ? new Date(Math.min(...observations.values())).toISOString()
            : undefined,
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

    const syncedAt = inputs.flatMap((input) => input.syncedAt ? [input.syncedAt] : []).sort()[0]
      ?? new Date().toISOString();
    return assembleSnapshot(inputs, filters, syncedAt);
  }
);
