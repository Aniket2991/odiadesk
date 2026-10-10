import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { isSafeHttpUrl } from "@/lib/validation";

type Result = { headline: string; excerpt: string; content: string; seoTitle: string; seoDescription: string; language: "ENGLISH" | "ODIA" };

async function authorized() {
  const jar = await cookies();
  return isValidAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function parse(text: string): Result | null {
  const s = text.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
  try { return JSON.parse(s) as Result; } catch {}
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a >= 0 && b > a) {
    try { return JSON.parse(s.slice(a, b + 1)) as Result; } catch {}
  }
  return null;
}

export async function POST(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "GEMINI_API_KEY is not configured in Vercel." }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";
  const sourceName = typeof body.sourceName === "string" ? body.sourceName.trim().slice(0, 160) : "";
  const category = typeof body.category === "string" ? body.category.trim().slice(0, 80) : "Odisha";
  const language = body.language === "ODIA" ? "ODIA" : "ENGLISH";

  if (!title || !content || !sourceUrl) {
    return NextResponse.json({ error: "Headline, content and source URL are required." }, { status: 400 });
  }
  if (title.length > 300 || excerpt.length > 2000 || content.length > 20000) {
    return NextResponse.json({ error: "The source material is too long. Shorten it before using AI assist." }, { status: 413 });
  }
  if (!isSafeHttpUrl(sourceUrl)) {
    return NextResponse.json({ error: "Enter a valid HTTP(S) source URL." }, { status: 400 });
  }

  const prompt = "You are the editorial assistant for OdiaDesk, a district-first Odisha news platform.\n\nCreate an ORIGINAL editorial draft from the supplied source-assisted material. Do not invent facts, names, quotes, numbers, dates or locations. Do not copy sentences from the source.\n\nReturn ONLY valid JSON with exactly these keys: headline, excerpt, content, seoTitle, seoDescription, language.\n\nHeadline: clear and not clickbait. Excerpt: 1-2 sentences. Content: 4-8 short paragraphs. Never fabricate quotes. SEO title about 60 characters. SEO description about 160 characters. Target language: " + language + ". Category: " + category + ". Publisher: " + sourceName + ". Source URL: " + sourceUrl + ".\n\nSOURCE MATERIAL\nHeadline: " + title + "\nExcerpt: " + excerpt + "\nNotes/content:\n" + content;

  try {
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(key);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: "application/json" } }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      console.error("Gemini editorial request failed", response.status);
      return NextResponse.json({ error: "AI editorial service is temporarily unavailable." }, { status: 502 });
    }
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") || "";
    const result = parse(text);
    if (!result?.headline || !result?.excerpt || !result?.content) {
      return NextResponse.json({ error: "AI returned an unusable editorial response." }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      result: {
        headline: result.headline,
        excerpt: result.excerpt,
        content: result.content,
        seoTitle: result.seoTitle || result.headline,
        seoDescription: result.seoDescription || result.excerpt,
        language: result.language === "ODIA" ? "ODIA" : language,
      },
    });
  } catch (error) {
    console.error("Gemini editorial error", error);
    return NextResponse.json({ error: "AI editorial service timed out or failed." }, { status: 502 });
  }
}
