/**
 * Safe redirect validation — prevent open redirect attacks.
 * Only allow same-origin paths.
 */
const ALLOWED_PREFIXES = ["/dashboard", "/venture", "/admin", "/studio", "/report", "/profile", "/tools", "/onboarding", "/login", "/signup", "/reset-password"];

export function isSafeRedirect(target: string | null | undefined): boolean {
  if (!target || typeof target !== "string") return false;
  const trimmed = target.trim();
  if (trimmed === "") return false;
  // Must start with / and not // (protocol-relative) or contain : (protocol)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes(":")) {
    return false;
  }
  // Must be a known path prefix (exact or subpath)
  return ALLOWED_PREFIXES.some(
    (p) => trimmed === p || trimmed.startsWith(p + "/")
  );
}

export function getSafeRedirect(target: string | null | undefined, fallback: string): string {
  return isSafeRedirect(target) ? target! : fallback;
}
