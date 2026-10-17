import { createHash } from "node:crypto";

/**
 * Nano Banana (Gemini 2.5 Flash Image) editorial illustration generation.
 * Requires GEMINI_API_KEY and Cloudinary credentials for persistent storage.
 * Returns null on failure so image generation never blocks editorial drafts.
 */
export async function generateEditorialImage(title: string, excerpt = ""): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!geminiKey || !cloudName || !cloudApiKey || !cloudApiSecret) return null;

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
    const mimeType = imagePart?.inlineData?.mimeType || "image/jpeg";
    if (!base64) return null;

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const publicId = "odiadesk/" + createHash("sha256").update(title + ":" + timestamp).digest("hex").slice(0, 28);
    const signatureBase = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = createHash("sha1").update(signatureBase + cloudApiSecret).digest("hex");
    const form = new FormData();
    form.set("file", `data:${mimeType};base64,${base64}`);
    form.set("api_key", cloudApiKey);
    form.set("timestamp", timestamp);
    form.set("public_id", publicId);
    form.set("signature", signature);

    const uploaded = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: "POST", body: form, signal: AbortSignal.timeout(12000)
    });
    if (!uploaded.ok) return null;
    const result = await uploaded.json() as { secure_url?: string };
    return typeof result.secure_url === "string" ? result.secure_url : null;
  } catch {
    return null;
  }
}
