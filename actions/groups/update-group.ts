"use server"

import { createClient } from "@/lib/supabase/server"
import { assertCanManageGroup } from "@/lib/community/groups/assert-can-manage-group"

export async function updateGroup({
  groupId,
  name,
  description,
  visibility,
  invite_code,
  allow_member_posts,
  require_post_approval,
  allow_member_events,
  allow_member_invites,
}: {
  groupId: string
  name: string
  description?: string | null
  visibility?: "public" | "request" | "private"
  invite_code?: string | null
  allow_member_posts: boolean
  require_post_approval: boolean
  allow_member_events: boolean
  allow_member_invites: boolean
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Unauthorized")
  }

  const permission = await assertCanManageGroup(supabase, groupId, user.id)
  if (!permission.ok) {
    throw new Error(permission.error)
  }

  const { data: existingRow, error: existingError } = await supabase
    .from("groups")
    .select("visibility, invite_code")
    .eq("id", groupId)
    .single()

  if (existingError || !existingRow) {
    throw new Error(existingError?.message || "Group not found")
  }

  const nextVisibility =
    (visibility ?? (existingRow.visibility as "public" | "request" | "private")) || "public"

  let nextInvite: string | null = null
  if (nextVisibility === "private") {
    const trimmed = invite_code?.trim()
    nextInvite = trimmed || existingRow.invite_code || null
  }

  const { error } = await supabase
    .from("groups")
    .update({
      name,
      description,
      visibility: nextVisibility,
      invite_code: nextInvite,
      allow_member_posts,
      require_post_approval,
      allow_member_events,
      allow_member_invites,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", groupId)

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}
