export const HERO_CUSTOM_ANCHOR = "#custom"

export function isValidCustomButtonUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false

  if (trimmed.startsWith("#")) {
    return trimmed.length > 1
  }

  if (trimmed.startsWith("/")) {
    return trimmed.length > 1
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed)
      return true
    } catch {
      return false
    }
  }

  return false
}

export function resolveHeroButtonHref(
  primaryButtonAnchor: string,
  customButtonUrl?: string | null,
): string | null {
  const anchor = (primaryButtonAnchor || "#membership-plans").trim()

  if (anchor === HERO_CUSTOM_ANCHOR || anchor === "custom") {
    const custom = (customButtonUrl ?? "").trim()
    if (!custom || !isValidCustomButtonUrl(custom)) return null
    return custom
  }

  if (anchor.startsWith("#")) return anchor
  if (anchor.startsWith("http://") || anchor.startsWith("https://")) return anchor
  if (anchor.startsWith("/")) return anchor

  return `#${anchor.replace(/^#/, "")}`
}

export function isExternalHeroButtonHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://")
}
