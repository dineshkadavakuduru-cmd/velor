import Link from "next/link";
import { createRegistry } from "@/lib/api";
import { findPlayer } from "@/lib/api/lookup";
import { validatePlayerId } from "@/lib/api/validate";
import type { Player, Team } from "@/lib/types/sports";
import PlayerHeader from "@/components/player/PlayerHeader";
import PlayerMetrics from "@/components/player/PlayerMetrics";
import PlayerStatCard from "@/components/player/PlayerStatCard";
import LiveHeader from "@/components/live/LiveHeader";
import ErrorState from "@/components/ui/ErrorState";

interface PlayerPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ sport?: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<{ title: string; description: string }> {
  const { id } = await params;
  const validId = validatePlayerId(id);

  if (!validId) {
    return { title: "Player Not Found — VELOR", description: "Player not found." };
  }

  try {
    const registry = createRegistry();
    const result = await findPlayer(registry, validId);
    if (!result) {
      return { title: "Player Not Found — VELOR", description: "Player not found." };
    }
    return {
      title: `${result.entity.name} — VELOR`,
      description: `${result.entity.name} player profile, statistics, and match data.`,
    };
  } catch {
    return { title: "Player Detail — VELOR", description: "Player profile and statistics." };
  }
}

function PlayerNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="PLAYER NOT FOUND" subtitle="The requested player could not be found." showLiveIndicator={false} />
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border-subtle">
        <p className="technical-label mb-2">PLAYER NOT FOUND</p>
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          The player you are looking for does not exist or is no longer available.
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
      <LiveHeader title="PLAYER DETAIL" subtitle="Player profile and statistics." showLiveIndicator={false} />
      <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load player data. Please try again." />
    </div>
  );
}

function ProviderMisconfigured() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="PLAYER DETAIL" subtitle="Player profile and statistics." showLiveIndicator={false} />
      <ErrorState
        title="SPORTS DATA UNAVAILABLE"
        description="Real API mode is requested but the API key is not configured on the server."
        showRetry={false}
      />
    </div>
  );
}

export default async function PlayerPage({ params, searchParams }: PlayerPageProps) {
  const { id } = await params;
  const validId = validatePlayerId(id);

  if (!validId) {
    return <PlayerNotFound />;
  }

  let player: Player | null = null;
  let team: Team | null = null;
  let hasError = false;
  let misconfigured = false;
  let notFound = false;

  try {
    const registry = createRegistry();
    const sportParam = searchParams ? (await searchParams).sport : undefined;
    const sportId = Array.isArray(sportParam) ? sportParam[0] : sportParam;
    const result = await findPlayer(registry, validId, sportId);
    if (!result) throw new Error("PLAYER_NOT_FOUND");
    const provider = result.provider;
    player = result.entity;

    if (player?.teamId) {
      team = await provider.getTeam(player.teamId);
    }
  } catch (error) {
    notFound = error instanceof Error && error.message === "PLAYER_NOT_FOUND";
    hasError = !notFound;
    if (error instanceof Error && error.message.includes("VELOR_API_SPORTS_KEY")) {
      misconfigured = true;
    }
  }

  if (misconfigured) {
    return <ProviderMisconfigured />;
  }

  if (notFound || !player) {
    return <PlayerNotFound />;
  }

  if (hasError) {
    return <ProviderUnavailable />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader
        title={player.name.toUpperCase()}
        subtitle={player.position ?? ""}
        showLiveIndicator={false}
      />
      <PlayerHeader player={player} team={team} />
      
      <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="technical-label mb-4">PLAYER METRICS</div>
        <PlayerMetrics player={player} />
      </div>

      <div className="px-4 sm:px-6 lg:px-10 py-4 border-t border-border-subtle">
        <Link
          href={team ? `/team/${team.id}` : "/teams"}
          className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors"
        >
          <span aria-hidden="true">←</span>
          BACK TO {team ? team.name.toUpperCase() : "TEAMS"}
        </Link>
      </div>
    </div>
  );
}
