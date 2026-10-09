import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Client-router cache must never replay a stale dynamic page: every
  // navigation re-renders from the server so /live, /matches, /teams, etc.
  // always reflect the current canonical snapshot, not a previous moment.
  // (Locks the framework default of dynamic: 0 against future drift.)
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "media.api-sports.io", pathname: "/**" },
      { protocol: "https", hostname: "v3.football.api-sports.io", pathname: "/**" },
      { protocol: "https", hostname: "v1.basketball.api-sports.io", pathname: "/**" },
      { protocol: "https", hostname: "sportsapipro.com", pathname: "/**" },
      { protocol: "https", hostname: "**.sportsapipro.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
