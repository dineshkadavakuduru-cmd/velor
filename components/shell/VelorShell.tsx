import { Suspense } from "react";
import { getSportsSnapshot, rankFeaturedLeagues, rankFeaturedTeams } from "@/lib/api/snapshot";
import type { Match } from "@/lib/types/sports";
import IntroClient from "./IntroClient";
import VelorHero from "../hero/VelorHero";
import MatchCard from "../ui/MatchCard";
import TeamCard from "../ui/TeamCard";
import LeagueCard from "../ui/LeagueCard";
import SectionHeader from "../ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import DataFreshness from "@/components/ui/DataFreshness";
import UnavailableSportsNote from "@/components/ui/UnavailableSportsNote";
import LiveTicker from "@/components/live/LiveTicker";
import Link from "next/link";

export default function VelorShell() {
  return (
    <IntroClient>
      <div className="min-h-screen flex flex-col bg-background">
        <LiveTickerWrapper />
        <div className="flex-1 relative overflow-hidden">
          <Suspense
            fallback={
              <div className="flex items-center min-h-[calc(100vh-8rem)]">
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
                  <div className="h-6 w-48 bg-surface-2/60 animate-pulse rounded-sm mb-8" />
                  <div className="h-16 w-full max-w-lg bg-surface-2/60 animate-pulse rounded-sm mb-6" />
                  <div className="h-6 w-full max-w-md bg-surface-2/60 animate-pulse rounded-sm" />
                </div>
              </div>
            }
          >
            <HeroContent />
          </Suspense>
        </div>
        <Suspense
          fallback={
            <div className="px-4 sm:px-6 lg:px-10 py-6 space-y-8">
              <div className="h-6 w-48 bg-surface-2/60 animate-pulse rounded-sm" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border border-border-subtle">
                    <div className="h-4 w-32 bg-surface-2/60 animate-pulse rounded-sm mb-2" />
                    <div className="h-3 w-24 bg-surface-2/60 animate-pulse rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <HomeSections />
        </Suspense>
      </div>
    </IntroClient>
  );
}

async function LiveTickerWrapper() {
  let matches: Match[] = [];

  try {
    const snapshot = await getSportsSnapshot();
    matches = snapshot.liveMatches;
  } catch {
    // Silently fail - ticker just won't show
  }

  return <LiveTicker matches={matches} />;
}

async function HeroContent() {
  let snapshot;
  try {
    snapshot = await getSportsSnapshot();
  } catch {
    snapshot = null;
  }

  if (!snapshot) {
    return (
      <VelorHero
        liveCount={0}
        matchCount={0}
        leagueCount={0}
        teamCount={0}
        syncedAt={new Date().toISOString()}
        degraded
      />
    );
  }

  // Canonical homepage statistics — derived from the same normalized
  // snapshot as /live and /matches. Never hardcoded, never independent.
  const { stats } = snapshot;

  return (
    <VelorHero
      liveCount={stats.liveMatches}
      matchCount={stats.matches}
      leagueCount={stats.leagues}
      teamCount={stats.teams}
      syncedAt={snapshot.syncedAt}
      degraded={snapshot.degraded}
    />
  );
}

async function HomeSections() {
  let snapshot;
  try {
    snapshot = await getSportsSnapshot();
  } catch {
    snapshot = null;
  }

  if (!snapshot) {
    return (
      <div className="divide-y divide-border-subtle">
        <ErrorState title="DATA UNAVAILABLE" description="We couldn't load live match data. Please try again." />
      </div>
    );
  }

  if (snapshot.misconfigured) {
    return (
      <div className="divide-y divide-border-subtle">
        <ErrorState
          title="SPORTS DATA UNAVAILABLE"
          description="Real API mode is requested but the API key is not configured on the server."
          showRetry={false}
        />
      </div>
    );
  }

  if (!snapshot.hasAnySuccess) {
    return (
      <div className="divide-y divide-border-subtle">
        <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load match data from any sport. Please try again." />
      </div>
    );
  }

  const { liveMatches, matches, leagues, teams } = snapshot;
  const upcomingMatches = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 6);

  // "Featured" ranking: leagues/teams are ordered by live activity first,
  // then total involvement — never a hardcoded "popular" list.
  const featuredLeagues = rankFeaturedLeagues(leagues, matches, 6);
  const featuredTeams = rankFeaturedTeams(teams, matches, 8);

  const hasAnyContent = liveMatches.length > 0 || upcomingMatches.length > 0 || leagues.length > 0 || teams.length > 0;

  return (
    <div className="divide-y divide-border-subtle">
      {(snapshot.degraded || snapshot.unavailableSports.length > 0) && (
        <div className="px-4 sm:px-6 lg:px-10 py-4 space-y-1 border-b border-border-subtle bg-surface-1/30">
          <UnavailableSportsNote sports={snapshot.unavailableSports} />
          <DataFreshness syncedAt={snapshot.syncedAt} degraded={snapshot.degraded} />
        </div>
      )}

      {liveMatches.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8" aria-label="Live matches">
          <SectionHeader
            title="LIVE NOW"
            subtitle={`${liveMatches.length} matches in progress`}
            href="/live"
            count={liveMatches.length}
          />
          <div className="space-y-0" role="list">
            {liveMatches.slice(0, 5).map((match) => (
              <MatchCard key={match.id} match={match} href={`/match/${match.id}`} />
            ))}
          </div>
        </section>
      )}

      {upcomingMatches.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 bg-surface-1/20" aria-label="Upcoming matches">
          <SectionHeader
            title="UPCOMING"
            href="/matches"
            count={upcomingMatches.length}
          />
          <div className="space-y-0" role="list">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} href={`/match/${match.id}`} />
            ))}
          </div>
        </section>
      )}

      {featuredLeagues.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8" aria-label="Featured leagues">
          <SectionHeader
            title="FEATURED LEAGUES"
            subtitle="Ranked by live activity"
            href="/leagues"
            count={leagues.length}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredLeagues.map((league) => (
              <LeagueCard key={league.id} league={league} href={`/league/${league.id}`} />
            ))}
          </div>
        </section>
      )}

      {featuredTeams.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 bg-surface-1/20" aria-label="Featured teams">
          <SectionHeader
            title="FEATURED TEAMS"
            subtitle={snapshot.teamsDerivedFromMatches ? "Derived from today's fixtures" : "Ranked by live activity"}
            href="/teams"
            count={teams.length}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTeams.map((team) => (
              <TeamCard key={team.id} team={team} href={`/team/${team.id}`} />
            ))}
          </div>
        </section>
      )}

      <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8" aria-label="Browse by sport">
        <SectionHeader
          title="QUICK DISCOVERY"
          subtitle="Browse by sport"
          href="/sports"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: "Football", href: "/matches?sport=football", icon: "FOOT" },
            { name: "Basketball", href: "/matches?sport=basketball", icon: "BASK" },
            { name: "Cricket", href: "/matches?sport=cricket", icon: "CRIC" },
            { name: "Tennis", href: "/matches?sport=tennis", icon: "TENN" },
            { name: "Live Matches", href: "/live", icon: "LIVE" },
            { name: "All Leagues", href: "/leagues", icon: "LEAG" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex flex-col gap-3 p-4 sm:p-5 border border-border-default bg-surface-1/40 hover:bg-surface-2/40 hover:border-border-strong transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="technical-label text-[0.6rem] text-text-secondary group-hover:text-live transition-colors">
                  {item.icon}
                </span>
              </div>
              <span className="font-body text-sm text-text-primary group-hover:text-live transition-colors">
                {item.name}
              </span>
              <span className="font-mono text-[0.65rem] text-text-secondary tracking-widest uppercase group-hover:text-live transition-colors">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {!hasAnyContent && (
        <EmptyState
          title="NO DATA AVAILABLE"
          description="We couldn't load live matches, upcoming fixtures, leagues, or teams. Please check your connection and try again."
        />
      )}
    </div>
  );
}
