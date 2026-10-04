"use client";

import type { FavoriteItem } from "@/lib/favorites/types";
import type { Match, MatchEvent, MatchStatistics, MatchLineup } from "@/lib/types/sports";
import { getMatchIntelligence, getScoreDifferenceLabel } from "@/lib/utils/derivedMetrics";
import LeagueBadge from "@/components/live/LeagueBadge";
import TeamDisplay from "@/components/live/TeamDisplay";
import ScoreDisplay from "@/components/live/ScoreDisplay";
import StatusBadge from "@/components/ui/StatusBadge";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import MatchTabs from "./MatchTabs";
import Link from "next/link";

interface MatchDetailProps {
  match: Match;
  stats: MatchStatistics[];
  events: MatchEvent[];
  lineups: MatchLineup[];
}

export default function MatchDetail({ match, stats, events, lineups }: MatchDetailProps) {
  const favoriteItem: FavoriteItem = {
    id: match.id,
    type: "match",
    name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    logo: match.homeTeam.logo ?? match.awayTeam.logo,
    sportId: match.sport.id,
  };

  const intel = getMatchIntelligence(match);
  const scoreDiffLabel = getScoreDifferenceLabel(match);

  return (
    <div className="flex flex-col">
      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <LeagueBadge league={match.league} href={`/league/${match.league.id}`} />
          <div className="flex items-center gap-3">
            <span className="technical-label">{intel.stateSummary}</span>
            <StatusBadge status={match.status} period={match.period} />
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-surface-1/40 border border-border-subtle mb-6">
          <div className="grid grid-cols-3 items-center gap-4 sm:gap-6">
            <div className="flex justify-end">
              <TeamDisplay
                team={match.homeTeam}
                align="right"
                showLogo={!!match.homeTeam.logo}
                showShortName={true}
                href={`/team/${match.homeTeam.id}`}
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <ScoreDisplay score={match.score} size="lg" />
              {match.period && (
                <StatusBadge status={match.status} period={match.period} />
              )}
            </div>

            <div className="flex justify-start">
              <TeamDisplay
                team={match.awayTeam}
                align="left"
                showLogo={!!match.awayTeam.logo}
                showShortName={true}
                href={`/team/${match.awayTeam.id}`}
              />
            </div>
          </div>
        </div>

        {match.score.periodScores && match.score.periodScores.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {match.score.periodScores.map((ps) => (
              <span
                key={ps.period}
                className="px-2 py-1 bg-surface-2 border border-border-subtle text-[0.65rem] font-mono tracking-widest text-text-secondary"
              >
                {ps.period} {ps.home}-{ps.away}
              </span>
            ))}
          </div>
        )}

        {intel.isFinished && scoreDiffLabel && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`
              px-3 py-1.5 border text-xs font-mono tracking-widest
              ${intel.result === "home_win" ? "border-live text-live bg-live/5" : ""}
              ${intel.result === "away_win" ? "border-gold text-gold bg-gold/5" : ""}
              ${intel.result === "draw" ? "border-text-secondary text-text-secondary bg-surface-2" : ""}
            `}>
              {intel.resultLabel}
            </span>
            <span className="text-xs text-text-secondary font-mono tracking-widest">
              {scoreDiffLabel}
            </span>
            {intel.hasHalftimeScore && intel.halftimeScore && (
              <span className="text-xs text-text-secondary font-mono">
                HT {intel.halftimeScore.home}-{intel.halftimeScore.away}
              </span>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border-subtle">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <DetailRow label="DATE" value={formatDate(match.startTime)} />
            {match.venue && <DetailRow label="VENUE" value={match.venue} />}
            {match.league.country && (
              <DetailRow label="COUNTRY" value={match.league.country} />
            )}
            <DetailRow label="SPORT" value={match.sport.name} />
            <DetailRow label="COMPETITION" value={match.league.name} />
            <DetailRow label="STATUS" value={intel.stateSummary} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/league/${match.league.id}`}
              className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-text-secondary hover:text-live transition-colors"
            >
              <span aria-hidden="true">→</span>
              VIEW {match.league.name.toUpperCase()}
            </Link>
            <Link
              href={`/matches?leagueId=${encodeURIComponent(match.league.id)}`}
              className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-text-secondary hover:text-live transition-colors"
            >
              <span aria-hidden="true">→</span>
              ALL MATCHES IN {match.league.name.toUpperCase()}
            </Link>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <FavoriteButton item={favoriteItem} />
        </div>
      </div>

      <MatchTabs match={match} stats={stats} events={events} lineups={lineups} />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="technical-label">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
