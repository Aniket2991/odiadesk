import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "odiadesk_admin";

function tokenFor(secret: string) {
  return createHmac("sha256", secret).update("odiadesk-admin-v1").digest("hex");
}

export function createAdminToken() {
  const secret = process.env.ADMIN_KEY;
  if (!secret) throw new Error("ADMIN_KEY is not configured");
  return tokenFor(secret);
}

export function isValidAdminToken(token?: string | null) {
  const secret = process.env.ADMIN_KEY;
  if (!secret || !token) return false;
  const expected = tokenFor(secret);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
