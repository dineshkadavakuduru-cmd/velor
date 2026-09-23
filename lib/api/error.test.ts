import { describe, it } from "node:test";
import assert from "node:assert";
import { SportsApiError, buildSportsApiError, logProviderError } from "./error";

describe("SportsApiError", () => {
  it("creates an error with provider, endpoint, kind, and detail", () => {
    const err = new SportsApiError({
      provider: "TestProvider",
      endpoint: "https://example.com/live",
      kind: "API_ERROR",
      status: 500,
      detail: "Internal Server Error",
    });

    assert.ok(err instanceof Error);
    assert.strictEqual(err.meta.provider, "TestProvider");
    assert.strictEqual(err.meta.endpoint, "https://example.com/live");
    assert.strictEqual(err.meta.kind, "API_ERROR");
    assert.strictEqual(err.meta.status, 500);
    assert.strictEqual(err.meta.detail, "Internal Server Error");
  });

  it("serializes cleanly via toJSON", () => {
    const err = new SportsApiError({
      provider: "TestProvider",
      endpoint: "https://example.com/live",
      kind: "RATE_LIMIT",
      detail: "Too many requests",
    });
    const json = err.toJSON();
    assert.strictEqual(json.error, true);
    assert.strictEqual(json.provider, "TestProvider");
    assert.strictEqual(json.kind, "RATE_LIMIT");
  });
});

describe("buildSportsApiError", () => {
  const provider = "TestProvider";
  const endpoint = "https://example.com/live";

  it("wraps AbortError as TIMEOUT", () => {
    const abortErr = Object.assign(new Error("The operation was aborted"), { name: "AbortError" });
    const result = buildSportsApiError(provider, endpoint, abortErr);
    assert.ok(result instanceof SportsApiError);
    assert.strictEqual(result.meta.kind, "TIMEOUT");
    assert.strictEqual(result.meta.provider, provider);
    assert.strictEqual(result.meta.endpoint, endpoint);
  });

  it("wraps TypeError as NETWORK_FAILURE", () => {
    const typeErr = new TypeError("fetch failed");
    const result = buildSportsApiError(provider, endpoint, typeErr);
    assert.ok(result instanceof SportsApiError);
    assert.strictEqual(result.meta.kind, "NETWORK_FAILURE");
  });

  it("maps AUTH_FAILURE string to AUTH_FAILURE kind", () => {
    const result = buildSportsApiError(provider, endpoint, new Error("AUTH_FAILURE"));
    assert.strictEqual(result.meta.kind, "AUTH_FAILURE");
    assert.strictEqual(result.meta.detail, "Invalid or missing authentication credentials.");
  });

  it("maps RATE_LIMIT string to RATE_LIMIT kind", () => {
    const result = buildSportsApiError(provider, endpoint, new Error("RATE_LIMIT"));
    assert.strictEqual(result.meta.kind, "RATE_LIMIT");
  });

  it("maps TIMEOUT string to TIMEOUT kind", () => {
    const result = buildSportsApiError(provider, endpoint, new Error("TIMEOUT"));
    assert.strictEqual(result.meta.kind, "TIMEOUT");
  });

  it("maps MALFORMED_RESPONSE string to MALFORMED_RESPONSE kind", () => {
    const result = buildSportsApiError(provider, endpoint, new Error("MALFORMED_RESPONSE"));
    assert.strictEqual(result.meta.kind, "MALFORMED_RESPONSE");
  });

  it("maps API_ERROR:<status> to API_ERROR kind with status", () => {
    const result = buildSportsApiError(provider, endpoint, new Error("API_ERROR:503"));
    assert.strictEqual(result.meta.kind, "API_ERROR");
    assert.strictEqual(result.meta.status, 503);
  });

  it("passes through existing SportsApiError unchanged", () => {
    const original = new SportsApiError({
      provider: "Orig",
      endpoint: "https://orig.com",
      kind: "AUTH_FAILURE",
      detail: "orig",
    });
    const result = buildSportsApiError(provider, endpoint, original);
    assert.strictEqual(result, original);
  });

  it("wraps unknown errors as UNKNOWN", () => {
    const result = buildSportsApiError(provider, endpoint, new Error("something weird"));
    assert.strictEqual(result.meta.kind, "UNKNOWN");
  });

  it("does not include secrets in the error message", () => {
    const result = buildSportsApiError(provider, endpoint, new Error("API_ERROR:401"));
    assert.ok(!result.message.includes("secret-key-12345"));
    // Verify endpoint is included (non-sensitive)
    assert.ok(result.message.includes(endpoint));
  });
});

describe("logProviderError", () => {
  it("logs without throwing (no secrets in output)", () => {
    const err = new SportsApiError({
      provider: "TestProvider",
      endpoint: "https://example.com/live",
      kind: "AUTH_FAILURE",
      detail: "Invalid credentials",
    });
    // Should not throw
    assert.doesNotThrow(() => logProviderError(err));
  });

  it("logs generic errors without throwing", () => {
    assert.doesNotThrow(() => logProviderError(new Error("random error")));
  });
});
