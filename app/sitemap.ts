import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { districts } from "@/lib/districts";

const base = "https://odiadesk.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "", "/news", "/districts", "/jobs", "/events", "/alerts",
    "/education", "/government", "/weather", "/business", "/about",
    "/privacy", "/terms"
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

  const articles = process.env.DATABASE_URL
    ? await prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true, publishedAt: true },
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
