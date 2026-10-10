import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://odiadesk.vercel.app"),
  title: { default: "OdiaDesk — Your Odisha. Your Local Desk.", template: "%s | OdiaDesk" },
  description: "OdiaDesk brings Odisha's local news, district updates, alerts, jobs, education, events and useful local information together.",
  keywords: ["Odisha news", "Odia news", "local Odisha", "district news Odisha", "Odisha jobs", "Odisha events", "OdiaDesk"],
  alternates: { canonical: "https://odiadesk.vercel.app", types: { "application/rss+xml": "https://odiadesk.vercel.app/rss.xml" } },
  openGraph: {
    title: "OdiaDesk — Your Odisha. Your Local Desk.",
    description: "Local news and useful information for every corner of Odisha.",
    url: "https://odiadesk.vercel.app",
    siteName: "OdiaDesk",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "OdiaDesk — Your Odisha. Your Local Desk." }],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  manifest: "/manifest.webmanifest",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "OdiaDesk",
  url: "https://odiadesk.vercel.app",
  description: "Local news and useful information for Odisha, organised around districts and communities.",
  areaServed: { "@type": "State", name: "Odisha", addressCountry: "IN" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
