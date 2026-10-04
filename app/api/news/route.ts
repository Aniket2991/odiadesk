import { prisma } from "@/lib/prisma";
export async function GET(request:Request){
 const {searchParams}=new URL(request.url); const district=searchParams.get("district"); const category=searchParams.get("category");
 if(!process.env.DATABASE_URL)return Response.json({ok:true,source:"database-not-configured",items:[]});
 const items=await prisma.article.findMany({where:{status:"PUBLISHED",...(district?{district:{slug:district}}:{}),...(category?{category}:{} )},orderBy:{publishedAt:"desc"},take:50,include:{district:true}});
 return Response.json({ok:true,source:"database",items});
}