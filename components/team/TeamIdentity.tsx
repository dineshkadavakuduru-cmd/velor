"use client";

import type { Team } from "@/lib/types/sports";
import EntityImage from "@/components/ui/EntityImage";

interface TeamIdentityProps {
  team: Team;
}

export default function TeamIdentity({ team }: TeamIdentityProps) {
  const initials = team.shortName.slice(0, 3).toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <EntityImage
        src={team.logo}
        alt={`${team.name} logo`}
        initials={initials}
        size="lg"
      />
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-text-primary">
          {team.name}
        </h1>
        {team.shortName && (
          <p className="font-mono text-xs text-text-secondary tracking-widest uppercase mt-0.5">
            {team.shortName}
          </p>
        )}
      </div>
    </div>
  );
}
