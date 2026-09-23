interface LiveHeaderProps {
  title?: string;
  subtitle?: string;
  matchCount?: number;
  countLabel?: string;
  showLiveIndicator?: boolean;
}

export default function LiveHeader({
  title = "LIVE",
  subtitle = "Match updates and scores",
  matchCount,
  countLabel = "MATCHES",
  showLiveIndicator = true,
}: LiveHeaderProps) {
  return (
    <header className="border-b border-border-subtle bg-surface-1/40">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showLiveIndicator && (
            <div className="live-indicator" aria-label="Live indicator">
              <span>LIVE</span>
            </div>
          )}
          {showLiveIndicator && <div className="h-4 w-px bg-border-subtle" />}
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
