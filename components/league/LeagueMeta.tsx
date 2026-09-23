import type { League } from "@/lib/types/sports";

interface LeagueMetaProps {
  league: League;
}

export default function LeagueMeta({ league }: LeagueMetaProps) {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <DetailRow label="COUNTRY" value={league.country} />
      <DetailRow label="SPORT" value={league.sportId} />
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
