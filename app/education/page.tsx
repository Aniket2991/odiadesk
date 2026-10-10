import CategoryPage from "@/app/components/CategoryPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Education — OdiaDesk", description: "Verified education notices, exams and opportunities across Odisha." };

export default function Education() {
  return <CategoryPage eyebrow="ODIA DESK • EDUCATION" heading="Education" accent="Updates" description="Exam notices, admissions, scholarships and school or college updates with links to original sources." categories={["Education"]} />;
}
