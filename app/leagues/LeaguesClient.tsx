"use client";

import { useState, useMemo } from "react";
import type { League } from "@/lib/types/sports";
import LiveHeader from "@/components/live/LiveHeader";
import LeagueCard from "@/components/ui/LeagueCard";
import EmptyState from "@/components/ui/EmptyState";

interface LeaguesClientProps {
  initialLeagues: League[];
}

export default function LeaguesClient({ initialLeagues }: LeaguesClientProps) {
  const [search, setSearch] = useState("");
  const [activeSport, setActiveSport] = useState<string | null>(null);

  const sports = useMemo(() => {
    const unique = new Map<string, string>();
    for (const league of initialLeagues) {
      if (!unique.has(league.sportId)) {
        unique.set(league.sportId, league.sportId);
      }
    }
    return Array.from(unique.values());
  }, [initialLeagues]);

  const leagues = useMemo(() => {
    let filtered = initialLeagues;
    if (activeSport) {
      filtered = filtered.filter((l) => l.sportId === activeSport);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.country.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [initialLeagues, activeSport, search]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader
        title="LEAGUES"
        subtitle="Discover leagues and competitions."
        matchCount={leagues.length}
        countLabel="LEAGUES"
      />
      <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-border-subtle">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <label htmlFor="league-search" className="technical-label">
              SEARCH
            </label>
            <input
              id="league-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or country..."
              className="h-9 px-3 bg-surface-2 border border-border-default text-text-primary text-sm focus:outline-none focus:border-live transition-colors placeholder:text-text-secondary/60"
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
        {leagues.length === 0 ? (
          <EmptyState
            title="NO LEAGUES FOUND"
            description={
              search
                ? "No leagues match your search. Try a different term."
                : "No leagues available at the moment."
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leagues.map((league) => (
              <LeagueCardWrapper key={league.id} league={league} />
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

function LeagueCardWrapper({ league }: { league: League }) {
  return (
    <LeagueCard league={league} href={`/league/${league.id}`} />
  );
}
