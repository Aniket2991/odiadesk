import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export const metadata={title:"Latest Odisha News",description:"Verified local and district news from across Odisha."};

export default async function News(){
  const articles=process.env.DATABASE_URL?await prisma.article.findMany({where:{status:"PUBLISHED"},orderBy:{publishedAt:"desc"},take:50,include:{district:true}}):[];
  return <main><header className="header"><div className="container nav"><Link href="/" className="brand"><span className="brandmark">O</span><span><strong>Odia</strong>Desk<small>Your Odisha. Your Local Desk.</small></span></Link><Link href="/" className="textLink">← Home</Link></div></header>
  <section className="pageHero"><div className="container"><span className="eyebrow">ODIA DESK • VERIFIED NEWS</span><h1>Latest <span>News</span></h1><p>District-first stories published after source and editorial verification.</p></div></section>
  <section className="section"><div className="container">{articles.length?<div className="storyGrid">{articles.map(a=><Link className="storyCard" href={"/news/"+a.slug} key={a.id}><span className="eyebrow">{a.category} · {a.district?.name||"Odisha"}</span><h2>{a.title}</h2><p>{a.excerpt}</p><small>{a.sourceName} · {a.publishedAt?new Date(a.publishedAt).toLocaleDateString("en-IN"):"Recently"}</small></Link>)}</div>:<div className="notice"><strong>No published stories yet.</strong><p>The editorial desk is ready. Stories will appear here only after a verified source is supplied and an editor publishes them.</p><Link href="/admin" className="primary inlineButton">Open editorial desk</Link></div>}</div></section></main>;
}