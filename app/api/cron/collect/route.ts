import { NextResponse } from "next/server";
import { collectNews } from "@/lib/news-collector";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const userAgent = request.headers.get("user-agent") || "";
  return Boolean(
    secret &&
    authorization === `Bearer ${secret}` &&
    userAgent.toLowerCase().includes("vercel-cron")
  );
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, ...(await collectNews()) });
  } catch {
    return NextResponse.json({ error: "Collection failed." }, { status: 500 });
  }
}
