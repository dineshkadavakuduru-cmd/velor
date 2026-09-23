import { describe, it } from "node:test";
import assert from "node:assert";
import type { SportsProvider } from "../types";
import { createProviderRegistry } from "./registry";

class FakeProvider implements SportsProvider {
  readonly sportId: string;
  constructor(sportId: string) {
    this.sportId = sportId;
  }
  async getLiveMatches() { return []; }
  async getMatches() { return []; }
  async getMatch() { return null; }
  async getLeagues() { return []; }
  async getLeague() { return null; }
  async getTeams() { return []; }
  async getTeam() { return null; }
  async getPlayers() { return []; }
  async getStandings() { return []; }
  async search() { return []; }
  async getMatchEvents() { return []; }
  async getMatchStatistics() { return []; }
  async getMatchLineups() { return []; }
}

describe("provider registry", () => {
  it("returns default provider for non-football enabled sports", () => {
    const registry = createProviderRegistry(new FakeProvider("mock"));
    const provider = registry.getProvider("basketball");
    assert.ok(provider);
    assert.ok(provider instanceof FakeProvider);
  });

  it("returns football provider when provided", () => {
    const footballProvider = new FakeProvider("football-api");
    const registry = createProviderRegistry(new FakeProvider("mock"), footballProvider);
    const provider = registry.getProvider("football");
    assert.strictEqual(provider, footballProvider);
  });

  it("falls back to default provider for unsupported sports", () => {
    const defaultProvider = new FakeProvider("mock");
    const registry = createProviderRegistry(defaultProvider);
    const provider = registry.getProvider("baseball");
    assert.strictEqual(provider, defaultProvider);
  });

  it("returns available sports from registry", () => {
    const registry = createProviderRegistry(new FakeProvider("mock"));
    const sports = registry.getAvailableSports();
    assert.ok(sports.some((s) => s.id === "football"));
    assert.ok(sports.some((s) => s.id === "basketball"));
    assert.ok(sports.some((s) => s.id === "cricket"));
    assert.ok(sports.some((s) => s.id === "tennis"));
  });

  it("returns capabilities for a sport", () => {
    const registry = createProviderRegistry(new FakeProvider("mock"));
    const caps = registry.getCapabilities("basketball");
    assert.strictEqual(caps.sportId, "basketball");
    assert.strictEqual(caps.hasLive, true);
    assert.strictEqual(caps.hasMatches, true);
  });

  it("returns football-specific provider capabilities", () => {
    const footballProvider = new FakeProvider("football-api");
    const registry = createProviderRegistry(new FakeProvider("mock"), footballProvider);
    const caps = registry.getCapabilities("football");
    assert.strictEqual(caps.sportId, "football");
  });

  it("returns basketball provider when provided", () => {
    const basketballProvider = new FakeProvider("basketball-api");
    const registry = createProviderRegistry(new FakeProvider("mock"), undefined, basketballProvider);
    const provider = registry.getProvider("basketball");
    assert.strictEqual(provider, basketballProvider);
  });

  it("falls back to default provider for basketball when no basketball provider configured", () => {
    const defaultProvider = new FakeProvider("mock");
    const registry = createProviderRegistry(defaultProvider);
    const provider = registry.getProvider("basketball");
    assert.strictEqual(provider, defaultProvider);
  });

  it("returns basketball capabilities when basketball provider is configured", () => {
    const basketballProvider = new FakeProvider("basketball-api");
    const registry = createProviderRegistry(new FakeProvider("mock"), undefined, basketballProvider);
    const caps = registry.getCapabilities("basketball");
    assert.strictEqual(caps.sportId, "basketball");
    assert.strictEqual(caps.hasLive, true);
    assert.strictEqual(caps.hasMatches, true);
  });

  it("preserves football provider when basketball provider is also configured", () => {
    const footballProvider = new FakeProvider("football-api");
    const basketballProvider = new FakeProvider("basketball-api");
    const registry = createProviderRegistry(new FakeProvider("mock"), footballProvider, basketballProvider);
    assert.strictEqual(registry.getProvider("football"), footballProvider);
    assert.strictEqual(registry.getProvider("basketball"), basketballProvider);
    assert.strictEqual(registry.getProvider("cricket"), registry.getProvider("cricket"));
  });

  it("returns cricket provider when provided", () => {
    const cricketProvider = new FakeProvider("cricket-api");
    const registry = createProviderRegistry(new FakeProvider("mock"), undefined, undefined, cricketProvider);
    assert.strictEqual(registry.getProvider("cricket"), cricketProvider);
  });

  it("falls back to default provider for cricket when no cricket provider configured", () => {
    const defaultProvider = new FakeProvider("mock");
    const registry = createProviderRegistry(defaultProvider);
    assert.strictEqual(registry.getProvider("cricket"), defaultProvider);
  });

  it("returns cricket capabilities when cricket provider is configured", () => {
    const cricketProvider = new FakeProvider("cricket-api");
    const registry = createProviderRegistry(new FakeProvider("mock"), undefined, undefined, cricketProvider);
    const caps = registry.getCapabilities("cricket");
    assert.strictEqual(caps.sportId, "cricket");
    assert.strictEqual(caps.hasLive, true);
    assert.strictEqual(caps.hasMatches, true);
  });

  it("returns tennis provider when provided", () => {
    const tennisProvider = new FakeProvider("tennis-api");
    const registry = createProviderRegistry(new FakeProvider("mock"), undefined, undefined, undefined, tennisProvider);
    assert.strictEqual(registry.getProvider("tennis"), tennisProvider);
  });

  it("falls back to default provider for tennis when no tennis provider configured", () => {
    const defaultProvider = new FakeProvider("mock");
    const registry = createProviderRegistry(defaultProvider);
    assert.strictEqual(registry.getProvider("tennis"), defaultProvider);
  });

  it("returns tennis capabilities when tennis provider is configured", () => {
    const tennisProvider = new FakeProvider("tennis-api");
    const registry = createProviderRegistry(new FakeProvider("mock"), undefined, undefined, undefined, tennisProvider);
    const caps = registry.getCapabilities("tennis");
    assert.strictEqual(caps.sportId, "tennis");
    assert.strictEqual(caps.hasLive, true);
    assert.strictEqual(caps.hasMatches, true);
  });

  it("preserves all providers when all four are configured", () => {
    const footballProvider = new FakeProvider("football-api");
    const basketballProvider = new FakeProvider("basketball-api");
    const cricketProvider = new FakeProvider("cricket-api");
    const tennisProvider = new FakeProvider("tennis-api");
    const registry = createProviderRegistry(new FakeProvider("mock"), footballProvider, basketballProvider, cricketProvider, tennisProvider);
    assert.strictEqual(registry.getProvider("football"), footballProvider);
    assert.strictEqual(registry.getProvider("basketball"), basketballProvider);
    assert.strictEqual(registry.getProvider("cricket"), cricketProvider);
    assert.strictEqual(registry.getProvider("tennis"), tennisProvider);
  });
});
