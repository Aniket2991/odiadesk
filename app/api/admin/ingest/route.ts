import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isValidAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { isSafeHttpUrl } from "@/lib/validation";

async function authorized() {
  const jar = await cookies();
  return isValidAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

function blockedHost(hostname: string) {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "::1" || h.endsWith(".local") ||
    h.startsWith("127.") || h.startsWith("10.") || h.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(h);
}

function decode(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function meta(html: string, name: string) {
  const pattern = "<meta[^>]+(?:name|property)=[\\\"]" + name +
    "[\\\"][^>]+content=[\\\"]([^\\\"]*)[\\\"][^>]*>";
  const altPattern = "<meta[^>]+content=[\\\"]([^\\\"]*)[\\\"][^>]+(?:name|property)=[\\\"]" +
    name + "[\\\"][^>]*>";
  const re = new RegExp(pattern, "i");
  const alt = new RegExp(altPattern, "i");
  return decode((html.match(re)?.[1] || html.match(alt)?.[1] || "").trim());
}

function htmlTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decode((match?.[1] || "").replace(/<[^>]+>/g, "").trim());
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export async function POST(request: Request) {
  if (!await authorized()) return NextResponse.json({error: "Unauthorized"}, {status: 401});
  const body = await request.json().catch(() => ({}));
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";
  if (!isSafeHttpUrl(sourceUrl)) return NextResponse.json({error: "Enter a valid HTTP(S) source URL."}, {status: 400});

  const url = new URL(sourceUrl);
  if (blockedHost(url.hostname)) return NextResponse.json({error: "This source host is not allowed."}, {status: 400});

  const duplicate = await prisma.article.findFirst({where: {sourceUrl}});
  if (duplicate) return NextResponse.json({error: "This source URL is already in the editorial queue."}, {status: 409});

  try {
    const response = await fetch(sourceUrl, {
      headers: {"user-agent": "OdiaDesk Editorial Fetcher/1.0"},
      signal: AbortSignal.timeout(8000),
      redirect: "manual"
    });
    if (!response.ok) return NextResponse.json({error: `Source returned HTTP ${response.status}. Open it manually and create the draft.`}, {status: 400});
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html")) return NextResponse.json({error: "This importer currently accepts HTML article pages only."}, {status: 400});

    const html = (await response.text()).slice(0, 800000);
    const title = meta(html, "og:title") || meta(html, "twitter:title") || htmlTitle(html);
    const description = meta(html, "og:description") || meta(html, "description") || meta(html, "twitter:description");
    if (!title) return NextResponse.json({error: "Could not detect a headline. Create the draft manually."}, {status: 400});

    let slug = slugify(title) || "imported-story";
    const existing = await prisma.article.findUnique({where: {slug}});
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const article = await prisma.article.create({
      data: {
        slug,
        title,
        excerpt: description || "Imported source draft — verify and rewrite before publishing.",
        content: "EDITORIAL NOTE\n\nThis is a source-assisted draft. Review the original source, verify the facts, write original OdiaDesk copy, and replace this note before publishing. Do not republish the source article verbatim unless you have the necessary rights.\n\nSource: " + sourceUrl,
        category: typeof body.category === "string" && body.category ? body.category : "Odisha",
        sourceName: typeof body.sourceName === "string" && body.sourceName ? body.sourceName : url.hostname,
        sourceUrl,
        language: body.language === "ODIA" ? "ODIA" : "ENGLISH",
        status: "DRAFT",
        districtId: null
      },
      include: {district: true}
    });
    return NextResponse.json({ok: true, article});
  } catch {
    return NextResponse.json({error: "Could not fetch that source. Try the URL manually or create the story from the editorial form."}, {status: 400});
  }
}
