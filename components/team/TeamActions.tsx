"use client";

import FavoriteButton from "@/components/favorites/FavoriteButton";
import type { FavoriteItem } from "@/lib/favorites/types";

interface TeamActionsProps {
  team: {
    id: string;
    name: string;
    logo?: string;
  };
}

export default function TeamActions({ team }: TeamActionsProps) {
  const favoriteItem: FavoriteItem = {
    id: team.id,
    type: "team",
    name: team.name,
    logo: team.logo,
  };

  return (
    <FavoriteButton item={favoriteItem} />
  );
}
