"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  consentToCategoryDraft,
  createAcceptAllConsent,
  createCustomConsent,
  createRejectNonEssentialConsent,
  hasConsentChoice,
  readCookieConsent,
  subscribeToCookieConsent,
  writeCookieConsent,
  type CookieCategoryDraft,
  type CookieConsentPreferences,
} from "@/lib/cookies/cookie-consent"

type CookieConsentContextValue = {
  consent: CookieConsentPreferences | null
  hasConsent: boolean
  preferences: {
    essential: boolean
    analytics: boolean
    marketing: boolean
    media: boolean
  }
  showBanner: boolean
  isPreferencesOpen: boolean
  acceptAll: () => void
  rejectNonEssential: () => void
  savePreferences: (prefs: CookieCategoryDraft) => void
  openPreferences: () => void
  closePreferences: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

function applyConsent(
  consent: CookieConsentPreferences,
  setConsent: (value: CookieConsentPreferences) => void,
  setShowBanner: (value: boolean) => void,
  setIsPreferencesOpen: (value: boolean) => void,
) {
  writeCookieConsent(consent)
  setConsent(consent)
  setShowBanner(false)
  setIsPreferencesOpen(false)
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentPreferences | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readCookieConsent()
    setConsent(stored)
    setShowBanner(!hasConsentChoice(stored))
    setHydrated(true)
  }, [])

  useEffect(() => {
    return subscribeToCookieConsent((nextConsent) => {
      setConsent(nextConsent)
      setShowBanner(!hasConsentChoice(nextConsent))
    })
  }, [])

  const acceptAll = useCallback(() => {
    applyConsent(createAcceptAllConsent(), setConsent, setShowBanner, setIsPreferencesOpen)
  }, [])

  const rejectNonEssential = useCallback(() => {
    applyConsent(createRejectNonEssentialConsent(), setConsent, setShowBanner, setIsPreferencesOpen)
  }, [])

  const savePreferences = useCallback((prefs: CookieCategoryDraft) => {
    applyConsent(createCustomConsent(prefs), setConsent, setShowBanner, setIsPreferencesOpen)
  }, [])

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true)
  }, [])

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false)
  }, [])

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent: hydrated ? consent : null,
      hasConsent: hydrated ? hasConsentChoice(consent) : false,
      preferences: {
        essential: true,
        analytics: consent?.analytics ?? false,
        marketing: consent?.marketing ?? false,
        media: consent?.media ?? false,
      },
      showBanner: hydrated ? showBanner : false,
      isPreferencesOpen,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openPreferences,
      closePreferences,
    }),
    [
      acceptAll,
      closePreferences,
      consent,
      hydrated,
      isPreferencesOpen,
      openPreferences,
      rejectNonEssential,
      savePreferences,
      showBanner,
    ],
  )

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider")
  }
  return context
}

export function useCookieConsentCategoryDraft(): CookieCategoryDraft {
  const { consent } = useCookieConsent()
  return consentToCategoryDraft(consent)
}
