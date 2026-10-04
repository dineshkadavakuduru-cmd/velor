"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Match } from "@/lib/types/sports";
import LiveHeader from "@/components/live/LiveHeader";
import LiveMatchList from "@/components/live/LiveMatchList";
import ErrorState from "@/components/ui/ErrorState";

const POLL_INTERVAL_MS = 30000;

interface LiveFeedClientProps {
  initialMatches: Match[];
}

export default function LiveFeedClient({ initialMatches }: LiveFeedClientProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [countdown, setCountdown] = useState(30);
  const [isRefreshing, startTransition] = useTransition();

  const fetchLiveMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/live-matches", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { tags: ["live-matches"] },
      });
      if (res.ok) {
        const data = await res.json();
        const newMatches: Match[] = data.matches ?? [];
        setMatches(newMatches);
      }
    } catch {
      // Silently fail - keep existing matches
    }
  }, []);

  const handleRefreshNow = useCallback(async () => {
    startTransition(() => {
      void fetchLiveMatches().then(() => {
        router.refresh();
      });
    });
  }, [fetchLiveMatches, router]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (document.visibilityState === "hidden") {
      return;
    }

    interval = setInterval(() => {
      fetchLiveMatches();
      setCountdown(30);
    }, POLL_INTERVAL_MS);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : POLL_INTERVAL_MS / 1000));
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && interval) {
        clearInterval(interval);
        clearInterval(countdownInterval);
      } else if (document.visibilityState === "visible") {
        setCountdown(30);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchLiveMatches]);

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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-live" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-live" />
              </span>
              <span className="text-[0.65rem] text-text-secondary font-mono tracking-widest uppercase">
                LIVE SYNC ACTIVE
              </span>
            </div>
            <span className="text-[0.65rem] text-text-secondary font-mono">
              REFRESH IN {countdown}s
            </span>
            <button
              type="button"
              onClick={handleRefreshNow}
              disabled={isRefreshing}
              className="px-3 py-1 border border-border-subtle text-[0.6rem] font-mono tracking-widest text-text-secondary hover:text-live hover:border-live transition-colors disabled:opacity-50"
            >
              REFRESH NOW
            </button>
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
              <LiveMatchList matches={liveMatches} getHref={(m) => `/match/${m.id}`} />
            </section>
          )}

          {halftimeMatches.length > 0 && (
            <section className="border-b border-border-subtle">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-gold/5">
                <span className="technical-label text-gold">HALFTIME</span>
                <span className="text-xs text-text-secondary font-mono ml-2">{halftimeMatches.length}</span>
              </div>
              <LiveMatchList matches={halftimeMatches} getHref={(m) => `/match/${m.id}`} />
            </section>
          )}

          {scheduledMatches.length > 0 && (
            <section className="border-b border-border-subtle">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-surface-1/40">
                <span className="technical-label">UPCOMING</span>
                <span className="text-xs text-text-secondary font-mono ml-2">{scheduledMatches.length}</span>
              </div>
              <LiveMatchList matches={scheduledMatches} getHref={(m) => `/match/${m.id}`} />
            </section>
          )}

          {finishedMatches.length > 0 && (
            <section className="border-b border-border-subtle">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-surface-1/40">
                <span className="technical-label">FINISHED</span>
                <span className="text-xs text-text-secondary font-mono ml-2">{finishedMatches.length}</span>
              </div>
              <LiveMatchList matches={finishedMatches} getHref={(m) => `/match/${m.id}`} />
            </section>
          )}

          {postponedMatches.length > 0 && (
            <section className="border-b border-border-subtle">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-danger/5">
                <span className="technical-label text-danger">POSTPONED / CANCELLED</span>
                <span className="text-xs text-text-secondary font-mono ml-2">{postponedMatches.length}</span>
              </div>
              <LiveMatchList matches={postponedMatches} getHref={(m) => `/match/${m.id}`} />
            </section>
          )}
        </div>
      )}
    </>
  );
}
