import { NextResponse } from "next/server";
import { createRegistry } from "@/lib/api";
import { getEnabledSports } from "@/lib/api/sports";
import { validateSearchQuery } from "@/lib/api/validate";
import {
  buildSearchPayload,
  type SearchSourceOutcome,
} from "@/lib/api/search-response";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function GET(request: Request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const url = new URL(request.url);
    const query = validateSearchQuery(url.searchParams.get("q") ?? "");

    if (!query) {
      return NextResponse.json(buildSearchPayload("", []));
    }

    const registry = createRegistry();
    const enabledSports = getEnabledSports();

    const settled = await Promise.race([
      Promise.allSettled(
        enabledSports.map((sport) => registry.getProvider(sport.id).search({ query, limit: 15 }))
      ),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () => reject(new Error("SEARCH_TIMEOUT")));
      }),
    ]);

    // A failing provider must not blank the whole palette: report which sports
    // could not be searched alongside whatever the other providers returned.
    const outcomes: SearchSourceOutcome[] = settled.map((result, index) => {
      const sport = enabledSports[index];
      return result.status === "fulfilled"
        ? {
            sportId: sport.id,
            sportName: sport.name,
            status: "fulfilled",
            results: result.value,
          }
        : {
            sportId: sport.id,
            sportName: sport.name,
            status: "rejected",
            reason: result.reason,
          };
    });

    return NextResponse.json(buildSearchPayload(query, outcomes));
  } catch {
    return NextResponse.json(
      {
        query: "",
        results: [],
        total: 0,
        unavailableSports: [],
        error: "SEARCH_UNAVAILABLE",
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
