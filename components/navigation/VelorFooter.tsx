import Link from "next/link";

export default function VelorFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-1/30">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-display text-sm font-medium tracking-[0.2em] text-text-primary hover:text-live transition-colors">
              VELOR
            </Link>
            <span className="text-xs text-text-secondary font-mono">SPORTS INTELLIGENCE</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/live" className="text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors">LIVE</Link>
            <Link href="/matches" className="text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors">MATCHES</Link>
            <Link href="/teams" className="text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors">TEAMS</Link>
            <Link href="/leagues" className="text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors">LEAGUES</Link>
            <Link href="/sports" className="text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors">SPORTS</Link>
            <Link href="/favorites" className="text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors">FAVORITES</Link>
          </div>
          <p className="text-xs text-text-secondary font-mono">VELOR SPORTS INTELLIGENCE MATRIX · MULTI-SPORT TELEMETRY</p>
        </div>
      </div>
    </footer>
  );
}
