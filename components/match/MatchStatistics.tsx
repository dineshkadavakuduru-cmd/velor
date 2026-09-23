"use client";

import type { MatchStatistics } from "@/lib/types/sports";

interface MatchStatisticsPanelProps {
  stats: MatchStatistics[];
  homeTeamId: string;
  awayTeamId: string;
}

export default function MatchStatisticsPanel({ stats, homeTeamId, awayTeamId }: MatchStatisticsPanelProps) {
  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="technical-label mb-2">MATCH STATISTICS</p>
        <p className="text-sm text-text-secondary max-w-sm">
          Statistics are not currently available from the provider.
        </p>
      </div>
    );
  }

  const home = stats.find((s) => s.teamId === homeTeamId) ?? null;
  const away = stats.find((s) => s.teamId === awayTeamId) ?? null;

  const allTypes = new Set<string>();
  for (const teamStats of stats) {
    for (const s of teamStats.stats) {
      allTypes.add(s.type);
    }
  }
  const statTypes = Array.from(allTypes);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 items-end">
        <div className="flex flex-col items-center gap-1">
          <span className="font-body text-sm font-medium text-text-primary truncate text-right w-full">
            {home?.teamName ?? ""}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="technical-label">STATS</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-body text-sm font-medium text-text-primary truncate text-left w-full">
            {away?.teamName ?? ""}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {statTypes.map((type) => {
          const homeStat = home?.stats.find((s) => s.type === type);
          const awayStat = away?.stats.find((s) => s.type === type);

          let homeVal = homeStat?.value ?? 0;
          let awayVal = awayStat?.value ?? 0;

          if (typeof homeVal === "string") {
            const parsed = parseInt(homeVal, 10);
            if (!isNaN(parsed)) homeVal = parsed;
          }
          if (typeof awayVal === "string") {
            const parsed = parseInt(awayVal, 10);
            if (!isNaN(parsed)) awayVal = parsed;
          }

          const homeNum = typeof homeVal === "number" ? homeVal : 0;
          const awayNum = typeof awayVal === "number" ? awayVal : 0;
          const total = homeNum + awayNum;
          const homePct = total > 0 ? (homeNum / total) * 100 : 50;
          const isPercentage = type.toLowerCase().includes("accuracy") || type.toLowerCase().includes("possession");

          return (
            <StatRow
              key={type}
              label={type.toUpperCase()}
              home={isPercentage && typeof homeVal === "number" ? `${homeVal}%` : String(homeVal)}
              away={isPercentage && typeof awayVal === "number" ? `${awayVal}%` : String(awayVal)}
              homePct={homePct}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatRow({ label, home, away, homePct }: { label: string; home: string; away: string; homePct: number }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <span className="data-number text-sm text-text-primary text-right">{home}</span>
      <div className="flex flex-col items-center gap-1">
        <span className="technical-label text-[0.6rem]">{label}</span>
        <div className="w-full h-1.5 bg-surface-2 overflow-hidden rounded-full">
          <div
            className="h-full bg-live/60 rounded-full transition-all"
            style={{ width: `${homePct}%` }}
          />
        </div>
      </div>
      <span className="data-number text-sm text-text-primary text-left">{away}</span>
    </div>
  );
}
