import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Short-lived signed tokens for the server-side PDF render page. The headless
 * browser has no admin session, so /pdf/quotation/[id] is gated by a token
 * minted by /api/quote-pdf for the authenticated admin.
 */

const TTL_MS = 10 * 60 * 1000;

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (s) return s;
  // Refuse the insecure default outside dev — a forgeable secret would let
  // anyone open any quotation by id via the PDF render page.
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production");
  }
  return "dev-secret";
}

export function signPdfToken(id: number): { token: string; exp: number } {
  const exp = Date.now() + TTL_MS;
  const mac = createHmac("sha256", secret())
    .update(`${id}.${exp}`)
    .digest("base64url");
  return { token: mac, exp };
}

export function verifyPdfToken(
  id: number,
  exp: unknown,
  token: unknown,
): boolean {
  if (typeof exp !== "string" || typeof token !== "string") return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Date.now()) return false;
  const expected = createHmac("sha256", secret())
    .update(`${id}.${expNum}`)
    .digest("base64url");
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
