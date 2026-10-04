import { NextResponse } from "next/server";
import { createRegistry } from "@/lib/api";
import { getEnabledSports } from "@/lib/api/sports";
import type { Match } from "@/lib/types/sports";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const registry = createRegistry();
    const sports = getEnabledSports();

    const promises = sports.map((sport) =>
      registry.getProvider(sport.id).getLiveMatches()
    );

    const settledResults = await Promise.allSettled(promises);

    const matches: Match[] = [];
    for (const r of settledResults) {
      if (r.status === "fulfilled") {
        matches.push(...r.value);
      }
    }

    clearTimeout(timeout);
    return NextResponse.json({ matches });
  } catch {
    clearTimeout(timeout);
    return NextResponse.json({ matches: [] }, { status: 500 });
  }
}
