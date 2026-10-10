import CategoryPage from "@/app/components/CategoryPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Government Updates — OdiaDesk", description: "Official government notices, schemes and public-service updates for Odisha." };

export default function Government() {
  return <CategoryPage eyebrow="ODIA DESK • GOVERNMENT" heading="Government" accent="Updates" description="Government notices, schemes and public-service information. Follow the original official source before acting." categories={["Government"]} />;
}
