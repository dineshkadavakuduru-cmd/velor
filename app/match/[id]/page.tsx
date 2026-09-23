import Link from "next/link";
import { createRegistry } from "@/lib/api";
import { findMatch } from "@/lib/api/lookup";
import type { Match, MatchEvent, MatchStatistics, MatchLineup } from "@/lib/types/sports";
import { validateMatchId } from "@/lib/api/validate";
import MatchDetail from "@/components/match/MatchDetail";
import LiveHeader from "@/components/live/LiveHeader";
import ErrorState from "@/components/ui/ErrorState";

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ sport?: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: MatchDetailPageProps): Promise<{ title: string; description: string }> {
  const { id } = await params;
  const validId = validateMatchId(id);

  if (!validId) {
    return { title: "Match Not Found — VELOR", description: "Match not found." };
  }

  try {
    const registry = createRegistry();
    const result = await findMatch(registry, validId);
    if (!result) {
      return { title: "Match Not Found — VELOR", description: "Match not found." };
    }
    return {
        title: `${result.entity.homeTeam.name} vs ${result.entity.awayTeam.name} — VELOR`,
        description: `Match details for ${result.entity.homeTeam.name} vs ${result.entity.awayTeam.name} in ${result.entity.league.name}.`,
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

  let match: Match | null = null;
  let events: MatchEvent[] = [];
  let stats: MatchStatistics[] = [];
  let lineups: MatchLineup[] = [];
  let providerResult: Awaited<ReturnType<typeof findMatch>> = null;
  let hasError = false;
  let misconfigured = false;
  let notFound = false;

  try {
    const registry = createRegistry();
    const sportParam = searchParams ? (await searchParams).sport : undefined;
    const sportId = Array.isArray(sportParam) ? sportParam[0] : sportParam;
    providerResult = await findMatch(registry, validId, sportId);
    if (!providerResult) throw new Error("MATCH_NOT_FOUND");
    const provider = providerResult.provider;
    const [matchResult, eventsResult, statsResult, lineupsResult] = await Promise.all([
      provider.getMatch(validId),
      provider.getMatchEvents({ matchId: validId }),
      provider.getMatchStatistics({ matchId: validId }),
      provider.getMatchLineups({ matchId: validId }),
    ]);
    match = matchResult;
    events = eventsResult;
    stats = statsResult;
    lineups = lineupsResult;
  } catch (error) {
    notFound = error instanceof Error && error.message === "MATCH_NOT_FOUND";
    hasError = !notFound;
    if (error instanceof Error && error.message.includes("VELOR_API_SPORTS_KEY")) {
      misconfigured = true;
    }
  }

  if (misconfigured) {
    return <ProviderMisconfigured />;
  }

  if (notFound) {
    return <MatchNotFound />;
  }

  if (hasError) {
    return <ProviderUnavailable />;
  }

  if (!match) {
    return <MatchNotFound />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MatchDetailContent match={match} events={events} stats={stats} lineups={lineups} />
    </div>
  );
}

function MatchDetailContent({ match, events, stats, lineups }: { match: Match; events: MatchEvent[]; stats: MatchStatistics[]; lineups: MatchLineup[] }) {
  return (
    <>
      <LiveHeader
        title="MATCH DETAIL"
        subtitle={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
        showLiveIndicator={false}
      />
      <MatchDetail match={match} stats={stats} events={events} lineups={lineups} />
      <div className="px-4 sm:px-6 lg:px-10 py-4 border-t border-border-subtle">
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors"
        >
          <span aria-hidden="true">←</span>
          BACK TO MATCHES
        </Link>
      </div>
    </>
  );
}
