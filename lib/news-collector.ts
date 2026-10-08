import { prisma } from "@/lib/prisma";
import { districts } from "@/lib/districts";

type FeedItem = {
  title: string;
  link: string;
  description: string;
  sourceName: string;
  pubDate: string;
};

const FEEDS = [
  { query: "Odisha", category: "Odisha" },
  { query: "Odisha government", category: "Government" },
  { query: "Odisha jobs recruitment", category: "Jobs" },
  { query: "Odisha education", category: "Education" },
  { query: "Odisha weather", category: "Weather" },
];

function clean(value: string): string {
  return value
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function field(block: string, name: string): string {
  const match = block.match(new RegExp("<" + name + "[^>]*>([\\s\\S]*?)</" + name + ">", "i"));
  return clean(match?.[1] ?? "");
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "source-draft";
}

function categoryFor(title: string, fallback: string): string {
  const text = title.toLowerCase();
  if (/job|recruit|vacancy|employment|career/.test(text)) return "Jobs";
  if (/school|college|university|exam|result|education|student/.test(text)) return "Education";
  if (/rain|weather|cyclone|storm|imd|flood|heatwave/.test(text)) return "Weather";
  if (/police|crime|arrest|murder|accident|theft/.test(text)) return "Crime";
  if (/business|industry|investment|company|market/.test(text)) return "Business";
  return fallback;
}

function districtSlugFor(title: string): string {
  const lower = title.toLowerCase();
  return districts.find((district) => lower.includes(district.name.toLowerCase()))?.slug ?? "";
}

async function getFeed(query: string): Promise<FeedItem[]> {
  const url = "https://news.google.com/rss/search?q=" + encodeURIComponent(query) + "&hl=en-IN&gl=IN&ceid=IN:en";
  const response = await fetch(url, {
    headers: { "user-agent": "OdiaDesk Source Collector/1.0" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("RSS HTTP " + response.status);

  const xml = await response.text();
  const blocks = xml.split(/<item>/i).slice(1);
  return blocks.map((block): FeedItem => ({
    title: field(block, "title"),
    link: field(block, "link"),
    description: field(block, "description"),
    sourceName: field(block, "source"),
    pubDate: field(block, "pubDate"),
  })).filter((item) => Boolean(item.title && item.link));
}

async function finalUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "OdiaDesk Source Collector/1.0" },
      redirect: "follow",
    });
    return response.url || url;
  } catch {
    return url;
  }
}

export async function collectNews() {
  const created: Array<{ id: string; title: string; sourceUrl: string }> = [];
  const errors: string[] = [];

  for (const feed of FEEDS) {
    if (created.length >= 15) break;
    try {
      const items = await getFeed(feed.query);
      for (const item of items) {
        if (created.length >= 15) break;

        const sourceUrl = await finalUrl(item.link);
        const duplicate = await prisma.article.findFirst({
          where: { OR: [{ sourceUrl }, { title: item.title }] },
          select: { id: true },
        });
        if (duplicate) continue;

        const districtSlug = districtSlugFor(item.title);
        const district = districtSlug
          ? await prisma.district.findUnique({ where: { slug: districtSlug }, select: { id: true } })
          : null;

        const baseSlug = slugify(item.title);
        const sameSlug = await prisma.article.findUnique({ where: { slug: baseSlug }, select: { id: true } });
        const slug = sameSlug ? baseSlug + "-" + Date.now().toString(36) : baseSlug;

        const article = await prisma.article.create({
          data: {
            slug,
            title: item.title,
            excerpt: item.description || "Source-assisted draft. Verify the original source before publishing.",
            content: "EDITORIAL NOTE\n\nThis story was automatically discovered from a public RSS feed. Verify the original source, confirm the facts, and write original OdiaDesk copy before publishing.\n\nSource: " + sourceUrl,
            category: categoryFor(item.title, feed.category),
            sourceName: item.sourceName || "Source publisher",
            sourceUrl,
            language: "ENGLISH",
            status: "DRAFT",
            districtId: district?.id ?? null,
          },
          select: { id: true, title: true, sourceUrl: true },
        });
        created.push(article);
      }
    } catch (error) {
      errors.push(feed.query + ": " + (error instanceof Error ? error.message : "collection failed"));
    }
  }

  return { created, errors };
}
