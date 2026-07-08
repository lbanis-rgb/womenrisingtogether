"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  consentToCategoryDraft,
  getDefaultCategoryDraft,
  type CookieCategoryDraft,
} from "@/lib/cookies/cookie-consent"
import { cn } from "@/lib/utils"
import { useCookieConsent } from "./CookieConsentProvider"

type CookieCategoryRowProps = {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

function CookieCategoryRow({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: CookieCategoryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${title} cookies`}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          disabled ? "cursor-not-allowed bg-gray-300" : checked ? "bg-blue-600" : "bg-gray-300",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  )
}

export function CookiePreferencesModal() {
  const {
    consent,
    isPreferencesOpen,
    closePreferences,
    acceptAll,
    rejectNonEssential,
    savePreferences,
  } = useCookieConsent()

  const [draft, setDraft] = useState<CookieCategoryDraft>(getDefaultCategoryDraft())

  useEffect(() => {
    if (!isPreferencesOpen) return
    setDraft(consentToCategoryDraft(consent))
  }, [consent, isPreferencesOpen])

  const updateDraft = (key: keyof CookieCategoryDraft, value: boolean) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return (
    <Dialog open={isPreferencesOpen} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Choose which optional cookies this site may use. Essential cookies are always active for
            login, security, and core functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <CookieCategoryRow
            title="Essential Cookies"
            description="Always active. Required for login, security, member access, and core site functionality."
            checked
            disabled
          />
          <CookieCategoryRow
            title="Analytics Cookies"
            description="Optional. Used to understand site usage and improve the experience."
            checked={draft.analytics}
            onChange={(value) => updateDraft("analytics", value)}
          />
          <CookieCategoryRow
            title="Marketing Cookies"
            description="Optional. Used for ads, tracking pixels, or promotional measurement if enabled."
            checked={draft.marketing}
            onChange={(value) => updateDraft("marketing", value)}
          />
          <CookieCategoryRow
            title="Embedded Media Cookies"
            description="Optional. Used by embedded services such as YouTube or Vimeo if present."
            checked={draft.media}
            onChange={(value) => updateDraft("media", value)}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button type="button" variant="outline" onClick={rejectNonEssential} className="w-full sm:w-auto">
            Reject Non-Essential
          </Button>
          <Button type="button" variant="outline" onClick={acceptAll} className="w-full sm:w-auto">
            Accept All
          </Button>
          <Button type="button" onClick={() => savePreferences(draft)} className="w-full sm:w-auto">
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
