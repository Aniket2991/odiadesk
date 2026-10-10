import CategoryPage from "@/app/components/CategoryPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Odisha Events — OdiaDesk", description: "Verified events and community updates across Odisha." };

export default function Events() {
  return <CategoryPage eyebrow="LOCAL CALENDAR" heading="Events across" accent="Odisha" description="Community activities, festivals, exhibitions and public events published after source review." categories={["Events"]} />;
}
