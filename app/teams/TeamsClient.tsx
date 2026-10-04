"use client";

import { useState, useMemo } from "react";
import type { Team } from "@/lib/types/sports";
import LiveHeader from "@/components/live/LiveHeader";
import TeamCard from "@/components/ui/TeamCard";
import EmptyState from "@/components/ui/EmptyState";
import DataFreshness from "@/components/ui/DataFreshness";
import UnavailableSportsNote from "@/components/ui/UnavailableSportsNote";

interface TeamsClientProps {
  initialTeams: Team[];
  syncedAt: string;
  degraded?: boolean;
  unavailableSports?: { id: string; name: string; errorKind?: string }[];
  teamsDerivedFromMatches?: boolean;
}

export default function TeamsClient({
  initialTeams,
  syncedAt,
  degraded = false,
  unavailableSports = [],
  teamsDerivedFromMatches = false,
}: TeamsClientProps) {
  const [search, setSearch] = useState("");
  const [activeSport, setActiveSport] = useState<string | null>(null);

  const sports = useMemo(() => {
    const unique = new Map<string, string>();
    for (const team of initialTeams) {
      if (team.sportId && !unique.has(team.sportId)) {
        unique.set(team.sportId, team.sportId);
      }
    }
    return Array.from(unique.values());
  }, [initialTeams]);

  const teams = useMemo(() => {
    let filtered = initialTeams;
    if (activeSport) {
      filtered = filtered.filter((t) => t.sportId === activeSport);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.shortName.toLowerCase().includes(q) ||
          (t.country && t.country.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [initialTeams, activeSport, search]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader
        title="TEAMS"
        subtitle="Discover teams and their match history."
        matchCount={teams.length}
        countLabel="TEAMS"
      />
      <div className="px-4 sm:px-6 lg:px-10 py-2 border-b border-border-subtle bg-surface-1/30 flex flex-col gap-1">
        <DataFreshness syncedAt={syncedAt} degraded={degraded} />
        {teamsDerivedFromMatches && teams.length > 0 && (
          <p className="text-[0.65rem] text-text-secondary font-mono tracking-widest uppercase">
            Team directory derived from today&apos;s fixtures — full directory unavailable.
          </p>
        )}
        {unavailableSports.length > 0 && (
          <UnavailableSportsNote sports={unavailableSports} />
        )}
      </div>
      <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-border-subtle">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <label htmlFor="team-search" className="technical-label">
              SEARCH TEAMS
            </label>
            <input
              id="team-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or country..."
              className="w-full h-9 px-3 bg-surface-2 border border-border-default text-text-primary text-sm focus:outline-none focus:border-live transition-colors placeholder:text-text-secondary/60"
            />
          </div>
          {sports.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <span className="technical-label">SPORT</span>
              <div className="flex flex-wrap gap-2">
                <SportChip
                  label="ALL"
                  active={activeSport === null}
                  onClick={() => setActiveSport(null)}
                />
                {sports.map((sport) => (
                  <SportChip
                    key={sport}
                    label={sport.toUpperCase()}
                    active={activeSport === sport}
                    onClick={() => setActiveSport(sport)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {teams.length === 0 ? (
          <EmptyState
            title={unavailableSports.length > 0 ? "TEAM DATA UNAVAILABLE" : "NO TEAMS FOUND"}
            description={
              search || activeSport
                ? "No teams match your filters. Try different criteria."
                : unavailableSports.length > 0
                  ? `Team data could not be loaded for: ${unavailableSports.map((s) => s.name).join(", ")}. Please try again later.`
                  : "No teams available at the moment."
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <TeamCardWrapper key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SportChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        h-7 px-3 font-mono text-[0.65rem] tracking-widest transition-colors
        ${active
          ? "bg-live/10 text-live border border-live/30"
          : "bg-surface-2 text-text-secondary border border-border-default hover:text-text-primary hover:border-border-strong"
        }
      `}
    >
      {label}
    </button>
  );
}

function TeamCardWrapper({ team }: { team: Team }) {
  return (
    <TeamCard team={team} href={`/team/${team.id}`} />
  );
}
