import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = process.env.DATABASE_URL
    ? await prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 50,
        select: { slug: true, title: true, excerpt: true, sourceName: true, publishedAt: true },
      })
    : [];

  const items = articles.map(a => `<item>
<title><![CDATA[${a.title}]]></title>
<link>https://odiadesk.com/news/${a.slug}</link>
<guid isPermaLink="true">https://odiadesk.com/news/${a.slug}</guid>
<description><![CDATA[${a.excerpt}]]></description>
<source url="https://odiadesk.com">${a.sourceName || "OdiaDesk"}</source>
${a.publishedAt ? `<pubDate>${a.publishedAt.toUTCString()}</pubDate>` : ""}
</item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>OdiaDesk — Odisha Local News</title>
<link>https://odiadesk.com</link>
<description>Verified local and district news from Odisha.</description>
<link>https://odiadesk.com/rss.xml</link>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
  });
}
