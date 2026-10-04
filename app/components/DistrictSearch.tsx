"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { districts } from "@/lib/districts";

export default function DistrictSearch(){
 const [q,setQ]=useState("");
 const results=useMemo(()=>districts.filter(d=>d.name.toLowerCase().includes(q.toLowerCase())).slice(0,8),[q]);
 return <div className="searchBox"><div className="searchInput"><span>⌕</span><input aria-label="Search districts" placeholder="Search your district..." value={q} onChange={e=>setQ(e.target.value)}/></div>{q&&<div className="searchResults">{results.length?results.map(d=><Link key={d.slug} href={"/district/"+d.slug}>{d.name}<span>→</span></Link>):<span className="noResult">No district found</span>}</div>}</div>;
}