import { Suspense } from "react";
import { getSportsSnapshot } from "@/lib/api/snapshot";
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
  let snapshot;
  try {
    // Canonical dataset: teams come from the shared snapshot, which falls
    // back to match participants when a provider exposes no team endpoint
    // (cricket/tennis return [] for getTeams without a search query).
    snapshot = await getSportsSnapshot();
  } catch (error) {
    if (error instanceof Error && error.message.includes("VELOR_API_SPORTS_KEY")) {
      return <ProviderMisconfigured />;
    }
    return <ProviderUnavailable />;
  }

  if (snapshot.misconfigured && !snapshot.hasAnySuccess) {
    return <ProviderMisconfigured />;
  }

  if (!snapshot.hasAnySuccess) {
    return <ProviderUnavailable />;
  }

  return (
    <TeamsClient
      initialTeams={snapshot.teams}
      syncedAt={snapshot.syncedAt}
      degraded={snapshot.degraded}
      unavailableSports={snapshot.unavailableSports}
      teamsDerivedFromMatches={snapshot.teamsDerivedFromMatches}
    />
  );
}
