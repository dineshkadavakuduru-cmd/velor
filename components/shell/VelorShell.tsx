import { Suspense } from "react";
import { createProvider } from "@/lib/api";
import type { Match, Team, League } from "@/lib/types/sports";
import IntroClient from "./IntroClient";
import VelorHero from "../hero/VelorHero";
import MatchCard from "../ui/MatchCard";
import TeamCard from "../ui/TeamCard";
import LeagueCard from "../ui/LeagueCard";
import SectionHeader from "../ui/SectionHeader";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import Link from "next/link";

export default function VelorShell() {
  return (
    <IntroClient>
      <div className="min-h-screen flex flex-col bg-background">
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
async function HeroContent() {
  let liveMatches: Match[] = [];
  let allMatches: Match[] = [];
  let leagues: League[] = [];
  let teams: Team[] = [];

  try {
    const provider = createProvider();
    const [liveResult, allMatchesResult, leaguesResult, teamsResult] = await Promise.all([
      provider.getLiveMatches(),
      provider.getMatches(),
      provider.getLeagues(),
      provider.getTeams(),
    ]);
    liveMatches = liveResult;
    allMatches = allMatchesResult;
    leagues = leaguesResult;
    teams = teamsResult;
  } catch {
    // Hero can render without data
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
  let liveMatches: Match[] = [];
  let upcomingMatches: Match[] = [];
  let leagues: League[] = [];
  let teams: Team[] = [];
  let hasError = false;

  try {
    const provider = createProvider();
    const [liveResult, allMatches, leaguesResult, teamsResult] = await Promise.all([
      provider.getLiveMatches(),
      provider.getMatches(),
      provider.getLeagues(),
      provider.getTeams(),
    ]);
    liveMatches = liveResult;
    upcomingMatches = allMatches
      .filter((m) => m.status === "scheduled")
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 6);
    leagues = leaguesResult;
    teams = teamsResult.slice(0, 8);
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
            {teams.map((team) => (
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

