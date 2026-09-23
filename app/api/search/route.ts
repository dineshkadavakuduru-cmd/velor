import { NextResponse } from "next/server";
import { createProvider } from "@/lib/api";
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

    const provider = createProvider();
    const results = await Promise.race([
      provider.search({ query, limit: 20 }),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () => reject(new Error("SEARCH_TIMEOUT")));
      }),
    ]);
    const searchResults = results as Awaited<ReturnType<typeof provider.search>>;
    const filtered = searchResults.filter((r) => {
      const q = query.toLowerCase();
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
