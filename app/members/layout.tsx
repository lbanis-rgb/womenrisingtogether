import type React from "react"
import { ShellConfigProvider } from "./_components/ShellConfig"
import { AppShell } from "./_components/AppShell"
import { createClient } from "@/lib/supabase/server"

export default async function MembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userProfile = { email: "" }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, full_name, email, avatar_url, role, is_creator")
      .eq("id", user.id)
      .single()

    if (profile) {
      userProfile = {
        ...profile,
        email: profile.email || user.email || "",
      }
    } else {
      userProfile = { email: user.email || "" }
    }
  }

  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select(
      "site_title, brand_logo_url, brand_accent_color, member_navigation, site_terms_url, site_privacy_url, billing_link",
    )
    .single()

  const allowedKeys = ["dashboard", "tools", "community", "education", "support"]

  const defaultLabels: Record<string, string> = {
    dashboard: "Dashboard",
    tools: "Tools",
    community: "Community",
    education: "Education",
    support: "Support",
  }

  let orderedNavigation: Array<{ key: string; label: string }> = []
  const sidebarLabels: Record<string, string> = { ...defaultLabels }

  if (siteSettings?.member_navigation) {
    let parsedNav: Array<{ id?: string; label?: string; order?: number; visible?: boolean }> = []

    // Safely parse if it's a string
    if (typeof siteSettings.member_navigation === "string") {
      try {
        parsedNav = JSON.parse(siteSettings.member_navigation)
      } catch {
        parsedNav = []
      }
    } else if (Array.isArray(siteSettings.member_navigation)) {
      // Already an array (fallback)
      parsedNav = siteSettings.member_navigation
    }

    // Normalize: filter by allowed keys, visible === true, exclude "course", sort by order
    if (Array.isArray(parsedNav)) {
      const validItems = parsedNav
        .filter((item) => {
          const id = item.id
          return typeof id === "string" && allowedKeys.includes(id) && item.visible === true
        })
        .sort((a, b) => {
          const orderA = typeof a.order === "number" ? a.order : 999
          const orderB = typeof b.order === "number" ? b.order : 999
          return orderA - orderB
        })

      orderedNavigation = validItems.map((item) => ({
        key: item.id as string,
        label: item.label || defaultLabels[item.id as string] || (item.id as string),
      }))

      // Build sidebarLabels from ordered navigation
      validItems.forEach((item) => {
        const key = item.id as string
        sidebarLabels[key] = item.label || defaultLabels[key] || key
      })
    }
  }

  // If no valid navigation was built, use defaults
  if (orderedNavigation.length === 0) {
    orderedNavigation = allowedKeys.map((key) => ({
      key,
      label: defaultLabels[key],
    }))
  }

  const shellConfigValue = {
    sidebarLabels,
    memberNavigation: orderedNavigation,
    brandLogoUrl: siteSettings?.brand_logo_url ?? null,
    brandAccentColor: siteSettings?.brand_accent_color ?? null,
    siteTitle: siteSettings?.site_title ?? null,
    siteTermsUrl: siteSettings?.site_terms_url ?? null,
    sitePrivacyUrl: siteSettings?.site_privacy_url ?? null,
    billingLink: siteSettings?.billing_link ?? null,
  }

  return (
    <ShellConfigProvider value={shellConfigValue}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        crossOrigin="anonymous"
      />
      <AppShell userProfile={userProfile}>{children}</AppShell>
    </ShellConfigProvider>
  )
}
