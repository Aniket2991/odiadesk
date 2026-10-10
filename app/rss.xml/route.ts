import { prisma } from "@/lib/prisma";
import { cleanHtmlText } from "@/lib/text";

export const dynamic = "force-dynamic";

const SITE_URL = "https://odiadesk.vercel.app";

function cdata(value: string | null | undefined) {
  return `<![CDATA[${String(value ?? "").replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const articles = process.env.DATABASE_URL
    ? await prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 50,
        select: { slug: true, title: true, excerpt: true, sourceName: true, publishedAt: true },
      })
    : [];

  const items = articles.map((a) => `<item>
<title>${cdata(a.title)}</title>
<link>${SITE_URL}/news/${encodeURIComponent(a.slug)}</link>
<guid isPermaLink="true">${SITE_URL}/news/${encodeURIComponent(a.slug)}</guid>
<description>${cdata(cleanHtmlText(a.excerpt))}</description>
<source url="${SITE_URL}">${cdata(a.sourceName || "OdiaDesk")}</source>
${a.publishedAt ? `<pubDate>${a.publishedAt.toUTCString()}</pubDate>` : ""}
</item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>OdiaDesk — Odisha Local News</title>
<link>${SITE_URL}</link>
<description>Verified local and district news from Odisha.</description>
<atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
