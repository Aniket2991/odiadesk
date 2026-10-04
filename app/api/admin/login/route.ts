import { NextResponse } from "next/server";
import { createAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!process.env.ADMIN_KEY) return NextResponse.json({error:"ADMIN_KEY is not configured"},{status:503});
  if (typeof body.key !== "string" || body.key !== process.env.ADMIN_KEY) return NextResponse.json({error:"Invalid admin key"},{status:401});
  const response = NextResponse.json({ok:true});
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), {httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*12});
  return response;
}
