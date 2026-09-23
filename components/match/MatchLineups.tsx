"use client";

import type { MatchLineup } from "@/lib/types/sports";

interface MatchLineupsPanelProps {
  lineups: MatchLineup[];
}

export default function MatchLineupsPanel({ lineups }: MatchLineupsPanelProps) {
  if (lineups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="technical-label mb-2">LINEUPS</p>
        <p className="text-sm text-text-secondary max-w-sm">
          Lineups are not currently available from the provider.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {lineups.map((lineup) => (
        <div key={lineup.teamId} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-body text-sm font-medium text-text-primary">
                {lineup.teamName}
              </span>
              {lineup.formation && (
                <span className="ml-2 technical-label text-[0.6rem]">
                  {lineup.formation}
                </span>
              )}
            </div>
          </div>

          {lineup.startXI.length > 0 && (
            <div>
              <span className="technical-label text-[0.6rem] block mb-2">STARTING XI</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {lineup.startXI.map((player) => (
                  <PlayerChip key={player.id} player={player} isSubstitute={false} />
                ))}
              </div>
            </div>
          )}

          {lineup.substitutes.length > 0 && (
            <div>
              <span className="technical-label text-[0.6rem] block mb-2">SUBSTITUTES</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {lineup.substitutes.map((player) => (
                  <PlayerChip key={player.id} player={player} isSubstitute />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PlayerChip({ player, isSubstitute }: { player: { id: string; name: string; position: string; number?: number }; isSubstitute: boolean }) {
  return (
    <div
      className={`
        flex items-center gap-2 p-2 border border-border-subtle
        ${isSubstitute ? "bg-surface-1/20" : "bg-surface-2/30"}
      `}
    >
      {player.number != null && (
        <span className="data-number text-xs text-text-secondary w-5 shrink-0 text-center">
          {player.number}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-text-primary truncate">{player.name}</p>
        {player.position && (
          <p className="text-[0.6rem] text-text-secondary uppercase tracking-widest">
            {player.position}
          </p>
        )}
      </div>
      {player.position && player.position.toLowerCase().includes("captain") && (
        <span className="text-[0.55rem] font-mono text-gold tracking-widest shrink-0">C</span>
      )}
    </div>
  );
}
