/**
 * Stable Supabase redirect URL — no query string.
 * Must match Supabase Dashboard allow-list entry: https://domain.com/auth/callback
 */
export function getOAuthCallbackUrl(origin: string): string {
  const base = origin.replace(/\/$/, "")
  return `${base}/auth/callback`
}

/** Password reset email redirect — no query string. Allow-list: https://domain.com/reset-password */
export function getResetPasswordRedirectUrl(origin: string): string {
  const base = origin.replace(/\/$/, "")
  return `${base}/reset-password`
}

/** Client-safe origin when running in the browser. */
export function getClientOrigin(): string {
  if (typeof window === "undefined") return ""
  return window.location.origin
}
