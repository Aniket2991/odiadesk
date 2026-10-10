import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cleanHtmlText } from "@/lib/text";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search Odisha News",
  description: "Search published OdiaDesk stories by topic, district and category.",
};

type SearchPageProps = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const articles = q && process.env.DATABASE_URL
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { district: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 30,
        include: { district: true },
      })
    : [];

  return (
    <main>
      <header className="header"><div className="container nav">
        <Link href="/" className="brand"><span className="brandmark">O</span><span><strong>Odia</strong>Desk<small>Your Odisha. Your Local Desk.</small></span></Link>
        <Link href="/news" className="textLink">← Latest News</Link>
      </div></header>

      <section className="pageHero"><div className="container">
        <span className="eyebrow">SEARCH ODIADESK</span>
        <h1>Find <span>local stories.</span></h1>
        <p>Search published news by headline, topic, category or district.</p>
        <form className="siteSearchForm" action="/search" method="get">
          <input name="q" defaultValue={q} placeholder="Search Odisha news, district, topic…" aria-label="Search OdiaDesk" />
          <button className="primary" type="submit">Search</button>
        </form>
      </div></section>

      <section className="section"><div className="container">
        {q ? (
          <>
            <div className="sectionHead"><div><span className="eyebrow">RESULTS</span><h2>{articles.length} result{articles.length === 1 ? "" : "s"} for “{q}”</h2></div></div>
            {articles.length ? <div className="storyGrid">
              {articles.map(a => <Link className="storyCard" href={"/news/" + a.slug} key={a.id}>
                <span className="eyebrow">{a.category} · {a.district?.name || "Odisha"}</span>
                <h2>{a.title}</h2><p>{cleanHtmlText(a.excerpt)}</p>
                <small>{a.sourceName} · {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-IN") : "Recently"}</small>
              </Link>)}
            </div> : <div className="notice"><strong>No matching published stories.</strong><p>Try a district name, topic or a shorter search.</p></div>}
          </>
        ) : (
          <div className="notice"><strong>Search is ready.</strong><p>Enter a district, topic or keyword to find verified OdiaDesk stories.</p></div>
        )}
      </div></section>
    </main>
  );
}
