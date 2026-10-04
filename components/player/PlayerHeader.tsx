"use client";

import Link from "next/link";
import type { Player, Team } from "@/lib/types/sports";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import type { FavoriteItem } from "@/lib/favorites/types";

interface PlayerHeaderProps {
  player: Player;
  team?: Team | null;
}

export default function PlayerHeader({ player, team }: PlayerHeaderProps) {
  const favoriteItem: FavoriteItem = {
    id: player.id,
    type: "team",
    name: player.name,
    logo: team?.logo,
    sportId: player.sportId ?? team?.sportId,
  };

  const nationality = player.nationality ?? "";
  const jersey = player.jerseyNumber;
  const position = player.position ?? "";

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 border-2 border-border-subtle bg-surface-2/40">
            <span className="data-number text-3xl text-text-primary font-medium">
              {jersey ?? "-"}
            </span>
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-text-primary">
              {player.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {position && (
                <span className="technical-label text-[0.65rem] text-text-secondary">
                  {position.toUpperCase()}
                </span>
              )}
              {nationality && (
                <>
                  <span className="technical-label text-[0.6rem] text-text-secondary">•</span>
                  <span className="font-body text-sm text-text-secondary">{nationality}</span>
                </>
              )}
              {jersey != null && (
                <>
                  <span className="technical-label text-[0.6rem] text-text-secondary">•</span>
                  <span className="font-mono text-sm text-text-secondary data-number">
                    #{jersey}
                  </span>
                </>
              )}
            </div>
            {team && (
              <div className="mt-3">
                <Link
                  href={`/team/${team.id}`}
                  className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-live transition-colors"
                >
                  <span className="font-body text-sm text-text-primary">{team.name}</span>
                  <span className="technical-label text-[0.6rem] text-text-secondary">
                    {team.shortName}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FavoriteButton item={favoriteItem} />
        </div>
      </div>
    </div>
  );
}
