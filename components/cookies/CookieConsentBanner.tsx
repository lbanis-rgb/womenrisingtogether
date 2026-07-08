"use client"

import { Button } from "@/components/ui/button"
import { useCookieConsent } from "./CookieConsentProvider"

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectNonEssential, openPreferences } = useCookieConsent()

  if (!showBanner) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_24px_rgba(15,23,42,0.08)]"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-gray-700 md:max-w-3xl">
          This site uses cookies to provide essential functionality and improve your experience. You can
          accept all cookies, reject non-essential cookies, or manage your preferences.
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end md:w-auto md:shrink-0">
          <Button type="button" variant="outline" onClick={openPreferences} className="w-full sm:w-auto">
            Manage Preferences
          </Button>
          <Button type="button" variant="outline" onClick={rejectNonEssential} className="w-full sm:w-auto">
            Reject Non-Essential
          </Button>
          <Button type="button" onClick={acceptAll} className="w-full sm:w-auto">
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}
