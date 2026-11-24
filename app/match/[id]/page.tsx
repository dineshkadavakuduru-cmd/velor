import Link from "next/link";
import { getMatchDetailSource } from "@/lib/api/match-detail-source";
import { getFirstValue, validateMatchId } from "@/lib/api/validate";
import MatchDetail from "@/components/match/MatchDetail";
import LiveHeader from "@/components/live/LiveHeader";
import ErrorState from "@/components/ui/ErrorState";
import DataFreshness from "@/components/ui/DataFreshness";
import LivePageRefresh from "@/components/live/LivePageRefresh";
import { isLiveMatch } from "@/lib/api/snapshot-helpers";

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ sport?: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: MatchDetailPageProps): Promise<{ title: string; description: string }> {
  const { id } = await params;
  const validId = validateMatchId(id);

  if (!validId) {
    return { title: "Match Not Found — VELOR", description: "Match not found." };
  }

  try {
    const result = await getMatchDetailSource(validId, getFirstValue((await searchParams)?.sport));
    if (!result) {
      return { title: "Match Not Found — VELOR", description: "Match not found." };
    }
    return {
        title: `${result.match.homeTeam.name} vs ${result.match.awayTeam.name} — VELOR`,
        description: `Match details for ${result.match.homeTeam.name} vs ${result.match.awayTeam.name} in ${result.match.league.name}.`,
    };
  } catch {
    return { title: "Match Detail — VELOR", description: "Match details and live scores." };
  }
}

function MatchNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="MATCH NOT FOUND" subtitle="The requested match could not be found." showLiveIndicator={false} />
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border-subtle">
        <p className="technical-label mb-2">MATCH NOT FOUND</p>
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          The match you are looking for does not exist or is no longer available.
        </p>
        <Link
          href="/matches"
          className="px-4 py-2 bg-text-primary text-background font-mono text-xs tracking-widest hover:opacity-90 transition-opacity"
        >
          BACK TO MATCHES
        </Link>
      </div>
    </div>
  );
}

function ProviderUnavailable() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="MATCH DETAIL" subtitle="Match details and live scores." showLiveIndicator={false} />
      <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load match data. Please try again." />
    </div>
  );
}

function ProviderMisconfigured() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="MATCH DETAIL" subtitle="Match details and live scores." showLiveIndicator={false} />
      <ErrorState
        title="SPORTS DATA UNAVAILABLE"
        description="Real API mode is requested but the API key is not configured on the server."
        showRetry={false}
      />
    </div>
  );
}

export default async function MatchDetailPage({ params, searchParams }: MatchDetailPageProps) {
  const { id } = await params;
  const validId = validateMatchId(id);

  if (!validId) {
    return <MatchNotFound />;
  }

  let source;
  try {
    source = await getMatchDetailSource(validId, getFirstValue((await searchParams)?.sport));
  } catch (error) {
    if (error instanceof Error && error.message.includes("VELOR_API_SPORTS_KEY")) {
      return <ProviderMisconfigured />;
    }
    return <ProviderUnavailable />;
  }
  if (!source) return <MatchNotFound />;

  const { match, provider, syncedAt, stale, degraded } = source;
  const [events, stats, lineups] = await Promise.allSettled([
    provider.getMatchEvents({ matchId: validId }),
    provider.getMatchStatistics({ matchId: validId }),
    provider.getMatchLineups({ matchId: validId }),
  ]);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {(isLiveMatch(match) || (syncedAt && (match.status === "scheduled" || stale || degraded))) && <LivePageRefresh />}
      <LiveHeader
        title="MATCH DETAIL"
        subtitle={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
        showLiveIndicator={false}
      />
      {(syncedAt || stale) && (
        <DataFreshness syncedAt={syncedAt} degraded={degraded} staleUpstream={stale} className="px-4 sm:px-6 lg:px-10 pt-3" />
      )}
      <MatchDetail
        match={match}
        events={events.status === "fulfilled" ? events.value : []}
        stats={stats.status === "fulfilled" ? stats.value : []}
        lineups={lineups.status === "fulfilled" ? lineups.value : []}
      />
      <div className="px-4 sm:px-6 lg:px-10 py-4 border-t border-border-subtle">
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors"
        >
          <span aria-hidden="true">←</span>
          BACK TO MATCHES
        </Link>
      </div>
    </div>
  );
}
