import type { League } from "@/lib/types/sports";
import LeagueIdentity from "./LeagueIdentity";
import LeagueActions from "./LeagueActions";
import LeagueMeta from "./LeagueMeta";

interface LeagueHeaderProps {
  league: League;
}

export default function LeagueHeader({ league }: LeagueHeaderProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 border-b border-border-subtle">
      <div className="flex items-center justify-between gap-4">
        <LeagueIdentity league={league} />
        <LeagueActions league={league} />
      </div>
      <LeagueMeta league={league} />
    </div>
  );
}
