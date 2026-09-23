import type { Match } from "@/lib/types/sports";
import LiveMatchList from "@/components/live/LiveMatchList";

interface TeamUpcomingMatchesProps {
  matches: Match[];
}

export default function TeamUpcomingMatches({ matches }: TeamUpcomingMatchesProps) {
  const upcoming = matches
    .filter((m) => m.status === "scheduled")
    .slice(0, 5);

  return (
    <section className="border-b border-border-subtle">
      <div className="px-4 sm:px-6 lg:px-10 py-4">
        <h2 className="technical-label mb-3">UPCOMING MATCHES</h2>
        <LiveMatchList
          matches={upcoming}
          emptyMessage="No upcoming matches scheduled."
          getHref={(match) => `/match/${match.id}`}
        />
      </div>
    </section>
  );
}
