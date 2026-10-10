function decodeCodePoint(value: string, radix: number): string {
  const point = Number.parseInt(value, radix);
  if (!Number.isFinite(point) || point < 0 || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff)) return " ";
  return String.fromCodePoint(point);
}

/** Converts source/feed HTML and encoded markup into readable plain text. */
export function cleanHtmlText(value: string | null | undefined): string {
  let text = String(value ?? "").replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "");
  for (let pass = 0; pass < 2; pass += 1) {
    text = text
      .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => decodeCodePoint(code, 16))
      .replace(/&#([0-9]+);/g, (_match, code: string) => decodeCodePoint(code, 10))
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");
  }
  return text
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
