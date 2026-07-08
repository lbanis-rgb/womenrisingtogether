"use server"

import { createClient } from "@/lib/supabase/server"
import { getAiMentorModuleUrl, isAiMentorModuleConfigured } from "@/lib/ai-mentors/config"

export type AiMentorsPageData = {
  isCreator: boolean
  configured: boolean
  moduleUrl: string
  pageTitle: string
}

export async function getAiMentorsPageData(): Promise<AiMentorsPageData> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isCreator = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_creator")
      .eq("id", user.id)
      .maybeSingle()

    isCreator = profile?.is_creator === true
  }

  let pageTitle = "AI Mentors"
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("member_navigation")
    .limit(1)
    .maybeSingle()

  if (siteSettings?.member_navigation) {
    let navItems: Array<{ id?: string; label?: string }> = []
    const rawNav = siteSettings.member_navigation

    if (typeof rawNav === "string") {
      try {
        navItems = JSON.parse(rawNav)
      } catch {
        navItems = []
      }
    } else if (Array.isArray(rawNav)) {
      navItems = rawNav
    }

    const navItem = navItems.find((item) => item.id === "aimentors")
    if (navItem?.label) {
      pageTitle = navItem.label
    }
  }

  return {
    isCreator,
    configured: isAiMentorModuleConfigured(),
    moduleUrl: getAiMentorModuleUrl(),
    pageTitle,
  }
}
