import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = process.env.DATABASE_URL
    ? await prisma.article.findFirst({
        where: { slug, status: "PUBLISHED" },
        include: { district: true },
      })
    : null;

  return a
    ? {
        title: a.title,
        description: a.excerpt,
        alternates: { canonical: "/news/" + a.slug },
        openGraph: {
          title: a.title,
          description: a.excerpt,
          url: "/news/" + a.slug,
          type: "article" as const,
          ...(a.imageUrl ? { images: [a.imageUrl] } : {}),
        },
        ...(a.imageUrl
          ? {
              twitter: {
                card: "summary_large_image" as const,
                title: a.title,
                description: a.excerpt,
                images: [a.imageUrl],
              },
            }
          : {}),
      }
    : { title: "News story" };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = process.env.DATABASE_URL
    ? await prisma.article.findFirst({
        where: { slug, status: "PUBLISHED" },
        include: { district: true },
      })
    : null;

  if (!a) notFound();

  const related = process.env.DATABASE_URL
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          id: { not: a.id },
          OR: [
            { category: a.category },
            ...(a.districtId ? [{ districtId: a.districtId }] : []),
          ],
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 4,
        include: { district: true },
      })
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.publishedAt?.toISOString(),
    dateModified: a.updatedAt.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://odiadesk.com/news/${a.slug}`,
    },
    author: { "@type": "Organization", name: "OdiaDesk" },
    publisher: {
      "@type": "Organization",
      name: "OdiaDesk",
      url: "https://odiadesk.com",
      logo: { "@type": "ImageObject", url: "https://odiadesk.com/icon.svg" },
    },
    ...(a.imageUrl ? { image: [a.imageUrl] } : {}),
  };

  return (
    <main>
      <header className="header">
        <div className="container nav">
          <Link href="/" className="brand">
            <span className="brandmark">O</span>
            <span>
              <strong>Odia</strong>Desk
              <small>Your Odisha. Your Local Desk.</small>
            </span>
          </Link>
          <Link href="/news" className="textLink">
            ← Latest
          </Link>
        </div>
      </header>

      <article className="article">
        <div className="container narrow">
          <span className="eyebrow">
            {a.category} · {a.district?.name || "Odisha"}
          </span>
          <h1>{a.title}</h1>

          {a.imageUrl && (
            <img
              src={a.imageUrl}
              alt={a.title}
              style={{
                width: "100%",
                maxHeight: 520,
                objectFit: "cover",
                borderRadius: 18,
                margin: "20px 0",
              }}
            />
          )}

          <p className="articleLead">{a.excerpt}</p>

          <div className="shareBar" aria-label="Share this story">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(a.title + " — https://odiadesk.com/news/" + a.slug)}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://odiadesk.com/news/" + a.slug)}`}
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}&url=${encodeURIComponent("https://odiadesk.com/news/" + a.slug)}`}
              target="_blank"
              rel="noreferrer"
            >
              X
            </a>
          </div>

          <div className="articleMeta">
            Published{" "}
            {a.publishedAt
              ? new Date(a.publishedAt).toLocaleString("en-IN")
              : "—"}{" "}
            · Source: {a.sourceName}
          </div>

          <div className="articleBody">
            {a.content
              .split(/\n+/)
              .map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
          </div>

          {related.length > 0 && (
            <section className="section" style={{ padding: "28px 0 0" }}>
              <div className="sectionHead">
                <div>
                  <span className="eyebrow">KEEP READING</span>
                  <h2>More local stories</h2>
                </div>
              </div>
              <div className="storyGrid">
                {related.map((story) => (
                  <Link className="storyCard" href={"/news/" + story.slug} key={story.id}>
                    <span className="eyebrow">
                      {story.category} · {story.district?.name || "Odisha"}
                    </span>
                    <h2>{story.title}</h2>
                    <p>{story.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="notice">
            <strong>Source</strong>
            <p>
              <a href={a.sourceUrl} target="_blank" rel="noreferrer">
                View original source →
              </a>
            </p>
          </div>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
