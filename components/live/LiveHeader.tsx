interface LiveHeaderProps {
  title?: string;
  subtitle?: string;
  matchCount?: number;
  countLabel?: string;
  /** Data-driven live indicator state — default "off" renders no claim at all. */
  liveState?: "live" | "degraded" | "off";
  /** @deprecated legacy prop; mapped into liveState. */
  showLiveIndicator?: boolean;
}

export default function LiveHeader({
  title = "LIVE",
  subtitle = "Match updates and scores",
  matchCount,
  countLabel = "MATCHES",
  liveState = "off",
  showLiveIndicator,
}: LiveHeaderProps) {
  const state = showLiveIndicator === undefined ? liveState : showLiveIndicator ? liveState : "off";
  const showLiveIndicatorFinal = state === "live" || state === "degraded";
  return (
    <header className="border-b border-border-subtle bg-surface-1/40">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showLiveIndicatorFinal && (
            <div
              className="live-indicator"
              data-state={state}
              aria-label={state === "live" ? "Live data syncing" : "Live data degraded"}
            >
              <span>{state === "live" ? "LIVE" : "DEGRADED"}</span>
            </div>
          )}
          {showLiveIndicatorFinal && <div className="h-4 w-px bg-border-subtle" />}
          <div>
            <h1 className="font-display text-lg sm:text-xl font-medium tracking-tight text-text-primary">
              {title}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
          </div>
        </div>

        {typeof matchCount === "number" && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="data-number text-sm text-text-secondary">
              {matchCount}
            </span>
            <span className="technical-label">{countLabel}</span>
          </div>
        )}
      </div>
    </header>
  );
}
