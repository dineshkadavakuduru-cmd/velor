import type { Match } from "@/lib/types/sports";
import LiveMatchList from "@/components/live/LiveMatchList";

interface LeagueMatchesProps {
  matches: Match[];
}

export default function LeagueMatches({ matches }: LeagueMatchesProps) {
  const sorted = [...matches].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const live = sorted.filter((m) => m.status === "live" || m.status === "halftime");
  const upcoming = sorted.filter((m) => m.status === "scheduled");
  const finished = sorted.filter((m) => m.status === "finished");
  const postponed = sorted.filter((m) => m.status === "postponed" || m.status === "cancelled");

  return (
    <>
      {live.length > 0 && (
        <section className="border-b border-border-subtle">
          <div className="px-4 sm:px-6 lg:px-10 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-live" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
                </span>
                <span className="technical-label text-live">LIVE</span>
              </div>
              <span className="text-xs text-text-secondary font-mono">{live.length}</span>
            </div>
            <LiveMatchList
              matches={live}
              getHref={(match) => `/match/${match.id}`}
            />
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="border-b border-border-subtle">
          <div className="px-4 sm:px-6 lg:px-10 py-3">
            <div className="flex items-center justify-between mb-3">
              <span className="technical-label">UPCOMING</span>
              <span className="text-xs text-text-secondary font-mono">{upcoming.length}</span>
            </div>
            <LiveMatchList
              matches={upcoming}
              getHref={(match) => `/match/${match.id}`}
            />
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section className="border-b border-border-subtle">
          <div className="px-4 sm:px-6 lg:px-10 py-3">
            <div className="flex items-center justify-between mb-3">
              <span className="technical-label">FINISHED</span>
              <span className="text-xs text-text-secondary font-mono">{finished.length}</span>
            </div>
            <LiveMatchList
              matches={finished}
              getHref={(match) => `/match/${match.id}`}
            />
          </div>
        </section>
      )}

      {postponed.length > 0 && (
        <section className="border-b border-border-subtle">
          <div className="px-4 sm:px-6 lg:px-10 py-3">
            <div className="flex items-center justify-between mb-3">
              <span className="technical-label text-danger">POSTPONED / CANCELLED</span>
              <span className="text-xs text-text-secondary font-mono">{postponed.length}</span>
            </div>
            <LiveMatchList
              matches={postponed}
              getHref={(match) => `/match/${match.id}`}
            />
          </div>
        </section>
      )}
    </>
  );
}
