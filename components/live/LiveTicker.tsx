const MATCHES = [
  {
    competition: "Premier League",
    home: "Arsenal",
    away: "Chelsea",
    homeScore: 2,
    awayScore: 1,
    time: "72'",
  },
  {
    competition: "La Liga",
    home: "Real Madrid",
    away: "Barcelona",
    homeScore: 1,
    awayScore: 0,
    time: "64'",
  },
  {
    competition: "Serie A",
    home: "Inter",
    away: "Milan",
    homeScore: 0,
    awayScore: 0,
    time: "31'",
  },
  {
    competition: "NBA",
    home: "Boston",
    away: "Los Angeles",
    homeScore: 108,
    awayScore: 104,
    time: "Q4",
  },
  {
    competition: "NFL",
    home: "Kansas City",
    away: "Buffalo",
    homeScore: 21,
    awayScore: 17,
    time: "Q3",
  },
  {
    competition: "Ligue 1",
    home: "PSG",
    away: "Lyon",
    homeScore: 3,
    awayScore: 1,
    time: "85'",
  },
  {
    competition: "ATP Tour",
    home: "Alcaraz",
    away: "Sinner",
    homeScore: 1,
    awayScore: 2,
    time: "Set 3",
  },
];

export default function LiveTicker() {
  return (
    <div
      className="border-b border-border-subtle bg-surface-1/60"
      aria-label="Live matches ticker"
      data-shell-ticker
    >
      <div className="flex items-stretch overflow-x-auto">
        {MATCHES.map((match, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 flex items-center gap-4 px-5 py-3 border-r border-border-subtle last:border-r-0 hover:bg-surface-2/50 transition-colors cursor-default"
          >
            <span className="technical-label w-24 truncate">
              {match.competition}
            </span>
            <span className="font-body text-sm text-text-secondary w-28 truncate">
              {match.home} — {match.away}
            </span>
            <span className="data-number text-sm font-medium text-text-primary w-16 text-right">
              {match.homeScore} — {match.awayScore}
            </span>
            <span className="data-number text-xs text-text-secondary w-12 text-right">
              {match.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
