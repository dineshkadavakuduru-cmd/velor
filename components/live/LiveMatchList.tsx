import type { Match } from "@/lib/types/sports";
import MatchCard from "@/components/ui/MatchCard";

interface LiveMatchListProps {
  matches: Match[];
  loading?: boolean;
  emptyMessage?: string;
  emptyLabel?: string;
  getHref?: (match: Match) => string | undefined;
}

export default function LiveMatchList({
  matches,
  loading = false,
  emptyMessage = "No live matches at the moment.",
  emptyLabel = "NO LIVE MATCHES",
  getHref,
}: LiveMatchListProps) {
  if (loading) {
    return (
      <div className="border-b border-border-subtle">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="px-4 sm:px-6 py-4 border-b border-border-subtle last:border-b-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-3 w-32 bg-surface-2/60 animate-pulse rounded-sm" />
              <div className="h-3 w-10 bg-surface-2/60 animate-pulse rounded-sm" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-48 bg-surface-2/60 animate-pulse rounded-sm" />
              <div className="h-4 w-48 bg-surface-2/60 animate-pulse rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border-subtle">
        <p className="technical-label mb-2">{emptyLabel}</p>
        <p className="text-sm text-text-secondary max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          href={getHref?.(match)}
        />
      ))}
    </div>
  );
}
