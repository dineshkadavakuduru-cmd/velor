import Link from "next/link";
import EntityImage from "./EntityImage";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import type { Team } from "@/lib/types/sports";

interface TeamCardProps {
  team: Team;
  href?: string;
  showCountry?: boolean;
  showVenue?: boolean;
}

export default function TeamCard({ team, href, showCountry = true, showVenue = true }: TeamCardProps) {
  const favoriteItem = {
    id: team.id,
    type: "team" as const,
    name: team.name,
    logo: team.logo,
  };

  const initials = team.shortName.slice(0, 3).toUpperCase();

  const cardContent = (
    <div className="relative flex flex-col gap-3 p-4 sm:p-5 border border-border-default bg-surface-1/40 hover:bg-surface-2/40 hover:border-border-strong transition-colors">
      {href && <Link href={href} aria-label={`View ${team.name}`} className="absolute inset-0" />}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <EntityImage
            src={team.logo}
            alt={`${team.name} logo`}
            initials={initials}
            size="md"
          />
          <div className="min-w-0">
            <p className="font-body text-sm text-text-primary truncate">{team.name}</p>
            <p className="font-mono text-[0.65rem] text-text-secondary tracking-widest uppercase">
              {team.shortName}
            </p>
          </div>
        </div>
        <div className="relative z-10">
          <FavoriteButton item={favoriteItem} />
        </div>
      </div>
      {showCountry && team.country && (
        <p className="text-xs text-text-secondary font-mono tracking-wide">
          {team.country}
        </p>
      )}
      {showVenue && team.venue && (
        <p className="text-xs text-text-secondary/70 truncate">
          {team.venue}
        </p>
      )}
    </div>
  );

  if (!href) return cardContent;

  return cardContent;
}
