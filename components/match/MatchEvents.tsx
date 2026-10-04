"use client";

import Link from "next/link";
import type { MatchEvent } from "@/lib/types/sports";

interface MatchEventsPanelProps {
  events: MatchEvent[];
  homeTeamId?: string;
  awayTeamId?: string;
}

const EVENT_CONFIG: Record<string, { label: string; homeClass: string; awayClass: string }> = {
  goal: { label: "GOAL", homeClass: "border-live bg-live/10", awayClass: "border-gold bg-gold/10" },
  card: { label: "CARD", homeClass: "border-danger bg-danger/10", awayClass: "border-danger bg-danger/10" },
  substitution: { label: "SUB", homeClass: "border-data bg-data/10", awayClass: "border-data bg-data/10" },
  period_start: { label: "START", homeClass: "border-text-secondary bg-surface-2", awayClass: "border-text-secondary bg-surface-2" },
  period_end: { label: "END", homeClass: "border-text-secondary bg-surface-2", awayClass: "border-text-secondary bg-surface-2" },
  penalty: { label: "PEN", homeClass: "border-live bg-live/10", awayClass: "border-gold bg-gold/10" },
  var: { label: "VAR", homeClass: "border-data bg-data/10", awayClass: "border-data bg-data/10" },
};

export default function MatchEventsPanel({ events, homeTeamId, awayTeamId }: MatchEventsPanelProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="technical-label mb-2">MATCH EVENTS</p>
        <p className="text-sm text-text-secondary max-w-sm">
          Events are not currently available from the provider.
        </p>
      </div>
    );
  }

  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="technical-label">MATCH EVENTS</span>
        <span className="text-xs text-text-secondary font-mono">
          {sorted.length} EVENTS
        </span>
      </div>
      <div className="space-y-3">
        {sorted.map((event) => {
          const config = EVENT_CONFIG[event.type] ?? { label: event.type.toUpperCase(), homeClass: "border-text-secondary bg-surface-2", awayClass: "border-text-secondary bg-surface-2" };
          const isHome = event.teamId === homeTeamId;
          const isAway = event.teamId === awayTeamId;
          const teamClass = isHome ? config.homeClass : isAway ? config.awayClass : "border-text-secondary bg-surface-2";
          const teamLabel = isHome ? "HOME" : isAway ? "AWAY" : "";

          return (
            <div
              key={event.id}
              className={`flex items-start gap-3 p-3 border-l-4 ${teamClass}`}
            >
              <div className="flex flex-col items-center gap-1 shrink-0 w-12">
                <span className="data-number text-sm text-text-primary">
                  {event.minute}&apos;
                </span>
                {teamLabel && (
                  <span className="text-[0.55rem] font-mono tracking-widest text-text-secondary uppercase">
                    {teamLabel}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="technical-label text-[0.6rem] text-live">
                    {config.label}
                  </span>
                  {event.detail && (
                    <span className="text-[0.6rem] text-text-secondary font-mono">
                      {event.detail}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-primary truncate">
                  {event.playerId ? (
                    <Link
                      href={`/player/${event.playerId}`}
                      className="hover:text-live transition-colors"
                    >
                      {event.playerName}
                    </Link>
                  ) : (
                    event.playerName
                  )}
                </p>
                {event.assistPlayerName && (
                  <p className="text-xs text-text-secondary mt-0.5">
                    Assist:{" "}
                    {event.assistPlayerId ? (
                      <Link
                        href={`/player/${event.assistPlayerId}`}
                        className="hover:text-live transition-colors"
                      >
                        {event.assistPlayerName}
                      </Link>
                    ) : (
                      event.assistPlayerName
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
