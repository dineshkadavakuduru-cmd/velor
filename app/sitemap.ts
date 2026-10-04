import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://velor.app";
  const routes = [
    "",
    "/live",
    "/matches",
    "/teams",
    "/leagues",
    "/sports",
    "/search",
    "/favorites",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/live" ? "always" : route === "/matches" ? "hourly" : "daily",
    priority: route === "" ? 1.0 : route === "/live" ? 0.9 : 0.8,
  }));
}
