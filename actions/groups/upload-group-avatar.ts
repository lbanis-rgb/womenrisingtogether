"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { assertCanManageGroupBranding } from "./group-branding-permissions"

function createServiceRoleClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function uploadGroupAvatar(formData: FormData) {
  const groupId = formData.get("groupId") as string
  const file = formData.get("file") as File

  if (!groupId || !file) {
    throw new Error("Missing groupId or file")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const permission = await assertCanManageGroupBranding(supabase, groupId, user.id)
  if (!permission.ok) {
    throw new Error(permission.error)
  }

  const serviceClient = createServiceRoleClient()
  const ext = file.name.split(".").pop() || "png"
  const path = `${groupId}/avatar.${ext}`

  const { error: uploadError } = await serviceClient.storage.from("groups").upload(path, file, { upsert: true })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  const { data: urlData } = serviceClient.storage.from("groups").getPublicUrl(path)
  const avatarUrl = urlData.publicUrl

  const { error: updateError } = await supabase
    .from("groups")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", groupId)

  if (updateError) {
    throw new Error(`DB update failed: ${updateError.message}`)
  }

  revalidatePath(`/members/community/groups/${groupId}`)
  revalidatePath("/members/community/groups")
}
