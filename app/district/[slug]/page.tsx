import { notFound } from "next/navigation";
import Link from "next/link";
import { districts } from "@/lib/districts";

export function generateStaticParams(){return districts.map(d=>({slug:d.slug}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const district=districts.find(d=>d.slug===slug);
  return district ? {title:district.name+" Local Desk",description:"Local news, alerts, jobs, events and useful information for "+district.name+", Odisha."} : {};
}

export default async function DistrictPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const district=districts.find(d=>d.slug===slug); if(!district) notFound();
  const modules=[["📰","Latest News","Stories from "+district.name+" and nearby towns."],["🚨","Local Alerts","Important public updates and alerts."],["💼","Jobs","Local opportunities and recruitment updates."],["🎓","Education","Schools, colleges, exams and education notices."],["🏛️","Government","Official notices, schemes and public services."],["🎉","Events","What’s happening around "+district.name+"."],["🚍","Transport","Road, rail and local mobility updates."],["🏪","Business","Useful local businesses and services."]];
  return <main><header className="header"><div className="container nav"><Link href="/" className="brand"><span className="brandmark">O</span><span><strong>Odia</strong>Desk<small>Your Odisha. Your Local Desk.</small></span></Link><Link href="/" className="textLink">← Home</Link></div></header>
    <section className="districtHero"><div className="container"><span className="eyebrow">{district.region.toUpperCase()} ODISHA • LOCAL DESK</span><h1>{district.name}<span> Desk</span></h1><p>One place for the local information that matters to people in {district.name}.</p><div className="districtPills"><span>📍 {district.name}, Odisha</span><span>30-district network</span></div></div></section>
    <section className="section"><div className="container"><div className="sectionHead"><div><span className="eyebrow">EXPLORE {district.name.toUpperCase()}</span><h2>Local information, organised.</h2></div></div><div className="categoryGrid">{modules.map(([icon,name,text])=><div className="categoryCard" key={name}><span>{icon}</span><div><strong>{name}</strong><small>{text}</small></div><b>→</b></div>)}</div><div className="notice"><strong>Launching the local desk</strong><p>Live reporting, verified updates and official-source integrations will be added here. We will never present placeholder content as real news.</p></div></div></section>
  </main>;
}