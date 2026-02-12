import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify that a request genuinely came from Slack using HMAC-SHA256.
 *
 * Slack sends three things:
 *   1. X-Slack-Request-Timestamp — Unix epoch seconds
 *   2. X-Slack-Signature — "v0={hex_hash}" computed from signing secret
 *   3. The raw request body (form-encoded)
 *
 * We recompute the hash and compare with timing-safe equality.
 * Requests older than 5 minutes are rejected (replay protection).
 */
export function verifySlackSignature(
  signingSecret: string,
  signature: string | null,
  timestamp: string | null,
  body: string
): boolean {
  if (!signature || !timestamp) return false;

  // Reject requests older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) return false;

  // Construct the base string: v0:{timestamp}:{body}
  const baseString = `v0:${timestamp}:${body}`;

  // Compute HMAC-SHA256
  const hmac = createHmac("sha256", signingSecret);
  hmac.update(baseString);
  const computed = `v0=${hmac.digest("hex")}`;

  // Timing-safe comparison to prevent timing attacks
  try {
    return timingSafeEqual(
      Buffer.from(computed, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    // Buffers of different lengths throw — that means invalid signature
    return false;
  }
}
