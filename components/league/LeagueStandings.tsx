"use client";

import type { Standing } from "@/lib/types/sports";
import Link from "next/link";

interface LeagueStandingsProps {
  standings: Standing[];
  teamNames?: Record<string, string>;
  getTeamHref?: (teamId: string) => string;
  showGD?: boolean;
  sportId?: string;
}

export default function LeagueStandings({ standings, teamNames, getTeamHref, showGD = false, sportId }: LeagueStandingsProps) {
  if (standings.length === 0) {
    return (
      <section className="border-b border-border-subtle">
        <div className="px-4 sm:px-6 lg:px-10 py-4">
          <h2 className="technical-label mb-3">STANDINGS</h2>
          <p className="text-sm text-text-secondary">No standings data available.</p>
        </div>
      </section>
    );
  }

  const isFootball = sportId === "football";
  const hasGD = showGD || standings.some((s) => (s as Standing & { goalDifference?: number }).goalDifference !== undefined);

  return (
    <section className="border-b border-border-subtle">
      <div className="px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="technical-label">STANDINGS</h2>
          <span className="text-xs text-text-secondary font-mono">
            {standings.length} TEAMS
          </span>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full px-4 sm:px-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th scope="col" className="py-2 pr-4 technical-label w-12">POS</th>
                  <th scope="col" className="py-2 pr-4 technical-label">TEAM</th>
                  {isFootball && (
                    <>
                      <th scope="col" className="py-2 pr-4 technical-label text-center hidden sm:table-cell">P</th>
                      <th scope="col" className="py-2 pr-4 technical-label text-center hidden sm:table-cell">W</th>
                      <th scope="col" className="py-2 pr-4 technical-label text-center hidden sm:table-cell">D</th>
                      <th scope="col" className="py-2 pr-4 technical-label text-center hidden sm:table-cell">L</th>
                      <th scope="col" className="py-2 pr-4 technical-label text-center hidden sm:table-cell">GF</th>
                      <th scope="col" className="py-2 pr-4 technical-label text-center hidden sm:table-cell">GA</th>
                    </>
                  )}
                  {hasGD && isFootball && (
                    <th scope="col" className="py-2 pr-4 technical-label text-center hidden md:table-cell">GD</th>
                  )}
                  <th scope="col" className="py-2 pr-4 technical-label text-center">PTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => {
                  const teamName = teamNames?.[standing.teamId] ?? standing.teamId;
                  const gd = (standing as Standing & { goalDifference?: number }).goalDifference ?? (standing.goalsFor ?? 0) - (standing.goalsAgainst ?? 0);
                  const isTopHalf = standing.position <= Math.ceil(standings.length / 2);
                  const teamContent = getTeamHref ? (
                    <Link href={getTeamHref(standing.teamId)} className="text-text-primary hover:text-live transition-colors">
                      {teamName}
                    </Link>
                  ) : (
                    <span className="text-text-primary">{teamName}</span>
                  );

                  return (
                    <tr key={standing.teamId} className={`border-b border-border-subtle last:border-b-0 ${isTopHalf ? "" : "opacity-60"}`}>
                      <td className="py-2 pr-4 data-number text-text-secondary">{standing.position}</td>
                      <td className="py-2 pr-4">
                        {teamContent}
                      </td>
                      {isFootball && (
                        <>
                          <td className="py-2 pr-4 data-number text-text-secondary text-center hidden sm:table-cell">{standing.played}</td>
                          <td className="py-2 pr-4 data-number text-text-secondary text-center hidden sm:table-cell">{standing.won}</td>
                          <td className="py-2 pr-4 data-number text-text-secondary text-center hidden sm:table-cell">{standing.drawn ?? 0}</td>
                          <td className="py-2 pr-4 data-number text-text-secondary text-center hidden sm:table-cell">{standing.lost ?? 0}</td>
                          <td className="py-2 pr-4 data-number text-text-secondary text-center hidden sm:table-cell">{standing.goalsFor ?? 0}</td>
                          <td className="py-2 pr-4 data-number text-text-secondary text-center hidden sm:table-cell">{standing.goalsAgainst ?? 0}</td>
                        </>
                      )}
                      {hasGD && isFootball && (
                        <td className={`py-2 pr-4 data-number text-center hidden md:table-cell ${gd > 0 ? "text-success" : gd < 0 ? "text-danger" : "text-text-secondary"}`}>
                          {gd > 0 ? `+${gd}` : String(gd)}
                        </td>
                      )}
                      <td className="py-2 pr-4 data-number text-text-primary text-center font-medium">{standing.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
