"use client";

import type { League } from "@/lib/types/sports";
import EntityImage from "@/components/ui/EntityImage";

interface LeagueIdentityProps {
  league: League;
}

export default function LeagueIdentity({ league }: LeagueIdentityProps) {
  const initials = league.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <EntityImage
        src={league.logo}
        alt={`${league.name} logo`}
        initials={initials}
        size="lg"
      />
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-text-primary">
          {league.name}
        </h1>
        <p className="font-mono text-xs text-text-secondary tracking-widest uppercase mt-0.5">
          {league.country}
        </p>
      </div>
    </div>
  );
}
