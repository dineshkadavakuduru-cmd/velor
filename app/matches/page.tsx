import { Suspense } from "react";
import { createProvider } from "@/lib/api";
import type { Match, League } from "@/lib/types/sports";
import { validateMatchFilters } from "@/lib/api/validate";
import LiveHeader from "@/components/live/LiveHeader";
import MatchCard from "@/components/ui/MatchCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import MatchesFilters from "./MatchesFilters";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = {
  title: "Matches — VELOR",
  description: "Match schedule and results.",
};

interface MatchesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

async function getFilteredMatches(
  searchParams?: Record<string, string | string[] | undefined>
): Promise<{ matches: Match[]; leagues: League[] }> {
  const filters = validateMatchFilters(searchParams ?? {});
  const sportId = filters.sport ?? "football";
  const provider = createProvider(sportId);

  const [matches, leagues] = await Promise.all([
    provider.getMatches(filters),
    provider.getLeagues(),
  ]);

  return { matches, leagues };
}

function ProviderUnavailable() {
  return (
    <>
      <LiveHeader title="MATCHES" subtitle="Match schedule and results" />
      <ErrorState title="SPORTS DATA UNAVAILABLE" description="We couldn't load match data. Please try again." />
    </>
  );
}

function ProviderMisconfigured() {
  return (
    <>
      <LiveHeader title="MATCHES" subtitle="Match schedule and results" />
      <ErrorState
        title="SPORTS DATA UNAVAILABLE"
        description="Real API mode is requested but the API key is not configured on the server."
        showRetry={false}
      />
    </>
  );
}

export default function MatchesPage({ searchParams }: MatchesPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Suspense
        fallback={
          <div>
            <LiveHeader title="MATCHES" subtitle="Match schedule and results" />
            <LoadingSkeleton lines={4} />
          </div>
        }
      >
        <MatchesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function MatchesContent({ searchParams }: MatchesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  let result: { matches: Match[]; leagues: League[] } = { matches: [], leagues: [] };
  let hasError = false;
  let misconfigured = false;

  try {
    result = await getFilteredMatches(resolvedSearchParams);
  } catch (error) {
    hasError = true;
    if (error instanceof Error && error.message.includes("VELOR_API_SPORTS_KEY")) {
      misconfigured = true;
    }
  }

  if (misconfigured) {
    return <ProviderMisconfigured />;
  }

  if (hasError) {
    return <ProviderUnavailable />;
  }

  const { matches, leagues } = result;
  const currentFilters = resolvedSearchParams;

  const grouped = groupMatches(matches, currentFilters);

  const filterCount = Object.keys(currentFilters).filter(
    (k) => currentFilters[k] && (Array.isArray(currentFilters[k]) ? currentFilters[k].length > 0 : true)
  ).length;

  const totalMatches = matches.length;
  const liveCount = matches.filter((m) => m.status === "live" || m.status === "halftime").length;
  const scheduledCount = matches.filter((m) => m.status === "scheduled").length;
  const finishedCount = matches.filter((m) => m.status === "finished").length;
  const postponedCount = matches.filter((m) => m.status === "postponed" || m.status === "cancelled").length;

  return (
    <>
      <LiveHeader
        title="MATCHES"
        subtitle="Match schedule and results"
        matchCount={totalMatches}
        countLabel="MATCHES"
        showLiveIndicator={false}
      />
      <MatchesFilters leagues={leagues} currentFilters={currentFilters} />
      <div>
        {filterCount > 0 && (
          <div className="flex items-center gap-4 py-3 border-b border-border-subtle text-xs text-text-secondary font-mono">
            <span>{totalMatches} RESULT{totalMatches !== 1 ? "S" : ""}</span>
            {liveCount > 0 && <span className="text-live">{liveCount} LIVE</span>}
            {scheduledCount > 0 && <span>{scheduledCount} UPCOMING</span>}
            {finishedCount > 0 && <span>{finishedCount} FINISHED</span>}
            {postponedCount > 0 && <span className="text-danger">{postponedCount} POSTPONED</span>}
          </div>
        )}
        {grouped.length === 0 && (
          <EmptyState
            title="NO MATCHES"
            description={
              filterCount > 0
                ? "No matches match the selected filters. Try adjusting your criteria."
                : "No matches available at the moment."
            }
          />
        )}
        {grouped.map((group) => (
          <section key={group.label} className="border-b border-border-subtle">
            <div className="px-4 sm:px-6 lg:px-10 py-3">
              <div className="flex items-center justify-between">
                <SectionHeader
                  title={group.label}
                  count={group.matches.length}
                  className="mb-0"
                />
              </div>
            </div>
            <div>
              {group.matches.map((match) => (
                <MatchCard key={match.id} match={match} href={`/match/${match.id}`} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

type MatchGroup = {
  label: string;
  matches: Match[];
};

function groupMatches(matches: Match[], filters: Record<string, string | string[] | undefined>): MatchGroup[] {
  const hasStatusFilter = !!(filters.status && typeof filters.status === "string" && filters.status.length > 0);
  const status = hasStatusFilter ? (filters.status as string) : "";

  const live = matches.filter((m) => m.status === "live" || m.status === "halftime");
  const scheduled = matches.filter((m) => m.status === "scheduled");
  const finished = matches.filter((m) => m.status === "finished");
  const postponed = matches.filter((m) => m.status === "postponed" || m.status === "cancelled");

  if (status === "live") {
    return live.length > 0 ? [{ label: "LIVE", matches: live }] : [];
  }
  if (status === "scheduled") {
    return scheduled.length > 0 ? [{ label: "UPCOMING", matches: scheduled }] : [];
  }
  if (status === "finished") {
    return finished.length > 0 ? [{ label: "FINISHED", matches: finished }] : [];
  }

  const groups: MatchGroup[] = [];
  if (live.length > 0) groups.push({ label: "LIVE", matches: live });
  if (scheduled.length > 0) groups.push({ label: "UPCOMING", matches: scheduled });
  if (finished.length > 0) groups.push({ label: "FINISHED", matches: finished });
  if (postponed.length > 0) groups.push({ label: "POSTPONED / CANCELLED", matches: postponed });
  return groups;
}
