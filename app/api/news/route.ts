import { prisma } from "@/lib/prisma";
import { validateArticle } from "@/lib/validation";
export async function GET(request:Request){
 const {searchParams}=new URL(request.url); const district=searchParams.get("district"); const category=searchParams.get("category");
 if(!process.env.DATABASE_URL)return Response.json({ok:true,source:"demo",items:[]});
 const items=await prisma.article.findMany({where:{status:"PUBLISHED",...(district?{district:{slug:district}}:{}),...(category?{category}:{} )},orderBy:{publishedAt:"desc"},take:50,include:{district:true}});
 return Response.json({ok:true,source:"database",items});
}
export async function POST(request:Request){
 if(!process.env.DATABASE_URL)return Response.json({error:"DATABASE_URL is not configured"},{status:503});
 const body=await request.json(); const error=validateArticle(body); if(error)return Response.json({error},{status:400});
 const slug=String(body.slug||body.title).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90);
 const article=await prisma.article.create({data:{slug,title:String(body.title).trim(),excerpt:String(body.excerpt).trim(),content:String(body.content),category:String(body.category),sourceName:String(body.sourceName),sourceUrl:String(body.sourceUrl),language:body.language==="ODIA"?"ODIA":"ENGLISH",status:"DRAFT"}});
 return Response.json({ok:true,article},{status:201});
}