import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { validateArticle } from "@/lib/validation";
import { cookies } from "next/headers";

async function authorized() {
  const jar = await cookies();
  return isValidAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

function slugify(value:string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90);
}

function uniqueSlug(base:string, currentId?:string) {
  return prisma.article.findUnique({where:{slug:base}}).then(existing => {
    if (!existing || existing.id === currentId) return base;
    return `${base}-${Date.now().toString(36)}`;
  });
}

export async function GET() {
  if (!await authorized()) return NextResponse.json({error:"Unauthorized"},{status:401});
  if (!process.env.DATABASE_URL) return NextResponse.json({error:"DATABASE_URL is not configured"},{status:503});
  const articles = await prisma.article.findMany({orderBy:{createdAt:"desc"},take:100,include:{district:true}});
  return NextResponse.json({ok:true,articles});
}

export async function POST(request:Request) {
  if (!await authorized()) return NextResponse.json({error:"Unauthorized"},{status:401});
  if (!process.env.DATABASE_URL) return NextResponse.json({error:"DATABASE_URL is not configured"},{status:503});
  const body = await request.json().catch(()=>({}));
  const error = validateArticle(body);
  if (error) return NextResponse.json({error},{status:400});

  const sourceUrl = String(body.sourceUrl).trim();
  const duplicate = await prisma.article.findFirst({where:{sourceUrl}});
  if (duplicate) return NextResponse.json({error:"This source URL is already in the editorial queue."},{status:409});

  const district = typeof body.districtSlug==="string" && body.districtSlug
    ? await prisma.district.findUnique({where:{slug:body.districtSlug}})
    : null;
  const baseSlug = slugify(String(body.slug||body.title)) || "story";
  const slug = await uniqueSlug(baseSlug);
  const status = body.status==="REVIEW" ? "REVIEW" : body.status==="PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const article = await prisma.article.create({data:{
    slug,title:String(body.title).trim(),excerpt:String(body.excerpt).trim(),content:String(body.content).trim(),
    category:String(body.category),sourceName:String(body.sourceName).trim(),sourceUrl,
    language:body.language==="ODIA"?"ODIA":"ENGLISH",status,
    districtId:district?.id ?? null,publishedAt:status==="PUBLISHED"?new Date():null,
    imageUrl:typeof body.imageUrl==="string"&&body.imageUrl?body.imageUrl:null
  },include:{district:true}});
  return NextResponse.json({ok:true,article},{status:201});
}

export async function PATCH(request:Request) {
  if (!await authorized()) return NextResponse.json({error:"Unauthorized"},{status:401});
  if (!process.env.DATABASE_URL) return NextResponse.json({error:"DATABASE_URL is not configured"},{status:503});
  const body = await request.json().catch(()=>({}));
  if (typeof body.id!=="string") return NextResponse.json({error:"id is required"},{status:400});

  const existing = await prisma.article.findUnique({where:{id:body.id}});
  if (!existing) return NextResponse.json({error:"Article not found"},{status:404});

  const data: Record<string, unknown> = {};

  for (const key of ["title","excerpt","content","category","sourceName","sourceUrl"]) {
    if (key in body) {
      if (typeof body[key] !== "string" || !body[key].trim()) return NextResponse.json({error:`Missing required field: ${key}`},{status:400});
      data[key] = body[key].trim();
    }
  }

  if ("sourceUrl" in data) {
    if (!/^https?:\\/\\//i.test(String(data.sourceUrl))) return NextResponse.json({error:"sourceUrl must be a valid HTTP(S) URL"},{status:400});
    const duplicate = await prisma.article.findFirst({where:{sourceUrl:String(data.sourceUrl),NOT:{id:body.id}}});
    if (duplicate) return NextResponse.json({error:"Another article already uses this source URL."},{status:409});
  }

  if ("category" in data) {
    const validationError = validateArticle({...existing,...data});
    if (validationError) return NextResponse.json({error:validationError},{status:400});
  }

  if ("language" in body) data.language = body.language==="ODIA" ? "ODIA" : "ENGLISH";

  if ("districtSlug" in body) {
    const district = typeof body.districtSlug==="string" && body.districtSlug
      ? await prisma.district.findUnique({where:{slug:body.districtSlug}})
      : null;
    data.districtId = district?.id ?? null;
  }

  if ("slug" in body || "title" in data) {
    const baseSlug = slugify(String(body.slug || data.title || existing.title)) || "story";
    data.slug = await uniqueSlug(baseSlug, existing.id);
  }

  if ("status" in body) {
    if (typeof body.status!=="string" || !["DRAFT","REVIEW","PUBLISHED","ARCHIVED"].includes(body.status)) {
      return NextResponse.json({error:"Invalid status"},{status:400});
    }
    data.status = body.status;
    data.publishedAt = body.status==="PUBLISHED" ? (existing.publishedAt || new Date()) : null;
  }

  if (Object.keys(data).length === 0) return NextResponse.json({error:"No changes supplied"},{status:400});

  const article = await prisma.article.update({where:{id:body.id},data:data as never,include:{district:true}});
  return NextResponse.json({ok:true,article});
}
