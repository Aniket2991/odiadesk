import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { collectNews } from "@/lib/news-collector";
async function authorized() { const jar = await cookies(); return isValidAdminToken(jar.get(ADMIN_COOKIE)?.value); }
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}
export async function POST(request: Request) {
  if (!await authorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  try { return NextResponse.json({ ok: true, ...(await collectNews()) }); }
  catch { return NextResponse.json({ error: "Collection failed." }, { status: 500 }); }
}
