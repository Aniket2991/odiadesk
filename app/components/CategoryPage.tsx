import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cleanHtmlText } from "@/lib/text";

type CategoryPageProps = {
  eyebrow: string;
  heading: string;
  accent: string;
  description: string;
  categories: string[];
};

export default async function CategoryPage({
  eyebrow,
  heading,
  accent,
  description,
  categories,
}: CategoryPageProps) {
  const articles = process.env.DATABASE_URL
    ? await prisma.article.findMany({
        where: { status: "PUBLISHED", NOT: { content: { startsWith: "EDITORIAL NOTE" } }, category: { in: categories } },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 50,
        include: { district: true },
      })
    : [];

  return (
    <main>
      <header className="header">
        <div className="container nav">
          <Link href="/" className="brand">
            <span className="brandmark">O</span>
            <span><strong>Odia</strong>Desk<small>Your Odisha. Your Local Desk.</small></span>
          </Link>
          <Link href="/" className="textLink">← Home</Link>
        </div>
      </header>
      <section className="pageHero">
        <div className="container">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{heading} <span>{accent}</span></h1>
          <p>{description}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {articles.length > 0 ? (
            <div className="storyGrid">
              {articles.map((article) => (
                <Link className="storyCard" href={"/news/" + article.slug} key={article.id}>
                  <span className="eyebrow">{article.category} · {article.district?.name || "Odisha"}</span>
                  <h2>{article.title}</h2>
                  <p>{cleanHtmlText(article.excerpt)}</p>
                  <small>{article.sourceName} · {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-IN") : "Recently published"}</small>
                </Link>
              ))}
            </div>
          ) : (
            <div className="notice">
              <strong>No verified updates published here yet.</strong>
              <p>This desk displays only stories an editor has checked and published. Please check back as new updates are verified.</p>
              <div className="heroActions">
                <Link href="/news" className="primary">Browse all news →</Link>
                <Link href="/districts" className="secondary">Explore districts</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
