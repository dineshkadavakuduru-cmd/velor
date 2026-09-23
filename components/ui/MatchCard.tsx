import type { Match } from "@/lib/types/sports";
import { getMatchIntelligence } from "@/lib/utils/derivedMetrics";
import LeagueBadge from "@/components/live/LeagueBadge";
import TeamDisplay from "@/components/live/TeamDisplay";
import ScoreDisplay from "@/components/live/ScoreDisplay";
import StatusBadge from "./StatusBadge";
import Link from "next/link";

interface MatchCardProps {
  match: Match;
  href?: string;
  showVenue?: boolean;
}

export default function MatchCard({ match, href, showVenue = true }: MatchCardProps) {
  const isLive = match.status === "live" || match.status === "halftime";
  const intel = getMatchIntelligence(match);

  const content = (
    <article
      className={`
        group flex flex-col border-b border-border-subtle
        hover:bg-surface-2/30 transition-colors
        ${isLive ? "bg-surface-1/40" : ""}
      `}
      aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4 mb-2">
          <LeagueBadge league={match.league} />
          <div className="flex items-center gap-2">
            {intel.isFinished && intel.result && (
              <span className={`
                text-[0.6rem] font-mono tracking-widest uppercase
                ${intel.result === "home_win" ? "text-live" : ""}
                ${intel.result === "away_win" ? "text-gold" : ""}
                ${intel.result === "draw" ? "text-text-secondary" : ""}
              `}>
                {intel.resultLabel}
              </span>
            )}
            <StatusBadge status={match.status} period={match.period} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <TeamDisplay
              team={match.homeTeam}
              showLogo={!!match.homeTeam.logo}
            />
            <TeamDisplay
              team={match.awayTeam}
              showLogo={!!match.awayTeam.logo}
            />
          </div>

          <ScoreDisplay score={match.score} />
        </div>

        {showVenue && match.venue && (
          <div className="mt-2 text-[0.65rem] text-text-secondary font-mono tracking-wide">
            {match.venue}
            {match.startTime && !isLive && (
              <span className="ml-2 text-text-secondary/60">
                {new Date(match.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
