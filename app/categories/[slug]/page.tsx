import Link from "next/link";
import { prisma } from "@/lib/prisma";

const data: Record<string, { title: string; eyebrow: string; desc: string }> = {
 alerts: { title: "Local Alerts", eyebrow: "ALERT DESK", desc: "Important public updates, civic alerts and time-sensitive local information." },
 education: { title: "Education", eyebrow: "EDUCATION DESK", desc: "Education news and useful information organised by district." },
 government: { title: "Government", eyebrow: "CIVIC DESK", desc: "Official notices, public services and government information." },
 business: { title: "Local Business", eyebrow: "BUSINESS DESK", desc: "Useful local business and service information close to home." },
 weather: { title: "Weather", eyebrow: "WEATHER DESK", desc: "Weather-related stories, advisories and travel information with clear sources." },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return { title: data[slug]?.title || "OdiaDesk", description: data[slug]?.desc }; }

export default async function Category({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const d = data[slug];
 if (!d) return <main><section className="section"><div className="container prose"><h1>Not found</h1><Link href="/">Return home →</Link></div></section></main>;
 const articles = process.env.DATABASE_URL ? await prisma.article.findMany({ where: { status: "PUBLISHED", category: d.title }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], take: 30, include: { district: true } }) : [];
 return <main><header className="header"><div className="container nav"><Link href="/" className="brand"><span className="brandmark">O</span><span><strong>Odia</strong>Desk<small>Your Odisha. Your Local Desk.</small></span></Link><Link href="/" className="textLink">← Home</Link></div></header><section className="pageHero"><div className="container"><span className="eyebrow">{d.eyebrow}</span><h1>{d.title.split(" ")[0]} <span>{d.title.split(" ").slice(1).join(" ")}</span></h1><p>{d.desc}</p></div></section><section className="section"><div className="container">{articles.length ? <div className="storyGrid">{articles.map((a) => <Link className="storyCard" href={"/news/" + a.slug} key={a.id}><span className="eyebrow">{a.category} · {a.district?.name || "Odisha"}</span><h2>{a.title}</h2><p>{a.excerpt}</p><small>{a.sourceName} · {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-IN") : "Recently"}</small></Link>)}</div> : <div className="notice"><strong>No published {d.title.toLowerCase()} stories yet.</strong><p>The desk is ready for verified editorial content. Nothing is invented or auto-published.</p><Link href="/news" className="primary inlineButton">Browse all news →</Link></div>}</div></section></main>;
}