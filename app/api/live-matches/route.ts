import { NextResponse } from "next/server";
import { getSportsSnapshot } from "@/lib/api/snapshot";
import { buildLiveMatchesResponse } from "@/lib/api/live-response";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * Live-matches polling endpoint. Returns the SAME canonical live dataset as
 * the /live page, homepage hero, and /matches (snapshot.matches filtered to
 * live), plus sync metadata so the client can show freshness honestly.
 *
 * Status codes are honest:
 *   200 — data (possibly partial; see `degraded` / `unavailableSports`)
 *   503 — no sport returned data (all providers failed)
 *   500 — misconfigured server (missing API key in real-API mode)
 */
export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const snapshot = await getSportsSnapshot();
    clearTimeout(timeout);

    // Status codes and counts come from the pure, unit-tested contract in
    // lib/api/live-response.ts: 200 data (possibly degraded), 503 no sport
    // reachable, 500 misconfigured.
    const { status, body } = buildLiveMatchesResponse(snapshot);
    return NextResponse.json(body, { status });
  } catch {
    clearTimeout(timeout);
    return NextResponse.json(
      {
        matches: [],
        syncedAt: new Date().toISOString(),
        degraded: false,
        unavailableSports: [],
        error: "SPORTS_DATA_UNAVAILABLE",
        message: "Live match data could not be loaded.",
      },
      { status: 503 }
    );
  }
}
