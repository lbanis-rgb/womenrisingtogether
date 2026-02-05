"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export type SalesPageType = "main" | "founders"

function createServiceRoleClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })
}

async function verifyAdminAccess(): Promise<{ authorized: boolean; error: string | null }> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { authorized: false, error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("is_creator").eq("id", user.id).single()

  if (!profile?.is_creator) {
    return { authorized: false, error: "Not authorized" }
  }

  return { authorized: true, error: null }
}

export interface SalesPageHeroRow {
  hero_logo_url: string | null
  hero_headline: string | null
  hero_intro_text: string | null
  hero_image_url: string | null
}

export interface SalesPageRow extends SalesPageHeroRow {
  community_vision_headline: string | null
  community_vision_image_url: string | null
  community_vision_body: string | null
  community_vision_bullets: string[] | null
  education_section_headline: string | null
  show_courses_section: boolean | null
  show_marketplace_section: boolean | null
  show_ai_mentors_section: boolean | null
  show_founders_cta_section: boolean | null
  selected_plan_ids: string[] | null
}

export async function getSalesPageByPageType(
  pageType: SalesPageType,
): Promise<{ success: boolean; data?: SalesPageRow | null; error?: string }> {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    return { success: false, error: authError || "Unauthorized" }
  }

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from("public_sales_pages")
    .select(
      "hero_logo_url, hero_headline, hero_intro_text, hero_image_url, community_vision_headline, community_vision_image_url, community_vision_body, community_vision_bullets, education_section_headline, show_courses_section, show_marketplace_section, show_ai_mentors_section, show_founders_cta_section, selected_plan_ids",
    )
    .eq("page_type", pageType)
    .maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: data as SalesPageRow | null }
}

export interface UpdateSalesPageCommunityVisionPayload {
  community_vision_headline?: string | null
  community_vision_image_url?: string | null
  community_vision_body?: string | null
  community_vision_bullets?: string[] | null
}

export async function updateSalesPageCommunityVision(
  pageType: SalesPageType,
  payload: UpdateSalesPageCommunityVisionPayload,
): Promise<{ success: boolean; error?: string }> {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    return { success: false, error: authError || "Unauthorized" }
  }

  const supabase = createServiceRoleClient()

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (payload.community_vision_headline !== undefined)
    updatePayload.community_vision_headline = payload.community_vision_headline
  if (payload.community_vision_image_url !== undefined)
    updatePayload.community_vision_image_url = payload.community_vision_image_url
  if (payload.community_vision_body !== undefined)
    updatePayload.community_vision_body = payload.community_vision_body
  if (payload.community_vision_bullets !== undefined)
    updatePayload.community_vision_bullets = payload.community_vision_bullets

  const { error } = await supabase
    .from("sales_pages")
    .update(updatePayload)
    .eq("page_type", pageType)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function updateSalesPageEducationSection(
  pageType: SalesPageType,
  payload: { education_section_headline?: string | null },
): Promise<{ success: boolean; error?: string }> {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    return { success: false, error: authError || "Unauthorized" }
  }

  const supabase = createServiceRoleClient()

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (payload.education_section_headline !== undefined)
    updatePayload.education_section_headline = payload.education_section_headline

  const { error } = await supabase
    .from("sales_pages")
    .update(updatePayload)
    .eq("page_type", pageType)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export interface UpdateSalesPageVisibilityPayload {
  show_courses_section?: boolean
  show_marketplace_section?: boolean
  show_ai_mentors_section?: boolean
  show_founders_cta_section?: boolean
}

export async function updateSalesPageVisibility(
  pageType: SalesPageType,
  payload: UpdateSalesPageVisibilityPayload,
): Promise<{ success: boolean; error?: string }> {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    return { success: false, error: authError || "Unauthorized" }
  }

  const supabase = createServiceRoleClient()

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (payload.show_courses_section !== undefined)
    updatePayload.show_courses_section = payload.show_courses_section
  if (payload.show_marketplace_section !== undefined)
    updatePayload.show_marketplace_section = payload.show_marketplace_section
  if (payload.show_ai_mentors_section !== undefined)
    updatePayload.show_ai_mentors_section = payload.show_ai_mentors_section
  if (payload.show_founders_cta_section !== undefined)
    updatePayload.show_founders_cta_section = payload.show_founders_cta_section

  const { error } = await supabase
    .from("sales_pages")
    .update(updatePayload)
    .eq("page_type", pageType)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export interface ActivePlanForSalesPage {
  id: string
  name: string
  price: number | null
  currency: string | null
  billing: string | null
  features: string[] | null
  most_popular: boolean | null
  payment_url: string | null
}

export async function getActivePlansForSalesPage(): Promise<{
  success: boolean
  data?: ActivePlanForSalesPage[]
  error?: string
}> {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    return { success: false, error: authError || "Unauthorized" }
  }

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from("plans")
    .select("id, name, price, currency, billing, features, most_popular, payment_url")
    .eq("active", true)
    .order("name", { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: (data ?? []) as ActivePlanForSalesPage[] }
}

export async function updateSalesPagePlans(
  pageType: SalesPageType,
  payload: { selected_plan_ids: string[] },
): Promise<{ success: boolean; error?: string }> {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    return { success: false, error: authError || "Unauthorized" }
  }

  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from("sales_pages")
    .update({
      selected_plan_ids: payload.selected_plan_ids,
      updated_at: new Date().toISOString(),
    })
    .eq("page_type", pageType)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export interface UpdateSalesPageHeroPayload {
  hero_logo_url?: string | null
  hero_headline?: string | null
  hero_intro_text?: string | null
  hero_image_url?: string | null
}

export async function updateSalesPageHero(
  pageType: SalesPageType,
  payload: UpdateSalesPageHeroPayload,
): Promise<{ success: boolean; error?: string }> {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    return { success: false, error: authError || "Unauthorized" }
  }

  const supabase = createServiceRoleClient()

  const updatePayload: Record<string, unknown> = {
    page_type: pageType,
    updated_at: new Date().toISOString(),
  }
  if (payload.hero_logo_url !== undefined) updatePayload.hero_logo_url = payload.hero_logo_url
  if (payload.hero_headline !== undefined) updatePayload.hero_headline = payload.hero_headline
  if (payload.hero_intro_text !== undefined) updatePayload.hero_intro_text = payload.hero_intro_text
  if (payload.hero_image_url !== undefined) updatePayload.hero_image_url = payload.hero_image_url

  const { error } = await supabase
    .from("sales_pages")
    .upsert(updatePayload, { onConflict: "page_type" })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
