/**
 * In-component document titles (e.g. auth flows that set <title> in the tree).
 * Uses optional NEXT_PUBLIC_SITE_NAME; otherwise matches the root layout default.
 */
export function templatePageTitle(segment: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Community Platform"
  return `${segment} | ${site}`
}
