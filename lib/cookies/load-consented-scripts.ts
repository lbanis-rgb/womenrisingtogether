import type { CookieConsentPreferences } from "./cookie-consent"

/**
 * Example helpers for loading optional third-party scripts after consent.
 * Wire these up when adding Google Analytics, GTM, Meta Pixel, etc.
 */
export function shouldLoadAnalyticsScripts(consent: CookieConsentPreferences | null): boolean {
  return consent?.analytics === true
}

export function shouldLoadMarketingScripts(consent: CookieConsentPreferences | null): boolean {
  return consent?.marketing === true
}

export function shouldLoadEmbeddedMedia(consent: CookieConsentPreferences | null): boolean {
  return consent?.media === true
}

export function loadExternalScript(src: string, id?: string): void {
  if (typeof document === "undefined") return
  if (id && document.getElementById(id)) return

  const script = document.createElement("script")
  script.src = src
  script.async = true
  if (id) script.id = id
  document.head.appendChild(script)
}
