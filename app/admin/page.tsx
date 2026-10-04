import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isValidAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import AdminClient from "./AdminClient";

export const metadata={title:"Admin — OdiaDesk"};

export default async function Admin(){
  const jar=await cookies();
  if(!isValidAdminToken(jar.get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
  return <main><header className="header"><div className="container nav"><Link href="/" className="brand"><span className="brandmark">O</span><span><strong>Odia</strong>Desk<small>Editorial workspace</small></span></Link><Link href="/news" className="textLink">← Public news</Link></div></header><section className="pageHero"><div className="container"><span className="eyebrow">EDITORIAL</span><h1>OdiaDesk <span>Admin</span></h1><p>Verified-source publishing desk. Draft, review, publish and archive stories without exposing the database to visitors.</p></div></section><section className="section"><div className="container"><AdminClient /></div></section></main>;
}