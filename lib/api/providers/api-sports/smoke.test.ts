import { describe, it } from "node:test";
import assert from "node:assert";
import { ApiSportsProvider } from "./ApiSportsProvider";

const apiKey = process.env.VELOR_API_SPORTS_KEY;

if (!apiKey) {
  // Skipping API-Sports smoke test: VELOR_API_SPORTS_KEY is not set.
} else {
  describe("ApiSportsProvider smoke test", () => {
    const provider = new ApiSportsProvider(apiKey);

    it("returns live matches", async () => {
      const matches = await provider.getLiveMatches();
      assert.ok(Array.isArray(matches));
    });

    it("returns matches for a date", async () => {
      const matches = await provider.getMatches({ date: "2026-08-22" });
      assert.ok(Array.isArray(matches));
    });

    it("returns null for an invalid match id", async () => {
      const match = await provider.getMatch("999999999");
      assert.strictEqual(match, null);
    });

    it("normalizes a match into domain model", async () => {
      const matches = await provider.getMatches({ date: "2026-08-22" });
      if (matches.length > 0) {
        const m = matches[0];
        assert.ok(typeof m.id === "string");
        assert.ok(typeof m.status === "string");
        assert.ok(
          ["scheduled", "live", "halftime", "finished", "postponed", "cancelled"].includes(
            m.status
          )
        );
        assert.ok(typeof m.homeTeam.name === "string");
        assert.ok(typeof m.awayTeam.name === "string");
      }
    });
  });
}
