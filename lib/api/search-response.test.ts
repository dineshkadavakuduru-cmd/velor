import { describe, it } from "node:test";
import assert from "node:assert";
import { buildSearchPayload, sportSearchHref } from "./search-response";
import type { SearchSourceOutcome } from "./search-response";
import type { SearchResult } from "@/lib/types/sports";

function fulfilled(sportId: string, sportName: string, results: SearchResult[] = []): SearchSourceOutcome {
  return { sportId, sportName, status: "fulfilled", results };
}

function rejected(sportId: string, sportName: string, reason: unknown): SearchSourceOutcome {
  return { sportId, sportName, status: "rejected", reason };
}

const ENTITY: SearchResult = {
  type: "team",
  id: "42",
  name: "Arsenal",
  subtitle: "Football · England",
  href: "/team/42",
};

describe("buildSearchPayload", () => {
  it("resolves a bare sport name to that sport's match view", () => {
    const payload = buildSearchPayload("tennis", [
      fulfilled("football", "Football"),
      fulfilled("basketball", "Basketball"),
      fulfilled("cricket", "Cricket"),
      fulfilled("tennis", "Tennis"),
    ]);

    assert.strictEqual(payload.total, 1);
    assert.strictEqual(payload.results[0].type, "sport");
    assert.strictEqual(payload.results[0].id, "tennis");
    assert.strictEqual(payload.results[0].name, "Tennis");
    assert.strictEqual(payload.results[0].href, "/matches?sport=tennis");
    assert.strictEqual(payload.results[0].href, sportSearchHref("tennis"));
  });

  it("returns sport targets before entity results", () => {
    const payload = buildSearchPayload("tennis", [fulfilled("tennis", "Tennis", [ENTITY])]);
    assert.deepStrictEqual(
      payload.results.map((result) => result.type),
      ["sport", "team"]
    );
  });

  it("keeps results from healthy providers when another provider fails", () => {
    const payload = buildSearchPayload("arsenal", [
      rejected("football", "Football", new Error("AUTH_FAILURE")),
      fulfilled("cricket", "Cricket", [ENTITY]),
    ]);

    assert.strictEqual(payload.total, 1);
    assert.strictEqual(payload.results[0].name, "Arsenal");
    assert.deepStrictEqual(payload.unavailableSports, [
      { id: "football", name: "Football", errorKind: "AUTH_FAILURE" },
    ]);
  });

  it("marks a failed sport target as unavailable instead of looking empty", () => {
    const payload = buildSearchPayload("basketball", [
      rejected("basketball", "Basketball", new Error("AUTH_FAILURE")),
    ]);

    assert.strictEqual(payload.results.length, 1);
    assert.strictEqual(payload.results[0].type, "sport");
    assert.match(payload.results[0].subtitle ?? "", /live data unavailable/i);
    assert.strictEqual(payload.unavailableSports[0].id, "basketball");
  });

  it("deduplicates entity results repeated across providers", () => {
    const payload = buildSearchPayload("arsenal", [
      fulfilled("football", "Football", [ENTITY]),
      fulfilled("cricket", "Cricket", [ENTITY]),
    ]);

    assert.strictEqual(payload.total, 1);
  });

  it("keeps different teams and distinguishes equal labels when squad metadata is unavailable", () => {
    const first: SearchResult = { ...ENTITY, sportId: "football", name: "Belgium", subtitle: "Football · Belgium" };
    const second: SearchResult = { ...first, id: "43" };
    const otherSport: SearchResult = { ...first, sportId: "basketball", subtitle: "Basketball · Belgium" };
    const payload = buildSearchPayload("belgium", [
      fulfilled("football", "Football", [first, second]),
      fulfilled("basketball", "Basketball", [first, otherSport]),
    ]);
    assert.deepStrictEqual(payload.results.map((result) => result.subtitle), [
      "Football · Belgium · Team ID 42", "Football · Belgium · Team ID 43", "Basketball · Belgium",
    ]);
    assert.strictEqual(first.subtitle, "Football · Belgium");
  });

  it("returns nothing for queries shorter than the minimum length", () => {
    const payload = buildSearchPayload("t", [
      rejected("football", "Football", new Error("AUTH_FAILURE")),
    ]);

    assert.deepStrictEqual(payload, {
      query: "t",
      results: [],
      total: 0,
      unavailableSports: [],
    });
  });

  it("never invents entities for an unmatched query", () => {
    const payload = buildSearchPayload("zzzzz", [fulfilled("tennis", "Tennis")]);
    assert.strictEqual(payload.total, 0);
    assert.deepStrictEqual(payload.unavailableSports, []);
  });
});
