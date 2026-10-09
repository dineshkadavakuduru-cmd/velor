import { MockSportsProvider } from "./mock/MockSportsProvider";
import { ApiSportsProvider } from "./providers/api-sports/ApiSportsProvider";
import { BasketballProvider } from "./providers/basketball/BasketballProvider";
import { CricketProvider } from "./providers/cricket/CricketProvider";
import { TennisProvider } from "./providers/tennis/TennisProvider";
import type { SportsProvider } from "./types";
import { createProviderRegistry } from "./providers/registry";
import { logProviderError } from "./error";

export { MockSportsProvider, ApiSportsProvider, BasketballProvider, CricketProvider, TennisProvider };
export type {
  SportsProvider,
  SportsProviderFactory,
  GetMatchesParams,
  GetLeaguesParams,
  GetTeamsParams,
  GetPlayersParams,
  GetStandingsParams,
} from "./types";
export type { ProviderRegistry, ProviderCapabilities } from "./providers/registry";

const SPORTSAPI_SHARED_ACCOUNT_PROVIDERS = ["cricket", "tennis"] as const;

export function createProvider(sportId: string = "football"): SportsProvider {
  const mode = (process.env.VELOR_SPORTS_PROVIDER || "").toLowerCase();
  const footballKey = process.env.VELOR_API_SPORTS_KEY;
  const basketballKey = process.env.VELOR_BASKETBALL_API_KEY || footballKey;
  const cricketKey = process.env.VELOR_CRICKET_API_KEY || footballKey;
  const tennisKey = process.env.VELOR_TENNIS_API_KEY || footballKey;

  let footballProvider: SportsProvider | undefined;
  let basketballProviderInstance: SportsProvider | undefined;
  let cricketProviderInstance: SportsProvider | undefined;
  let tennisProviderInstance: SportsProvider | undefined;
  let defaultProvider: SportsProvider;

  if (mode === "api") {
    if (!footballKey) {
      const e = new Error(
        "VELOR_SPORTS_PROVIDER=api is set but VELOR_API_SPORTS_KEY is missing. " +
          "Set the API key or switch to VELOR_SPORTS_PROVIDER=mock."
      );
      logProviderError(e);
      throw e;
    }
    footballProvider = new ApiSportsProvider(footballKey);
    defaultProvider = new MockSportsProvider();
  } else if (mode === "mock" || !footballKey) {
    defaultProvider = new MockSportsProvider();
  } else {
    footballProvider = new ApiSportsProvider(footballKey);
    defaultProvider = new MockSportsProvider();
  }

  // Mock mode must be pure-mock: keys alone must never silently mix real
  // provider data into the mock dataset (or vice versa), or pages render
  // franken-datasets that disagree with each other.
  const useRealProviders = mode !== "mock";

  if (useRealProviders && basketballKey) {
    basketballProviderInstance = new BasketballProvider(basketballKey);
  }

  if (useRealProviders && cricketKey) {
    cricketProviderInstance = new CricketProvider(cricketKey);
  }

  if (useRealProviders && tennisKey) {
    tennisProviderInstance = new TennisProvider(tennisKey);
  }

  const registry = createProviderRegistry(defaultProvider, footballProvider, basketballProviderInstance, cricketProviderInstance, tennisProviderInstance);
  return registry.getProvider(sportId);
}

export function createRegistry(): ReturnType<typeof createProviderRegistry> {
  const mode = (process.env.VELOR_SPORTS_PROVIDER || "").toLowerCase();
  const footballKey = process.env.VELOR_API_SPORTS_KEY;
  const basketballKey = process.env.VELOR_BASKETBALL_API_KEY || footballKey;
  const cricketKey = process.env.VELOR_CRICKET_API_KEY || footballKey;
  const tennisKey = process.env.VELOR_TENNIS_API_KEY || footballKey;

  let footballProvider: SportsProvider | undefined;
  let basketballProviderInstance: SportsProvider | undefined;
  let cricketProviderInstance: SportsProvider | undefined;
  let tennisProviderInstance: SportsProvider | undefined;
  let defaultProvider: SportsProvider;

  if (mode === "api") {
    if (!footballKey) {
      const e = new Error(
        "VELOR_SPORTS_PROVIDER=api is set but VELOR_API_SPORTS_KEY is missing. " +
          "Set the API key or switch to VELOR_SPORTS_PROVIDER=mock."
      );
      logProviderError(e);
      throw e;
    }
    footballProvider = new ApiSportsProvider(footballKey);
    defaultProvider = new MockSportsProvider();
  } else if (mode === "mock" || !footballKey) {
    defaultProvider = new MockSportsProvider();
  } else {
    footballProvider = new ApiSportsProvider(footballKey);
    defaultProvider = new MockSportsProvider();
  }

  // Mock mode must be pure-mock: keys alone must never silently mix real
  // provider data into the mock dataset (or vice versa), or pages render
  // franken-datasets that disagree with each other.
  const useRealProviders = mode !== "mock";

  if (useRealProviders && basketballKey) {
    basketballProviderInstance = new BasketballProvider(basketballKey);
  }

  if (useRealProviders && cricketKey) {
    cricketProviderInstance = new CricketProvider(cricketKey);
  }

  if (useRealProviders && tennisKey) {
    tennisProviderInstance = new TennisProvider(tennisKey);
  }

  return createProviderRegistry(defaultProvider, footballProvider, basketballProviderInstance, cricketProviderInstance, tennisProviderInstance);
}

export const __testing = { SPORTSAPI_SHARED_ACCOUNT_PROVIDERS };
