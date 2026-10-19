import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import {
  fetchWithLastGood,
  runWithStaleCollection,
  __resetLastGoodStore,
  __setLastGoodForTest,
  __peekLastGood,
  __lastGoodStoreSize,
} from "./last-good";

beforeEach(() => {
  __resetLastGoodStore();
});

describe("fetchWithLastGood", () => {
  it("records successful non-empty payloads", async () => {
    const data = await fetchWithLastGood<number[]>({
      provider: "TestProvider",
      endpoint: "https://upstream/data?count=1",
      run: async () => [1, 2, 3],
    });
    assert.deepStrictEqual(data, [1, 2, 3]);
    assert.ok(__peekLastGood("TestProvider:https://upstream/data?count=1"));
  });

  it("never caches an empty array payload", async () => {
    await assert.rejects(
      fetchWithLastGood<number[]>({
        provider: "TestProvider",
        endpoint: "https://upstream/data?empty",
        run: async () => {
          throw new Error("HTTP 500 from upstream.");
        },
      })
    );
    assert.strictEqual(__lastGoodStoreSize(), 0);
  });

  it("keeps the previous good payload when a fresh response is empty", async () => {
    const key = "TestProvider:https://upstream/data?ration";
    __setLastGoodForTest(key, [9, 9], Date.now());
    await fetchWithLastGood<number[]>({
      provider: "TestProvider",
      endpoint: "https://upstream/data?ration",
      run: async () => [],
    });
    assert.deepStrictEqual(__peekLastGood(key)?.data, [9, 9]);
  });

  it("fallbacks to last-known-good on failure and records staleness in the request-local collector", async () => {
    const endpoint = "https://upstream/data?fallback";
    await fetchWithLastGood<number[]>({
      provider: "TestProvider",
      endpoint,
      run: async () => [7],
    });

    const staleSet = new Set<string>();
    const served = await runWithStaleCollection(staleSet, () =>
      fetchWithLastGood<number[]>({
        provider: "TestProvider",
        endpoint,
        run: async () => {
          throw new Error("HTTP 503 from upstream.");
        },
      })
    );
    assert.deepStrictEqual(served, [7]);
    assert.ok(staleSet.has(`TestProvider:${endpoint}`));
  });

  it("rethrows when no last-good payload exists and the upstream fails", async () => {
    await assert.rejects(
      fetchWithLastGood({
        provider: "LonelyProvider",
        endpoint: "https://upstream/first-fail",
        run: async () => {
          throw new Error("HTTP 500 from upstream.");
        },
      }),
      /HTTP 500/
    );
  });

  it("refuses to serve an expired fallback", async () => {
    const endpoint = "https://upstream/data?expired";
    __setLastGoodForTest(`ExpiredProvider:${endpoint}`, [1], Date.now() - 7 * 60 * 60 * 1000);
    await assert.rejects(
      fetchWithLastGood({
        provider: "ExpiredProvider",
        endpoint,
        run: async () => {
          throw new Error("HTTP 500 from upstream.");
        },
      })
    );
  });

  it("isolates staleness marking between concurrent requests", async () => {
    const endpoint = "https://upstream/data?concurrency";
    await fetchWithLastGood<string[]>({
      provider: "TestProvider",
      endpoint,
      run: async () => ["good"],
    });

    const setA = new Set<string>();
    const setB = new Set<string>();
    const [a, b] = await Promise.all([
      runWithStaleCollection(setA, () =>
        fetchWithLastGood<string[]>({
          provider: "TestProvider",
          endpoint,
          run: async () => {
            throw new Error("HTTP 500 from upstream.");
          },
        })
      ),
      runWithStaleCollection(setB, () =>
        fetchWithLastGood<string[]>({
          provider: "TestProvider",
          endpoint,
          run: async () => ["fresh"],
        })
      ),
    ]);
    assert.deepStrictEqual(a, ["good"]);
    assert.deepStrictEqual(b, ["fresh"]);
    assert.ok(setA.has(`TestProvider:${endpoint}`));
    assert.strictEqual(setB.size, 0);
  });
});
