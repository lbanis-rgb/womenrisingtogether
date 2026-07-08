"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type ActionResult = { success: true } | { success: false; error: string }

function validateVideoUrl(videoUrl: string | null | undefined): string | null {
  const value = videoUrl?.trim()
  if (!value) return null
  try {
    new URL(value)
    return value
  } catch {
    return null
  }
}

function validateMasterclassFields(input: {
  title?: string
  scheduled_at?: string
  duration_minutes?: number
  video_url?: string | null
}): { ok: true; title: string; scheduledAt: string; durationMinutes: number; videoUrl: string | null } | { ok: false; error: string } {
  const title = input.title?.trim() ?? ""
  if (!title) {
    return { ok: false, error: "Title is required" }
  }

  const scheduledAt = input.scheduled_at?.trim() ?? ""
  if (!scheduledAt) {
    return { ok: false, error: "Date and time are required" }
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(scheduledAt)) {
    return { ok: false, error: "Invalid date or time" }
  }

  const durationMinutes = input.duration_minutes
  if (!Number.isFinite(durationMinutes) || (durationMinutes ?? 0) <= 0) {
    return { ok: false, error: "Duration is required" }
  }

  const videoUrl = validateVideoUrl(input.video_url)
  if (input.video_url?.trim() && !videoUrl) {
    return { ok: false, error: "Please enter a valid video URL" }
  }

  return {
    ok: true,
    title,
    scheduledAt,
    durationMinutes: durationMinutes as number,
    videoUrl,
  }
}

async function assertMasterclassOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  masterclassId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing } = await supabase
    .from("masterclasses")
    .select("creator_id")
    .eq("id", masterclassId)
    .single()

  if (!existing) {
    return { ok: false, error: "Masterclass not found" }
  }

  if (existing.creator_id !== userId) {
    return { ok: false, error: "You can only manage your own masterclasses" }
  }

  return { ok: true }
}

export async function reserveMasterclass(masterclassId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const id = masterclassId?.trim()
    if (!id) return { success: false, error: "Masterclass ID is required" }

    const { error: insertError } = await supabase
      .from("masterclass_attendees")
      .insert({ masterclass_id: id, user_id: user.id })

    if (insertError) {
      if (insertError.code === "23505") return { success: true }
      console.error("[reserveMasterclass]", insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath("/members/masterclasses")
    return { success: true }
  } catch (err) {
    console.error("[reserveMasterclass] Unexpected error:", err)
    return { success: false, error: "Something went wrong" }
  }
}

export async function updateMasterclass(input: {
  id: string
  title: string
  description?: string | null
  topics?: string[] | null
  who_its_for?: string | null
  video_url?: string | null
  image_path?: string | null
  scheduled_at: string
  duration_minutes: number
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const id = input.id?.trim()
    if (!id) {
      return { success: false, error: "Masterclass ID is required" }
    }

    const validated = validateMasterclassFields(input)
    if (!validated.ok) {
      return { success: false, error: validated.error }
    }

    const ownerCheck = await assertMasterclassOwner(supabase, id, user.id)
    if (!ownerCheck.ok) {
      return { success: false, error: ownerCheck.error }
    }

    const topicsArr =
      input.topics && Array.isArray(input.topics)
        ? input.topics.filter((t) => typeof t === "string")
        : []
    const topicsValue = topicsArr.length > 0 ? topicsArr : null

    const { error: updateError } = await supabase
      .from("masterclasses")
      .update({
        title: validated.title,
        description: input.description?.trim() || null,
        topics: topicsValue,
        who_its_for: input.who_its_for?.trim() || null,
        video_url: validated.videoUrl,
        image_path: input.image_path?.trim() || null,
        scheduled_at: validated.scheduledAt,
        duration_minutes: validated.durationMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("creator_id", user.id)

    if (updateError) {
      console.error("[updateMasterclass]", updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath("/members/masterclasses")
    return { success: true }
  } catch (err) {
    console.error("[updateMasterclass] Unexpected error:", err)
    return { success: false, error: "Something went wrong" }
  }
}

export async function deleteMasterclass(masterclassId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const id = masterclassId?.trim()
    if (!id) {
      return { success: false, error: "Masterclass ID is required" }
    }

    const ownerCheck = await assertMasterclassOwner(supabase, id, user.id)
    if (!ownerCheck.ok) {
      return { success: false, error: ownerCheck.error }
    }

    const { error: deleteError } = await supabase
      .from("masterclasses")
      .delete()
      .eq("id", id)
      .eq("creator_id", user.id)

    if (deleteError) {
      console.error("[deleteMasterclass]", deleteError)
      return { success: false, error: deleteError.message }
    }

    revalidatePath("/members/masterclasses")
    return { success: true }
  } catch (err) {
    console.error("[deleteMasterclass] Unexpected error:", err)
    return { success: false, error: "Something went wrong" }
  }
}
