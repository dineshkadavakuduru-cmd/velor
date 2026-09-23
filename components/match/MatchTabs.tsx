"use client";

import { useState, useCallback } from "react";
import type { Match, MatchEvent, MatchStatistics, MatchLineup } from "@/lib/types/sports";
import { getMatchIntelligence, getScoreDifferenceLabel } from "@/lib/utils/derivedMetrics";
import MatchStatisticsPanel from "./MatchStatistics";
import MatchEventsPanel from "./MatchEvents";
import MatchLineupsPanel from "./MatchLineups";

interface MatchTabsProps {
  match: Match;
  stats: MatchStatistics[];
  events: MatchEvent[];
  lineups: MatchLineup[];
}

type TabId = "overview" | "stats" | "lineups" | "events";

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: "overview", label: "OVERVIEW" },
  { id: "stats", label: "STATS" },
  { id: "lineups", label: "LINEUPS" },
  { id: "events", label: "EVENTS" },
];

export default function MatchTabs({ match, stats, events, lineups }: MatchTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const hasStats = stats.length > 0;
  const hasLineups = lineups.length > 0;
  const hasEvents = events.length > 0;

  const availableTabs = TABS.filter((tab) => {
    if (tab.id === "overview") return true;
    if (tab.id === "stats") return hasStats;
    if (tab.id === "lineups") return hasLineups;
    if (tab.id === "events") return hasEvents;
    return false;
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = availableTabs.findIndex((t) => t.id === activeTab);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % availableTabs.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + availableTabs.length) % availableTabs.length;
      } else if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = availableTabs.length - 1;
      } else {
        return;
      }

      e.preventDefault();
      setActiveTab(availableTabs[nextIndex].id);
    },
    [activeTab, availableTabs]
  );

  return (
    <div className="border-b border-border-subtle">
      <div className="px-4 sm:px-6 lg:px-10">
        <div
          className="flex gap-0 overflow-x-auto"
          role="tablist"
          aria-label="Match sections"
          onKeyDown={handleKeyDown}
        >
          {TABS.map((tab) => {
            const isAvailable =
              (tab.id === "overview") ||
              (tab.id === "stats" && hasStats) ||
              (tab.id === "lineups" && hasLineups) ||
              (tab.id === "events" && hasEvents);

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                disabled={!isAvailable && tab.id !== "overview"}
                onClick={() => isAvailable && setActiveTab(tab.id)}
                className={`
                  px-4 py-3 font-mono text-xs tracking-widest whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? "border-live text-live"
                    : isAvailable
                      ? "border-transparent text-text-secondary hover:text-text-primary"
                      : "border-transparent text-text-secondary/40 cursor-default"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <TabPanel tabId="overview" active={activeTab}>
        <OverviewTab match={match} />
      </TabPanel>

      <TabPanel tabId="stats" active={activeTab} available={hasStats}>
        {hasStats ? (
          <MatchStatisticsPanel stats={stats} homeTeamId={match.homeTeam.id} awayTeamId={match.awayTeam.id} />
        ) : (
          <DataNotAvailable label="MATCH STATISTICS" />
        )}
      </TabPanel>

      <TabPanel tabId="lineups" active={activeTab} available={hasLineups}>
        {hasLineups ? (
          <MatchLineupsPanel lineups={lineups} />
        ) : (
          <DataNotAvailable label="LINEUPS" />
        )}
      </TabPanel>

      <TabPanel tabId="events" active={activeTab} available={hasEvents}>
        {hasEvents ? (
          <MatchEventsPanel
            events={events}
            homeTeamId={match.homeTeam.id}
            awayTeamId={match.awayTeam.id}
          />
        ) : (
          <DataNotAvailable label="MATCH EVENTS" />
        )}
      </TabPanel>
    </div>
  );
}

function TabPanel({ tabId, active, available, children }: { tabId: TabId; active: TabId; available?: boolean; children: React.ReactNode }) {
  const isActive = active === tabId;
  if (!isActive && !available) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      hidden={!isActive}
      className={!isActive ? "hidden" : "px-4 sm:px-6 lg:px-10 py-6"}
    >
      {children}
    </div>
  );
}

function OverviewTab({ match }: { match: Match }) {
  const intel = getMatchIntelligence(match);
  const scoreDiffLabel = getScoreDifferenceLabel(match);

  return (
    <div className="space-y-6">
      {intel.isFinished && intel.result && (
        <div className="flex flex-wrap items-center gap-3">
          <span className={`
            px-3 py-1.5 border text-xs font-mono tracking-widest
            ${intel.result === "home_win" ? "border-live text-live bg-live/5" : ""}
            ${intel.result === "away_win" ? "border-gold text-gold bg-gold/5" : ""}
            ${intel.result === "draw" ? "border-text-secondary text-text-secondary bg-surface-2" : ""}
          `}>
            {intel.resultLabel}
          </span>
          {scoreDiffLabel && (
            <span className="text-xs text-text-secondary font-mono tracking-widest">
              {scoreDiffLabel}
            </span>
          )}
          {intel.hasHalftimeScore && intel.halftimeScore && (
            <span className="text-xs text-text-secondary font-mono">
              HALFTIME {intel.halftimeScore.home}-{intel.halftimeScore.away}
            </span>
          )}
        </div>
      )}

      {match.score.periodScores && match.score.periodScores.length > 0 && (
        <div className="pt-4 border-t border-border-subtle">
          <span className="technical-label block mb-3">PERIOD SCORES</span>
          <div className="flex flex-wrap gap-2">
            {match.score.periodScores.map((ps) => (
              <span
                key={ps.period}
                className="px-3 py-1.5 bg-surface-2 border border-border-subtle text-sm font-mono tracking-widest text-text-primary"
              >
                {ps.period} {ps.home}-{ps.away}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="technical-label">MATCH STATE</span>
          <span className="text-sm text-text-primary capitalize">{intel.stateSummary}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="technical-label">START TIME</span>
          <span className="text-sm text-text-primary">
            {new Date(match.startTime).toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="technical-label">COMPETITION</span>
          <span className="text-sm text-text-primary">{match.league.name}</span>
        </div>
        {match.venue && (
          <div className="flex flex-col gap-1">
            <span className="technical-label">VENUE</span>
            <span className="text-sm text-text-primary">{match.venue}</span>
          </div>
        )}
        {match.league.country && (
          <div className="flex flex-col gap-1">
            <span className="technical-label">COUNTRY</span>
            <span className="text-sm text-text-primary">{match.league.country}</span>
          </div>
        )}
        {match.period && (
          <div className="flex flex-col gap-1">
            <span className="technical-label">PERIOD</span>
            <span className="text-sm text-text-primary">{match.period}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DataNotAvailable({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <p className="technical-label mb-2">{label}</p>
      <p className="text-sm text-text-secondary max-w-sm">
        This data is not currently available from the provider.
      </p>
    </div>
  );
}
