import { Suspense } from "react";
import { getSportsSnapshot } from "@/lib/api/snapshot";
import LeaguesClient from "./LeaguesClient";
import LiveHeader from "@/components/live/LiveHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ErrorState from "@/components/ui/ErrorState";

export const metadata = {
  title: "Leagues — VELOR",
  description: "Discover leagues and competitions.",
};

function ProviderUnavailable() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="LEAGUES" subtitle="Discover leagues and competitions." showLiveIndicator={false} />
      <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load league data. Please try again." />
    </div>
  );
}

function ProviderMisconfigured() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="LEAGUES" subtitle="Discover leagues and competitions." showLiveIndicator={false} />
      <ErrorState
        title="SPORTS DATA UNAVAILABLE"
        description="Real API mode is requested but the API key is not configured on the server."
        showRetry={false}
      />
    </div>
  );
}

export default async function LeaguesPage() {
  return (
    <Suspense
      fallback={
        <div>
          <LiveHeader title="LEAGUES" subtitle="Discover leagues and competitions." showLiveIndicator={false} />
          <div className="px-4 sm:px-6 lg:px-10 py-6">
            <LoadingSkeleton lines={3} />
          </div>
        </div>
      }
    >
      <LeaguesContent />
    </Suspense>
  );
}

async function LeaguesContent() {
  let snapshot;
  try {
    // Canonical dataset shared with every other page.
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
    <LeaguesClient
      initialLeagues={snapshot.leagues}
      syncedAt={snapshot.syncedAt}
      degraded={snapshot.degraded}
      unavailableSports={snapshot.unavailableSports}
    />
  );
}
