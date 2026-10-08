"use client";

import { FormEvent, useEffect, useState } from "react";
import { districts } from "@/lib/districts";

type Article={
  id:string; title:string; excerpt:string; content:string; status:string; category:string;
  sourceName:string; sourceUrl:string; imageUrl?:string|null; language:string; districtId?:string|null;
  district?:{name:string}|null; createdAt:string
};
const categories=["Odisha","Districts","Politics","Crime","Business","Education","Jobs","Sports","Technology","Health","Culture","Alerts","Events","Traffic","Transport","Weather","Public Issues"];

const emptyForm={title:"",excerpt:"",content:"",category:"Districts",sourceName:"",sourceUrl:"",imageUrl:"",districtSlug:"",language:"ENGLISH",status:"DRAFT"};

export default function AdminClient() {
  const [articles,setArticles]=useState<Article[]>([]);
  const [message,setMessage]=useState("");
  const [importMessage,setImportMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [importBusy,setImportBusy]=useState(false);
  const [collectBusy,setCollectBusy]=useState(false);
  const [collectMessage,setCollectMessage]=useState("");
  const [aiBusy,setAiBusy]=useState(false);
  const [aiMessage,setAiMessage]=useState("");
  const [sourceUrl,setSourceUrl]=useState("");
  const [editing,setEditing]=useState<Article|null>(null);
  const [form,setForm]=useState(emptyForm);
  const [review,setReview]=useState({source:false,facts:false,district:false,image:false,original:false});
  const reviewReady=Object.values(review).every(Boolean);
  const counts={all:articles.length,draft:articles.filter(a=>a.status==="DRAFT").length,review:articles.filter(a=>a.status==="REVIEW").length,published:articles.filter(a=>a.status==="PUBLISHED").length,archived:articles.filter(a=>a.status==="ARCHIVED").length};
  const [queueFilter,setQueueFilter]=useState("ALL");
  const [queueCategory,setQueueCategory]=useState("ALL");
  const [queueDistrict,setQueueDistrict]=useState("ALL");
  const filteredArticles=articles.filter(a=>(queueFilter==="ALL"||a.status===queueFilter)&&(queueCategory==="ALL"||a.category===queueCategory)&&(queueDistrict==="ALL"||(a.district?.name||"All Odisha")===queueDistrict));

  async function load(){
    const r=await fetch("/api/admin/articles");
    if(r.ok){const d=await r.json();setArticles(d.articles)}
  }
  useEffect(()=>{load()},[]);

  function set(k:string,v:string){setForm(x=>({...x,[k]:v}))}

  function startEdit(a:Article){
    const districtSlug=districts.find(d=>d.name===a.district?.name)?.slug || "";
    setEditing(a);
    setMessage("");
    setReview({source:false,facts:false,district:false,image:false,original:false});
    setForm({
      title:a.title, excerpt:a.excerpt, content:a.content, category:a.category,
      sourceName:a.sourceName, sourceUrl:a.sourceUrl, imageUrl:a.imageUrl||"", districtSlug,
      language:a.language, status:a.status==="ARCHIVED"?"DRAFT":a.status
    });
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function cancelEdit(){setEditing(null);setForm(emptyForm);setMessage("");setReview({source:false,facts:false,district:false,image:false,original:false})}

  async function aiAssist(){
    setAiBusy(true);setAiMessage("");
    const r=await fetch("/api/admin/ai-editor",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});
    const d=await r.json();
    if(!r.ok)setAiMessage(d.error||"AI editorial assist failed.");
    else {setForm(x=>({...x,title:d.result.headline,excerpt:d.result.excerpt,content:d.result.content,language:d.result.language}));setAiMessage("AI draft prepared. Verify every fact and source before saving or publishing.");}
    setAiBusy(false);
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    if(editing&&form.status==="PUBLISHED"&&!reviewReady){setMessage("Complete every editorial review check before publishing.");return;}
    setBusy(true);setMessage("");
    const method=editing?"PATCH":"POST";
    const payload=editing?{id:editing.id,...form,reviewConfirmed:form.status==="PUBLISHED"&&reviewReady}:form;
    const r=await fetch("/api/admin/articles",{method,headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
    const d=await r.json();
    if(!r.ok)setMessage(d.error||"Could not save article.");
    else {
      setMessage(editing?"Changes saved.":"Article saved.");
      setEditing(null);setForm(emptyForm);load();
    }
    setBusy(false);
  }

  async function collectSources(){
    setCollectBusy(true);setCollectMessage("");
    const r=await fetch("/api/admin/collect",{method:"POST"});
    const d=await r.json();
    if(!r.ok)setCollectMessage(d.error||"Could not collect sources.");
    else {setCollectMessage(`Collected ${d.created?.length||0} new drafts.`);load();}
    setCollectBusy(false);
  }

  async function importDraft(e:FormEvent){
    e.preventDefault();setImportBusy(true);setImportMessage("");
    const r=await fetch("/api/admin/ingest",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sourceUrl})});
    const d=await r.json();
    if(!r.ok)setImportMessage(d.error||"Could not import source.");
    else {
      setImportMessage("Draft created. Open Edit below to verify, rewrite and publish.");
      setSourceUrl("");load();
    }
    setImportBusy(false);
  }

  async function changeStatus(id:string,status:string){
    const r=await fetch("/api/admin/articles",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,status})});
    if(r.ok) load();
  }

  async function logout(){await fetch("/api/admin/logout",{method:"POST"});location.href="/admin/login"}

  return <div className="adminWorkspace">
    <div className="adminToolbar">
      <strong>Editorial desk</strong>
      <button className="secondary" onClick={logout}>Log out</button>
    </div>

    <div className="adminEditorGrid">
      <div>
        <div className="adminForm" style={{marginBottom:24}}>
          <div className="formHeader">
            <span className="eyebrow">SOURCE IMPORT</span>
            <h2>Create a review draft</h2>
            <p>Import headline/description metadata only. The full source article is never copied.</p>
          </div>
          <form onSubmit={importDraft}>
            <label>Source URL<input type="url" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://…" required /></label>
            {importMessage&&<p className="formMessage">{importMessage}</p>}
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button className="secondary" disabled={importBusy}>{importBusy?"Importing…":"Import as draft"}</button>
              <button type="button" className="secondary" disabled={collectBusy} onClick={collectSources}>{collectBusy?"Collecting…":"Collect latest sources"}</button>
            </div>
            {collectMessage&&<p className="formMessage">{collectMessage}</p>}
          </form>
        </div>

        <form className="adminForm" onSubmit={submit}>
          <div className="formHeader">
            <span className="eyebrow">{editing?"EDIT STORY":"NEW STORY"}</span>
            <h2>{editing?"Edit article":"Create article"}</h2>
            {editing&&<p>Rewrite and verify the source-assisted draft before publishing.</p>}
          </div>

          <label>Headline<input value={form.title} onChange={e=>set("title",e.target.value)} required /></label>
          <label>Excerpt<textarea value={form.excerpt} onChange={e=>set("excerpt",e.target.value)} required /></label>
          <label>Story content<textarea className="largeInput" value={form.content} onChange={e=>set("content",e.target.value)} required /></label>
          {editing&&<div style={{margin:"8px 0 16px",padding:16,border:"1px solid rgba(23,60,45,.14)",borderRadius:16,background:"rgba(23,60,45,.035)"}}>
            <div style={{fontWeight:800,marginBottom:8}}>Editorial review checklist</div>
            <div style={{display:"grid",gap:8}}>
              {([
                ["source","Source is opened and verified"],
                ["facts","Names, dates, numbers and claims are fact-checked"],
                ["district","District/category are correct"],
                ["image","Image rights/source are verified or image is removed"],
                ["original","Copy is original and not copied from the source"]
              ] as [keyof typeof review,string][]).map(([key,label])=><label key={key} style={{display:"flex",gap:8,alignItems:"flex-start",fontWeight:500}}>
                <input type="checkbox" checked={review[key]} onChange={e=>setReview(x=>({...x,[key]:e.target.checked}))} style={{marginTop:4}} />{label}
              </label>)}
            </div>
            <p style={{margin:"10px 0 0",fontSize:13,opacity:.7}}>{reviewReady?"✓ Ready to publish":"Complete all checks before publishing."}</p>
          </div>}
          {editing&&<div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",margin:"8px 0 16px"}}>
            <button type="button" className="secondary" disabled={aiBusy} onClick={aiAssist}>{aiBusy?"Preparing…":"✨ AI editorial assist"}</button>
            {aiMessage&&<span className="formMessage">{aiMessage}</span>}
          </div>}

          <div className="formTwo">
            <label>Category<select value={form.category} onChange={e=>set("category",e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>District<select value={form.districtSlug} onChange={e=>set("districtSlug",e.target.value)}><option value="">All Odisha</option>{districts.map(d=><option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label>
          </div>

          <div className="formTwo">
            <label>Source name<input value={form.sourceName} onChange={e=>set("sourceName",e.target.value)} required /></label>
            <label>Source URL<input type="url" value={form.sourceUrl} onChange={e=>set("sourceUrl",e.target.value)} placeholder="https://…" required /></label>
          </div>

          <label>Article image URL <span style={{fontWeight:400,opacity:.65}}>(optional)</span><input type="url" value={form.imageUrl} onChange={e=>set("imageUrl",e.target.value)} placeholder="https://…/image.jpg" /></label>

          <div className="formTwo">
            <label>Language<select value={form.language} onChange={e=>set("language",e.target.value)}><option value="ENGLISH">English</option><option value="ODIA">Odia</option></select></label>
            <label>Save as<select value={form.status} onChange={e=>set("status",e.target.value)}><option>DRAFT</option><option>REVIEW</option></select></label>
          </div>

          {message&&<p className="formMessage">{message}</p>}
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="primary" disabled={busy||Boolean(editing&&form.status==="PUBLISHED"&&!reviewReady)}>{busy?(editing?"Saving…":"Creating…"):(editing&&form.status==="PUBLISHED"?"Approve & Publish":editing?"Save changes":"Save article")}</button>
            {editing&&<button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div>
        <div className="formHeader"><span className="eyebrow">CONTENT QUEUE</span><h2>Editorial overview</h2></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:8,marginBottom:16}}>
          {([["ALL","All",counts.all],["DRAFT","Drafts",counts.draft],["REVIEW","Review",counts.review],["PUBLISHED","Published",counts.published],["ARCHIVED","Archived",counts.archived]] as [string,string,number][]).map(([key,label,count])=><button type="button" key={key} className={queueFilter===key?"primary":"secondary"} onClick={()=>setQueueFilter(key)} style={{padding:"10px 8px"}}><strong>{count}</strong><small style={{display:"block"}}>{label}</small></button>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <select value={queueCategory} onChange={e=>setQueueCategory(e.target.value)}><option value="ALL">All categories</option>{categories.map(x=><option key={x} value={x}>{x}</option>)}</select>
          <select value={queueDistrict} onChange={e=>setQueueDistrict(e.target.value)}><option value="ALL">All districts</option>{districts.map(d=><option key={d.name} value={d.name}>{d.name}</option>)}</select>
        </div>
        <div className="articleQueue">
          {filteredArticles.map(a=><div className="queueItem" key={a.id}>
            <div>
              <strong>{a.title}</strong>
              <small>{a.category} · {a.district?.name||"All Odisha"} · {a.status}</small>
            </div>
            <div className="queueActions">
              <button onClick={()=>startEdit(a)}>Edit</button>
              {a.status!=="PUBLISHED"&&<button onClick={()=>startEdit(a)}>Review</button>}
              {a.status==="PUBLISHED"&&<button onClick={()=>changeStatus(a.id,"ARCHIVED")}>Archive</button>}
            </div>
          </div>)}
          {!articles.length&&<div className="notice"><strong>No stories yet.</strong><p>Create the first verified story above.</p></div>}{articles.length>0&&!filteredArticles.length&&<div className="notice"><strong>No matching stories.</strong><p>Try another status, category or district filter.</p></div>}
        </div>
      </div>
    </div>
  </div>;
}
