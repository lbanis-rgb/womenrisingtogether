"use server"

import { createClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

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

export async function getMemberStats() {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    throw new Error(authError || "Not authorized")
  }

  const supabase = createServiceRoleClient()

  const { count: total, error: totalError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  if (totalError) {
    throw new Error(totalError.message)
  }

  const { count: active, error: activeError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  if (activeError) {
    throw new Error(activeError.message)
  }

  const { count: suspended, error: suspendedError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_active", false)

  if (suspendedError) {
    throw new Error(suspendedError.message)
  }

  return {
    total: total ?? 0,
    active: active ?? 0,
    suspended: suspended ?? 0,
  }
}

export async function createSiteUpdate({ title, body }: { title?: string; body: string }) {
  const supabase = await createClient()

  const { error } = await supabase.from("site_updates").insert({
    title,
    body,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function getSiteUpdates() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("site_updates")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateSiteUpdate({
  id,
  title,
  body,
}: {
  id: string
  title?: string
  body: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from("site_updates").update({ title, body }).eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function deleteSiteUpdate(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("site_updates").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function getRecentMembers() {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    throw new Error(authError || "Not authorized")
  }

  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, display_name, email, avatar_url, created_at, plans ( name )")
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((profile) => ({
    id: profile.id ?? "",
    full_name: profile.full_name || profile.display_name || profile.email || "Unknown User",
    email: profile.email ?? "No email",
    avatar_url: profile.avatar_url ?? null,
    created_at: profile.created_at ?? "",
    plan_name:
      profile.plans && typeof profile.plans === "object" && "name" in profile.plans
        ? ((profile.plans.name as string) ?? "Unknown")
        : "Unknown",
  }))
}

export async function getMembersByPlan() {
  const { authorized, error: authError } = await verifyAdminAccess()
  if (!authorized) {
    throw new Error(authError || "Not authorized")
  }

  const supabase = createServiceRoleClient()

  const { data: plans, error: plansError } = await supabase.from("plans").select("id, name").eq("active", true)

  if (plansError) {
    throw new Error(plansError.message)
  }

  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("plan_id")

  if (profilesError) {
    throw new Error(profilesError.message)
  }

  const countByPlanId = new Map<string, number>()
  for (const row of profiles ?? []) {
    const pid = row.plan_id
    if (pid) {
      countByPlanId.set(pid, (countByPlanId.get(pid) ?? 0) + 1)
    }
  }

  return (plans ?? []).map((plan) => ({
    planId: plan.id ?? "",
    planName: plan.name ?? "Unknown Plan",
    memberCount: countByPlanId.get(plan.id) ?? 0,
  }))
}
