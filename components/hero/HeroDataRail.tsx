import DataFreshness from "@/components/ui/DataFreshness";

interface HeroDataRailProps {
  liveCount: number;
  matchCount: number;
  leagueCount: number;
  teamCount: number;
  syncedAt: string;
  degraded?: boolean;
}

export default function HeroDataRail({ liveCount, matchCount, leagueCount, teamCount, syncedAt, degraded = false }: HeroDataRailProps) {
  return (
    <div data-hero-data-rail>
      <div
        className="flex items-stretch border-t border-border-subtle"
        role="status"
        aria-label={`${liveCount} live ${liveCount === 1 ? "match" : "matches"}, ${matchCount} total ${matchCount === 1 ? "match" : "matches"}, ${leagueCount} ${leagueCount === 1 ? "league" : "leagues"}, ${teamCount} ${teamCount === 1 ? "team" : "teams"}`}
      >
        <RailItem label="LIVE" value={liveCount} live />
        <RailItem label="MATCHES" value={matchCount} />
        <RailItem label="LEAGUES" value={leagueCount} />
        <RailItem label="TEAMS" value={teamCount} />
      </div>
      <div className="border-t border-border-subtle px-5 sm:px-6 py-2">
        <DataFreshness syncedAt={syncedAt} degraded={degraded} />
      </div>
    </div>
  );
}

function RailItem({ label, value, live = false }: { label: string; value: number; live?: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center sm:items-start gap-1 px-5 sm:px-6 py-4 sm:border-r border-border-subtle last:border-r-0">
      <span className="technical-label">{label}</span>
      <span className="data-number text-sm text-text-primary" aria-live={live ? "polite" : undefined}>{value}</span>
    </div>
  );
}
