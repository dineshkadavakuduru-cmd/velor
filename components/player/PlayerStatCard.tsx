import type { Player } from "@/lib/types/sports";

interface PlayerStatCardProps {
  player: Player;
  href?: string;
  showFavorite?: boolean;
}

export default function PlayerStatCard({ player, href, showFavorite = false }: PlayerStatCardProps) {
  const position = player.position ?? "Unknown";
  const teamName = player.teamId ?? "Free Agent";
  const nationality = player.nationality ?? "";
  const jersey = player.jerseyNumber;

  const stats = player.stats ?? {};

  let statValues: { label: string; value: string }[] = [];
  if ("goals" in stats && typeof stats.goals === "number") {
    statValues.push({ label: "GOALS", value: String(stats.goals) });
  }
  if ("assists" in stats && typeof stats.assists === "number") {
    statValues.push({ label: "ASSISTS", value: String(stats.assists) });
  }
  if ("appearances" in stats && typeof stats.appearances === "number") {
    statValues.push({ label: "APPS", value: String(stats.appearances) });
  }
  if ("points" in stats && typeof stats.points === "number") {
    statValues.push({ label: "PTS", value: String(stats.points) });
  }
  if ("runs" in stats && typeof stats.runs === "number") {
    statValues.push({ label: "RUNS", value: String(stats.runs) });
  }
  if ("wickets" in stats && typeof stats.wickets === "number") {
    statValues.push({ label: "WICKETS", value: String(stats.wickets) });
  }
  if ("minutes" in stats && typeof stats.minutes === "number") {
    statValues.push({ label: "MIN", value: String(stats.minutes) });
  }

  const cardContent = (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-border-subtle bg-surface-1/20 hover:bg-surface-2/30 transition-colors">
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-border-subtle bg-surface-2/40">
        <span className="font-mono text-xs text-text-primary data-number">
          {jersey ?? "-"}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-text-primary truncate">{player.name}</span>
          {nationality && (
            <span className="technical-label text-[0.55rem] text-text-secondary shrink-0">
              {nationality}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="technical-label text-[0.6rem] text-text-secondary">
            {position}
          </span>
          <span className="technical-label text-[0.55rem] text-text-secondary shrink-0">
            • {teamName}
          </span>
        </div>
      </div>

      {statValues.length > 0 && (
        <div className="flex-shrink-0 flex items-center gap-3 sm:gap-4">
          {statValues.slice(0, 3).map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="data-number text-sm text-text-primary font-medium">{stat.value}</span>
              <span className="technical-label text-[0.55rem] text-text-secondary">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
