import { NextResponse } from "next/server";
import { createRegistry } from "@/lib/api";
import { getEnabledSports } from "@/lib/api/sports";
import type { SearchResult } from "@/lib/types/sports";
import { validateSearchQuery } from "@/lib/api/validate";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function GET(request: Request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const url = new URL(request.url);
    const query = validateSearchQuery(url.searchParams.get("q") ?? "");

    if (!query) {
      clearTimeout(timeout);
      return NextResponse.json({ query: "", results: [], total: 0 });
    }

    const registry = createRegistry();
    const enabledSports = getEnabledSports();
    const searchPromises = enabledSports.map((sport) =>
      registry.getProvider(sport.id).search({ query, limit: 15 })
    );

    const settledResults = await Promise.race([
      Promise.allSettled(searchPromises),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () => reject(new Error("SEARCH_TIMEOUT")));
      }),
    ]);

    const allResults: SearchResult[] = [];
    const seen = new Set<string>();

    for (const r of settledResults) {
      if (r.status === "fulfilled") {
        for (const item of r.value) {
          const key = `${item.type}:${item.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            allResults.push(item);
          }
        }
      }
    }

    const q = query.toLowerCase();
    const filtered = allResults.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) ||
        r.subtitle?.toLowerCase().includes(q)
      );
    });

    clearTimeout(timeout);
    return NextResponse.json({ query, results: filtered, total: filtered.length });
  } catch {
    clearTimeout(timeout);
    return NextResponse.json(
      { results: [], total: 0 },
      { status: 500 }
    );
  }
}
