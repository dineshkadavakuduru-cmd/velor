import type { Team } from "@/lib/types/sports";
import TeamIdentity from "./TeamIdentity";
import TeamActions from "./TeamActions";
import TeamMeta from "./TeamMeta";

interface TeamHeaderProps {
  team: Team;
}

export default function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 border-b border-border-subtle">
      <div className="flex items-center justify-between gap-4">
        <TeamIdentity team={team} />
        <TeamActions team={team} />
      </div>
      <TeamMeta team={team} />
    </div>
  );
}
