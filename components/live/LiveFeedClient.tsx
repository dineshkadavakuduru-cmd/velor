"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Match } from "@/lib/types/sports";
import { isLiveMatch, shouldAcceptLivePayload } from "@/lib/api/snapshot-helpers";
import LiveHeader from "@/components/live/LiveHeader";
import LiveMatchList from "@/components/live/LiveMatchList";
import DataFreshness from "@/components/ui/DataFreshness";
import UnavailableSportsNote from "@/components/ui/UnavailableSportsNote";
import ErrorState from "@/components/ui/ErrorState";

const POLL_INTERVAL_MS = 30000;

interface LiveFeedClientProps {
  initialMatches: Match[];
  syncedAt: string;
  degraded?: boolean;
  unavailableSports?: { id: string; name: string; errorKind?: string }[];
}

export default function LiveFeedClient({
  initialMatches,
  syncedAt: initialSyncedAt,
  degraded = false,
  unavailableSports = [],
}: LiveFeedClientProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [syncedAt, setSyncedAt] = useState(initialSyncedAt);
  const [pollFailed, setPollFailed] = useState(false);
  // Degraded status of the latest accepted payload (init: server snapshot).
  const [syncDegraded, setSyncDegraded] = useState(degraded);
  const [unavailable, setUnavailable] = useState(unavailableSports);
  const [countdown, setCountdown] = useState(30);
  const [isRefreshing, startTransition] = useTransition();
  // Mirror of the currently displayed live count for the accept-guard below.
  const liveCountRef = useRef(initialMatches.filter(isLiveMatch).length);
  useEffect(() => {
    liveCountRef.current = matches.filter(isLiveMatch).length;
  }, [matches]);

  const fetchLiveMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/live-matches", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        setPollFailed(true);
        return;
      }
      const data = await res.json();
      const newMatches: Match[] = Array.isArray(data.matches) ? data.matches : [];
      const payloadDegraded = data.degraded === true;
      setSyncDegraded(payloadDegraded);
      if (Array.isArray(data.unavailableSports)) {
        setUnavailable(data.unavailableSports);
      }
      // Never swap a fuller good list for a thinner degraded one: a degraded
      // payload describes a provider failure, not an empty world. An empty
      // list is trusted only when every provider succeeded (matches ended).
      if (shouldAcceptLivePayload(liveCountRef.current, newMatches.length, payloadDegraded)) {
        setMatches(newMatches);
        if (typeof data.syncedAt === "string") {
          setSyncedAt(data.syncedAt);
        }
      }
      setPollFailed(false);
    } catch {
      // Keep existing (stale) matches on network failure — never blank the screen.
      setPollFailed(true);
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
    if (document.visibilityState === "hidden") {
      return;
    }

    const interval = setInterval(() => {
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

  // Canonical live derivation — identical to the homepage hero and /matches:
  // live = matches.filter(isLiveMatch). Never a separate dataset.
  const liveMatches = matches.filter((m) => m.status === "live");
  const halftimeMatches = matches.filter((m) => m.status === "halftime");
  const activeMatches = matches.filter(isLiveMatch);

  const totalMatches = activeMatches.length;
  const leagueGroups = new Map<string, { league: Match["league"]; matches: Match[] }>();
  for (const match of activeMatches) {
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
          <p className="text-xs text-text-secondary font-mono tracking-widest" aria-live="polite">
            {totalMatches} MATCH{totalMatches !== 1 ? "ES" : ""} ACROSS {leagueGroups.size} LEAGUE{leagueGroups.size !== 1 ? "S" : ""}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pollFailed || syncDegraded ? "bg-gold" : "bg-live"}`} style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${pollFailed || syncDegraded ? "bg-gold" : "bg-live"}`} />
              </span>
              <span className="text-[0.65rem] text-text-secondary font-mono tracking-widest uppercase">
                {pollFailed || syncDegraded ? "SYNC DEGRADED" : "LIVE SYNC ACTIVE"}
              </span>
            </div>
            <span className="text-[0.65rem] text-text-secondary font-mono">
              REFRESH IN {countdown}s
            </span>
            <button
              type="button"
              onClick={handleRefreshNow}
              disabled={isRefreshing}
              className="px-3 py-1 border border-border-subtle text-[0.6rem] font-mono tracking-widest text-text-secondary hover:text-live hover:border-live transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-live"
            >
              {isRefreshing ? "REFRESHING…" : "REFRESH NOW"}
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <DataFreshness syncedAt={syncedAt} degraded={pollFailed || syncDegraded} />
          {unavailable.length > 0 && (
            <UnavailableSportsNote sports={unavailable} />
          )}
          {pollFailed && (
            <p role="alert" className="text-[0.65rem] text-gold font-mono tracking-widest uppercase">
              Live update failed — showing last synced data. Data may be delayed.
            </p>
          )}
        </div>
      </div>

      {totalMatches === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border-subtle">
          <p className="technical-label mb-2">NO LIVE MATCHES RIGHT NOW</p>
          <p className="text-sm text-text-secondary max-w-sm">
            {unavailable.length > 0
              ? "No live matches from available sources. Some sports could not be reached — check back later."
              : "No matches are currently in progress. Check upcoming fixtures or try refreshing."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle" aria-live="polite" aria-label="Live score updates">
          {liveMatches.length > 0 && (
            <section className="border-b border-border-subtle" aria-label="Live matches">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-live/5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
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
            <section className="border-b border-border-subtle" aria-label="Halftime matches">
              <div className="px-4 sm:px-6 lg:px-10 py-2 bg-gold/5">
                <span className="technical-label text-gold">HALFTIME</span>
                <span className="text-xs text-text-secondary font-mono ml-2">{halftimeMatches.length}</span>
              </div>
              <LiveMatchList matches={halftimeMatches} getHref={(m) => `/match/${m.id}`} />
            </section>
          )}
        </div>
      )}
    </>
  );
}

// Keep the error export used by future error boundaries.
export function LiveFeedError() {
  return (
    <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load live match data. Please try again." />
  );
}
