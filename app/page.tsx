import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { districts } from "@/lib/districts";
import DistrictSearch from "@/app/components/DistrictSearch";
import { cleanHtmlText } from "@/lib/text";

export const dynamic = "force-dynamic";

const categories = [
  ["📰", "Latest News", "/news"],
  ["🚨", "Local Alerts", "/alerts"],
  ["💼", "Jobs", "/jobs"],
  ["🎓", "Education", "/education"],
  ["🏛️", "Government", "/government"],
  ["🎉", "Events", "/events"],
  ["☀️", "Weather", "/weather"],
  ["🏪", "Local Business", "/business"],
];

const highlights = [
  { tag: "ODISHA", title: "One place for the stories and information that matter locally.", text: "OdiaDesk organizes news and useful information around districts, towns and everyday local needs — not just statewide headlines." },
  { tag: "DISTRICTS", title: "Choose your district and get a local desk.", text: "Each of Odisha’s 30 districts has its own desk for news, alerts, jobs, events, public issues and useful updates." },
  { tag: "TRUST", title: "Useful first. Verified always.", text: "Stories are published after editorial review, with source links so readers can check the original information." },
];

export default async function Home() {
  const articles = process.env.DATABASE_URL
    ? await prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 4,
        include: { district: true },
      })
    : [];

  return (
    <main>
      <div className="topline"><div className="container topinner"><span>ଆପଣଙ୍କ ଓଡ଼ିଶା • ଆପଣଙ୍କ ଲୋକାଲ୍ ଡେସ୍କ</span><span>Independent local information platform</span></div></div>
      <header className="header"><div className="container nav">
        <Link href="/" className="brand"><span className="brandmark">O</span><span><strong>Odia</strong>Desk<small>Your Odisha. Your Local Desk.</small></span></Link>
        <nav className="navlinks">{["News", "Jobs", "Events", "Business"].map((x) => <Link key={x} href={"/" + x.toLowerCase()}>{x}</Link>)}<Link href="/search">Search</Link></nav>
        <Link href="/districts" className="districtButton">📍 Select District</Link>
      </div></header>

      <section className="hero"><div className="container heroGrid">
        <div>
          <div className="eyebrow">ODIA DESK • ODISHA</div>
          <h1>What’s happening <span>near you?</span></h1>
          <p className="heroText">Local news, public updates, jobs, events and useful information — organised around the places you actually live.</p>
          <DistrictSearch />
          <div className="heroActions"><Link href="/districts" className="primary">Explore a District →</Link><Link href="/news" className="secondary">Browse latest</Link></div>
          <div className="trustRow"><span>✓ District-first</span><span>✓ Mobile-first</span><span>✓ Built for Odisha</span></div>
        </div>
        <div className="heroCard"><div className="heroCardTop"><span>LOCAL DESK</span><b>30 districts</b></div><div className="odishaMap">ଓଡ଼ିଶା</div><div className="mapCaption">A local desk for every district</div><div className="districtMini">{districts.slice(0, 6).map((d) => <Link href={"/district/" + d.slug} key={d.slug}>{d.name}</Link>)}</div></div>
      </div></section>

      {articles.length > 0 && <section className="section"><div className="container">
        <div className="sectionHead"><div><span className="eyebrow">JUST PUBLISHED</span><h2>Latest from Odisha.</h2></div><Link href="/news" className="textLink">See all →</Link></div>
        <div className="storyGrid">{articles.map((a) => <Link className="storyCard" href={"/news/" + a.slug} key={a.id}><span className="eyebrow">{a.category} · {a.district?.name || "Odisha"}</span><h2>{a.title}</h2><p>{cleanHtmlText(a.excerpt)}</p><small>{a.sourceName} · {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-IN") : "Recently"}</small></Link>)}</div>
      </div></section>}

      <section className="section"><div className="container">
        <div className="sectionHead"><div><span className="eyebrow">EXPLORE</span><h2>Everything local, in one place.</h2></div><Link href="/news" className="textLink">See all →</Link></div>
        <div className="categoryGrid">{categories.map(([icon, name, href]) => <Link className="categoryCard" href={href} key={href}><span>{icon}</span><div><strong>{name}</strong><small>Explore local updates</small></div><b>→</b></Link>)}</div>
      </div></section>

      <section className="section soft"><div className="container">
        <div className="sectionHead"><div><span className="eyebrow">WHY ODIADESK</span><h2>Built differently from a breaking-news feed.</h2></div></div>
        <div className="highlightGrid">{highlights.map((h, i) => <article className="highlight" key={h.tag}><span className="number">0{i + 1}</span><small>{h.tag}</small><h3>{h.title}</h3><p>{h.text}</p></article>)}</div>
      </div></section>

      <section className="section"><div className="container districtSection">
        <div className="sectionHead"><div><span className="eyebrow">YOUR DISTRICT</span><h2>Start with your place.</h2></div><Link href="/districts" className="textLink">View all 30 →</Link></div>
        <div className="districtGrid">{districts.map((d) => <Link href={"/district/" + d.slug} key={d.slug}>{d.name}<span>→</span></Link>)}</div>
      </div></section>

      <section className="cta"><div className="container ctaInner"><div><span className="eyebrow">ODIADESK</span><h2>Your Odisha. Your Local Desk.</h2><p>Discover the stories and updates that matter close to home.</p></div><Link href="/about" className="primary light">How it works →</Link></div></section>

      <footer className="footer"><div className="container footerGrid"><div><Link href="/" className="footerBrand">OdiaDesk</Link><p>Local information for Odisha, organised around people and places.</p></div><div><strong>Explore</strong><Link href="/news">News</Link><Link href="/jobs">Jobs</Link><Link href="/events">Events</Link></div><div><strong>About</strong><Link href="/about">About us</Link><Link href="/editorial-policy">Editorial policy</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div><div className="container copyright">© 2026 OdiaDesk. Built for Odisha.</div></footer>
    </main>
  );
}
