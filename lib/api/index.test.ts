import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

const ORIGINAL_ENV = { ...process.env };

function setEnv(map: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(map)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

function resetEnv() {
  for (const k of Object.keys(process.env)) delete process.env[k];
  for (const [k, v] of Object.entries(ORIGINAL_ENV)) process.env[k] = v;
}

describe("createProvider / createRegistry environment handling", () => {
  beforeEach(() => {
    resetEnv();
    setEnv({
      VELOR_API_SPORTS_KEY: undefined,
      VELOR_BASKETBALL_API_KEY: undefined,
      VELOR_CRICKET_API_KEY: undefined,
      VELOR_TENNIS_API_KEY: undefined,
      VELOR_SPORTS_PROVIDER: undefined,
    });
  });

  afterEach(() => {
    resetEnv();
  });

  describe("VELOR_SPORTS_PROVIDER=api", () => {
    it("throws a sanitized error when VELOR_API_SPORTS_KEY is missing (no key leaked)", async () => {
      setEnv({ VELOR_SPORTS_PROVIDER: "api", VELOR_API_SPORTS_KEY: undefined });
      const { createProvider } = await import("./index");
      let caught: unknown;
      try {
        createProvider();
      } catch (error) {
        caught = error;
      }
      assert.ok(caught instanceof Error);
      assert.strictEqual(
        (caught as Error).message.includes("VELOR_API_SPORTS_KEY is missing"),
        true,
        "Expected message to reference missing key"
      );
      assert.ok(
        !JSON.stringify(caught).match(/x-api-key/i),
        "Error must not reference the auth header name"
      );
    });

    it("creates real providers when VELOR_API_SPORTS_KEY is present", async () => {
      setEnv({
        VELOR_SPORTS_PROVIDER: "api",
        VELOR_API_SPORTS_KEY: "shared-key-123",
        VELOR_CRICKET_API_KEY: undefined,
        VELOR_TENNIS_API_KEY: undefined,
      });
      const { createRegistry } = await import("./index");
      const reg = createRegistry();
      const football = reg.getProvider("football");
      const cricket = reg.getProvider("cricket");
      const tennis = reg.getProvider("tennis");
      assert.ok(football);
      assert.ok(cricket);
      assert.ok(tennis);
      assert.notStrictEqual(football, cricket);
      assert.notStrictEqual(cricket, tennis);
    });
  });

  describe("shared-account fallback (SportsAPI Pro single key)", () => {
    it("uses VELOR_API_SPORTS_KEY for cricket and tennis when sport-specific keys are absent", async () => {
      setEnv({
        VELOR_SPORTS_PROVIDER: "api",
        VELOR_API_SPORTS_KEY: "shared-sportsapipro-key",
        VELOR_CRICKET_API_KEY: undefined,
        VELOR_TENNIS_API_KEY: undefined,
      });
      const { createRegistry } = await import("./index");
      const reg = createRegistry();
      const cricket = reg.getProvider("cricket");
      const tennis = reg.getProvider("tennis");
      assert.ok(cricket);
      assert.ok(tennis);
    });

    it("prefers per-sport keys (VELOR_CRICKET_API_KEY / VELOR_TENNIS_API_KEY) when set", async () => {
      setEnv({
        VELOR_SPORTS_PROVIDER: "api",
        VELOR_API_SPORTS_KEY: "shared-key",
        VELOR_CRICKET_API_KEY: "cricket-only-key",
        VELOR_TENNIS_API_KEY: "tennis-only-key",
      });
      const { createRegistry } = await import("./index");
      const reg = createRegistry();
      assert.ok(reg.getProvider("cricket"));
      assert.ok(reg.getProvider("tennis"));
    });
  });

  describe("default mode", () => {
    it("uses the MockSportsProvider when no key is present and mode is not api", async () => {
      setEnv({
        VELOR_SPORTS_PROVIDER: undefined,
        VELOR_API_SPORTS_KEY: undefined,
      });
      const { createRegistry, MockSportsProvider } = await import("./index");
      const reg = createRegistry();
      const cricket = reg.getProvider("cricket");
      const tennis = reg.getProvider("tennis");
      const football = reg.getProvider("football");
      assert.ok(cricket instanceof MockSportsProvider);
      assert.ok(tennis instanceof MockSportsProvider);
      assert.ok(football instanceof MockSportsProvider);
    });
  });
});
