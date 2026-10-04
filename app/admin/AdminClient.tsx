"use client";

import { FormEvent, useEffect, useState } from "react";
import { districts } from "@/lib/districts";

type Article={id:string;title:string;status:string;category:string;district?:{name:string}|null;createdAt:string};
const categories=["Odisha","Districts","Politics","Crime","Business","Education","Jobs","Sports","Technology","Health","Culture","Alerts","Events","Traffic","Transport","Weather","Public Issues"];

export default function AdminClient() {
  const [articles,setArticles]=useState<Article[]>([]);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [form,setForm]=useState({title:"",excerpt:"",content:"",category:"Districts",sourceName:"",sourceUrl:"",districtSlug:"",language:"ENGLISH",status:"DRAFT"});

  async function load(){const r=await fetch("/api/admin/articles");if(r.ok){const d=await r.json();setArticles(d.articles)}}
  useEffect(()=>{load()},[]);

  function set(k:string,v:string){setForm(x=>({...x,[k]:v}))}
  async function submit(e:FormEvent){
    e.preventDefault();setBusy(true);setMessage("");
    const r=await fetch("/api/admin/articles",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});
    const d=await r.json();
    if(!r.ok)setMessage(d.error||"Could not create article."); else {setMessage("Article saved.");setForm({...form,title:"",excerpt:"",content:"",sourceName:"",sourceUrl:"",districtSlug:"",status:"DRAFT"});load();}
    setBusy(false);
  }
  async function changeStatus(id:string,status:string){
    const r=await fetch("/api/admin/articles",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,status})});
    if(r.ok) load();
  }
  async function logout(){await fetch("/api/admin/logout",{method:"POST"});location.href="/admin/login"}

  return <div className="adminWorkspace">
    <div className="adminToolbar"><strong>Editorial desk</strong><button className="secondary" onClick={logout}>Log out</button></div>
    <div className="adminEditorGrid">
      <form className="adminForm" onSubmit={submit}>
        <div className="formHeader"><span className="eyebrow">NEW STORY</span><h2>Create article</h2></div>
        <label>Headline<input value={form.title} onChange={e=>set("title",e.target.value)} required /></label>
        <label>Excerpt<textarea value={form.excerpt} onChange={e=>set("excerpt",e.target.value)} required /></label>
        <label>Story content<textarea className="largeInput" value={form.content} onChange={e=>set("content",e.target.value)} required /></label>
        <div className="formTwo"><label>Category<select value={form.category} onChange={e=>set("category",e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label><label>District<select value={form.districtSlug} onChange={e=>set("districtSlug",e.target.value)}><option value="">All Odisha</option>{districts.map(d=><option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label></div>
        <div className="formTwo"><label>Source name<input value={form.sourceName} onChange={e=>set("sourceName",e.target.value)} required /></label><label>Source URL<input type="url" value={form.sourceUrl} onChange={e=>set("sourceUrl",e.target.value)} placeholder="https://…" required /></label></div>
        <div className="formTwo"><label>Language<select value={form.language} onChange={e=>set("language",e.target.value)}><option value="ENGLISH">English</option><option value="ODIA">Odia</option></select></label><label>Save as<select value={form.status} onChange={e=>set("status",e.target.value)}><option>DRAFT</option><option>REVIEW</option><option>PUBLISHED</option></select></label></div>
        {message&&<p className="formMessage">{message}</p>}<button className="primary" disabled={busy}>{busy?"Saving…":"Save article"}</button>
      </form>
      <div><div className="formHeader"><span className="eyebrow">CONTENT QUEUE</span><h2>Recent stories</h2></div><div className="articleQueue">{articles.map(a=><div className="queueItem" key={a.id}><div><strong>{a.title}</strong><small>{a.category} · {a.district?.name||"All Odisha"} · {a.status}</small></div><div className="queueActions">{a.status!=="PUBLISHED"&&<button onClick={()=>changeStatus(a.id,"PUBLISHED")}>Publish</button>}{a.status==="PUBLISHED"&&<button onClick={()=>changeStatus(a.id,"ARCHIVED")}>Archive</button>}</div></div>)}{!articles.length&&<div className="notice"><strong>No stories yet.</strong><p>Create the first verified story above.</p></div>}</div></div>
    </div>
  </div>;
}
