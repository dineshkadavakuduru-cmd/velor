export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed"
  | "cancelled";

export function getMatchStateLabel(status: MatchStatus, period?: string): string {
  switch (status) {
    case "live":
      return period ? `LIVE · ${period}` : "LIVE";
    case "halftime":
      return "HALFTIME";
    case "finished":
      return "FULL TIME";
    case "scheduled":
      return "UPCOMING";
    case "postponed":
      return "POSTPONED";
    case "cancelled":
      return "CANCELLED";
    default:
      return String(status).toUpperCase();
  }
}
