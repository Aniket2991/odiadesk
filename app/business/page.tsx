import CategoryPage from "@/app/components/CategoryPage";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Local Business — OdiaDesk",
  description: "Local business news and verified business updates across Odisha.",
};

export default function Business() {
  return <CategoryPage eyebrow="ODIA DESK • LOCAL BUSINESS" heading="Local" accent="Business" description="Local business news, industry updates and business opportunities published after source review." categories={["Business"]} />;
}
