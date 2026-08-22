import VelorNav from "../navigation/VelorNav";
import LiveTicker from "../live/LiveTicker";
import IntroClient from "./IntroClient";
import VelorHero from "../hero/VelorHero";

export default function VelorShell() {
  return (
    <IntroClient>
      <div className="min-h-screen flex flex-col bg-background">
        <VelorNav />
        <LiveTicker />
        <main className="flex-1 relative overflow-hidden">
          <VelorHero />
        </main>
      </div>
    </IntroClient>
  );
}
