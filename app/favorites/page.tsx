"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { FavoritesStore } from "@/lib/favorites/types";
import { useFavorites } from "@/lib/favorites/client-store";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import LiveHeader from "@/components/live/LiveHeader";
import EmptyState from "@/components/ui/EmptyState";
import EntityImage from "@/components/ui/EntityImage";

type FilterType = "all" | "teams" | "leagues" | "matches";

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "teams", label: "TEAMS" },
  { id: "leagues", label: "LEAGUES" },
  { id: "matches", label: "MATCHES" },
];

export default function FavoritesPage() {
  const favorites = useFavorites();
  const [filter, setFilter] = useState<FilterType>("all");

  const hasAny = favorites.teams.length > 0 || favorites.leagues.length > 0 || favorites.matches.length > 0;

  const visibleTeams = useMemo(() => sortTeams(favorites.teams), [favorites.teams]);
  const visibleLeagues = useMemo(() => sortLeagues(favorites.leagues), [favorites.leagues]);
  const visibleMatches = useMemo(() => sortMatches(favorites.matches), [favorites.matches]);

  const hasVisible = visibleTeams.length > 0 || visibleLeagues.length > 0 || visibleMatches.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="FAVORITES" subtitle="Your bookmarked teams, leagues, and matches." showLiveIndicator={false} />
      <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`
                  h-8 px-3 font-mono text-[0.65rem] tracking-widest transition-colors
                  ${filter === f.id
                    ? "border-live text-live bg-live/10"
                    : "border-border-default text-text-secondary hover:text-text-primary hover:border-text-secondary"
                  }
                  border
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
          {hasAny && (
            <p className="text-xs text-text-secondary font-mono">
              {favorites.teams.length + favorites.leagues.length + favorites.matches.length} TOTAL FAVORITES
            </p>
          )}
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        {!hasAny ? (
          <EmptyState
            title="NO FAVORITES"
            description="You haven't bookmarked any teams, leagues, or matches yet. Browse matches and tap the heart icon to add favorites."
          />
        ) : !hasVisible ? (
          <EmptyState
            title={`NO ${filter.toUpperCase()} FAVORITES`}
            description={`You haven't bookmarked any ${filter === "teams" ? "teams" : filter === "leagues" ? "leagues" : "matches"} yet.`}
          />
        ) : (
          <div className="space-y-8">
            {visibleTeams.length > 0 && (filter === "all" || filter === "teams") && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="technical-label">TEAMS</h2>
                  <span className="text-xs text-text-secondary font-mono">{visibleTeams.length}</span>
                </div>
                <div className="space-y-2">
                  {visibleTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border-subtle"
                    >
                      <Link
                        href={`/team/${team.id}`}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <EntityImage
                          src={team.logo}
                          alt={`${team.name} logo`}
                          initials={team.name.slice(0, 2).toUpperCase()}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <span className="font-body text-sm text-text-primary truncate block">{team.name}</span>
                          {team.subtitle && (
                            <span className="font-mono text-[0.6rem] text-text-secondary tracking-widest uppercase">
                              {team.subtitle}
                            </span>
                          )}
                        </div>
                      </Link>
                      <FavoriteButton
                        item={team}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {visibleLeagues.length > 0 && (filter === "all" || filter === "leagues") && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="technical-label">LEAGUES</h2>
                  <span className="text-xs text-text-secondary font-mono">{visibleLeagues.length}</span>
                </div>
                <div className="space-y-2">
                  {visibleLeagues.map((league) => (
                    <div
                      key={league.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border-subtle"
                    >
                      <Link
                        href={`/league/${league.id}`}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <EntityImage
                          src={league.logo}
                          alt={`${league.name} logo`}
                          initials={league.name.slice(0, 2).toUpperCase()}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <span className="font-body text-sm text-text-primary truncate block">{league.name}</span>
                          {league.subtitle && (
                            <span className="font-mono text-[0.6rem] text-text-secondary tracking-widest uppercase">
                              {league.subtitle}
                            </span>
                          )}
                        </div>
                      </Link>
                      <FavoriteButton
                        item={league}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {visibleMatches.length > 0 && (filter === "all" || filter === "matches") && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="technical-label">MATCHES</h2>
                  <span className="text-xs text-text-secondary font-mono">{visibleMatches.length}</span>
                </div>
                <div className="space-y-2">
                  {visibleMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border-subtle"
                    >
                      <Link
                        href={`/match/${match.id}`}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <EntityImage
                          src={match.logo}
                          alt={`${match.name} logo`}
                          initials={match.name.slice(0, 2).toUpperCase()}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <span className="font-body text-sm text-text-primary truncate block">{match.name}</span>
                          {match.subtitle && (
                            <span className="font-mono text-[0.6rem] text-text-secondary tracking-widest uppercase">
                              {match.subtitle}
                            </span>
                          )}
                        </div>
                      </Link>
                      <FavoriteButton
                        item={match}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function sortTeams(teams: FavoritesStore["teams"]) {
  return [...teams].sort((a, b) => a.name.localeCompare(b.name));
}

function sortLeagues(leagues: FavoritesStore["leagues"]) {
  return [...leagues].sort((a, b) => a.name.localeCompare(b.name));
}

function sortMatches(matches: FavoritesStore["matches"]) {
  return [...matches].sort((a, b) => a.name.localeCompare(b.name));
}
