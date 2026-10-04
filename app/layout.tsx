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
        <VelorFooter />
      </body>
    </html>
  );
}
