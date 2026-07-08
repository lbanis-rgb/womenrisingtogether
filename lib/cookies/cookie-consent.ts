export const COOKIE_CONSENT_STORAGE_KEY = "community_cookie_consent"
export const COOKIE_CONSENT_VERSION = 1

export type CookieConsentPreferences = {
  essential: true
  analytics: boolean
  marketing: boolean
  media: boolean
  updatedAt: string
  version: number
}

export type CookieCategoryDraft = {
  analytics: boolean
  marketing: boolean
  media: boolean
}

function nowIso(): string {
  return new Date().toISOString()
}

export function createAcceptAllConsent(): CookieConsentPreferences {
  return {
    essential: true,
    analytics: true,
    marketing: true,
    media: true,
    updatedAt: nowIso(),
    version: COOKIE_CONSENT_VERSION,
  }
}

export function createRejectNonEssentialConsent(): CookieConsentPreferences {
  return {
    essential: true,
    analytics: false,
    marketing: false,
    media: false,
    updatedAt: nowIso(),
    version: COOKIE_CONSENT_VERSION,
  }
}

export function createCustomConsent(prefs: CookieCategoryDraft): CookieConsentPreferences {
  return {
    essential: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    media: prefs.media,
    updatedAt: nowIso(),
    version: COOKIE_CONSENT_VERSION,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function parseCookieConsent(raw: unknown): CookieConsentPreferences | null {
  if (!isRecord(raw)) return null

  const essential = raw.essential === true
  const analytics = raw.analytics === true
  const marketing = raw.marketing === true
  const media = raw.media === true
  const updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : nowIso()
  const version = typeof raw.version === "number" ? raw.version : COOKIE_CONSENT_VERSION

  if (!essential) return null

  return {
    essential: true,
    analytics,
    marketing,
    media,
    updatedAt,
    version,
  }
}

export function readCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null

  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!stored) return null
    return parseCookieConsent(JSON.parse(stored))
  } catch {
    return null
  }
}

export function writeCookieConsent(consent: CookieConsentPreferences): void {
  if (typeof window === "undefined") return

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent))
  window.dispatchEvent(new CustomEvent("community-cookie-consent-changed", { detail: consent }))
}

export function clearCookieConsent(): void {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent("community-cookie-consent-changed", { detail: null }))
}

export function hasConsentChoice(consent: CookieConsentPreferences | null): boolean {
  return consent !== null
}

export function getDefaultCategoryDraft(): CookieCategoryDraft {
  return {
    analytics: false,
    marketing: false,
    media: false,
  }
}

export function consentToCategoryDraft(consent: CookieConsentPreferences | null): CookieCategoryDraft {
  if (!consent) return getDefaultCategoryDraft()
  return {
    analytics: consent.analytics,
    marketing: consent.marketing,
    media: consent.media,
  }
}

export const COOKIE_CONSENT_CHANGED_EVENT = "community-cookie-consent-changed"

export function subscribeToCookieConsent(
  listener: (consent: CookieConsentPreferences | null) => void,
): () => void {
  if (typeof window === "undefined") return () => {}

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<CookieConsentPreferences | null>
    listener(customEvent.detail ?? readCookieConsent())
  }

  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handler)
  return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handler)
}
