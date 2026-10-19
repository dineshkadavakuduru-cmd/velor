interface DegradedBannerProps {
  /** Snapshot-level degraded state (some sports unreachable). */
  degraded?: boolean;
  /** True when a sport is served last-known-good data (upstream returned errors). */
  upstreamStale?: boolean;
  /** True when the sync timestamp is older than the freshness threshold. */
  stale?: boolean;
  /** Names of sports whose live provider could not be reached. */
  unavailableSports?: string[];
  className?: string;
}

/**
 * Visible degraded-state banner for every live-data screen.
 *
 * Shown whenever the data a user is looking at is NOT fully live:
 *  - some upstream sports providers are unreachable (degraded),
 *  - payloads are being served from the last-known-good fallback
 *    (upstreamStale — upstream refreshed nothing for this view),
 *  - the sync timestamp is older than the freshness threshold (stale).
 *
 * Never decorative: rendered as a polite status region with a clear,
 * monotone gold treatment so it reads as an honest system message.
 */
export default function DegradedBanner({
  degraded = false,
  upstreamStale = false,
  stale = false,
  unavailableSports = [],
  className = "",
}: DegradedBannerProps) {
  if (!degraded && !upstreamStale && !stale) return null;

  const lines: string[] = [];
  if (upstreamStale) {
    lines.push("SHOWING LAST-KNOWN DATA — UPSTREAM TEMPORARILY UNREACHABLE");
  } else if (degraded) {
    lines.push("DEGRADED SYNC — SOME SOURCES UNAVAILABLE");
  }
  if (stale) {
    lines.push("DATA MAY BE DELAYED");
  }
  if (unavailableSports.length > 0) {
    lines.push(`UNAVAILABLE: ${unavailableSports.join(" · ").toUpperCase()}`);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`px-4 sm:px-6 lg:px-10 py-2.5 bg-gold/5 border-b border-gold/20 flex flex-col gap-0.5 ${className}`}
    >
      {lines.map((line) => (
        <p key={line} className="text-[0.65rem] text-gold font-mono tracking-widest">
          {line}
        </p>
      ))}
    </div>
  );
}
