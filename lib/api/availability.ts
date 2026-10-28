import { SportsApiError } from "./error";

/**
 * Pure provider-failure classification shared by the snapshot assembler and
 * the search response, so both describe a failed provider identically.
 * Kept free of Next/React imports (and of path aliases) so any data-layer
 * module can use it without pulling in the whole snapshot module.
 */

export type SportSyncState = "ok" | "unavailable" | "misconfigured";

export function classifyError(error: unknown): { state: SportSyncState; errorKind?: string } {
  if (error instanceof SportsApiError) {
    return { state: "unavailable", errorKind: error.meta.kind };
  }
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("VELOR_API_SPORTS_KEY")) {
    return { state: "misconfigured" };
  }
  if (message.includes("RATE_LIMIT")) {
    return { state: "unavailable", errorKind: "RATE_LIMIT" };
  }
  if (message.includes("AUTH_FAILURE")) {
    return { state: "unavailable", errorKind: "AUTH_FAILURE" };
  }
  if (message.includes("TIMEOUT")) {
    return { state: "unavailable", errorKind: "TIMEOUT" };
  }
  if (message.includes("MALFORMED_RESPONSE")) {
    return { state: "unavailable", errorKind: "MALFORMED_RESPONSE" };
  }
  const apiError = message.match(/API_ERROR:(\d+)/);
  if (apiError) {
    return { state: "unavailable", errorKind: `API_ERROR_${apiError[1]}` };
  }
  return { state: "unavailable", errorKind: "UNKNOWN" };
}
