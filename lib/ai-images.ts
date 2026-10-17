import { createHash, createHmac } from "node:crypto";

/**
 * Optional AI editorial illustration generation.
 * Requires OPENAI_API_KEY plus Cloudinary credentials so generated files persist
 * across serverless invocations. Returns null on any failure (safe fallback).
 */
export async function generateEditorialImage(title: string, excerpt = ""): Promise<string | null> {
  const openAiKey = process.env.OPENAI_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!openAiKey || !cloudName || !apiKey || !apiSecret) return null;

  const prompt = [
    "Create a polished, high-quality editorial illustration for an Odisha, India local-news website.",
    "Wide 16:9 composition, clear focal point, tasteful realistic digital illustration, professional news-magazine art direction.",
    "No text, no lettering, no logos, no watermarks. Do not depict a real identifiable person or imply a generated scene is documentary photography.",
    "Represent the topic symbolically and respectfully; avoid sensationalism.",
    "Headline: " + title.slice(0, 240),
    "Context: " + excerpt.slice(0, 500)
  ].join("\n");

  try {
    const generated = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1536x1024", quality: "medium", output_format: "jpeg" }),
      signal: AbortSignal.timeout(12000)
    });
    if (!generated.ok) return null;
    const payload = await generated.json() as { data?: Array<{ b64_json?: string }> };
    const base64 = payload.data?.[0]?.b64_json;
    if (!base64) return null;

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const publicId = "odiadesk/" + createHash("sha256").update(title + ":" + timestamp).digest("hex").slice(0, 28);
    const signatureBase = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = createHash("sha1").update(signatureBase + apiSecret).digest("hex");
    const form = new FormData();
    form.set("file", `data:image/jpeg;base64,${base64}`);
    form.set("api_key", apiKey);
    form.set("timestamp", timestamp);
    form.set("public_id", publicId);
    form.set("signature", signature);

    const uploaded = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: "POST", body: form, signal: AbortSignal.timeout(45000)
    });
    if (!uploaded.ok) return null;
    const result = await uploaded.json() as { secure_url?: string };
    return typeof result.secure_url === "string" ? result.secure_url : null;
  } catch {
    return null;
  }
}
