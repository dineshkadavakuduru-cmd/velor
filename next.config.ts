import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
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
