import type { MatchStatus } from "@/lib/types/sports";

const STATUS_CONFIG: Record<
  MatchStatus,
  { label: string; color: string; className: string }
> = {
  live: { label: "LIVE", color: "var(--live)", className: "text-live" },
  halftime: { label: "HT", color: "var(--gold)", className: "text-gold" },
  scheduled: { label: "UPCOMING", color: "var(--text-secondary)", className: "text-text-secondary" },
  finished: { label: "FT", color: "var(--text-secondary)", className: "text-text-secondary" },
  postponed: { label: "POSTPONED", color: "var(--danger)", className: "text-danger" },
  cancelled: { label: "CANCELLED", color: "var(--danger)", className: "text-danger" },
  abandoned: { label: "ABANDONED", color: "var(--danger)", className: "text-danger" },
  suspended: { label: "SUSPENDED", color: "var(--danger)", className: "text-danger" },
  delayed: { label: "DELAYED", color: "var(--gold)", className: "text-gold" },
  retired: { label: "RETIRED", color: "var(--danger)", className: "text-danger" },
  walkover: { label: "WALKOVER", color: "var(--danger)", className: "text-danger" },
  break: { label: "BREAK", color: "var(--gold)", className: "text-gold" },
  interval: { label: "INTERVAL", color: "var(--gold)", className: "text-gold" },
};

interface LiveStatusProps {
  status: MatchStatus;
  period?: string;
}

export default function LiveStatus({ status, period }: LiveStatusProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled;

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.className}`}>
      {status === "live" && (
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: config.color, animation: "pulse 1.5s ease-in-out infinite" }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: config.color }}
          />
        </span>
      )}
      <span className="font-mono text-[0.65rem] font-medium tracking-widest uppercase">
        {status === "live" && period ? period : config.label}
      </span>
    </span>
  );
}
