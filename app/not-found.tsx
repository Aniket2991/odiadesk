import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section className="pageHero">
        <div className="container">
          <span className="eyebrow">404 • ODIADESK</span>
          <h1>That page isn’t here.</h1>
          <p>The story or page you requested may have moved, been removed, or not been published yet.</p>
          <div className="heroActions">
            <Link href="/" className="primary">Go to homepage →</Link>
            <Link href="/news" className="secondary">Browse latest news</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
