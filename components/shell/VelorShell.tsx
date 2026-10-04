import { Suspense } from "react";
import { createRegistry } from "@/lib/api";
import { getEnabledSports } from "@/lib/api/sports";
import type { Match, Team, League } from "@/lib/types/sports";
import IntroClient from "./IntroClient";
import VelorHero from "../hero/VelorHero";
import MatchCard from "../ui/MatchCard";
import TeamCard from "../ui/TeamCard";
import LeagueCard from "../ui/LeagueCard";
import SectionHeader from "../ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LiveTicker from "@/components/live/LiveTicker";
import Link from "next/link";

export default function VelorShell() {
  return (
    <IntroClient>
      <div className="min-h-screen flex flex-col bg-background">
        <LiveTickerWrapper />
        <main className="flex-1 relative overflow-hidden">
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
        </main>
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
  const matches: Match[] = [];

  try {
    const registry = createRegistry();
    const sports = getEnabledSports();
    const results = await Promise.allSettled(
      sports.map((sport) => registry.getProvider(sport.id).getLiveMatches())
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        matches.push(...result.value);
      }
    }
  } catch {
    // Silently fail - ticker just won't show
  }

  return <LiveTicker matches={matches} />;
}

async function HeroContent() {
  const liveMatches: Match[] = [];
  const allMatches: Match[] = [];
  const leagues: League[] = [];
  const teams: Team[] = [];

  try {
    const registry = createRegistry();
    const sports = getEnabledSports();
    const results = await Promise.allSettled(
      sports.map(async (sport) => {
        const provider = registry.getProvider(sport.id);
        const [liveResult, allMatchesResult, leaguesResult, teamsResult] = await Promise.all([
          provider.getLiveMatches(),
          provider.getMatches(),
          provider.getLeagues(),
          provider.getTeams(),
        ]);
        return { live: liveResult, matches: allMatchesResult, leagues: leaguesResult, teams: teamsResult };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        liveMatches.push(...r.value.live);
        allMatches.push(...r.value.matches);
        leagues.push(...r.value.leagues);
        teams.push(...r.value.teams);
      }
    }
  } catch {
    // Hero can render with 0 defaults
  }

  return (
    <VelorHero
      liveCount={liveMatches.length}
      matchCount={allMatches.length}
      leagueCount={leagues.length}
      teamCount={teams.length}
    />
  );
}

async function HomeSections() {
  const liveMatches: Match[] = [];
  let upcomingMatches: Match[] = [];
  const leagues: League[] = [];
  const teams: Team[] = [];
  let hasError = false;

  try {
    const registry = createRegistry();
    const sports = getEnabledSports();
    const results = await Promise.allSettled(
      sports.map(async (sport) => {
        const provider = registry.getProvider(sport.id);
        const [liveResult, allMatches, leaguesResult, teamsResult] = await Promise.all([
          provider.getLiveMatches(),
          provider.getMatches(),
          provider.getLeagues(),
          provider.getTeams(),
        ]);
        return { live: liveResult, matches: allMatches, leagues: leaguesResult, teams: teamsResult };
      })
    );

    let anySuccess = false;
    const allMatchesList: Match[] = [];

    for (const r of results) {
      if (r.status === "fulfilled") {
        anySuccess = true;
        liveMatches.push(...r.value.live);
        allMatchesList.push(...r.value.matches);
        leagues.push(...r.value.leagues);
        teams.push(...r.value.teams);
      }
    }

    if (!anySuccess && sports.length > 0) {
      hasError = true;
    } else {
      upcomingMatches = allMatchesList
        .filter((m) => m.status === "scheduled")
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 6);
    }
  } catch {
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="divide-y divide-border-subtle">
        <ErrorState title="DATA UNAVAILABLE" description="We couldn't load live match data. Please try again." />
      </div>
    );
  }

  const hasAnyContent = liveMatches.length > 0 || upcomingMatches.length > 0 || leagues.length > 0 || teams.length > 0;

  return (
    <div className="divide-y divide-border-subtle">
      {liveMatches.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          <SectionHeader
            title="LIVE NOW"
            subtitle={`${liveMatches.length} matches in progress`}
            href="/live"
            count={liveMatches.length}
          />
          <div className="space-y-0">
            {liveMatches.slice(0, 5).map((match) => (
              <MatchCard key={match.id} match={match} href={`/match/${match.id}`} />
            ))}
          </div>
        </section>
      )}

      {upcomingMatches.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 bg-surface-1/20">
          <SectionHeader
            title="UPCOMING"
            href="/matches"
            count={upcomingMatches.length}
          />
          <div className="space-y-0">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} href={`/match/${match.id}`} />
            ))}
          </div>
        </section>
      )}

      {leagues.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          <SectionHeader
            title="POPULAR LEAGUES"
            href="/leagues"
            count={leagues.length}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leagues.slice(0, 6).map((league) => (
              <LeagueCard key={league.id} league={league} href={`/league/${league.id}`} />
            ))}
          </div>
        </section>
      )}

      {teams.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 bg-surface-1/20">
          <SectionHeader
            title="POPULAR TEAMS"
            href="/teams"
            count={teams.length}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.slice(0, 8).map((team) => (
              <TeamCard key={team.id} team={team} href={`/team/${team.id}`} />
            ))}
          </div>
        </section>
      )}

      <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
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
