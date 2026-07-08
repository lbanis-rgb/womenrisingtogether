import { createClient } from "@/lib/supabase/server"
import { isGroupModeratorRole } from "@/lib/community/groups/can-manage-group"

export async function assertCanManageGroup(
  supabase: Awaited<ReturnType<typeof createClient>>,
  groupId: string,
  userId: string,
): Promise<{ ok: true; membershipRole: string } | { ok: false; error: string }> {
  const { data: membership, error } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !membership) {
    console.warn("[canManageGroup] not_group_moderator", {
      groupId,
      userId,
      membershipRole: null,
      reason: "not_group_moderator",
    })
    return { ok: false, error: "You do not have permission to manage this group" }
  }

  if (!isGroupModeratorRole(membership.role)) {
    console.warn("[canManageGroup] not_group_moderator", {
      groupId,
      userId,
      membershipRole: membership.role,
      reason: "not_group_moderator",
    })
    return { ok: false, error: "You do not have permission to manage this group" }
  }

  return { ok: true, membershipRole: membership.role }
}
