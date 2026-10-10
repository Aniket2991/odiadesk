import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { districts } from "@/lib/districts";

export const dynamic = "force-dynamic";

const base = "https://odiadesk.vercel.app";

function hasValidDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  return Boolean(value && (value.startsWith("postgresql://") || value.startsWith("postgres://")));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "", "/news", "/districts", "/jobs", "/events", "/alerts",
    "/education", "/government", "/weather", "/business", "/about",
    "/privacy", "/terms", "/editorial-policy", "/search"
  ].map(path => ({
    url: base + path,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/news" ? "daily" as const : "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const districtRoutes = districts.map(d => ({
    url: base + "/district/" + d.slug,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const articles = hasValidDatabaseUrl()
    ? await prisma.article.findMany({
        where: { status: "PUBLISHED", NOT: { content: { startsWith: "EDITORIAL NOTE" } } },
        select: { slug: true, updatedAt: true, publishedAt: true, content: true },
      })
    : [];

  const articleRoutes = articles.map(a => ({
    url: base + "/news/" + a.slug,
    lastModified: a.updatedAt || a.publishedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...districtRoutes, ...articleRoutes];
}
