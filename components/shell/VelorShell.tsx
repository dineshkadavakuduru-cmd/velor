import VelorNav from "../navigation/VelorNav";
import LiveTicker from "../live/LiveTicker";
import IntroClient from "./IntroClient";

export default function VelorShell() {
  return (
    <IntroClient>
      <div className="min-h-screen flex flex-col bg-background">
        <VelorNav />
        <LiveTicker />
        <main className="flex-1 relative overflow-hidden">
          <section className="relative flex-1 flex items-center min-h-[calc(100vh-8rem)]">
            <div className="absolute inset-0 bg-background" />
            <div
              className="absolute inset-0 hero-bg-grid opacity-40 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 15% 40%, rgba(122,92,255,0.06), transparent)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 50% 40% at 85% 60%, rgba(24,240,255,0.04), transparent)",
              }}
            />

            <div
              className="absolute top-0 left-0 right-0 h-px bg-border-subtle"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-px bg-border-subtle"
              aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
              <div className="max-w-3xl">
                <div
                  className="technical-label mb-6"
                  data-shell-hero-label
                >
                  LIVE SPORTS / REAL-TIME
                </div>
                <h1
                  className="font-display text-5xl md:text-7xl lg:text-[6.5rem] font-medium tracking-tight leading-[0.92] text-text-primary mb-8"
                  data-shell-hero-headline
                >
                  THE GAME<br />
                  NEVER STOPS.
                </h1>
                <p
                  className="font-body text-lg md:text-xl text-text-secondary max-w-xl leading-relaxed mb-10"
                  data-shell-hero-copy
                >
                  Live scores, match intelligence, standings and player data — in
                  one command center.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-text-primary text-background font-mono text-xs font-medium tracking-widest hover:bg-text-secondary transition-colors"
                  data-shell-hero-action
                >
                  EXPLORE LIVE
                </a>
              </div>

              <div
                className="mt-12 lg:absolute lg:bottom-8 lg:right-6 lg:mt-0 inline-flex items-stretch border border-border-subtle"
                data-shell-hero-data
              >
                <div className="px-5 py-4 border-r border-border-subtle">
                  <div className="technical-label">LIVE</div>
                  <div className="data-number text-xl mt-1 text-text-primary">
                    24/7
                  </div>
                </div>
                <div className="px-5 py-4 border-r border-border-subtle">
                  <div className="technical-label">MATCHES</div>
                  <div className="data-number text-xl mt-1 text-text-primary">
                    1,284
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="technical-label">LEAGUES</div>
                  <div className="data-number text-xl mt-1 text-text-primary">
                    42
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </IntroClient>
  );
}
