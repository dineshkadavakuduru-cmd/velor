/**
 * Safe diagnostic error types for sports API providers.
 *
 * These errors are designed to carry diagnostic information useful for
 * development logs (provider name, endpoint, HTTP status, sanitized
 * message, timeout/network failure) while NEVER exposing API keys,
 * authorization headers, or any secret material.
 *
 * All provider names, endpoints, and status codes referenced in a
 * message are non-sensitive operational metadata.
 */

const PROVIDER_TAG = "[SportsAPI]";

export type SportsApiErrorKind =
  | "AUTH_FAILURE"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "NETWORK_FAILURE"
  | "MALFORMED_RESPONSE"
  | "API_ERROR"
  | "UNKNOWN";

export interface SportsApiErrorMeta {
  provider: string;
  endpoint: string;
  status?: number;
  kind: SportsApiErrorKind;
  /**
   * Sanitized, human-readable detail. Never contains API keys, tokens,
   * authorization headers, or raw response bodies that may include them.
   */
  detail: string;
}

/**
 * A safe, diagnostic-friendly error thrown by sports providers.
 *
 * The `meta` field carries structured diagnostics without secrets.
 * ToS: nothing sensitive is ever placed in `message` or `meta.detail`.
 */
export class SportsApiError extends Error {
  public readonly meta: SportsApiErrorMeta;
  public readonly cause?: unknown;

  constructor(meta: SportsApiErrorMeta, cause?: unknown) {
    const safeMessage = `${PROVIDER_TAG} ${meta.provider}: ${meta.kind} ${
      meta.endpoint
    }${meta.status ? ` (HTTP ${meta.status})` : ""} — ${meta.detail}`;
    super(safeMessage);
    this.name = "SportsApiError";
    this.meta = meta;
    this.cause = cause;
  }

  toJSON(): SportsApiErrorMeta & { error: true } {
    return { error: true, ...this.meta };
  }
}

/**
 * Build a diagnostic error from a thrown value during an API fetch.
 * Extracts HTTP status, message, and timeout/network context without
 * ever referencing secrets.
 */
export function buildSportsApiError(
  provider: string,
  endpoint: string,
  error: unknown
): SportsApiError {
  if (error instanceof SportsApiError) {
    return error;
  }

  // Fetch/network layer: AbortError => timeout
  if (error instanceof Error && error.name === "AbortError") {
    return new SportsApiError(
      {
        provider,
        endpoint,
        kind: "TIMEOUT",
        detail: "Request exceeded the configured timeout.",
      }
    );
  }

  // TypeError from fetch => network failure
  if (error instanceof TypeError) {
    return new SportsApiError(
      {
        provider,
        endpoint,
        kind: "NETWORK_FAILURE",
        detail: "Network request failed.",
      },
      error
    );
  }

  // Errors thrown by our own api helper carry status in the message
  const message = error instanceof Error ? error.message : String(error);

  if (message === "AUTH_FAILURE") {
    return new SportsApiError(
      {
        provider,
        endpoint,
        kind: "AUTH_FAILURE",
        detail: "Invalid or missing authentication credentials.",
      }
    );
  }

  if (message === "RATE_LIMIT") {
    return new SportsApiError(
      {
        provider,
        endpoint,
        kind: "RATE_LIMIT",
        detail: "API rate limit exceeded.",
      }
    );
  }

  if (message === "TIMEOUT") {
    return new SportsApiError(
      {
        provider,
        endpoint,
        kind: "TIMEOUT",
        detail: "Request exceeded the configured timeout.",
      }
    );
  }

  if (message === "MALFORMED_RESPONSE") {
    return new SportsApiError(
      {
        provider,
        endpoint,
        kind: "MALFORMED_RESPONSE",
        detail: "Response body could not be parsed as JSON.",
      }
    );
  }

  // API_ERROR:<status> sentinel
  if (message.startsWith("API_ERROR:")) {
    const statusStr = message.split(":")[1] ?? "0";
    const status = parseInt(statusStr, 10);
    return new SportsApiError(
      {
        provider,
        endpoint,
        status,
        kind: "API_ERROR",
        detail: `HTTP ${status} response from upstream provider.`,
      }
    );
  }

  return new SportsApiError(
    {
      provider,
      endpoint,
      kind: "UNKNOWN",
      detail: "Unexpected error during API request.",
    },
    error
  );
}

/**
 * Log a provider error to stderr for development diagnostics.
 * Sanitizes: never logs API keys, headers, or raw secret payloads.
 */
export function logProviderError(error: unknown): void {
  const wrapped = error instanceof SportsApiError ? error : undefined;
  if (wrapped) {
    const m = wrapped.meta;
    console.error(
      `${PROVIDER_TAG} ${m.provider} endpoint=${m.endpoint} kind=${m.kind}` +
        `${m.status ? ` status=${m.status}` : ""}` +
        ` detail="${m.detail}"`
    );
    return;
  }
  // Fallback for unexpected errors — log message only, never the body
  console.error(`${PROVIDER_TAG} ${error instanceof Error ? error.message : String(error)}`);
}
