import Link from "next/link";
import EntityImage from "./EntityImage";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import type { League } from "@/lib/types/sports";

interface LeagueCardProps {
  league: League;
  href?: string;
}

export default function LeagueCard({ league, href }: LeagueCardProps) {
  const favoriteItem = {
    id: league.id,
    type: "league" as const,
    name: league.name,
    logo: league.logo,
  };

  const initials = league.name.slice(0, 2).toUpperCase();

  const cardContent = (
    <div className="relative flex flex-col gap-3 p-4 sm:p-5 border border-border-default bg-surface-1/40 hover:bg-surface-2/40 hover:border-border-strong transition-colors">
      {href && <Link href={href} aria-label={`View ${league.name}`} className="absolute inset-0" />}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <EntityImage
            src={league.logo}
            alt={`${league.name} logo`}
            initials={initials}
            size="md"
          />
          <div className="min-w-0">
            <p className="font-body text-sm text-text-primary truncate">{league.name}</p>
            <p className="font-mono text-[0.65rem] text-text-secondary tracking-widest uppercase">
              {league.country}
            </p>
          </div>
        </div>
        <div className="relative z-10">
          <FavoriteButton item={favoriteItem} />
        </div>
      </div>
    </div>
  );

  if (!href) return cardContent;

  return cardContent;
}
