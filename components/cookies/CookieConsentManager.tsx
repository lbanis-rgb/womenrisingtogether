"use client"

import { usePathname } from "next/navigation"
import { CookieConsentBanner } from "./CookieConsentBanner"
import { CookiePreferencesModal } from "./CookiePreferencesModal"

export function CookieConsentManager() {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  if (isAdminRoute) return null

  return (
    <>
      <CookieConsentBanner />
      <CookiePreferencesModal />
    </>
  )
}
