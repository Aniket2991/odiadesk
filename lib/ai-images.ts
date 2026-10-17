import { createHash } from "node:crypto";

export type EditorialImageResult = { imageUrl: string; error?: never } | { imageUrl: null; error: string };

function safeDetails(value: string, secrets: string[]): string {
  let text = value.replace(/[\r\n\t]+/g, " ").slice(0, 280);
  for (const secret of secrets) if (secret) text = text.split(secret).join("[redacted]");
  return text;
}

/** Generate a Nano Banana illustration and persist it in Supabase Storage. */
export async function generateEditorialImageDetailed(title: string, excerpt = ""): Promise<EditorialImageResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const rawSupabaseUrl = process.env.SUPABASE_URL;
  const supabaseUrl = rawSupabaseUrl?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "odiadesk-images";
  const secrets = [geminiKey || "", supabaseKey || ""];
  const missing = [
    !geminiKey && "GEMINI_API_KEY",
    !supabaseUrl && "SUPABASE_URL",
    !supabaseKey && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean);
  if (missing.length) return { imageUrl: null, error: "Missing Production environment variable(s): " + missing.join(", ") + ". Redeploy after setting them." };
  if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(supabaseUrl!) || !/^[a-z0-9][a-z0-9-]*$/.test(bucket)) {
    return { imageUrl: null, error: "Supabase configuration is invalid. Check SUPABASE_URL and SUPABASE_STORAGE_BUCKET." };
  }

  const prompt = [
    "Create a polished editorial illustration for an Odisha, India local-news website.",
    "Wide landscape composition, clear focal point, professional news-magazine art direction.",
    "No text, lettering, logos, or watermarks. Do not depict a real identifiable person or imply this is documentary photography.",
    "Represent the topic symbolically and respectfully; avoid sensationalism.",
    "Headline: " + title.slice(0, 240),
    "Context: " + excerpt.slice(0, 500)
  ].join("\n");

  let base64: string | undefined;
  let mimeType = "image/png";
  try {
    const generated = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=" + encodeURIComponent(geminiKey!),
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
    if (!generated.ok) {
      const details = safeDetails(await generated.text().catch(() => ""), secrets);
      return { imageUrl: null, error: "Gemini API returned HTTP " + generated.status + (details ? ": " + details : ". Check API key, model access, and quota.") };
    }
    const payload = await generated.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>,
      promptFeedback?: { blockReason?: string }
    };
    const imagePart = payload.candidates?.[0]?.content?.parts?.find(part => part.inlineData?.data);
    base64 = imagePart?.inlineData?.data;
    mimeType = imagePart?.inlineData?.mimeType || "image/png";
    if (!base64 || !/^image\/(png|jpeg|webp)$/.test(mimeType)) {
      return { imageUrl: null, error: "Gemini responded but returned no usable image" + (payload.promptFeedback?.blockReason ? " (reason: " + payload.promptFeedback.blockReason + ")" : "") + ". Check model availability and response." };
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown network error";
    return { imageUrl: null, error: "Gemini request failed: " + safeDetails(detail, secrets) };
  }

  try {
    const bucketResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: { Authorization: `Bearer ${supabaseKey}`, apikey: supabaseKey!, "Content-Type": "application/json" },
      body: JSON.stringify({ id: bucket, name: bucket, public: true, file_size_limit: 10485760, allowed_mime_types: ["image/png", "image/jpeg", "image/webp"] }),
      signal: AbortSignal.timeout(10000)
    });
    if (!bucketResponse.ok && bucketResponse.status !== 409) {
      const details = safeDetails(await bucketResponse.text().catch(() => ""), secrets);
      if (!/already exists|duplicate/i.test(details)) {
        return { imageUrl: null, error: "Supabase bucket setup failed (HTTP " + bucketResponse.status + ")" + (details ? ": " + details : "") + ". Check service-role permissions and project URL." };
      }
    }

    const extension = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";
    const digest = createHash("sha256").update(title + ":" + Date.now() + ":" + Math.random()).digest("hex").slice(0, 32);
    const objectPath = `editorial/${digest}.${extension}`;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
    const uploaded = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey!,
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "x-upsert": "false"
      },
      body: Buffer.from(base64!, "base64"),
      signal: AbortSignal.timeout(20000)
    });
    if (!uploaded.ok) {
      const details = safeDetails(await uploaded.text().catch(() => ""), secrets);
      return { imageUrl: null, error: "Supabase image upload failed (HTTP " + uploaded.status + ")" + (details ? ": " + details : "") + ". Check bucket access and storage limits." };
    }

    return { imageUrl: `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}` };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown network error";
    return { imageUrl: null, error: "Supabase storage request failed: " + safeDetails(detail, secrets) };
  }
}

/** Backwards-compatible helper for ingestion flows: failures remain non-blocking. */
export async function generateEditorialImage(title: string, excerpt = ""): Promise<string | null> {
  const result = await generateEditorialImageDetailed(title, excerpt);
  return result.imageUrl;
}
