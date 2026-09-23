import { Suspense } from "react";
import { createRegistry } from "@/lib/api";
import { getEnabledSports } from "@/lib/api/sports";
import type { Team } from "@/lib/types/sports";
import TeamsClient from "./TeamsClient";
import LiveHeader from "@/components/live/LiveHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ErrorState from "@/components/ui/ErrorState";

export const metadata = {
  title: "Teams — VELOR",
  description: "Discover teams and their match history.",
};

function ProviderUnavailable() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="TEAMS" subtitle="Discover teams and their match history." showLiveIndicator={false} />
      <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load team data. Please try again." />
    </div>
  );
}

function ProviderMisconfigured() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="TEAMS" subtitle="Discover teams and their match history." showLiveIndicator={false} />
      <ErrorState
        title="SPORTS DATA UNAVAILABLE"
        description="Real API mode is requested but the API key is not configured on the server."
        showRetry={false}
      />
    </div>
  );
}

export default async function TeamsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <LiveHeader title="TEAMS" subtitle="Discover teams and their match history." showLiveIndicator={false} />
          <div className="px-4 sm:px-6 lg:px-10 py-6">
            <LoadingSkeleton lines={3} />
          </div>
        </div>
      }
    >
      <TeamsContent />
    </Suspense>
  );
}

async function TeamsContent() {
  const teams: Team[] = [];
  let hasError = false;
  let misconfigured = false;

  try {
    const registry = createRegistry();
    const results = await Promise.allSettled(
      getEnabledSports().map((sport) => registry.getProvider(sport.id).getTeams())
    );
    for (const result of results) {
      if (result.status === "fulfilled") {
        teams.push(...result.value);
      }
    }
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

  return <TeamsClient initialTeams={teams} />;
}
