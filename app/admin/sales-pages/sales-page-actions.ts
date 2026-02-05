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

function getSalesPageSlug(pageType: SalesPageType) {
  return pageType === "founders" ? "founders" : "home"
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
  logo_url: string | null
  hero_headline: string | null
  hero_intro_text: string | null
  hero_image_url: string | null
}

export interface SalesPageRow extends SalesPageHeroRow {
  vision_headline: string | null
  vision_body_text: string | null
  vision_image_url: string | null
  vision_who_for_bullets: string[] | null
  education_headline: string | null
  show_courses: boolean | null
  show_marketplace: boolean | null
  show_ai_mentors: boolean | null
  show_founders_bridge: boolean | null
  membership_headline: string | null
  membership_intro: string | null
  selected_plan_ids: string[] | null
}

export interface UpdateSalesPageCommunityVisionPayload {
  vision_headline?: string | null
  vision_body_text?: string | null
  vision_image_url?: string | null
  vision_who_for_bullets?: string[] | null
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
  if (payload.vision_headline !== undefined)
    updatePayload.vision_headline = payload.vision_headline
  if (payload.vision_body_text !== undefined)
    updatePayload.vision_body_text = payload.vision_body_text
  if (payload.vision_image_url !== undefined)
    updatePayload.vision_image_url = payload.vision_image_url
  if (payload.vision_who_for_bullets !== undefined)
    updatePayload.vision_who_for_bullets = payload.vision_who_for_bullets

  const { error } = await supabase
    .from("public_sales_pages")
    .update(updatePayload)
    .eq("slug", getSalesPageSlug(pageType))

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function updateSalesPageEducationSection(
  pageType: SalesPageType,
  payload: { education_headline?: string | null },
): Promise<{ success: boolean; error?: string }> {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    return { success: false, error: authError || "Unauthorized" }
  }

  const supabase = createServiceRoleClient()

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (payload.education_headline !== undefined)
    updatePayload.education_headline = payload.education_headline

  const { error } = await supabase
    .from("public_sales_pages")
    .update(updatePayload)
    .eq("slug", getSalesPageSlug(pageType))

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export interface UpdateSalesPageVisibilityPayload {
  show_courses?: boolean
  show_marketplace?: boolean
  show_ai_mentors?: boolean
  show_founders_bridge?: boolean
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
  if (payload.show_courses !== undefined)
    updatePayload.show_courses = payload.show_courses
  if (payload.show_marketplace !== undefined)
    updatePayload.show_marketplace = payload.show_marketplace
  if (payload.show_ai_mentors !== undefined)
    updatePayload.show_ai_mentors = payload.show_ai_mentors
  if (payload.show_founders_bridge !== undefined)
    updatePayload.show_founders_bridge = payload.show_founders_bridge

  const { error } = await supabase
    .from("public_sales_pages")
    .update(updatePayload)
    .eq("slug", getSalesPageSlug(pageType))

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
  payload: {
    selected_plan_ids: string[]
    membership_headline?: string | null
    membership_intro?: string | null
  },
): Promise<{ success: boolean; error?: string }> {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    return { success: false, error: authError || "Unauthorized" }
  }

  const supabase = createServiceRoleClient()

  const updatePayload: Record<string, unknown> = {
    selected_plan_ids: payload.selected_plan_ids,
    updated_at: new Date().toISOString(),
  }
  if (payload.membership_headline !== undefined)
    updatePayload.membership_headline = payload.membership_headline ?? null
  if (payload.membership_intro !== undefined)
    updatePayload.membership_intro = payload.membership_intro ?? null

  const { error } = await supabase
    .from("public_sales_pages")
    .update(updatePayload)
    .eq("slug", getSalesPageSlug(pageType))

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export interface UpdateSalesPageHeroPayload {
  logo_url?: string | null
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
    updated_at: new Date().toISOString(),
  }
  if (payload.logo_url !== undefined) updatePayload.logo_url = payload.logo_url
  if (payload.hero_headline !== undefined) updatePayload.hero_headline = payload.hero_headline
  if (payload.hero_intro_text !== undefined) updatePayload.hero_intro_text = payload.hero_intro_text
  if (payload.hero_image_url !== undefined) updatePayload.hero_image_url = payload.hero_image_url

  const { error } = await supabase
    .from("public_sales_pages")
    .update(updatePayload)
    .eq("slug", getSalesPageSlug(pageType))

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
