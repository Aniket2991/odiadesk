import CategoryPage from "@/app/components/CategoryPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Odisha Jobs — OdiaDesk", description: "Verified recruitment notices and job updates across Odisha." };

export default function Jobs() {
  return <CategoryPage eyebrow="CAREER DESK" heading="Odisha" accent="Jobs" description="Recruitment notices, apprenticeships and local opportunities. Check each story's original source and deadline before applying." categories={["Jobs"]} />;
}
