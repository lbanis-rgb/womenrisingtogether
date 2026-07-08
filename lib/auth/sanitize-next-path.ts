const DEFAULT_MEMBER_DESTINATION = "/members/dashboard"

/**
 * Only allow same-origin relative paths for post-auth redirects.
 */
export function sanitizeNextPath(
  next: string | null | undefined,
  fallback: string = DEFAULT_MEMBER_DESTINATION,
): string {
  if (!next) return fallback

  const trimmed = next.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback
  }

  // Block protocol-relative or backslash tricks
  if (trimmed.includes("\\") || trimmed.includes("://")) {
    return fallback
  }

  return trimmed
}

export { DEFAULT_MEMBER_DESTINATION }
