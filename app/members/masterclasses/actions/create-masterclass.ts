"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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

export async function createMasterclass(input: {
  title: string
  description?: string | null
  topics?: string[] | null
  who_its_for?: string | null
  scheduled_at: string
  duration_minutes: number
  image_path?: string | null
  video_url?: string | null
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const title = input.title?.trim()
  if (!title) {
    return { success: false, error: "Title is required" }
  }

  const scheduledAt = input.scheduled_at?.trim()
  if (!scheduledAt || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(scheduledAt)) {
    return { success: false, error: "Date and time are required" }
  }

  if (!Number.isFinite(input.duration_minutes) || input.duration_minutes <= 0) {
    return { success: false, error: "Duration is required" }
  }

  const videoUrl = validateVideoUrl(input.video_url)
  if (input.video_url?.trim() && !videoUrl) {
    return { success: false, error: "Please enter a valid video URL" }
  }

  const { error } = await supabase.from("masterclasses").insert({
    title,
    description: input.description?.trim() || null,
    topics: input.topics || null,
    who_its_for: input.who_its_for?.trim() || null,
    scheduled_at: scheduledAt,
    duration_minutes: input.duration_minutes,
    image_path: input.image_path || null,
    video_url: videoUrl,
    creator_id: user.id,
    status: "pending",
  })

  if (error) {
    console.error("[createMasterclass]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/members/masterclasses")

  return { success: true }
}
