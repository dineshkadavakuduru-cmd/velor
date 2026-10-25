import { SportsApiProProvider, type SportsApiProConfig } from "../sportsapipro/provider";

/**
 * Football provider on the API-Sports Pro platform.
 *
 * The retired `*.api-sports.io` hosts (HTTP 403 for every request) are gone;
 * football now reads from `v2.football.sportsapipro.com`, the same platform
 * cricket and tennis already use.
 */
export const FOOTBALL_PROVIDER_CONFIG: SportsApiProConfig = {
  baseUrl: "https://v2.football.sportsapipro.com",
  providerName: "ApiSportsProvider",
  sportId: "football",
  sportName: "Football",
  sportSlug: "football",
};

export class ApiSportsProvider extends SportsApiProProvider {
  constructor(apiKey: string) {
    super(FOOTBALL_PROVIDER_CONFIG, apiKey);
  }
}
