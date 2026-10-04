import Link from "next/link";
import { districts } from "@/lib/districts";

export const metadata = {
  title: "All Odisha Districts — OdiaDesk",
  description: "Choose your Odisha district to open its local desk on OdiaDesk.",
};

export default function DistrictsPage() {
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
          <span className="eyebrow">ODIA DESK • DISTRICTS</span>
          <h1>Choose your <span>district</span></h1>
          <p>Open your local desk for news, alerts, jobs, events and useful information.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="districtGrid">
            {districts.map((district) => (
              <Link href={"/district/" + district.slug} key={district.slug}>
                <strong>{district.name}</strong>
                <span>{district.region} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
