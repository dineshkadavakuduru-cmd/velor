"use client";

import FavoriteButton from "@/components/favorites/FavoriteButton";
import type { FavoriteItem } from "@/lib/favorites/types";

interface LeagueActionsProps {
  league: {
    id: string;
    name: string;
    logo?: string;
  };
}

export default function LeagueActions({ league }: LeagueActionsProps) {
  const favoriteItem: FavoriteItem = {
    id: league.id,
    type: "league",
    name: league.name,
    logo: league.logo,
  };

  return (
    <FavoriteButton item={favoriteItem} />
  );
}
