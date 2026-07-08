"use client"

import { cn } from "@/lib/utils"
import { useCookieConsent } from "./CookieConsentProvider"

type CookiePreferencesLinkProps = {
  className?: string
}

export function CookiePreferencesLink({ className }: CookiePreferencesLinkProps) {
  const { openPreferences } = useCookieConsent()

  return (
    <button
      type="button"
      onClick={openPreferences}
      className={cn("hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2", className)}
    >
      Cookie Preferences
    </button>
  )
}
