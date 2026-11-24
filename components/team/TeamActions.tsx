"use client";

import FavoriteButton from "@/components/favorites/FavoriteButton";
import type { FavoriteItem } from "@/lib/favorites/types";
import type { Team } from "@/lib/types/sports";
import { teamSubtitle } from "@/lib/utils/entityIdentity";

interface TeamActionsProps {
  team: Team;
}

export default function TeamActions({ team }: TeamActionsProps) {
  const favoriteItem: FavoriteItem = {
    id: team.id,
    type: "team",
    name: team.name,
    logo: team.logo,
    sportId: team.sportId,
    subtitle: teamSubtitle(team),
  };

  return (
    <FavoriteButton item={favoriteItem} />
  );
}
