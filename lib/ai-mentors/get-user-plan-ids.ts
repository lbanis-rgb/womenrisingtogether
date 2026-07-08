import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Resolves the current user's active plan IDs from profiles.plan_id.
 * Falls back to the platform's active free plan when a member has no plan assigned.
 */
export async function getUserPlanIds(
  adminClient: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data: profile } = await adminClient
    .from("profiles")
    .select("plan_id")
    .eq("id", userId)
    .maybeSingle()

  if (profile?.plan_id) {
    return [String(profile.plan_id)]
  }

  const { data: freePlan } = await adminClient
    .from("plans")
    .select("id")
    .eq("is_free", true)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (freePlan?.id) {
    return [String(freePlan.id)]
  }

  return []
}
