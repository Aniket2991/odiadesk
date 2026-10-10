import CategoryPage from "@/app/components/CategoryPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Local Alerts — OdiaDesk", description: "Verified public alerts and local updates from Odisha." };

export default function Alerts() {
  return <CategoryPage eyebrow="ODIA DESK • LOCAL ALERTS" heading="Local" accent="Alerts" description="Verified public notices, transport disruptions, weather warnings and important local updates." categories={["Alerts", "Traffic", "Transport", "Weather", "Public Issues"]} />;
}
