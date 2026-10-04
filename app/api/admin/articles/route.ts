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

  const district = typeof body.districtSlug==="string" && body.districtSlug
    ? await prisma.district.findUnique({where:{slug:body.districtSlug}})
    : null;
  const slug = slugify(String(body.slug||body.title));
  const status = body.status==="REVIEW" ? "REVIEW" : body.status==="PUBLISHED" ? "PUBLISHED" : "DRAFT";
  const article = await prisma.article.create({data:{
    slug,title:String(body.title).trim(),excerpt:String(body.excerpt).trim(),content:String(body.content).trim(),
    category:String(body.category),sourceName:String(body.sourceName).trim(),sourceUrl:String(body.sourceUrl).trim(),
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
  if (typeof body.id!=="string" || typeof body.status!=="string") return NextResponse.json({error:"id and status are required"},{status:400});
  const allowed = ["DRAFT","REVIEW","PUBLISHED","ARCHIVED"];
  if (!allowed.includes(body.status)) return NextResponse.json({error:"Invalid status"},{status:400});
  const article = await prisma.article.update({where:{id:body.id},data:{status:body.status as "DRAFT"|"REVIEW"|"PUBLISHED"|"ARCHIVED",publishedAt:body.status==="PUBLISHED"?new Date():body.status==="ARCHIVED"?undefined:null},include:{district:true}});
  return NextResponse.json({ok:true,article});
}
