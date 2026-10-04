/**
 * Data-freshness helpers.
 *
 * Every live-data screen shows when its data was last synchronized so users
 * can trust what they see. Times are rendered in IST (Asia/Kolkata), the
 * primary audience timezone for VELOR's cricket + football coverage.
 */

const IST_TIME_ZONE = "Asia/Kolkata";

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: IST_TIME_ZONE,
});

/** "21:18 IST" — safe fallback when the timestamp is missing/invalid. */
export function formatIST(isoTimestamp: string | undefined): string {
  if (!isoTimestamp) return "--:-- IST";
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return "--:-- IST";
  return `${timeFormatter.format(date)} IST`;
}

/** "Updated 21:18 IST" */
export function formatUpdatedLine(isoTimestamp: string | undefined): string {
  return `Updated ${formatIST(isoTimestamp)}`;
}

/** "Last successful sync: 21:18 IST" */
export function formatLastSyncLine(isoTimestamp: string | undefined): string {
  return `Last successful sync: ${formatIST(isoTimestamp)}`;
}

/**
 * True when the snapshot is older than `thresholdMinutes` (default 15).
 * Stale screens must show "Data may be delayed." instead of pretending
 * the numbers are fresh.
 */
export function isStaleSync(isoTimestamp: string | undefined, thresholdMinutes = 15): boolean {
  if (!isoTimestamp) return true;
  const time = new Date(isoTimestamp).getTime();
  if (Number.isNaN(time)) return true;
  return Date.now() - time > thresholdMinutes * 60 * 1000;
}
