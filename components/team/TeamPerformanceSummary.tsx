import type { Match } from "@/lib/types/sports";
import { getTeamPerformance, getFormFromMatches } from "@/lib/utils/derivedMetrics";

interface TeamPerformanceSummaryProps {
  matches: Match[];
  teamId: string;
}

export default function TeamPerformanceSummary({ matches, teamId }: TeamPerformanceSummaryProps) {
  const perf = getTeamPerformance(matches, teamId);
  const form = getFormFromMatches(matches, teamId);
  const sportId = matches[0]?.sport.id ?? "football";

  if (perf.matchesPlayed === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <span className="technical-label">RECENT FORM</span>
          <span className="text-xs text-text-secondary font-mono">NO FINISHED MATCHES</span>
        </div>
      </div>
    );
  }

  const hasDraws = sportId === "football";
  const hasGoals = sportId === "football";

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-border-subtle">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="technical-label">RECENT FORM</span>
          <div className="flex items-center gap-1">
            {form.map((result, i) => (
              <span
                key={i}
                className={`
                  inline-flex items-center justify-center h-5 w-5 text-[0.6rem] font-mono font-bold tracking-wider
                  ${result === "W"
                    ? "bg-success/10 text-success border border-success/30"
                    : result === "D"
                      ? "bg-gold/10 text-gold border border-gold/30"
                      : "bg-danger/10 text-danger border border-danger/30"
                  }
                `}
              >
                {result}
              </span>
            ))}
          </div>
        </div>
        <div className={`grid gap-3 ${hasDraws && hasGoals ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7" : hasDraws || hasGoals ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"}`}>
          <StatChip label="PLAYED" value={String(perf.matchesPlayed)} />
          <StatChip label="W" value={String(perf.wins)} highlight={perf.wins > 0} />
          {hasDraws && (
            <StatChip label="D" value={String(perf.draws)} highlight={perf.draws > 0} />
          )}
          <StatChip label="L" value={String(perf.losses)} highlight={perf.losses > 0} />
          {hasGoals && (
            <>
              <StatChip label="GF" value={String(perf.goalsFor)} />
              <StatChip label="GA" value={String(perf.goalsAgainst)} />
              <StatChip
                label="GD"
                value={perf.goalDifference > 0 ? `+${perf.goalDifference}` : String(perf.goalDifference)}
                highlight={perf.goalDifference > 0}
                danger={perf.goalDifference < 0}
              />
            </>
          )}
        </div>
        <p className="text-[0.6rem] text-text-secondary font-mono tracking-wide">
          BASED ON {perf.matchesPlayed} FINISHED MATCH{perf.matchesPlayed !== 1 ? "ES" : ""} IN RETRIEVED DATA
        </p>
      </div>
    </div>
  );
}

function StatChip({ label, value, highlight, danger }: { label: string; value: string; highlight?: boolean; danger?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 bg-surface-2/50 border border-border-subtle">
      <span className="technical-label text-[0.55rem]">{label}</span>
      <span className={`
        data-number text-sm
        ${highlight ? "text-success" : ""}
        ${danger ? "text-danger" : ""}
        ${!highlight && !danger ? "text-text-primary" : ""}
      `}>
        {value}
      </span>
    </div>
  );
}
