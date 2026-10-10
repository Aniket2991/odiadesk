import { prisma } from "@/lib/prisma";
import { cleanHtmlText } from "@/lib/text";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district")?.trim() || null;
    const category = searchParams.get("category")?.trim() || null;
    const requestedLimit = Number(searchParams.get("limit") || "20");
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 50)
      : 20;

    if (!process.env.DATABASE_URL) {
      return Response.json({ ok: true, source: "database-not-configured", items: [] });
    }

    const items = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        ...(district ? { district: { slug: district } } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: { district: true },
    });

    return Response.json(
      { ok: true, source: "database", items: items.map((item) => ({ ...item, excerpt: cleanHtmlText(item.excerpt) })) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return Response.json(
      { ok: false, source: "database", items: [], error: "Unable to load news" },
      { status: 503 }
    );
  }
}
