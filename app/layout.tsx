import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://odiadesk.com"),
  title: { default: "OdiaDesk — Your Odisha. Your Local Desk.", template: "%s | OdiaDesk" },
  description: "OdiaDesk brings Odisha's local news, district updates, alerts, jobs, education, events and useful local information together.",
  keywords: ["Odisha news", "Odia news", "local Odisha", "district news Odisha", "Odisha jobs", "Odisha events", "OdiaDesk"],
  alternates: { canonical: "https://odiadesk.com", types: { "application/rss+xml": "https://odiadesk.com/rss.xml" } },
  openGraph: {
    title: "OdiaDesk — Your Odisha. Your Local Desk.",
    description: "Local news and useful information for every corner of Odisha.",
    url: "https://odiadesk.com",
    siteName: "OdiaDesk",
    locale: "en_IN",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  manifest: "/manifest.webmanifest",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "OdiaDesk",
  url: "https://odiadesk.com",
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
