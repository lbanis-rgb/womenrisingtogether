"use client"

import { Analytics } from "@vercel/analytics/next"
import { useCookieConsent } from "./CookieConsentProvider"

/**
 * Loads Vercel Analytics only after the visitor has opted in to analytics cookies.
 * Add other analytics scripts here or use `preferences.analytics` in a custom loader.
 */
export function ConsentGatedAnalytics() {
  const { hasConsent, preferences } = useCookieConsent()

  if (!hasConsent || !preferences.analytics) return null

  return <Analytics />
}
