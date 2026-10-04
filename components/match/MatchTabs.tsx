"use client";

import { useState, useCallback } from "react";
import type { Match, MatchEvent, MatchStatistics, MatchLineup } from "@/lib/types/sports";
import { getMatchIntelligence } from "@/lib/utils/derivedMetrics";
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
        <OverviewTab match={match} stats={stats} events={events} lineups={lineups} />
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

function OverviewTab({ match, stats, events, lineups }: { match: Match; stats: MatchStatistics[]; events: MatchEvent[]; lineups: MatchLineup[] }) {
  const intel = getMatchIntelligence(match);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="technical-label">MATCH STATE</span>
          <span className="text-sm text-text-primary capitalize">{intel.stateSummary}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="technical-label">SPORT</span>
          <span className="text-sm text-text-primary">{match.sport.name}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="technical-label">COMPETITION</span>
          <span className="text-sm text-text-primary">{match.league.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
        <KeyMetric label="TOTAL EVENTS" value={events.length.toString()} />
        <KeyMetric label="PERIOD SCORES" value={match.score.periodScores?.length ? match.score.periodScores.map((ps) => `${ps.period} ${ps.home}-${ps.away}`).join(", ") : "N/A"} />
      </div>
    </div>
  );
}

function KeyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="technical-label">{label}</span>
      <span className="data-number text-sm text-text-primary">{value}</span>
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
