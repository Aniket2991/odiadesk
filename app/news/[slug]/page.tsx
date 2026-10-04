import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const a=process.env.DATABASE_URL?await prisma.article.findFirst({where:{slug,status:"PUBLISHED"},include:{district:true}}):null;
 return a?{title:a.title,description:a.excerpt,alternates:{canonical:"/news/"+a.slug}}:{title:"News story"};
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const a=process.env.DATABASE_URL?await prisma.article.findFirst({where:{slug,status:"PUBLISHED"},include:{district:true}}):null;
 if(!a)notFound();
 const jsonLd={"@context":"https://schema.org","@type":"NewsArticle","headline":a.title,"description":a.excerpt,"datePublished":a.publishedAt?.toISOString(),"dateModified":a.updatedAt.toISOString(),"author":{"@type":"Organization","name":"OdiaDesk"},"publisher":{"@type":"Organization","name":"OdiaDesk"}};
 return <main><header className="header"><div className="container nav"><Link href="/" className="brand"><span className="brandmark">O</span><span><strong>Odia</strong>Desk<small>Your Odisha. Your Local Desk.</small></span></Link><Link href="/news" className="textLink">← Latest</Link></div></header><article className="article"><div className="container narrow"><span className="eyebrow">{a.category} · {a.district?.name||"Odisha"}</span><h1>{a.title}</h1><p className="articleLead">{a.excerpt}</p><div className="articleMeta">Published {a.publishedAt?new Date(a.publishedAt).toLocaleString("en-IN"):"—"} · Source: {a.sourceName}</div><div className="articleBody">{a.content.split(/\n+/).map((p:string,i:number)=><p key={i}>{p}</p>)}</div><div className="notice"><strong>Source</strong><p><a href={a.sourceUrl} target="_blank" rel="noreferrer">View original source →</a></p></div></div></article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/></main>;
}