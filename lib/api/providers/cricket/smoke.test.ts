import { describe, it } from "node:test";
import assert from "node:assert";
import { CricketProvider } from "./CricketProvider";

const apiKey = process.env.VELOR_CRICKET_API_KEY;

if (!apiKey) {
  // Skipping CricketProvider smoke test: VELOR_CRICKET_API_KEY is not set.
} else {
  describe("CricketProvider smoke test", () => {
    const provider = new CricketProvider(apiKey);

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
          ["scheduled", "live", "halftime", "finished", "postponed", "cancelled", "abandoned", "break"].includes(
            m.status
          )
        );
        assert.ok(typeof m.homeTeam.name === "string");
        assert.ok(typeof m.awayTeam.name === "string");
        assert.strictEqual(m.sport.id, "cricket");
        assert.strictEqual(m.sport.name, "Cricket");
      }
    });
  });
}
