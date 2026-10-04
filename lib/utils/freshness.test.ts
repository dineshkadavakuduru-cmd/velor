import { describe, it } from "node:test";
import assert from "node:assert";
import {
  formatIST,
  formatUpdatedLine,
  formatLastSyncLine,
  isStaleSync,
} from "./freshness";

describe("freshness", () => {
  it("formats an IST timestamp line", () => {
    // 2026-10-04T15:48:00Z == 21:18 IST (UTC+5:30)
    assert.strictEqual(formatIST("2026-10-04T15:48:00Z"), "21:18 IST");
    assert.strictEqual(formatUpdatedLine("2026-10-04T15:48:00Z"), "Updated 21:18 IST");
    assert.strictEqual(
      formatLastSyncLine("2026-10-04T15:48:00Z"),
      "Last successful sync: 21:18 IST"
    );
  });

  it("falls back honestly for missing/invalid timestamps", () => {
    assert.strictEqual(formatIST(undefined), "--:-- IST");
    assert.strictEqual(formatIST("not-a-date"), "--:-- IST");
    assert.strictEqual(isStaleSync(undefined), true);
    assert.strictEqual(isStaleSync("not-a-date"), true);
  });

  it("flags snapshots older than the threshold as stale", () => {
    const old = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const fresh = new Date().toISOString();
    assert.strictEqual(isStaleSync(old, 15), true);
    assert.strictEqual(isStaleSync(fresh, 15), false);
  });
});
