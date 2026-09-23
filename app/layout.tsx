import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#05070B",
};
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import VelorNav from "@/components/navigation/VelorNav";
import Link from "next/link";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VELOR — Live Sports Intelligence",
  description: "Premium live-sports command center — scores, schedules, standings, and live events.",
  metadataBase: new URL("https://velor.app"),
  openGraph: {
    title: "VELOR — Live Sports Intelligence",
    description: "Premium live-sports command center — scores, schedules, standings, and live events.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VELOR — Live Sports Intelligence",
    description: "Premium live-sports command center — scores, schedules, standings, and live events.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`
        ${spaceGrotesk.variable}
        ${inter.variable}
        ${jetbrainsMono.variable}
        min-h-full antialiased
      `}
    >
      <body className="min-h-full flex flex-col bg-background">
        <VelorNav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
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
            <Link href="/favorites" className="text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary transition-colors">FAVORITES</Link>
          </div>
          <p className="text-xs text-text-secondary font-mono">SPORTS DATA BY API-SPORTS</p>
        </div>
      </div>
    </footer>
  );
}
