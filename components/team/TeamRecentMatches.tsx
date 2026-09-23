import type { Match } from "@/lib/types/sports";
import { getMatchIntelligence } from "@/lib/utils/derivedMetrics";
import LiveMatchList from "@/components/live/LiveMatchList";

interface TeamRecentMatchesProps {
  matches: Match[];
}

export default function TeamRecentMatches({ matches }: TeamRecentMatchesProps) {
  const recent = matches
    .filter((m) => m.status === "finished" || m.status === "live" || m.status === "halftime")
    .slice(0, 5);

  return (
    <section className="border-b border-border-subtle">
      <div className="px-4 sm:px-6 lg:px-10 py-4">
        <h2 className="technical-label mb-3">RECENT MATCHES</h2>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-b border-border-subtle">
            <p className="text-sm text-text-secondary">No recent matches available.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {recent.map((match) => {
              const intel = getMatchIntelligence(match);
              return (
                <div key={match.id} className="border-b border-border-subtle last:border-b-0">
                  <LiveMatchList
                    matches={[match]}
                    getHref={(m) => `/match/${m.id}`}
                  />
                  {intel.isFinished && intel.result && (
                    <div className="px-4 sm:px-6 py-1.5 bg-surface-1/20">
                      <span className={`
                        text-[0.6rem] font-mono tracking-widest uppercase
                        ${intel.result === "home_win" ? "text-live" : ""}
                        ${intel.result === "away_win" ? "text-gold" : ""}
                        ${intel.result === "draw" ? "text-text-secondary" : ""}
                      `}>
                        {intel.resultLabel}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
