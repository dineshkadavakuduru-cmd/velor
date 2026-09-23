interface HeroDataRailProps {
  liveCount: number;
  matchCount: number;
  leagueCount: number;
  teamCount: number;
}

export default function HeroDataRail({ liveCount, matchCount, leagueCount, teamCount }: HeroDataRailProps) {
  return (
    <div
      className="flex items-stretch border-t border-border-subtle"
      data-hero-data-rail
    >
      <RailItem label="LIVE" value={liveCount} />
      <RailItem label="MATCHES" value={matchCount} />
      <RailItem label="LEAGUES" value={leagueCount} />
      <RailItem label="TEAMS" value={teamCount} />
    </div>
  );
}

function RailItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 flex flex-col items-center sm:items-start gap-1 px-5 sm:px-6 py-4 sm:border-r border-border-subtle last:border-r-0">
      <span className="technical-label">{label}</span>
      <span className="data-number text-sm text-text-primary">{value}</span>
    </div>
  );
}
