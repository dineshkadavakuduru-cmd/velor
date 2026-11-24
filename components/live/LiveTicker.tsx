"use client";

import Link from "next/link";
import type { Match } from "@/lib/types/sports";
import { entityHref } from "@/lib/utils/entityIdentity";
import ScoreDisplay from "./ScoreDisplay";
import StatusBadge from "@/components/ui/StatusBadge";
import DataFreshness from "@/components/ui/DataFreshness";

interface LiveTickerProps {
  matches: Match[];
  syncedAt: string;
  degraded: boolean;
  upstreamStale: boolean;
}

export default function LiveTicker({ matches, syncedAt, degraded, upstreamStale }: LiveTickerProps) {
  if (matches.length === 0) {
    return null;
  }

  return (
    <div
      className="border-b border-border-subtle bg-surface-1/60 overflow-x-auto"
      role="region"
      aria-label="Live matches ticker"
      data-shell-ticker
    >
      <div className="flex items-stretch">
        {matches.map((match) => (
          <Link
            key={match.id}
            href={entityHref("match", match.id, match.sport.id)}
            className="flex-shrink-0 flex items-center gap-4 px-5 py-3 border-r border-border-subtle last:border-r-0 hover:bg-surface-2/50 transition-colors"
          >
            <span className="technical-label w-24 truncate">
              {match.league.name}
            </span>
            <span className="font-body text-sm text-text-secondary w-28 truncate">
              {match.homeTeam.shortName} — {match.awayTeam.shortName}
            </span>
            <ScoreDisplay score={match.score} size="sm" showPeriodScores={false} />
            <StatusBadge status={match.status} period={match.period} />
          </Link>
        ))}
      </div>
      <DataFreshness syncedAt={syncedAt} degraded={degraded} staleUpstream={upstreamStale} className="px-5 pb-2" />
    </div>
  );
}
