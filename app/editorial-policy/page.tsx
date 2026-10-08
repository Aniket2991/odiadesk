import Link from "next/link";

export const metadata = {
  title: "Editorial Policy",
  description: "OdiaDesk standards for sourcing, verification, corrections, AI assistance and sponsored content.",
};

export default function EditorialPolicy() {
  return (
    <main>
      <header className="header"><div className="container nav">
        <Link href="/" className="brand"><span className="brandmark">O</span><span><strong>Odia</strong>Desk<small>Your Odisha. Your Local Desk.</small></span></Link>
        <Link href="/" className="textLink">← Home</Link>
      </div></header>
      <section className="pageHero"><div className="container">
        <span className="eyebrow">EDITORIAL STANDARDS</span>
        <h1>How we <span>publish.</span></h1>
        <p>OdiaDesk is built around useful local information, clear sourcing and responsible editorial review.</p>
      </div></section>
      <section className="section"><div className="container prose">
        <h2>Verification before publication</h2>
        <p>Stories are reviewed before publication. Editors should verify the original source, names, dates, numbers and important claims. Time-sensitive information should be checked against the relevant official source where appropriate.</p>
        <h2>Original reporting and source use</h2>
        <p>Source links are provided for transparency. OdiaDesk does not treat a source headline, article or RSS feed as permission to republish someone else’s work. Published copy should be original and appropriately sourced.</p>
        <h2>AI-assisted editing</h2>
        <p>AI tools may assist with summarisation, translation, headlines, categorisation and SEO drafts. AI output is not a source of truth. Human editorial review is required before publication.</p>
        <h2>Corrections</h2>
        <p>If a published story contains an important factual error, the editorial team should correct it promptly and, where appropriate, make the correction clear to readers.</p>
        <h2>Sponsored and commercial content</h2>
        <p>Advertising, sponsored material and commercial listings should be distinguishable from independent editorial coverage. Commercial relationships should not determine factual reporting.</p>
        <h2>Community information</h2>
        <p>Community-submitted information may be useful, but it should be verified before being presented as established fact. Unverified claims should not be presented as confirmed news.</p>
      </div></section>
    </main>
  );
}
