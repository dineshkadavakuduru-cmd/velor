import { getEnabledSports, isSportEnabled } from "./sports";
import type { League, Match, Team } from "@/lib/types/sports";
import type { SportsProvider } from "./types";
import type { ProviderRegistry } from "./providers/registry";

export interface EntityLookup<T> {
  entity: T;
  provider: SportsProvider;
  sportId: string;
}

function candidateSports(sportId?: string): string[] {
  if (sportId && isSportEnabled(sportId)) return [sportId];
  return getEnabledSports().map((sport) => sport.id);
}

async function findEntity<T>(
  registry: ProviderRegistry,
  sportId: string | undefined,
  getEntity: (provider: SportsProvider) => Promise<T | null>
): Promise<EntityLookup<T> | null> {
  let lastError: unknown;

  for (const candidate of candidateSports(sportId)) {
    const provider = registry.getProvider(candidate);
    try {
      const entity = await getEntity(provider);
      if (entity) return { entity, provider, sportId: candidate };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return null;
}

export function findMatch(registry: ProviderRegistry, id: string, sportId?: string) {
  return findEntity<Match>(registry, sportId, (provider) => provider.getMatch(id));
}

export function findTeam(registry: ProviderRegistry, id: string, sportId?: string) {
  return findEntity<Team>(registry, sportId, (provider) => provider.getTeam(id));
}

export function findLeague(registry: ProviderRegistry, id: string, sportId?: string) {
  return findEntity<League>(registry, sportId, (provider) => provider.getLeague(id));
}
