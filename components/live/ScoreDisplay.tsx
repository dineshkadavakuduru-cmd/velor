import type { Score } from "@/lib/types/sports";

interface ScoreDisplayProps {
  score: Score;
  size?: "sm" | "md" | "lg";
}

export default function ScoreDisplay({ score, size = "md" }: ScoreDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg sm:text-xl",
    lg: "text-2xl sm:text-3xl",
  };

  return (
    <div className={`flex flex-col items-end gap-0.5 ${sizeClasses[size]}`}>
      <div className="flex items-baseline gap-2 tabular-nums">
        <span className="data-number font-medium text-text-primary">
          {score.home ?? "—"}
        </span>
        <span className="text-text-secondary text-xs">:</span>
        <span className="data-number font-medium text-text-primary">
          {score.away ?? "—"}
        </span>
      </div>
      {score.periodScores && score.periodScores.length > 0 && (
        <div className="flex gap-2 text-[0.65rem] text-text-secondary font-mono">
          {score.periodScores.map((ps) => (
            <span key={ps.period}>
              {ps.period} {ps.home}-{ps.away}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
