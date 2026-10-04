import type { Player } from "@/lib/types/sports";

interface PlayerMetricsProps {
  player: Player;
}

interface MetricGroup {
  label: string;
  metrics: { label: string; value: string | number }[];
}

type StatRecord = Record<string, unknown>;

function num(stats: StatRecord, key: string): number {
  const val = stats[key];
  return typeof val === "number" ? val : 0;
}

function str(stats: StatRecord, key: string, fallback = "-"): string {
  const val = stats[key];
  return typeof val === "string" ? val : fallback;
}

export default function PlayerMetrics({ player }: PlayerMetricsProps) {
  const stats = (player.stats ?? {}) as StatRecord;
  const isFootballLike = "goals" in stats || "assists" in stats;
  const isBasketballLike = "points" in stats || "rebounds" in stats;
  const isCricketLike = "runs" in stats || "wickets" in stats;
  const isTennisLike = "aces" in stats || "winners" in stats;

  let groups: MetricGroup[] = [];

  if (isFootballLike) {
    const apps = num(stats, "appearances");
    const goals = num(stats, "goals");
    const ppg = apps > 0 ? ((goals / apps) * 90).toFixed(2) : "0";

    groups = [
      {
        label: "APPEARANCES",
        metrics: [
          { label: "Apps", value: apps },
          { label: "Goals", value: goals },
          { label: "Assists", value: num(stats, "assists") },
        ],
      },
      {
        label: "MINUTES",
        metrics: [
          { label: "Mins", value: num(stats, "minutes") },
          { label: "PPG", value: ppg },
        ],
      },
    ];
  } else if (isBasketballLike) {
    const points = num(stats, "points");
    const apps = num(stats, "appearances");
    const ppg = apps > 0 ? (points / apps).toFixed(1) : "0";

    groups = [
      {
        label: "SCORING",
        metrics: [
          { label: "Pts", value: points },
          { label: "Reb", value: num(stats, "rebounds") },
          { label: "Ast", value: num(stats, "assists") },
        ],
      },
      {
        label: "SHOOTING",
        metrics: [
          { label: "MIN", value: num(stats, "minutes") },
          { label: "PPG", value: ppg },
        ],
      },
    ];
  } else if (isCricketLike) {
    groups = [
      {
        label: "BATTING",
        metrics: [
          { label: "Runs", value: num(stats, "runs") },
          { label: "Avg", value: num(stats, "average") },
          { label: "HS", value: str(stats, "highScore") },
        ],
      },
      {
        label: "BOWLING",
        metrics: [
          { label: "Wkts", value: num(stats, "wickets") },
          { label: "Econ", value: num(stats, "economy") },
          { label: "Mins", value: num(stats, "minutes") },
        ],
      },
    ];
  } else if (isTennisLike) {
    groups = [
      {
        label: "MATCHES",
        metrics: [
          { label: "Wins", value: num(stats, "wins") },
          { label: "Titles", value: num(stats, "titles") },
          { label: "MIN", value: num(stats, "minutes") },
        ],
      },
      {
        label: "SERVING",
        metrics: [
          { label: "Aces", value: num(stats, "aces") },
          { label: "DF", value: num(stats, "doubleFaults") },
          { label: "WR", value: num(stats, "winners") },
        ],
      },
    ];
  } else {
    groups = [
      {
        label: "STATS",
        metrics: Object.entries(stats).map(([key, val]) => ({
          label: key.toUpperCase(),
          value:
            typeof val === "number"
              ? val % 1 === 0
                ? val
                : val.toFixed(1)
              : typeof val === "string" ? val : String(val),
        })),
      },
    ];
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {groups.map((group, i) => (
        <MetricGroup key={i} label={group.label} metrics={group.metrics} />
      ))}
    </div>
  );
}

function MetricGroup({ label, metrics }: { label: string; metrics: { label: string; value: string | number }[] }) {
  return (
    <div className="border border-border-default bg-surface-1/20 p-4">
      <span className="technical-label text-xs text-text-secondary block mb-3">{label}</span>
      <div className="space-y-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between">
            <span className="technical-label text-[0.6rem] text-text-secondary">{metric.label}</span>
            <span className="data-number text-sm font-medium text-text-primary">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
