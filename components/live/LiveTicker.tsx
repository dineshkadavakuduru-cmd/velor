"use client";

import Link from "next/link";
import type { Match } from "@/lib/types/sports";

interface LiveTickerProps {
  matches: Match[];
}

export default function LiveTicker({ matches }: LiveTickerProps) {
  const liveMatches = matches.filter((m) => m.status === "live" || m.status === "halftime");

  if (liveMatches.length === 0) {
    return null;
  }

  return (
    <div
      className="border-b border-border-subtle bg-surface-1/60 overflow-x-auto"
      aria-label="Live matches ticker"
      data-shell-ticker
    >
      <div className="flex items-stretch">
        {liveMatches.map((match) => (
          <Link
            key={match.id}
            href={`/match/${match.id}`}
            className="flex-shrink-0 flex items-center gap-4 px-5 py-3 border-r border-border-subtle last:border-r-0 hover:bg-surface-2/50 transition-colors"
          >
            <span className="technical-label w-24 truncate">
              {match.league.name}
            </span>
            <span className="font-body text-sm text-text-secondary w-28 truncate">
              {match.homeTeam.shortName} — {match.awayTeam.shortName}
            </span>
            <span className="data-number text-sm font-medium text-text-primary w-16 text-right">
              {match.score.home ?? 0} — {match.score.away ?? 0}
            </span>
            <span className="data-number text-xs text-text-secondary w-12 text-right">
              {match.period ?? ""}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
