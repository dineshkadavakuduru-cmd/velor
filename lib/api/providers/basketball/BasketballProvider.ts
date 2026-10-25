import { SportsApiProProvider, type SportsApiProConfig } from "../sportsapipro/provider";

/**
 * Basketball provider on the API-Sports Pro platform.
 *
 * The retired `*.api-sports.io` hosts (HTTP 403 for every request) are gone;
 * basketball now reads from `v2.basketball.sportsapipro.com`, the same
 * platform cricket and tennis already use.
 */
export const BASKETBALL_PROVIDER_CONFIG: SportsApiProConfig = {
  baseUrl: "https://v2.basketball.sportsapipro.com",
  providerName: "BasketballProvider",
  sportId: "basketball",
  sportName: "Basketball",
  sportSlug: "basketball",
};

export class BasketballProvider extends SportsApiProProvider {
  constructor(apiKey: string) {
    super(BASKETBALL_PROVIDER_CONFIG, apiKey);
  }
}
