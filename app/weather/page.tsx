import CategoryPage from "@/app/components/CategoryPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Odisha Weather Updates — OdiaDesk", description: "Weather-related news and official warnings for Odisha districts." };

export default function Weather() {
  return <CategoryPage eyebrow="ODIA DESK • WEATHER" heading="Odisha" accent="Weather Updates" description="Weather-related reports and published warnings. This desk shows verified stories, not live forecasts." categories={["Weather"]} />;
}
