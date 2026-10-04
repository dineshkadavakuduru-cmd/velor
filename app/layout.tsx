import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#05070B",
};
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import VelorNav from "@/components/navigation/VelorNav";
import VelorFooter from "@/components/navigation/VelorFooter";

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

const SITE_URL = "https://velor-omega.vercel.app";
const SITE_NAME = "VELOR";
const SITE_TITLE = "VELOR — Live Sports Intelligence";
const SITE_DESCRIPTION =
  "Premium live-sports command center — scores, schedules, standings, and live events.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — VELOR",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-surface-2 focus:text-live focus:font-mono focus:text-xs focus:tracking-widest"
        >
          SKIP TO CONTENT
        </a>
        <VelorNav />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <VelorFooter />
      </body>
    </html>
  );
}
