import { getEnabledSports, isSportEnabled } from "./sports";
import type { League, Match, Team, Player, PlayerMatchStats } from "@/lib/types/sports";
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
  const candidates = candidateSports(sportId);
  let lastError: unknown;
  let errorCount = 0;

  for (const candidate of candidates) {
    const provider = registry.getProvider(candidate);
    try {
      const entity = await getEntity(provider);
      if (entity) return { entity, provider, sportId: candidate };
    } catch (error) {
      lastError = error;
      errorCount++;
    }
  }

  if (sportId && lastError) {
    throw lastError;
  }

  if (errorCount === candidates.length && lastError) {
    throw lastError;
  }

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

export function findPlayer(registry: ProviderRegistry, id: string, sportId?: string) {
  return findEntity<Player>(registry, sportId, (provider) => provider.getPlayer ? provider.getPlayer(id) : Promise.resolve(null));
}

export const getMatchAcrossSports = findMatch;
export const getTeamAcrossSports = findTeam;
export const getLeagueAcrossSports = findLeague;
export const getPlayerAcrossSports = findPlayer;
