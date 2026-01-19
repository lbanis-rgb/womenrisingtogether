"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardData() {
  const supabase = await createClient()

  const { data: siteSettings } = await supabase.from("site_settings").select("dashboard_settings").single()

  const dashboard = siteSettings?.dashboard_settings || {}

  const featuredToolIds = dashboard.featured_tools || []
  const featuredGroupIds = dashboard.featured_groups || []
  const featuredContentIds = dashboard.featured_content || []
  const featuredExpertIds = (dashboard.featured_experts || []).slice(0, 2)

  const [{ data: tools }, { data: groups }, { data: content }, { data: experts }] = await Promise.all([
    featuredToolIds.length
      ? supabase
          .from("tools")
          .select("id, name, short_description, image_url, launch_url")
          .in("id", featuredToolIds)
          .eq("is_active", true)
      : Promise.resolve({ data: [] }),

    featuredGroupIds.length
      ? supabase
          .from("groups")
          .select("id, name, description, avatar_url, slug")
          .in("id", featuredGroupIds)
          .eq("status", "active")
      : Promise.resolve({ data: [] }),

    featuredContentIds.length
      ? supabase
          .from("content_entries")
          .select("id, title, description, image_url, slug, cta_text, cta_url")
          .in("id", featuredContentIds)
          .eq("status", "published")
      : Promise.resolve({ data: [] }),

    featuredExpertIds.length
      ? supabase
          .from("experts")
          .select("id, name, title, image_url, bio, slug")
          .in("id", featuredExpertIds)
          .eq("is_active", true)
      : Promise.resolve({ data: [] }),
  ])

  const latestSiteUpdates = await getLatestSiteUpdates()

  return {
    headerImageUrl: dashboard.header_image_url || null,
    tools: tools || [],
    groups: groups || [],
    featuredContent: content || [],
    latestSiteUpdates: latestSiteUpdates || [],
    featuredExperts: experts || [],
  }
}

export async function getLatestSiteUpdates() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("site_updates")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("Failed to load site updates:", error)
    return []
  }

  return data
}
