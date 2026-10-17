import { createHash } from "node:crypto";

/**
 * Nano Banana (Gemini 2.5 Flash Image) editorial illustration generation.
 * Stores generated assets in a public Supabase Storage bucket using its REST API.
 * Requires GEMINI_API_KEY, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY.
 * Returns null on failure so image generation never blocks editorial drafts.
 */
export async function generateEditorialImage(title: string, excerpt = ""): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "odiadesk-images";
  if (!geminiKey || !supabaseUrl || !supabaseKey || !/^[a-z0-9][a-z0-9-]*$/.test(bucket)) return null;

  const prompt = [
    "Create a polished editorial illustration for an Odisha, India local-news website.",
    "Wide landscape composition, clear focal point, professional news-magazine art direction.",
    "No text, lettering, logos, or watermarks. Do not depict a real identifiable person or imply this is documentary photography.",
    "Represent the topic symbolically and respectfully; avoid sensationalism.",
    "Headline: " + title.slice(0, 240),
    "Context: " + excerpt.slice(0, 500)
  ].join("\n");

  try {
    const generated = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=" + encodeURIComponent(geminiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
        }),
        signal: AbortSignal.timeout(40000)
      }
    );
    if (!generated.ok) return null;

    const payload = await generated.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>
    };
    const imagePart = payload.candidates?.[0]?.content?.parts?.find(part => part.inlineData?.data);
    const base64 = imagePart?.inlineData?.data;
    const mimeType = imagePart?.inlineData?.mimeType || "image/png";
    if (!base64 || !/^image\/(png|jpeg|webp)$/.test(mimeType)) return null;

    // Create the public bucket on first use. A conflict means it already exists.
    const bucketResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: bucket, name: bucket, public: true, file_size_limit: 10485760, allowed_mime_types: ["image/png", "image/jpeg", "image/webp"] }),
      signal: AbortSignal.timeout(10000)
    });
    if (!bucketResponse.ok && bucketResponse.status !== 409) {
      const details = await bucketResponse.text().catch(() => "");
      if (!/already exists|duplicate/i.test(details)) return null;
    }

    const extension = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";
    const digest = createHash("sha256").update(title + ":" + Date.now() + ":" + Math.random()).digest("hex").slice(0, 32);
    const objectPath = `editorial/${digest}.${extension}`;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
    const uploaded = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "x-upsert": "false"
      },
      body: Buffer.from(base64, "base64"),
      signal: AbortSignal.timeout(20000)
    });
    if (!uploaded.ok) return null;

    return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
  } catch {
    return null;
  }
}
