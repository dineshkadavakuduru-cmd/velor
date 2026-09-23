import type { Team } from "@/lib/types/sports";

interface TeamMetaProps {
  team: Team;
}

export default function TeamMeta({ team }: TeamMetaProps) {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {team.country && <DetailRow label="COUNTRY" value={team.country} />}
      {team.venue && <DetailRow label="VENUE" value={team.venue} />}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="technical-label">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}
