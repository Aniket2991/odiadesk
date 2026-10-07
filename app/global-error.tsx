"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#152018" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 620, textAlign: "center" }}>
            <div style={{ display: "inline-grid", placeItems: "center", width: 52, height: 52, borderRadius: 14, background: "#e25d2d", color: "#fff", fontWeight: 900, fontSize: 24 }}>O</div>
            <p style={{ marginTop: 24, fontSize: 11, letterSpacing: 2, fontWeight: 800, color: "#e25d2d" }}>ODIADESK • SYSTEM ERROR</p>
            <h1 style={{ fontSize: "clamp(36px, 7vw, 64px)", lineHeight: 1, letterSpacing: -3, margin: "14px 0" }}>We’re fixing this.</h1>
            <p style={{ color: "#68746d", lineHeight: 1.7 }}>OdiaDesk encountered an unexpected problem. Please try again.</p>
            <button onClick={() => reset()} style={{ marginTop: 18, border: 0, borderRadius: 9, padding: "14px 20px", background: "#173c2d", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
