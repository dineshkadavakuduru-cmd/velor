import { Suspense } from "react";
import { createRegistry } from "@/lib/api";
import { getEnabledSports } from "@/lib/api/sports";
import type { Match } from "@/lib/types/sports";
import LiveHeader from "@/components/live/LiveHeader";
import LiveFeedClient from "@/components/live/LiveFeedClient";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export const metadata = {
  title: "Live — VELOR",
  description: "Live scores and match updates.",
};

async function getLiveMatches(): Promise<Match[]> {
  const registry = createRegistry();
  const sports = getEnabledSports();
  const results = await Promise.allSettled(
    sports.map((sport) => registry.getProvider(sport.id).getLiveMatches())
  );
  const matches: Match[] = [];
  let atLeastOneSuccess = false;

  for (const result of results) {
    if (result.status === "fulfilled") {
      atLeastOneSuccess = true;
      matches.push(...result.value);
    }
  }

  if (!atLeastOneSuccess && sports.length > 0) {
    const firstReject = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
    throw firstReject?.reason ?? new Error("SPORTS_DATA_UNAVAILABLE");
  }

  return matches;
}

function ProviderUnavailable() {
  return (
    <>
      <LiveHeader />
      <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load live match data. Please try again." />
    </>
  );
}

function ProviderMisconfigured() {
  return (
    <>
      <LiveHeader />
      <ErrorState
        title="SPORTS DATA UNAVAILABLE"
        description="Real API mode is requested but the API key is not configured on the server."
        showRetry={false}
      />
    </>
  );
}

function LiveMatchesFallback() {
  return (
    <>
      <LiveHeader />
      <div className="px-4 sm:px-6 lg:px-10 py-3 border-b border-border-subtle bg-surface-1/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs text-text-secondary font-mono tracking-widest">Loading matches…</p>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-live" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-live" />
            </span>
            <span className="text-[0.65rem] text-text-secondary font-mono tracking-widest uppercase">
              LIVE SYNC ACTIVE
            </span>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <LoadingSkeleton lines={8} />
      </div>
    </>
  );
}

export default function LivePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Suspense fallback={<LiveMatchesFallback />}>
        <LiveMatches />
      </Suspense>
    </div>
  );
}

async function LiveMatches() {
  let matches: Match[] = [];
  let hasError = false;
  let misconfigured = false;

  try {
    matches = await getLiveMatches();
  } catch (error) {
    hasError = true;
    if (error instanceof Error && error.message.includes("VELOR_API_SPORTS_KEY")) {
      misconfigured = true;
    }
  }

  if (misconfigured) {
    return <ProviderMisconfigured />;
  }

  if (hasError) {
    return <ProviderUnavailable />;
  }

  return <LiveFeedClient initialMatches={matches} />;
}
