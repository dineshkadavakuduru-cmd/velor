import Link from "next/link";
import { getSportsSnapshot } from "@/lib/api/snapshot";
import { SPORTS } from "@/lib/api/sports";
import type { League } from "@/lib/types/sports";
import LiveHeader from "@/components/live/LiveHeader";
import ErrorState from "@/components/ui/ErrorState";
import LeagueCard from "@/components/ui/LeagueCard";
import DataFreshness from "@/components/ui/DataFreshness";

export const metadata = {
  title: "Sports — VELOR",
  description: "Browse supported sports and find matches.",
};

type SportSummary = {
  id: string;
  name: string;
  leagueCount: number;
  matchCount: number;
  liveCount: number;
  leagues: League[];
  enabled: boolean;
  available: boolean;
  errorKind?: string;
};

function ProviderUnavailable() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="SPORTS" subtitle="Browse supported sports and find matches." showLiveIndicator={false} />
      <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load sports data. Please try again." />
    </div>
  );
}

function ProviderMisconfigured() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="SPORTS" subtitle="Browse supported sports and find matches." showLiveIndicator={false} />
      <ErrorState
        title="SPORTS DATA UNAVAILABLE"
        description="Real API mode is requested but the API key is not configured on the server."
        showRetry={false}
      />
    </div>
  );
}

export default async function SportsPage() {
  let snapshot;
  try {
    // Canonical dataset — per-sport availability comes from the same snapshot
    // every other page uses, so coverage claims here can't disagree with /matches.
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

  const { matches, leagues } = snapshot;

  const sportsMap = new Map<string, SportSummary>();
  for (const sport of Object.values(SPORTS)) {
    sportsMap.set(sport.id, {
      id: sport.id,
      name: sport.name,
      leagueCount: 0,
      matchCount: 0,
      liveCount: 0,
      leagues: [],
      enabled: sport.enabled,
      available: true,
    });
  }

  // Mark sports whose provider failed — shown honestly as unavailable,
  // never as "0 leagues, 0 matches" as if the world were empty.
  for (const sync of snapshot.perSport) {
    const summary = sportsMap.get(sync.sportId);
    if (summary && sync.state !== "ok") {
      summary.available = false;
      summary.errorKind = sync.errorKind;
    }
  }

  for (const league of leagues) {
    const existing = sportsMap.get(league.sportId);
    if (existing) {
      existing.leagueCount += 1;
      existing.leagues.push(league);
    }
  }

  for (const match of matches) {
    const sport = sportsMap.get(match.sport.id);
    if (sport) {
      sport.matchCount += 1;
      if (match.status === "live" || match.status === "halftime") {
        sport.liveCount += 1;
      }
    }
  }

  const sports = Array.from(sportsMap.values()).sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader
        title="SPORTS"
        subtitle="Browse supported sports and find matches."
        matchCount={sports.filter((s) => s.enabled).length}
        countLabel="SPORTS"
        showLiveIndicator={false}
      />
      <div className="px-4 sm:px-6 lg:px-10 py-2 border-b border-border-subtle bg-surface-1/30">
        <DataFreshness syncedAt={snapshot.syncedAt} degraded={snapshot.degraded} />
      </div>
      <div className="py-6 sm:py-8">
        {sports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border-subtle">
            <p className="technical-label mb-2">NO SPORTS AVAILABLE</p>
            <p className="text-sm text-text-secondary max-w-sm">
              No sports are currently available. Please check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sports.map((sport) => (
              <section key={sport.id} className="border-b border-border-subtle last:border-b-0" aria-label={`${sport.name} coverage`}>
                <div className="px-4 sm:px-6 lg:px-10 py-4">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="font-display text-base sm:text-lg font-medium tracking-tight text-text-primary">
                          {sport.name}
                        </h2>
                        {!sport.enabled && (
                          <span className="font-mono text-[0.6rem] text-text-secondary/60 tracking-widest uppercase border border-border-subtle px-2 py-0.5">
                            COMING SOON
                          </span>
                        )}
                        {sport.enabled && !sport.available && (
                          <span className="font-mono text-[0.6rem] text-gold tracking-widest uppercase border border-gold/30 px-2 py-0.5" role="status">
                            LIVE DATA UNAVAILABLE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {sport.enabled && sport.available ? (
                          <>
                            <span className="font-mono text-[0.65rem] text-text-secondary tracking-widest uppercase">
                              {sport.leagueCount} {sport.leagueCount === 1 ? "LEAGUE" : "LEAGUES"}
                            </span>
                            <span className="font-mono text-[0.65rem] text-text-secondary tracking-widest uppercase">
                              {sport.matchCount} {sport.matchCount === 1 ? "MATCH" : "MATCHES"}
                            </span>
                            {sport.liveCount > 0 && (
                              <span className="font-mono text-[0.65rem] text-live tracking-widest uppercase">
                                {sport.liveCount} LIVE
                              </span>
                            )}
                          </>
                        ) : sport.enabled ? (
                          <span className="font-mono text-[0.65rem] text-text-secondary tracking-widest uppercase">
                            Could not reach this sport&apos;s data provider — not zero matches worldwide.
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {sport.enabled && sport.available && (
                      <Link
                        href={`/matches?sport=${encodeURIComponent(sport.id)}`}
                        className="font-mono text-xs tracking-widest text-text-secondary hover:text-live transition-colors shrink-0"
                      >
                        VIEW ALL →
                      </Link>
                    )}
                  </div>
                  {sport.leagues.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sport.leagues.slice(0, 6).map((league) => (
                        <LeagueCard key={league.id} league={league} href={`/league/${league.id}`} />
                      ))}
                    </div>
                  ) : sport.enabled && sport.available ? (
                    <div className="py-8 text-center border border-border-subtle border-dashed">
                      <p className="text-sm text-text-secondary">
                        No leagues or matches available for this sport right now.
                      </p>
                    </div>
                  ) : sport.enabled ? (
                    <div className="py-8 text-center border border-border-subtle border-dashed">
                      <p className="text-sm text-text-secondary" role="status">
                        Live data unavailable for {sport.name}. Data may be delayed — please check back later.
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 text-center border border-border-subtle border-dashed">
                      <p className="text-sm text-text-secondary">
                        Real data integration for this sport is not yet connected.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
