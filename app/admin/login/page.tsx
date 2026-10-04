"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({key}) });
    if (res.ok) router.replace("/admin");
    else setError("Invalid admin key.");
    setBusy(false);
  }

  return <main>
    <header className="header"><div className="container nav"><Link href="/" className="brand"><span className="brandmark">O</span><span><strong>Odia</strong>Desk<small>Editorial workspace</small></span></Link><Link href="/" className="textLink">← Public site</Link></div></header>
    <section className="pageHero"><div className="container"><span className="eyebrow">SECURE EDITORIAL ACCESS</span><h1>Admin <span>Login</span></h1><p>Use the private editorial key configured for OdiaDesk.</p></div></section>
    <section className="section"><div className="container"><form className="adminForm loginForm" onSubmit={submit}>
      <label>Admin key<input type="password" value={key} onChange={e=>setKey(e.target.value)} autoComplete="current-password" required /></label>
      {error && <p className="formError">{error}</p>}
      <button className="primary" disabled={busy}>{busy ? "Checking…" : "Enter editorial desk"}</button>
      <small className="muted">The key is never stored in the browser. Access uses an HttpOnly session cookie.</small>
    </form></div></section>
  </main>;
}
