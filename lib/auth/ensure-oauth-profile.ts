import type { SupabaseClient, User } from "@supabase/supabase-js"

/**
 * Ensure OAuth users have a profiles row (trigger may lag or be absent on some deployments).
 * Does not overwrite existing profile fields except optional plan_id.
 */
export async function ensureOAuthUserProfile(
  user: User,
  serviceClient: SupabaseClient,
  planId?: string | null,
): Promise<{ created: boolean; error?: string }> {
  const { data: existing, error: fetchError } = await serviceClient
    .from("profiles")
    .select("id, plan_id")
    .eq("id", user.id)
    .maybeSingle()

  if (fetchError) {
    console.error("[auth/callback] profile lookup failed:", fetchError.message)
    return { created: false, error: fetchError.message }
  }

  if (existing) {
    if (planId && existing.plan_id !== planId) {
      const { error: updateError } = await serviceClient
        .from("profiles")
        .update({ plan_id: planId })
        .eq("id", user.id)
      if (updateError) {
        console.error("[auth/callback] profile plan update failed:", updateError.message)
      }
    }
    return { created: false }
  }

  const metadata = user.user_metadata ?? {}
  const fullName = ((metadata.full_name as string) || (metadata.name as string) || "").trim()
  const nameParts = fullName.split(/\s+/).filter(Boolean)
  const firstName =
    ((metadata.first_name as string) || (metadata.given_name as string) || nameParts[0] || "").trim()
  const lastName =
    ((metadata.last_name as string) || (metadata.family_name as string) || nameParts.slice(1).join(" ") || "").trim()
  const avatarUrl = (metadata.avatar_url as string) || (metadata.picture as string) || null

  const { error: insertError } = await serviceClient.from("profiles").insert({
    id: user.id,
    email: user.email ?? null,
    full_name: fullName || [firstName, lastName].filter(Boolean).join(" ") || null,
    first_name: firstName || null,
    last_name: lastName || null,
    avatar_url: avatarUrl,
    ...(planId ? { plan_id: planId } : {}),
  })

  if (insertError) {
    // Race: trigger may have inserted between select and insert
    if (insertError.code === "23505") {
      if (planId) {
        await serviceClient.from("profiles").update({ plan_id: planId }).eq("id", user.id)
      }
      return { created: false }
    }
    console.error("[auth/callback] profile insert failed:", insertError.message)
    return { created: false, error: insertError.message }
  }

  console.log("[auth/callback] Created profile for OAuth user:", user.id)
  return { created: true }
}
