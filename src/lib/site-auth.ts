import { createHash, timingSafeEqual } from "node:crypto";

export const SITE_UNLOCK_COOKIE = "clientflow_unlock";

export function sitePasswordConfigured() {
  return Boolean(process.env.SITE_PASSWORD);
}

export function siteUnlockToken(password = process.env.SITE_PASSWORD ?? "") {
  return createHash("sha256").update(`clientflow:${password}`).digest("hex");
}

export function isValidUnlockToken(token: string | undefined) {
  if (!process.env.SITE_PASSWORD) return false;
  const expected = siteUnlockToken();
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function passwordsMatch(input: string, expected: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  try {
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}
