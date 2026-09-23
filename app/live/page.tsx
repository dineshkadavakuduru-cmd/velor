import { Suspense } from "react";
import { createRegistry } from "@/lib/api";
import { getEnabledSports } from "@/lib/api/sports";
import type { Match } from "@/lib/types/sports";
import LiveHeader from "@/components/live/LiveHeader";
import LiveMatchList from "@/components/live/LiveMatchList";
import ErrorState from "@/components/ui/ErrorState";

export const metadata = {
  title: "Live — VELOR",
  description: "Live scores and match updates.",
};

async function getLiveMatches(): Promise<Match[]> {
  const registry = createRegistry();
  const sports = getEnabledSports();
  const results = await Promise.allSettled(
    sports.map((sport) => registry.getProvider(sport.id).getLiveMatches())
  );
  const matches: Match[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      matches.push(...result.value);
    }
  }
  return matches;
}

function ProviderUnavailable() {
  return (
    <>
      <LiveHeader />
      <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load live match data. Please try again." />
    </>
  );
}

function ProviderMisconfigured() {
  return (
    <>
      <LiveHeader />
      <ErrorState
        title="SPORTS DATA UNAVAILABLE"
        description="Real API mode is requested but the API key is not configured on the server."
        showRetry={false}
      />
    </>
  );
}

export default function LivePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Suspense
        fallback={
          <div>
            <LiveHeader />
            <LiveMatchList loading={true} matches={[]} />
          </div>
        }
      >
        <LiveMatches />
      </Suspense>
    </div>
  );
}

async function LiveMatches() {
  let matches: Match[] = [];
  let hasError = false;
  let misconfigured = false;

  try {
    matches = await getLiveMatches();
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

  const liveMatches = matches.filter((m) => m.status === "live");
  const halftimeMatches = matches.filter((m) => m.status === "halftime");
  const scheduledMatches = matches.filter((m) => m.status === "scheduled");
  const finishedMatches = matches.filter((m) => m.status === "finished");
  const postponedMatches = matches.filter((m) => m.status === "postponed" || m.status === "cancelled");

  const totalMatches = matches.length;
  const leagueGroups = new Map<string, { league: Match["league"]; matches: Match[] }>();
  for (const match of matches) {
    const key = match.league.id;
    const existing = leagueGroups.get(key);
    if (existing) {
      existing.matches.push(match);
    } else {
      leagueGroups.set(key, { league: match.league, matches: [match] });
    }
  }

  return (
    <>
      <LiveHeader matchCount={totalMatches} />
      <div className="px-4 sm:px-6 lg:px-10 py-3 border-b border-border-subtle bg-surface-1/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs text-text-secondary font-mono tracking-widest">
            {totalMatches} MATCH{totalMatches !== 1 ? "ES" : ""} ACROSS {leagueGroups.size} LEAGUE{leagueGroups.size !== 1 ? "S" : ""}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-live" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-live" />
            </span>
            <span className="text-[0.65rem] text-text-secondary font-mono tracking-widest uppercase">
              Updated Recently
            </span>
          </div>
        </div>
      </div>

      {totalMatches === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border-subtle">
          <p className="technical-label mb-2">NO LIVE MATCHES</p>
          <p className="text-sm text-text-secondary max-w-sm">
            No live matches at the moment. Check back later.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {liveMatches.length > 0 && (
            <section className="border-b border-border-subtle">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-live/5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-live" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
                  </span>
                  <span className="technical-label text-live">LIVE</span>
                  <span className="text-xs text-text-secondary font-mono">{liveMatches.length}</span>
                </div>
              </div>
              {liveMatches.map((match) => (
                <LiveMatchList
                  key={match.id}
                  matches={[match]}
                  getHref={(m) => `/match/${m.id}`}
                />
              ))}
            </section>
          )}

          {halftimeMatches.length > 0 && (
            <section className="border-b border-border-subtle">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-gold/5">
                <span className="technical-label text-gold">HALFTIME</span>
                <span className="text-xs text-text-secondary font-mono ml-2">{halftimeMatches.length}</span>
              </div>
              {halftimeMatches.map((match) => (
                <LiveMatchList
                  key={match.id}
                  matches={[match]}
                  getHref={(m) => `/match/${m.id}`}
                />
              ))}
            </section>
          )}

          {scheduledMatches.length > 0 && (
            <section className="border-b border-border-subtle">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-surface-1/40">
                <span className="technical-label">UPCOMING</span>
                <span className="text-xs text-text-secondary font-mono ml-2">{scheduledMatches.length}</span>
              </div>
              {scheduledMatches.map((match) => (
                <LiveMatchList
                  key={match.id}
                  matches={[match]}
                  getHref={(m) => `/match/${m.id}`}
                />
              ))}
            </section>
          )}

          {finishedMatches.length > 0 && (
            <section className="border-b border-border-subtle">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-surface-1/40">
                <span className="technical-label">FINISHED</span>
                <span className="text-xs text-text-secondary font-mono ml-2">{finishedMatches.length}</span>
              </div>
              {finishedMatches.map((match) => (
                <LiveMatchList
                  key={match.id}
                  matches={[match]}
                  getHref={(m) => `/match/${m.id}`}
                />
              ))}
            </section>
          )}

          {postponedMatches.length > 0 && (
            <section className="border-b border-border-subtle">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-danger/5">
                <span className="technical-label text-danger">POSTPONED / CANCELLED</span>
                <span className="text-xs text-text-secondary font-mono ml-2">{postponedMatches.length}</span>
              </div>
              {postponedMatches.map((match) => (
                <LiveMatchList
                  key={match.id}
                  matches={[match]}
                  getHref={(m) => `/match/${m.id}`}
                />
              ))}
            </section>
          )}
        </div>
      )}
    </>
  );
}
