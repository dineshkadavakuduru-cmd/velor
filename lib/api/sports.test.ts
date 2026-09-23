import { describe, it } from "node:test";
import assert from "node:assert";
import {
  SPORTS,
  getSport,
  isSportEnabled,
  getEnabledSports,
  getSportDisplayName,
} from "./sports";

describe("sport registry", () => {
  it("contains football", () => {
    assert.ok(SPORTS.football);
    assert.strictEqual(SPORTS.football.id, "football");
    assert.strictEqual(SPORTS.football.name, "Football");
    assert.strictEqual(SPORTS.football.category, "team");
    assert.strictEqual(SPORTS.football.enabled, true);
  });

  it("contains basketball", () => {
    assert.ok(SPORTS.basketball);
    assert.strictEqual(SPORTS.basketball.id, "basketball");
    assert.strictEqual(SPORTS.basketball.name, "Basketball");
    assert.strictEqual(SPORTS.basketball.category, "team");
  });

  it("contains cricket", () => {
    assert.ok(SPORTS.cricket);
    assert.strictEqual(SPORTS.cricket.id, "cricket");
    assert.strictEqual(SPORTS.cricket.name, "Cricket");
  });

  it("contains tennis", () => {
    assert.ok(SPORTS.tennis);
    assert.strictEqual(SPORTS.tennis.id, "tennis");
    assert.strictEqual(SPORTS.tennis.category, "individual");
  });

  it("returns sport by id", () => {
    const sport = getSport("football");
    assert.ok(sport);
    assert.strictEqual(sport!.id, "football");
  });

  it("returns undefined for unknown sport", () => {
    assert.strictEqual(getSport("unknown-sport"), undefined);
  });

  it("reports enabled status correctly", () => {
    assert.strictEqual(isSportEnabled("football"), true);
    assert.strictEqual(isSportEnabled("basketball"), true);
    assert.strictEqual(isSportEnabled("cricket"), true);
    assert.strictEqual(isSportEnabled("tennis"), true);
    assert.strictEqual(isSportEnabled("baseball"), false);
    assert.strictEqual(isSportEnabled("hockey"), false);
    assert.strictEqual(isSportEnabled("unknown"), false);
  });

  it("returns enabled sports", () => {
    const enabled = getEnabledSports();
    assert.ok(enabled.length >= 4);
    assert.ok(enabled.some((s) => s.id === "football"));
    assert.ok(enabled.some((s) => s.id === "basketball"));
    assert.ok(enabled.some((s) => s.id === "cricket"));
    assert.ok(enabled.some((s) => s.id === "tennis"));
  });

  it("returns display names", () => {
    assert.strictEqual(getSportDisplayName("football"), "Football");
    assert.strictEqual(getSportDisplayName("basketball"), "Basketball");
    assert.strictEqual(getSportDisplayName("unknown"), "unknown");
  });
});
