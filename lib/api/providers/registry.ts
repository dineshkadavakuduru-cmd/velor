import type { SportsProvider } from "../types";
import type { SportDefinition } from "../sports";
import { isSportEnabled, getEnabledSports } from "../sports";

export interface ProviderCapabilities {
  sportId: string;
  hasLive: boolean;
  hasMatches: boolean;
  hasLeagues: boolean;
  hasTeams: boolean;
  hasPlayers: boolean;
  hasStandings: boolean;
  hasSearch: boolean;
  hasEvents: boolean;
  hasStatistics: boolean;
  hasLineups: boolean;
  hasPlayerMatchStats: boolean;
}

export interface ProviderRegistry {
  getProvider(sportId: string): SportsProvider;
  getCapabilities(sportId: string): ProviderCapabilities;
  getAvailableSports(): SportDefinition[];
}

export function createProviderRegistry(
  defaultProvider: SportsProvider,
  footballProvider?: SportsProvider,
  basketballProvider?: SportsProvider,
  cricketProvider?: SportsProvider,
  tennisProvider?: SportsProvider
): ProviderRegistry {
  const capabilitiesCache = new Map<string, ProviderCapabilities>();

  function getCapabilitiesForProvider(provider: SportsProvider, sportId: string): ProviderCapabilities {
    if (capabilitiesCache.has(sportId)) {
      return capabilitiesCache.get(sportId)!;
    }

    const caps: ProviderCapabilities = {
      sportId,
      hasLive: true,
      hasMatches: true,
      hasLeagues: true,
      hasTeams: true,
      hasPlayers: true,
      hasStandings: true,
      hasSearch: true,
      hasEvents: true,
      hasStatistics: true,
      hasLineups: true,
      hasPlayerMatchStats: true,
    };

    capabilitiesCache.set(sportId, caps);
    return caps;
  }

  return {
    getProvider(sportId: string): SportsProvider {
      if (sportId === "football" && footballProvider) {
        return footballProvider;
      }
      if (sportId === "basketball" && basketballProvider) {
        return basketballProvider;
      }
      if (sportId === "cricket" && cricketProvider) {
        return cricketProvider;
      }
      if (sportId === "tennis" && tennisProvider) {
        return tennisProvider;
      }
      if (isSportEnabled(sportId)) {
        return defaultProvider;
      }
      return defaultProvider;
    },

    getCapabilities(sportId: string): ProviderCapabilities {
      if (sportId === "football" && footballProvider) {
        return getCapabilitiesForProvider(footballProvider, sportId);
      }
      if (sportId === "basketball" && basketballProvider) {
        return getCapabilitiesForProvider(basketballProvider, sportId);
      }
      if (sportId === "cricket" && cricketProvider) {
        return getCapabilitiesForProvider(cricketProvider, sportId);
      }
      if (sportId === "tennis" && tennisProvider) {
        return getCapabilitiesForProvider(tennisProvider, sportId);
      }
      if (isSportEnabled(sportId)) {
        return getCapabilitiesForProvider(defaultProvider, sportId);
      }
      return getCapabilitiesForProvider(defaultProvider, sportId);
    },

    getAvailableSports(): SportDefinition[] {
      return getEnabledSports();
    },
  };
}
