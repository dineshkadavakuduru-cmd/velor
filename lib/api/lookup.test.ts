import { describe, it } from "node:test";
import assert from "node:assert";
import { findMatch, findLeague, findTeam } from "./lookup";
import type { ProviderRegistry } from "./providers/registry";
import type { SportsProvider } from "./types";

function createMockRegistry(overrides?: {
  football?: Partial<SportsProvider>;
  cricket?: Partial<SportsProvider>;
  tennis?: Partial<SportsProvider>;
  basketball?: Partial<SportsProvider>;
}): ProviderRegistry {
  const defaultImpl: Partial<SportsProvider> = {
    getMatch: async () => null,
    getTeam: async () => null,
    getLeague: async () => null,
  };

  const providers: Record<string, SportsProvider> = {
    football: { ...defaultImpl, ...overrides?.football } as unknown as SportsProvider,
    cricket: { ...defaultImpl, ...overrides?.cricket } as unknown as SportsProvider,
    tennis: { ...defaultImpl, ...overrides?.tennis } as unknown as SportsProvider,
    basketball: { ...defaultImpl, ...overrides?.basketball } as unknown as SportsProvider,
  };

  return {
    getProvider: (sportId: string) => providers[sportId] || (providers.football as SportsProvider),
    hasProvider: (sportId: string) => Boolean(providers[sportId]),
  } as unknown as ProviderRegistry;
}

describe("findEntity lookup behavior", () => {
  it("returns entity when found in a secondary provider despite earlier provider throwing", async () => {
    const registry = createMockRegistry({
      football: {
        getMatch: async () => {
          throw new Error("AUTH_FAILURE");
        },
      },
      cricket: {
        getMatch: async (id: string) => ({
          id,
          sport: { id: "cricket", name: "Cricket" },
          homeTeam: { id: "t1", name: "Team 1" },
          awayTeam: { id: "t2", name: "Team 2" },
          status: "live",
          startTime: "2026-09-24T00:00:00Z",
          league: { id: "l1", name: "League 1", country: "Global", sportId: "cricket" },
        } as unknown as import("@/lib/types/sports").Match),
      },
    });

    const result = await findMatch(registry, "16932896");
    assert.ok(result);
    assert.strictEqual(result.sportId, "cricket");
    assert.strictEqual(result.entity.id, "16932896");
  });

  it("finds leagues and teams across sports", async () => {
    const registry = createMockRegistry({
      tennis: {
        getLeague: async (id: string) => ({
          id,
          name: "Wimbledon",
          country: "UK",
          sportId: "tennis",
        } as unknown as import("@/lib/types/sports").League),
        getTeam: async (id: string) => ({
          id,
          name: "Player A",
          country: "UK",
          sportId: "tennis",
        } as unknown as import("@/lib/types/sports").Team),
      },
    });

    const league = await findLeague(registry, "wim-1");
    assert.ok(league);
    assert.strictEqual(league.sportId, "tennis");
    assert.strictEqual(league.entity.name, "Wimbledon");

    const team = await findTeam(registry, "play-1");
    assert.ok(team);
    assert.strictEqual(team.sportId, "tennis");
    assert.strictEqual(team.entity.name, "Player A");
  });

  it("returns null when entity is not found and at least one provider succeeded", async () => {
    const registry = createMockRegistry({
      football: {
        getMatch: async () => {
          throw new Error("AUTH_FAILURE");
        },
      },
      cricket: {
        getMatch: async () => null,
      },
    });

    const result = await findMatch(registry, "non-existent-id");
    assert.strictEqual(result, null);
  });

  it("rethrows error when specific sport is requested and that provider fails", async () => {
    const registry = createMockRegistry({
      football: {
        getMatch: async () => {
          throw new Error("AUTH_FAILURE");
        },
      },
    });

    await assert.rejects(
      async () => {
        await findMatch(registry, "123", "football");
      },
      /AUTH_FAILURE/
    );
  });

  it("rethrows error when ALL candidates fail", async () => {
    const failingProvider: Partial<SportsProvider> = {
      getMatch: async () => {
        throw new Error("NETWORK_DOWN");
      },
    };
    const registry = createMockRegistry({
      football: failingProvider,
      cricket: failingProvider,
      tennis: failingProvider,
      basketball: failingProvider,
    });

    await assert.rejects(
      async () => {
        await findMatch(registry, "123");
      },
      /NETWORK_DOWN/
    );
  });
});
