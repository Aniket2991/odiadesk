import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isValidAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { generateEditorialImage } from "@/lib/ai-images";

export const maxDuration = 60;

export async function POST(request: Request) {
  const jar = await cookies();
  if (!isValidAdminToken(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
  }

  const body = await request.json().catch(() => ({}));
  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "A headline is required." }, { status: 400 });
  }
  const imageUrl = await generateEditorialImage(body.title.trim(), typeof body.excerpt === "string" ? body.excerpt : "");
  if (!imageUrl) {
    return NextResponse.json({
      error: "Image generation is not configured or failed. Set GEMINI_API_KEY, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY in Vercel, then try again."
    }, { status: 503 });
  }

  if (typeof body.articleId === "string" && body.articleId) {
    const article = await prisma.article.findUnique({ where: { id: body.articleId } });
    if (!article) return NextResponse.json({ error: "Article not found." }, { status: 404 });
    if (article.status === "PUBLISHED") {
      return NextResponse.json({ error: "Published stories cannot have images replaced from this tool. Edit and review the story first." }, { status: 409 });
    }
    const updated = await prisma.article.update({ where: { id: article.id }, data: { imageUrl } });
    return NextResponse.json({ ok: true, imageUrl: updated.imageUrl });
  }

  return NextResponse.json({ ok: true, imageUrl });
}
