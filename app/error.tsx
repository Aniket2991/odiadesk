"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <section className="pageHero">
        <div className="container">
          <span className="eyebrow">ODIADESK • TEMPORARY ERROR</span>
          <h1>Something went wrong.</h1>
          <p>We couldn’t load this page right now. Try again, or return to the OdiaDesk homepage.</p>
          <div className="heroActions">
            <button className="primary" onClick={() => reset()}>Try again</button>
            <Link href="/" className="secondary">Go home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
