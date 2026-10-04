import LazyVelorCanvas from "@/components/3d/VelorCanvasLazy";
import HeroActions from "./HeroActions";
import HeroDataRail from "./HeroDataRail";

interface VelorHeroProps {
  liveCount?: number;
  matchCount?: number;
  leagueCount?: number;
  teamCount?: number;
}

const ENV_LABELS = [
  { text: "SYSTEM / LIVE", top: "3%", right: "3%", bottom: undefined, left: undefined },
  { text: "DATA STREAM / 04", top: undefined, right: "3%", bottom: "3%", left: undefined },
  { text: "LATENCY / 42MS", top: undefined, right: undefined, bottom: "3%", left: "3%" },
  { text: "SYNC / ACTIVE", top: "3%", right: undefined, bottom: undefined, left: "3%" },
];

export default function VelorHero({ liveCount = 0, matchCount = 0, leagueCount = 0, teamCount = 0 }: VelorHeroProps) {
  return (
    <section className="relative flex-1 flex items-center min-h-[calc(100vh-8rem)]">
      <div className="absolute inset-0 bg-background" />

      <div
        className="absolute inset-0 hero-bg-grid opacity-40 pointer-events-none hidden md:block"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 10% 40%, rgba(122,92,255,0.05), transparent)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 85% 60%, rgba(24,240,255,0.03), transparent)",
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8 xl:gap-12">
          <div className="flex-1 min-w-0 lg:max-w-[55%]">
            <div className="technical-label mb-6" data-hero-label>
              LIVE SPORTS / REAL-TIME
            </div>

            <h1
              className="font-display text-[2.8rem] sm:text-6xl md:text-7xl lg:text-[6.5rem] font-medium tracking-tight leading-[0.92] text-text-primary mb-7"
              data-hero-headline
            >
              THE GAME
              <br />
              NEVER<span className="text-text-secondary"> STOPS.</span>
            </h1>

            <p
              className="font-body text-base sm:text-lg md:text-xl text-text-secondary max-w-lg leading-relaxed mb-9"
              data-hero-copy
            >
              Live scores, match intelligence, standings and player data — in
              one command center.
            </p>

            <HeroActions />

            <div data-hero-live-indicator>
              <div className="live-indicator mt-8">
                <span>LIVE</span>
                <span className="text-text-secondary normal-case tracking-normal text-xs">
                  SPORTS INTELLIGENCE
                </span>
              </div>
            </div>
          </div>

          <div
            className="hidden lg:block relative w-[45%] h-[60vh] min-h-[400px] max-h-[600px] flex-shrink-0"
            data-hero-env-bg
            aria-hidden="true"
          >
            <div className="absolute inset-0 border border-border-subtle">
              <LazyVelorCanvas />

              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(24,240,255,0.03), transparent 60%)",
                }}
              />

              <div className="absolute top-4 left-4 w-3 h-3">
                <div className="absolute top-0 left-0 w-full h-px bg-border-subtle" />
                <div className="absolute top-0 left-0 w-px h-full bg-border-subtle" />
              </div>
              <div className="absolute top-4 right-4 w-3 h-3">
                <div className="absolute top-0 right-0 w-full h-px bg-border-subtle" />
                <div className="absolute top-0 right-0 w-px h-full bg-border-subtle" />
              </div>
              <div className="absolute bottom-4 left-4 w-3 h-3">
                <div className="absolute bottom-0 left-0 w-full h-px bg-border-subtle" />
                <div className="absolute bottom-0 left-0 w-px h-full bg-border-subtle" />
              </div>
              <div className="absolute bottom-4 right-4 w-3 h-3">
                <div className="absolute bottom-0 right-0 w-full h-px bg-border-subtle" />
                <div className="absolute bottom-0 right-0 w-px h-full bg-border-subtle" />
              </div>

              {ENV_LABELS.map(({ text, top, right, bottom, left }) => (
                <span
                  key={text}
                  className="technical-label absolute text-[0.65rem] opacity-30"
                  style={{ top, right, bottom, left }}
                >
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" data-hero-data-rail>
        <HeroDataRail
          liveCount={liveCount}
          matchCount={matchCount}
          leagueCount={leagueCount}
          teamCount={teamCount}
        />
      </div>

      <div
        className="absolute top-0 left-0 bottom-0 w-px bg-border-subtle pointer-events-none hidden lg:block"
        aria-hidden="true"
        style={{ left: "calc(55% + 1.5rem)" }}
      />
    </section>
  );
}
