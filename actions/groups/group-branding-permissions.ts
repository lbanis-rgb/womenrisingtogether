import { createClient } from "@/lib/supabase/server"
import { assertCanManageGroup } from "@/lib/community/groups/assert-can-manage-group"

export async function assertCanManageGroupBranding(
  supabase: Awaited<ReturnType<typeof createClient>>,
  groupId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const permission = await assertCanManageGroup(supabase, groupId, userId)
  if (!permission.ok) {
    return permission
  }
  return { ok: true }
}
