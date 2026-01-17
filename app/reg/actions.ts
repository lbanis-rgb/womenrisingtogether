"use server"

import { createServerClient } from "@supabase/ssr"

function getServiceRoleClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  })
}

export async function assignPlanToProfile(userId: string, planId: string): Promise<{ ok: boolean; error?: string }> {
  // Validate inputs
  if (!userId || !planId) {
    return { ok: false, error: "Missing userId or planId" }
  }

  try {
    const supabase = getServiceRoleClient()

    // Validate plan exists
    const { data: plan, error: planError } = await supabase.from("plans").select("id").eq("id", planId).single()

    if (planError || !plan) {
      return { ok: false, error: "Plan not found or inactive" }
    }

    // Update profile with plan_id
    const { error: updateError } = await supabase.from("profiles").update({ plan_id: planId }).eq("id", userId)

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}
