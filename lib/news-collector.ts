import { prisma } from "@/lib/prisma";
import { districts } from "@/lib/districts";

export const SOURCE_QUERIES = [
  { q: "Odisha", category: "Odisha" },
  { q: "Odisha government", category: "Government" },
  { q: "Odisha jobs recruitment", category: "Jobs" },
  { q: "Odisha education", category: "Education" },
  { q: "Odisha weather rain", category: "Weather" },
];
const FEED_BASE = "https://news.google.com/rss/search";
const MAX_PER_RUN = 20;

function decode(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}
function tag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return decode((match?.[1] || "").replace(/<[^>]+>/g, ""));
}
function attr(block: string, name: string) {
  const match = block.match(new RegExp(`<source[^>]*\\b${name}=["']([^"']+)["']`, "i"));
  return decode(match?.[1] || "");
}
function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}
function districtFor(title: string) {
  const lower = title.toLowerCase();
  return districts.find(d => lower.includes(d.name.toLowerCase()))?.slug || "";
}
function categoryFor(title: string, fallback: string) {
  const t = title.toLowerCase();
  if (/job|recruit|vacanc|employment|career|appointment/.test(t)) return "Jobs";
  if (/school|college|university|exam|result|education|admission|student/.test(t)) return "Education";
  if (/rain|weather|cyclone|storm|imd|heatwave|flood/.test(t)) return "Weather";
  if (/police|crime|arrest|murder|accident|theft/.test(t)) return "Crime";
  if (/business|industry|investment|company|market/.test(t)) return "Business";
  if (/health|hospital|doctor|disease|medical/.test(t)) return "Health";
  return fallback;
}
async function resolveUrl(url: string) {
  try {
    const response = await fetch(url, { headers: { "user-agent": "OdiaDesk Source Collector/1.0" }, redirect: "follow", signal: AbortSignal.timeout(7000) });
    return response.url.startsWith("http") ? response.url : url;
  } catch { return url; }
}
async function feedItems(query: string) {
  const url = `${FEED_BASE}?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
  const response = await fetch(url, { headers: { "user-agent": "OdiaDesk Source Collector/1.0" }, signal: AbortSignal.timeout(7000), cache: "no-store" });
  if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<item>([\\s\\S]*?)<\\/item>/gi)].map(m => {
    const block = m[1];
    return { title: tag(block, "title"), link: tag(block, "link"), description: tag(block, "description").replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim(), sourceName: tag(block, "source"), sourceUrl: attr(block, "url"), pubDate: tag(block, "pubDate") };
  }).filter(item => item.title && item.link);
}
export async function collectNews() {
  const created: Array<{ id: string; title: string; sourceUrl: string }> = [];
  const skipped: string[] = [];
  const errors: string[] = [];
  outer: for (const source of SOURCE_QUERIES) {
    try {
      const items = await feedItems(source.q);
      for (const item of items) {
        if (created.length >= MAX_PER_RUN) break outer;
        const sourceUrl = await resolveUrl(item.link);
        const existing = await prisma.article.findFirst({ where: { OR: [{ sourceUrl }, { title: item.title }] }, select: { id: true } });
        if (existing) { skipped.push(item.title); continue; }
        const districtSlug = districtFor(item.title);
        const district = districtSlug ? await prisma.district.findUnique({ where: { slug: districtSlug }, select: { id: true } }) : null;
        const baseSlug = slugify(item.title) || "source-draft";
        const slugExists = await prisma.article.findUnique({ where: { slug: baseSlug }, select: { id: true } });
        const slug = slugExists ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
        const article = await prisma.article.create({
          data: {
            slug, title: item.title,
            excerpt: item.description || "Source-assisted draft. Verify the original source before publishing.",
            content: ["EDITORIAL NOTE", "", "Automatically collected from a public news feed.", "Verify the original source, confirm the facts, and write original OdiaDesk copy before publishing.", "Do not republish the source article verbatim unless you have the necessary rights.", "", `Source: ${sourceUrl}`, `Collected: ${new Date().toISOString()}`, item.pubDate ? `Source date: ${item.pubDate}` : ""].filter(Boolean).join("\n"),
            category: categoryFor(item.title, source.category), sourceName: item.sourceName || new URL(sourceUrl).hostname,
            sourceUrl, language: "ENGLISH", status: "DRAFT", districtId: district?.id ?? null,
          },
          select: { id: true, title: true, sourceUrl: true },
        });
        created.push(article);
      }
    } catch (error) { errors.push(`${source.q}: ${error instanceof Error ? error.message : "collection failed"}`); }
  }
  return { created, skippedCount: skipped.length, errors };
}
