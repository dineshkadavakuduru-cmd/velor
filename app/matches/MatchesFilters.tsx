"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { League } from "@/lib/types/sports";
import { getFirstValue } from "@/lib/api/validate";

interface MatchesFiltersProps {
  leagues: League[];
  currentFilters: Record<string, string | string[] | undefined>;
}

const DAYS_TO_SHOW = 5;
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

function addDays(iso: string, days: number): string {
  const date = new Date(iso + "T00:00:00");
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateLabel(iso: string): { day: string; month: string } {
  const date = new Date(iso + "T00:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  return { day, month };
}

export default function MatchesFilters({
  leagues,
  currentFilters,
}: MatchesFiltersProps) {
  const activeSport = getFirstValue(currentFilters.sport);
  const activeLeague = getFirstValue(currentFilters.leagueId);
  const activeDate = getFirstValue(currentFilters.date);
  const activeStatus = getFirstValue(currentFilters.status);

  const sports = useMemo(() => {
    const unique = new Map<string, string>();
    for (const league of leagues) {
      if (!unique.has(league.sportId)) {
        unique.set(league.sportId, league.sportId);
      }
    }
    return Array.from(unique.values());
  }, [leagues]);

  const hasActiveFilters = Boolean(activeSport || activeLeague || activeDate || activeStatus);

  const buildHref = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      if (activeSport && !overrides.sport) params.set("sport", activeSport);
      if (activeLeague && !overrides.leagueId) params.set("leagueId", activeLeague);
      if (activeDate && !overrides.date) params.set("date", activeDate);
      if (activeStatus && !overrides.status) params.set("status", activeStatus);
      for (const [key, value] of Object.entries(overrides)) {
        if (value) params.set(key, value);
      }
      const qs = params.toString();
      return qs ? `/matches?${qs}` : "/matches";
    },
    [activeSport, activeLeague, activeDate, activeStatus]
  );

  const todayIso = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const selectedDate = activeDate && DATE_FORMAT.test(activeDate) ? activeDate : todayIso;

  const dateRange = useMemo(() => {
    const startOffset = -Math.floor(DAYS_TO_SHOW / 2);
    const dates: string[] = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      dates.push(addDays(selectedDate, startOffset + i));
    }
    return dates;
  }, [selectedDate]);

  const prevDate = useMemo(() => addDays(dateRange[0], -1), [dateRange]);
  const nextDate = useMemo(() => addDays(dateRange[dateRange.length - 1], 1), [dateRange]);

  const STATUS_OPTIONS = [
    { value: "", label: "ALL" },
    { value: "live", label: "LIVE" },
    { value: "scheduled", label: "UPCOMING" },
    { value: "finished", label: "FINISHED" },
  ];

  return (
    <form
      method="get"
      action="/matches"
      className="px-4 sm:px-6 lg:px-10 py-4 border-b border-border-subtle bg-surface-1/30"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <label htmlFor="sport-filter" className="technical-label">
              SPORT
            </label>
            <select
              id="sport-filter"
              name="sport"
              defaultValue={activeSport ?? ""}
              className="h-9 px-3 bg-surface-2 border border-border-default text-text-primary text-sm focus:outline-none focus:border-live transition-colors"
            >
              <option value="">All Sports</option>
              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <label htmlFor="league-filter" className="technical-label">
              LEAGUE
            </label>
            <select
              id="league-filter"
              name="leagueId"
              defaultValue={activeLeague ?? ""}
              className="h-9 px-3 bg-surface-2 border border-border-default text-text-primary text-sm focus:outline-none focus:border-live transition-colors"
            >
              <option value="">All Leagues</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <label htmlFor="status-filter" className="technical-label">
              STATUS
            </label>
            <select
              id="status-filter"
              name="status"
              defaultValue={activeStatus ?? ""}
              className="h-9 px-3 bg-surface-2 border border-border-default text-text-primary text-sm focus:outline-none focus:border-live transition-colors"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {activeDate && (
            <input type="hidden" name="date" value={activeDate} />
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="h-9 px-4 bg-text-primary text-background font-mono text-xs tracking-widest hover:opacity-90 transition-opacity"
            >
              APPLY
            </button>
            {hasActiveFilters && (
              <Link
                href="/matches"
                className="h-9 px-4 border border-border-default text-text-secondary font-mono text-xs tracking-widest hover:text-text-primary hover:border-text-secondary transition-colors inline-flex items-center"
              >
                CLEAR
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={buildHref({ date: prevDate })}
            aria-label="Previous day"
            className="inline-flex items-center justify-center h-8 w-8 border border-border-default text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <Link
            href={buildHref({ date: todayIso })}
            aria-label="Today"
            aria-pressed={activeDate === todayIso}
            className={`inline-flex items-center justify-center h-8 px-3 border transition-colors font-mono text-[0.65rem] tracking-widest ${
              activeDate === todayIso
                ? "border-live text-live bg-live/10"
                : "border-border-default text-text-secondary hover:text-text-primary hover:border-text-secondary"
            }`}
          >
            TODAY
          </Link>

          <div className="flex items-center gap-1 flex-1 justify-center overflow-x-auto">
            {dateRange.map((date) => {
              const isActive = date === selectedDate;
              const { day, month } = formatDateLabel(date);
              const dayName = new Date(date + "T00:00:00")
                .toLocaleString("en-US", { weekday: "short" })
                .toUpperCase();
              return (
                <Link
                  key={date}
                  href={buildHref({ date })}
                  aria-pressed={isActive}
                  className={`
                    flex flex-col items-center justify-center min-w-[3.5rem] h-12 px-1 border transition-colors
                    ${isActive
                      ? "border-live bg-live/10 text-live"
                      : "border-border-default text-text-secondary hover:text-text-primary hover:border-text-secondary"
                    }
                  `}
                >
                  <span className="font-mono text-[0.6rem] tracking-widest">{dayName}</span>
                  <span className="font-mono text-sm font-medium leading-none mt-0.5">{day}</span>
                  <span className="font-mono text-[0.55rem] tracking-wider mt-0.5">{month}</span>
                </Link>
              );
            })}
          </div>

          <Link
            href={buildHref({ date: nextDate })}
            aria-label="Next day"
            className="inline-flex items-center justify-center h-8 w-8 border border-border-default text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {activeSport && (
              <ActiveFilter
                label={`Sport: ${activeSport}`}
                href={buildHref({ sport: "" })}
              />
            )}
            {activeLeague && (
              <ActiveFilter
                label={`League: ${leagues.find((l) => l.id === activeLeague)?.name ?? activeLeague}`}
                href={buildHref({ leagueId: "" })}
              />
            )}
            {activeDate && (
              <ActiveFilter
                label={`Date: ${activeDate}`}
                href={buildHref({ date: "" })}
              />
            )}
            {activeStatus && (
              <ActiveFilter
                label={`Status: ${activeStatus.toUpperCase()}`}
                href={buildHref({ status: "" })}
              />
            )}
          </div>
        )}
      </div>
    </form>
  );
}

function ActiveFilter({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border-subtle text-xs text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
    >
      <span>{label}</span>
      <span aria-hidden="true" className="text-text-secondary">
        ×
      </span>
    </Link>
  );
}
