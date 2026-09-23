import Link from "next/link";
import { createRegistry } from "@/lib/api";
import { findLeague } from "@/lib/api/lookup";
import type { Match, League, Standing } from "@/lib/types/sports";
import { validateLeagueId } from "@/lib/api/validate";
import LeagueHeader from "@/components/league/LeagueHeader";
import LeagueStandings from "@/components/league/LeagueStandings";
import LeagueMatches from "@/components/league/LeagueMatches";
import LiveHeader from "@/components/live/LiveHeader";
import ErrorState from "@/components/ui/ErrorState";

interface LeaguePageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ sport?: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: LeaguePageProps): Promise<{ title: string; description: string }> {
  const { id } = await params;
  const validId = validateLeagueId(id);

  if (!validId) {
    return { title: "League Not Found — VELOR", description: "League not found." };
  }

  try {
    const registry = createRegistry();
    const result = await findLeague(registry, validId);
    if (!result) {
      return { title: "League Not Found — VELOR", description: "League not found." };
    }
    return {
        title: `${result.entity.name} — VELOR`,
        description: `${result.entity.name} standings, matches, and league information.`,
    };
  } catch {
    return { title: "League Detail — VELOR", description: "League standings and matches." };
  }
}

function LeagueNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="LEAGUE NOT FOUND" subtitle="The requested league could not be found." showLiveIndicator={false} />
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border-subtle">
        <p className="technical-label mb-2">LEAGUE NOT FOUND</p>
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          The league you are looking for does not exist or is no longer available.
        </p>
        <Link
          href="/leagues"
          className="px-4 py-2 bg-text-primary text-background font-mono text-xs tracking-widest hover:opacity-90 transition-opacity"
        >
          BACK TO LEAGUES
        </Link>
      </div>
    </div>
  );
}

function ProviderUnavailable() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="LEAGUE DETAIL" subtitle="League standings and matches." showLiveIndicator={false} />
      <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load league data. Please try again." />
    </div>
  );
}

function ProviderMisconfigured() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="LEAGUE DETAIL" subtitle="League standings and matches." showLiveIndicator={false} />
      <ErrorState
        title="SPORTS DATA UNAVAILABLE"
        description="Real API mode is requested but the API key is not configured on the server."
        showRetry={false}
      />
    </div>
  );
}

export default async function LeaguePage({ params, searchParams }: LeaguePageProps) {
  const { id } = await params;
  const validId = validateLeagueId(id);

  if (!validId) {
    return <LeagueNotFound />;
  }

  let league: League | null = null;
  let matches: Match[] = [];
  let standings: Standing[] = [];
  let teamNames: Record<string, string> = {};
  let providerResult: Awaited<ReturnType<typeof findLeague>> = null;
  let hasError = false;
  let misconfigured = false;
  let notFound = false;

  try {
    const registry = createRegistry();
    const sportParam = searchParams ? (await searchParams).sport : undefined;
    const sportId = Array.isArray(sportParam) ? sportParam[0] : sportParam;
    providerResult = await findLeague(registry, validId, sportId);
    if (!providerResult) throw new Error("LEAGUE_NOT_FOUND");
    const provider = providerResult.provider;
    const [leagueResult, matchesResult] = await Promise.all([
      provider.getLeague(validId),
      provider.getMatches({ leagueId: validId }),
    ]);
    league = leagueResult;
    matches = matchesResult;

    if (league) {
      try {
        standings = await provider.getStandings({ leagueId: validId });
      } catch {
        standings = [];
      }
    }

    if (standings.length > 0 && matches.length > 0) {
      teamNames = {};
      for (const match of matches) {
        teamNames[match.homeTeam.id] = match.homeTeam.name;
        teamNames[match.awayTeam.id] = match.awayTeam.name;
      }
    }
  } catch (error) {
    notFound = error instanceof Error && error.message === "LEAGUE_NOT_FOUND";
    hasError = !notFound;
    if (error instanceof Error && error.message.includes("VELOR_API_SPORTS_KEY")) {
      misconfigured = true;
    }
  }

  if (misconfigured) {
    return <ProviderMisconfigured />;
  }

  if (notFound) {
    return <LeagueNotFound />;
  }

  if (hasError) {
    return <ProviderUnavailable />;
  }

  if (!league) {
    return <LeagueNotFound />;
  }

  const standingsWithGD = standings.map((s) => ({
    ...s,
    goalDifference: (s.goalsFor ?? 0) - (s.goalsAgainst ?? 0),
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LeaguePageContent league={league} matches={matches} standings={standingsWithGD} teamNames={teamNames} />
    </div>
  );
}

function LeaguePageContent({ league, matches, standings, teamNames }: { league: League; matches: Match[]; standings: Standing[]; teamNames: Record<string, string> }) {
  const liveMatches = matches.filter((m) => m.status === "live" || m.status === "halftime");
  const upcomingMatches = matches.filter((m) => m.status === "scheduled");
  const finishedMatches = matches.filter((m) => m.status === "finished");

  return (
    <>
      <LiveHeader
        title="LEAGUE DETAIL"
        subtitle={league.name}
        showLiveIndicator={false}
      />
      <LeagueHeader league={league} />

      {standings.length > 0 && (
        <section className="border-b border-border-subtle">
          <div className="px-4 sm:px-6 lg:px-10 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="technical-label">STANDINGS</h2>
              <span className="text-xs text-text-secondary font-mono">
                {standings.length} TEAMS
              </span>
            </div>
            <LeagueStandings standings={standings} teamNames={teamNames} getTeamHref={(teamId) => `/team/${teamId}`} showGD={true} sportId={league.sportId} />
          </div>
        </section>
      )}

      <LeagueMatches matches={matches} />

      <div className="px-4 sm:px-6 lg:px-10 py-4 border-t border-border-subtle">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/leagues"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors"
          >
            <span aria-hidden="true">←</span>
            BACK TO LEAGUES
          </Link>
          <div className="flex items-center gap-4 text-xs text-text-secondary font-mono">
            {liveMatches.length > 0 && (
              <span>
                <span className="text-live">{liveMatches.length}</span> LIVE
              </span>
            )}
            {upcomingMatches.length > 0 && (
              <span>
                <span className="text-text-primary">{upcomingMatches.length}</span> UPCOMING
              </span>
            )}
            {finishedMatches.length > 0 && (
              <span>
                <span className="text-text-primary">{finishedMatches.length}</span> FINISHED
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
