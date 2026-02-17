/**
 * Report page authentication — simple password gate with HMAC cookie.
 * No Supabase auth required. Password set via REPORT_PASSWORD env var.
 */
import crypto from "crypto";

export const REPORT_COOKIE_NAME = "report_session";
export const REPORT_COOKIE_MAX_AGE = 86400; // 24 hours

export function generateReportToken(password: string): string {
  return crypto
    .createHmac("sha256", password)
    .update("report_access_granted")
    .digest("hex");
}

export function isValidReportToken(
  token: string,
  password: string
): boolean {
  const expected = generateReportToken(password);
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
