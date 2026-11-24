import { getSportDisplayName } from "../api/sports";
import type { Team } from "../types/sports";

export function entityHref(type: "team" | "match" | "league" | "player", id: string, sportId?: string) {
  const path = `/${type}/${encodeURIComponent(id)}`;
  return sportId ? `${path}?sport=${encodeURIComponent(sportId)}` : path;
}

export function teamSubtitle(team: Team) {
  return [team.sportId && getSportDisplayName(team.sportId), team.squadCategory, team.competition ?? team.country]
    .filter(Boolean).join(" · ");
}
