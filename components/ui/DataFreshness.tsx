import { formatLastSyncLine, formatUpdatedLine, isStaleSync } from "@/lib/utils/freshness";

interface DataFreshnessProps {
  syncedAt: string;
  degraded?: boolean;
  /** True when payloads came from the last-known-good fallback. */
  staleUpstream?: boolean;
  className?: string;
}

/**
 * Honest data-freshness line shown on every live-data screen:
 * "Updated 21:18 IST · Last successful sync: 21:18 IST"
 * plus "Data may be delayed." when the snapshot is stale or partial,
 * and "Last-known data shown." when the upstream itself could not be
 * reached and a fallback payload is serving the view.
 * Rendered as a polite live region so screen readers announce updates.
 */
export default function DataFreshness({
  syncedAt,
  degraded = false,
  staleUpstream = false,
  className = "",
}: DataFreshnessProps) {
  const stale = isStaleSync(syncedAt);
  const showDelayWarning = stale || degraded || staleUpstream;

  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-[0.65rem] text-text-secondary font-mono tracking-widest uppercase ${className}`}
    >
      {formatUpdatedLine(syncedAt)}
      <span aria-hidden="true"> · </span>
      <span className="hidden sm:inline">{formatLastSyncLine(syncedAt)}</span>
      {staleUpstream && (
        <span className="text-gold"> · Last-known data shown.</span>
      )}
      {showDelayWarning && (
        <span className="text-gold"> · Data may be delayed.</span>
      )}
    </p>
  );
}
