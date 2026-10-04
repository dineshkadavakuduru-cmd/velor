import Link from "next/link";
import { createRegistry } from "@/lib/api";
import { findTeam } from "@/lib/api/lookup";
import type { Match, Team, Standing, Player } from "@/lib/types/sports";
import { validateTeamId } from "@/lib/api/validate";
import TeamHeader from "@/components/team/TeamHeader";
import TeamRecentMatches from "@/components/team/TeamRecentMatches";
import TeamUpcomingMatches from "@/components/team/TeamUpcomingMatches";
import TeamPerformanceSummary from "@/components/team/TeamPerformanceSummary";
import PlayerStatCard from "@/components/player/PlayerStatCard";
import LiveHeader from "@/components/live/LiveHeader";
import ErrorState from "@/components/ui/ErrorState";

interface TeamPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ sport?: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: TeamPageProps): Promise<{ title: string; description: string }> {
  const { id } = await params;
  const validId = validateTeamId(id);

  if (!validId) {
    return { title: "Team Not Found — VELOR", description: "Team not found." };
  }

  try {
    const registry = createRegistry();
    const result = await findTeam(registry, validId);
    if (!result) {
      return { title: "Team Not Found — VELOR", description: "Team not found." };
    }
    return {
        title: `${result.entity.name} — VELOR`,
        description: `${result.entity.name} team details, form, match history, and upcoming fixtures.`,
    };
  } catch {
    return { title: "Team Detail — VELOR", description: "Team details and match history." };
  }
}

function TeamNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="TEAM NOT FOUND" subtitle="The requested team could not be found." showLiveIndicator={false} />
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border-subtle">
        <p className="technical-label mb-2">TEAM NOT FOUND</p>
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          The team you are looking for does not exist or is no longer available.
        </p>
        <Link
          href="/teams"
          className="px-4 py-2 bg-text-primary text-background font-mono text-xs tracking-widest hover:opacity-90 transition-opacity"
        >
          BACK TO TEAMS
        </Link>
      </div>
    </div>
  );
}

function ProviderUnavailable() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="TEAM DETAIL" subtitle="Team details and match history." showLiveIndicator={false} />
      <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load team data. Please try again." />
    </div>
  );
}

function ProviderMisconfigured() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="TEAM DETAIL" subtitle="Team details and match history." showLiveIndicator={false} />
      <ErrorState
        title="SPORTS DATA UNAVAILABLE"
        description="Real API mode is requested but the API key is not configured on the server."
        showRetry={false}
      />
    </div>
  );
}

export default async function TeamPage({ params, searchParams }: TeamPageProps) {
  const { id } = await params;
  const validId = validateTeamId(id);

  if (!validId) {
    return <TeamNotFound />;
  }

  let team: Team | null = null;
  let matches: Match[] = [];
  let standings: Standing[] = [];
  let squad: Player[] = [];
  let leagueInfo: { id: string; name: string; country: string; sportId?: string } | null = null;
  let teamPosition: Standing | undefined;
  let providerResult: Awaited<ReturnType<typeof findTeam>> = null;
  let hasError = false;
  let misconfigured = false;
  let notFound = false;

  try {
    const registry = createRegistry();
    const sportParam = searchParams ? (await searchParams).sport : undefined;
    const sportId = Array.isArray(sportParam) ? sportParam[0] : sportParam;
    providerResult = await findTeam(registry, validId, sportId);
    if (!providerResult) throw new Error("TEAM_NOT_FOUND");
    const provider = providerResult.provider;
    const [teamResult, matchesResult, squadResult] = await Promise.all([
      provider.getTeam(validId),
      provider.getMatches({ teamId: validId }),
      provider.getTeamSquad ? provider.getTeamSquad(validId) : Promise.resolve([]),
    ]);
    team = teamResult;
    matches = matchesResult;
    squad = squadResult;

    if (matches.length > 0) {
      const currentLeague = matches.find((m) => m.status === "live" || m.status === "halftime" || m.status === "scheduled")?.league
        ?? matches[0]?.league;
      if (currentLeague) {
        leagueInfo = { id: currentLeague.id, name: currentLeague.name, country: currentLeague.country, sportId: currentLeague.sportId };
        try {
          const standingsResult = await provider.getStandings({ leagueId: currentLeague.id });
          standings = standingsResult;
          teamPosition = standingsResult.find((s) => s.teamId === validId);
        } catch {
          standings = [];
        }
      }
    }
  } catch (error) {
    notFound = error instanceof Error && error.message === "TEAM_NOT_FOUND";
    hasError = !notFound;
    if (error instanceof Error && error.message.includes("VELOR_API_SPORTS_KEY")) {
      misconfigured = true;
    }
  }

  if (misconfigured) {
    return <ProviderMisconfigured />;
  }

  if (notFound) {
    return <TeamNotFound />;
  }

  if (hasError) {
    return <ProviderUnavailable />;
  }

  if (!team) {
    return <TeamNotFound />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TeamPageContent
        team={team}
        matches={matches}
        leagueInfo={leagueInfo}
        teamPosition={teamPosition}
        standings={standings}
        squad={squad}
      />
    </div>
  );
}

function TeamPageContent({ team, matches, leagueInfo, teamPosition, standings, squad }: { team: Team; matches: Match[]; leagueInfo: { id: string; name: string; country: string; sportId?: string } | null; teamPosition?: Standing; standings: Standing[]; squad: Player[] }) {
  const recentMatches = matches
    .filter((m) => m.status === "finished" || m.status === "live" || m.status === "halftime")
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const upcomingMatches = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const isFootball = leagueInfo?.sportId === "football";

  return (
    <>
      <LiveHeader
        title="TEAM DETAIL"
        subtitle={team.name}
        showLiveIndicator={false}
      />
      <TeamHeader team={team} />
      <TeamPerformanceSummary matches={recentMatches} teamId={team.id} />

      {leagueInfo && (
        <div className="px-4 sm:px-6 lg:px-10 py-3 border-b border-border-subtle bg-surface-1/30">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="technical-label">CURRENT COMPETITION</span>
            <Link
              href={`/league/${leagueInfo.id}`}
              className="text-sm text-text-primary hover:text-live transition-colors"
            >
              {leagueInfo.name} · {leagueInfo.country}
            </Link>
            {teamPosition && (
              <span className="text-xs text-text-secondary font-mono">
                POS {teamPosition.position} · {teamPosition.points} PTS
              </span>
            )}
          </div>
        </div>
      )}

      {standings.length > 0 && teamPosition && (
        <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-border-subtle">
          <h2 className="technical-label mb-3">LEAGUE STANDINGS</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="py-2 pr-4 technical-label w-12">#</th>
                  {isFootball && (
                    <>
                      <th className="py-2 pr-4 technical-label hidden sm:table-cell">P</th>
                      <th className="py-2 pr-4 technical-label hidden sm:table-cell">W</th>
                      <th className="py-2 pr-4 technical-label hidden sm:table-cell">D</th>
                      <th className="py-2 pr-4 technical-label hidden sm:table-cell">L</th>
                      <th className="py-2 pr-4 technical-label hidden sm:table-cell">GF</th>
                      <th className="py-2 pr-4 technical-label hidden sm:table-cell">GA</th>
                    </>
                  )}
                  <th className="py-2 pr-4 technical-label">PTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.slice(0, 10).map((standing) => {
                  const isCurrentTeam = standing.teamId === team.id;
                  return (
                    <tr key={standing.teamId} className={`border-b border-border-subtle last:border-b-0 ${isCurrentTeam ? "bg-live/5" : ""}`}>
                      <td className="py-2 pr-4 data-number text-text-secondary">{standing.position}</td>
                      {isFootball && (
                        <>
                          <td className="py-2 pr-4 data-number text-text-secondary hidden sm:table-cell">{standing.played}</td>
                          <td className="py-2 pr-4 data-number text-text-secondary hidden sm:table-cell">{standing.won}</td>
                          <td className="py-2 pr-4 data-number text-text-secondary hidden sm:table-cell">{standing.drawn}</td>
                          <td className="py-2 pr-4 data-number text-text-secondary hidden sm:table-cell">{standing.lost}</td>
                          <td className="py-2 pr-4 data-number text-text-secondary hidden sm:table-cell">{standing.goalsFor}</td>
                          <td className="py-2 pr-4 data-number text-text-secondary hidden sm:table-cell">{standing.goalsAgainst}</td>
                        </>
                      )}
                      <td className={`py-2 pr-4 data-number text-center font-medium ${isCurrentTeam ? "text-live" : "text-text-primary"}`}>
                        {standing.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {teamPosition && standings.length > 10 && (
            <Link
              href={`/league/${leagueInfo?.id}`}
              className="inline-block mt-3 font-mono text-xs tracking-widest text-text-secondary hover:text-live transition-colors"
            >
              VIEW FULL TABLE →
            </Link>
          )}
        </div>
      )}

      <TeamRecentMatches matches={recentMatches} />
      <TeamUpcomingMatches matches={upcomingMatches} />

      {squad.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-10 py-8 border-t border-border-subtle">
          <h2 className="technical-label mb-4">SQUAD</h2>
          <div className="space-y-2">
            {squad.map((player) => (
              <PlayerStatCard
                key={player.id}
                player={player}
                href={`/player/${player.id}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-10 py-4 border-t border-border-subtle">
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors"
        >
          <span aria-hidden="true">←</span>
          BACK TO TEAMS
        </Link>
      </div>
    </>
  );
}
