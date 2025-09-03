import type { MetadataRoute } from "next";
import { posts } from "@/data/posts";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/insights`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const insightRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE}/insights/${p.slug}`,
    lastModified: p.date,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...routes, ...insightRoutes];
}
