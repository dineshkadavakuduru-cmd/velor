import { cache } from "react";
import { createRegistry } from "./index";
import { runWithStaleCollection } from "./last-good";
import { findMatch } from "./lookup";
import { getSportsSnapshot } from "./snapshot";
import { isSportEnabled } from "./sports";

export const getMatchDetailSource = cache(async (id: string, sportId?: string) => {
  const registry = createRegistry();
  const sport = sportId && isSportEnabled(sportId) ? sportId : undefined;
  const snapshot = await getSportsSnapshot(sport ? { sport } : undefined);
  const match = snapshot.matches.find((item) => item.id === id && (!sport || item.sport.id === sport));

  if (match) {
    const sync = snapshot.perSport.find((item) => item.sportId === match.sport.id);
    return {
      match,
      provider: registry.getProvider(match.sport.id),
      syncedAt: sync?.syncedAt ?? snapshot.syncedAt,
      stale: sync?.servedUpstreamStale ?? false,
      degraded: sync?.partial ?? false,
    };
  }

  // Older fixtures can fall outside today's feed.
  const stale = new Set<string>();
  const result = await runWithStaleCollection(stale, () => findMatch(registry, id, sport));
  return result && {
    match: result.entity,
    provider: result.provider,
    syncedAt: undefined,
    stale: stale.size > 0,
    degraded: false,
  };
});
