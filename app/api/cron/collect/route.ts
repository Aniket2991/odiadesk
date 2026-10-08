import { NextResponse } from "next/server";
import { collectNews } from "@/lib/news-collector";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}
export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ ok: true, ...(await collectNews()) }); }
  catch { return NextResponse.json({ error: "Collection failed." }, { status: 500 }); }
}
