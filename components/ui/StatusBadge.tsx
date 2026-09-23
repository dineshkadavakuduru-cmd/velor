import type { MatchStatus } from "@/lib/types/sports";

const STATUS_CONFIG: Record<
  MatchStatus,
  { label: string; className: string; dot?: boolean }
> = {
  live: { label: "LIVE", className: "text-live", dot: true },
  halftime: { label: "HT", className: "text-gold", dot: true },
  scheduled: { label: "UPCOMING", className: "text-text-secondary" },
  finished: { label: "FT", className: "text-text-secondary" },
  postponed: { label: "POSTPONED", className: "text-danger" },
  cancelled: { label: "CANCELLED", className: "text-danger" },
  abandoned: { label: "ABANDONED", className: "text-danger" },
  suspended: { label: "SUSPENDED", className: "text-danger" },
  delayed: { label: "DELAYED", className: "text-gold" },
  retired: { label: "RETIRED", className: "text-danger" },
  walkover: { label: "WALKOVER", className: "text-danger" },
  break: { label: "BREAK", className: "text-gold" },
  interval: { label: "INTERVAL", className: "text-gold" },
};

interface StatusBadgeProps {
  status: MatchStatus;
  period?: string;
  className?: string;
}

export default function StatusBadge({ status, period, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled;
  const label = status === "live" && period ? period : config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${config.className} ${className}`}
      aria-label={`Status: ${label}`}
    >
      {config.dot && status === "live" && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-live"
            style={{ animation: "pulse 1.5s ease-in-out infinite" }}
          />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
        </span>
      )}
      <span className="font-mono text-[0.65rem] font-medium tracking-widest uppercase">
        {label}
      </span>
    </span>
  );
}
