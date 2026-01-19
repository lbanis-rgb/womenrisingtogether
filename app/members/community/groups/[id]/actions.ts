"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import type { FeedPost, FeedReply } from "@/lib/types/community"

function createServiceRoleClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}

const resolveAuthorName = (profiles: any): string => {
  if (!profiles) return "Unknown"
  return profiles.full_name || profiles.first_name || profiles.display_name || "Unknown"
}

export async function getGroupFeedPosts(groupId: string): Promise<FeedPost[]> {
  const supabase = await createClient()

  // Query comments where context_type = 'group_feed', context_id = groupId, parent_id IS NULL, status IN ('active','approved')
  const { data: posts, error } = await supabase
    .from("comments")
    .select(`
      id,
      author_id,
      body,
      image_url,
      document_url,
      document_name,
      link_url,
      video_url,
      context_type,
      context_label,
      parent_id,
      status,
      created_at,
      profiles!comments_author_id_fkey (
        full_name,
        first_name,
        display_name,
        avatar_url
      )
    `)
    .eq("context_type", "group_feed")
    .eq("context_id", groupId)
    .is("parent_id", null)
    .in("status", ["active", "approved"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching group feed posts:", error)
    return []
  }

  return (posts || []).map((post: any) => ({
    ...post,
    author: {
      name: resolveAuthorName(post.profiles),
      avatar_url: post.profiles?.avatar_url ?? null,
    },
    profiles: undefined, // Remove the raw profiles object
  }))
}

export async function getGroupFeedReplies(postId: string): Promise<FeedReply[]> {
  const supabase = await createClient()

  const { data: replies, error } = await supabase
    .from("comments")
    .select(`
      id,
      author_id,
      body,
      parent_id,
      status,
      created_at,
      link_url,
      video_url,
      profiles!comments_author_id_fkey (
        full_name,
        first_name,
        display_name,
        avatar_url
      )
    `)
    .eq("parent_id", postId)
    .in("status", ["active", "approved"])
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching group feed replies:", error)
    return []
  }

  return (replies || []).map((reply: any) => ({
    ...reply,
    author: {
      name: resolveAuthorName(reply.profiles),
      avatar_url: reply.profiles?.avatar_url ?? null,
    },
    profiles: undefined,
  }))
}

export async function createGroupFeedPost(
  groupId: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to create a post" }
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)

  console.log("GROUP MEMBERSHIP CHECK:", {
    groupId,
    userId: user.id,
    memberships,
    membershipError,
  })

  if (membershipError) {
    return {
      success: false,
      error: membershipError.message || "Membership lookup failed",
    }
  }

  if (!memberships || memberships.length === 0) {
    return {
      success: false,
      error: "You are not a member of this group",
    }
  }

  const body = formData.get("body") as string
  const imageUrl = formData.get("imageUrl") as string | null
  const documentUrl = formData.get("documentUrl") as string | null
  const documentName = formData.get("documentName") as string | null
  const linkUrl = formData.get("linkUrl") as string | null
  const videoUrl = formData.get("videoUrl") as string | null

  if (!body?.trim()) {
    return { success: false, error: "Post content is required" }
  }

  const { error } = await supabase.from("comments").insert({
    author_id: user.id,
    body: body.trim(),
    image_url: imageUrl || null,
    document_url: documentUrl || null,
    document_name: documentName || null,
    link_url: linkUrl || null,
    video_url: videoUrl || null,
    context_type: "group_feed",
    context_id: groupId,
    context_label: "Group",
    status: "active",
  })

  if (error) {
    console.error("Error creating group feed post:", error)
    return { success: false, error: error.message } // <-- THIS is the key
  }

  revalidatePath(`/members/community/groups/${groupId}`)
  return { success: true }
}

export async function createGroupFeedReply(
  groupId: string,
  parentId: string,
  body: string,
  formData?: FormData,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to reply" }
  }

  if (!body?.trim()) {
    return { success: false, error: "Reply content is required" }
  }

  const videoUrl = formData?.get("videoUrl") as string | null

  const { error } = await supabase.from("comments").insert({
    author_id: user.id,
    parent_id: parentId,
    body: body.trim(),
    context_type: "group_feed",
    context_id: groupId,
    context_label: "Group",
    status: "active",
    video_url: videoUrl || null,
  })

  if (error) {
    console.error("Error creating group feed reply:", error)
    return { success: false, error: "Failed to create reply" }
  }

  revalidatePath(`/members/community/groups/${groupId}`)
  return { success: true }
}

export async function reportGroupFeedItem(
  itemId: string,
  reason: string,
  details?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to report content" }
  }

  // Only update if current status is 'active'
  const { error } = await supabase
    .from("comments")
    .update({
      status: "reported",
      reported_by: user.id,
      reported_at: new Date().toISOString(),
      report_reason: reason,
    })
    .eq("id", itemId)
    .eq("status", "active")

  if (error) {
    console.error("Error reporting group feed item:", error)
    return { success: false, error: "Failed to report content" }
  }

  // Note: We don't have groupId here, but the item will be revalidated when the page is visited
  return { success: true }
}

export async function getGroupFeedVideos(groupId: string): Promise<
  {
    id: string
    body: string
    video_url: string
    author_id: string
    created_at: string
    author: { name: string; avatar_url: string | null }
  }[]
> {
  const supabase = await createClient()

  const { data: videos, error } = await supabase
    .from("comments")
    .select(`
      id,
      body,
      video_url,
      author_id,
      created_at,
      profiles!comments_author_id_fkey (
        full_name,
        first_name,
        display_name,
        avatar_url
      )
    `)
    .eq("context_type", "group_feed")
    .eq("context_id", groupId)
    .not("video_url", "is", null)
    .in("status", ["active", "approved"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching group feed videos:", error)
    return []
  }

  return (videos || []).map((video: any) => ({
    id: video.id,
    body: video.body,
    video_url: video.video_url,
    author_id: video.author_id,
    created_at: video.created_at,
    author: {
      name: resolveAuthorName(video.profiles),
      avatar_url: video.profiles?.avatar_url ?? null,
    },
  }))
}

export async function deleteGroupFeedPost(
  groupId: string,
  postId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to delete a post" }
  }

  // 1. Fetch the post to get author_id
  const { data: post, error: postError } = await supabase.from("comments").select("author_id").eq("id", postId).single()

  if (postError || !post) {
    return { success: false, error: "Post not found" }
  }

  // 2. Check if user is the post author
  const isAuthor = post.author_id === user.id

  // 3. Check if user is group owner
  const { data: groupData } = await supabase.from("groups").select("created_by").eq("id", groupId).single()

  const isGroupOwner = groupData?.created_by === user.id

  // 4. Check if user is a moderator in the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  const isModerator = membership?.role === "moderator"

  // 5. Only allow delete if author, owner, or moderator
  if (!isAuthor && !isGroupOwner && !isModerator) {
    return { success: false, error: "You do not have permission to delete this post" }
  }

  // 6. Soft delete by setting status to 'deleted'
  const { error } = await supabase.from("comments").update({ status: "deleted" }).eq("id", postId)

  if (error) {
    console.error("Error deleting group feed post:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/members/community/groups/${groupId}`)
  return { success: true }
}

export async function curateGroupVideo(
  groupId: string,
  postId: string,
  videoTitle: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to curate videos" }
  }

  // Check if user is group owner
  const { data: groupData } = await supabase.from("groups").select("created_by").eq("id", groupId).single()
  const isGroupOwner = groupData?.created_by === user.id

  // Check if user is a moderator in the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()
  const isModerator = membership?.role === "moderator"

  if (!isGroupOwner && !isModerator) {
    return { success: false, error: "Only group owners and moderators can curate videos" }
  }

  if (!videoTitle?.trim()) {
    return { success: false, error: "Video title is required" }
  }

  const serviceSupabase = createServiceRoleClient()

  // Update the existing comment with video_title and is_featured
  const { error } = await serviceSupabase
    .from("comments")
    .update({
      video_title: videoTitle.trim(),
      is_featured: true,
    })
    .eq("id", postId)
    .eq("context_type", "group_feed")
    .eq("context_id", groupId)

  if (error) {
    console.error("Error curating group video:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/members/community/groups/${groupId}`)
  revalidatePath(`/members/community/groups/${groupId}/library`)
  return { success: true }
}

export async function getCuratedGroupVideos(groupId: string): Promise<
  {
    id: string
    body: string
    video_url: string
    video_title: string
    author_id: string
    created_at: string
    author: { name: string; avatar_url: string | null }
  }[]
> {
  const supabase = await createClient()

  const { data: videos, error } = await supabase
    .from("comments")
    .select(`
      id,
      body,
      video_url,
      video_title,
      author_id,
      created_at,
      profiles!comments_author_id_fkey (
        full_name,
        first_name,
        display_name,
        avatar_url
      )
    `)
    .eq("context_type", "group_feed")
    .eq("context_id", groupId)
    .not("video_url", "is", null)
    .not("video_title", "is", null)
    .eq("is_featured", true)
    .in("status", ["active", "approved"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching curated group videos:", error)
    return []
  }

  return (videos || []).map((video: any) => ({
    id: video.id,
    body: video.body,
    video_url: video.video_url,
    video_title: video.video_title,
    author_id: video.author_id,
    created_at: video.created_at,
    author: {
      name: resolveAuthorName(video.profiles),
      avatar_url: video.profiles?.avatar_url ?? null,
    },
  }))
}

export async function getGroupFeedResources(groupId: string): Promise<
  {
    id: string
    body: string
    image_url: string | null
    document_url: string | null
    document_name: string | null
    link_url: string | null
    author_id: string
    created_at: string
    author: { name: string; avatar_url: string | null }
  }[]
> {
  const supabase = await createClient()

  const { data: resources, error } = await supabase
    .from("comments")
    .select(`
      id,
      author_id,
      body,
      image_url,
      document_url,
      document_name,
      link_url,
      video_url,
      author_id,
      created_at,
      profiles!comments_author_id_fkey (
        full_name,
        first_name,
        display_name,
        avatar_url
      )
    `)
    .eq("context_type", "group_feed")
    .eq("context_id", groupId)
    .in("status", ["active", "approved"])
    .or("image_url.not.is.null,document_url.not.is.null,link_url.not.is.null")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching group feed resources:", error)
    return []
  }

  return (resources || []).map((resource: any) => ({
    id: resource.id,
    body: resource.body,
    image_url: resource.image_url,
    document_url: resource.document_url,
    document_name: resource.document_name,
    link_url: resource.link_url,
    author_id: resource.author_id,
    created_at: resource.created_at,
    author: {
      name: resolveAuthorName(resource.profiles),
      avatar_url: resource.profiles?.avatar_url ?? null,
    },
  }))
}

export async function createGroupEvent(
  groupId: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to create an event" }
  }

  // Check if user is group owner
  const { data: groupData } = await supabase.from("groups").select("created_by").eq("id", groupId).single()
  const isGroupOwner = groupData?.created_by === user.id

  // Check if user is a moderator in the group
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()
  const isModerator = membership?.role === "moderator"

  if (!isGroupOwner && !isModerator) {
    return { success: false, error: "Only group owners and moderators can create events" }
  }

  // Extract form fields (UI-friendly names)
  const name = formData.get("name") as string
  const eventType = formData.get("eventType") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string | null
  const description = formData.get("description") as string | null
  const intention = formData.get("intention") as string | null
  const imageUrl = formData.get("imageUrl") as string | null
  const accessDetails = formData.get("accessDetails") as string | null
  const additionalInfoLink = formData.get("additionalInfoLink") as string | null
  const status = formData.get("status") as string

  // Validate required fields
  if (!name?.trim()) {
    return { success: false, error: "Event name is required" }
  }
  if (!startDate) {
    return { success: false, error: "Start date and time is required" }
  }
  if (!eventType) {
    return { success: false, error: "Event type is required" }
  }

  const payload = {
    group_id: groupId,
    created_by: user.id,
    title: name.trim(), // form "name" -> db "title"
    event_type: eventType,
    start_at: startDate,
    end_at: endDate || null,
    description: description?.trim() || null,
    intention: intention?.trim() || null,
    image_url: imageUrl?.trim() || null,
    access_details: accessDetails?.trim() || null,
    status: status === "published" ? "published" : "draft",
  }

  const { data: eventData, error } = await supabase
    .from("group_events")
    .insert(payload)
    .select("id, title, start_at, end_at, event_type, description")
    .single()

  if (error) {
    console.error("Error creating group event:", error)
    return { success: false, error: error.message }
  }

  if (status === "published" && eventData) {
    const serviceSupabase = createServiceRoleClient()
    const postBody = formatEventPostBody({ ...eventData, name: eventData.title })

    const commentPayload: Record<string, unknown> = {
      author_id: user.id,
      parent_id: null,
      root_id: null,
      context_type: "group_feed",
      context_id: groupId,
      context_label: "Group",
      body: postBody,
      image_url: imageUrl?.trim() || null,
      status: "active",
    }

    if (additionalInfoLink?.trim()) {
      commentPayload.link_url = additionalInfoLink.trim()
    }

    const { error: commentError } = await serviceSupabase.from("comments").insert(commentPayload)

    if (commentError) {
      console.error("EVENT ANNOUNCEMENT INSERT FAILED", commentError)
    }
  }

  revalidatePath(`/members/community/groups/${groupId}`)
  return { success: true }
}

export async function getGroupEvents(
  groupId: string,
  includeAllStatuses = false,
): Promise<
  {
    id: string
    group_id: string
    created_by: string
    title: string
    event_type: string
    start_at: string
    end_at: string | null
    description: string | null
    intention: string | null
    image_url: string | null
    access_details: string | null
    additional_info_link: string | null
    status: string
    created_at: string
  }[]
> {
  const supabase = await createClient()

  let query = supabase.from("group_events").select("*").eq("group_id", groupId).order("start_at", { ascending: true })

  if (!includeAllStatuses) {
    query = query.eq("status", "published")
  }

  const { data: events, error } = await query

  if (error) {
    console.error("Error fetching group events:", error)
    return []
  }

  return events || []
}

export async function updateGroupEvent(
  groupId: string,
  eventId: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to update an event" }
  }

  const { data: groupData } = await supabase.from("groups").select("created_by").eq("id", groupId).single()
  const isGroupOwner = groupData?.created_by === user.id

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()
  const isModerator = membership?.role === "moderator"

  if (!isGroupOwner && !isModerator) {
    return { success: false, error: "Only group owners and moderators can update events" }
  }

  const name = formData.get("name") as string
  const eventType = formData.get("eventType") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string | null
  const description = formData.get("description") as string | null
  const intention = formData.get("intention") as string | null
  const imageUrl = formData.get("imageUrl") as string | null
  const accessDetails = formData.get("accessDetails") as string | null
  const additionalInfoLink = formData.get("additionalInfoLink") as string | null
  const status = formData.get("status") as string | null

  if (!name?.trim()) {
    return { success: false, error: "Event name is required" }
  }
  if (!startDate) {
    return { success: false, error: "Start date and time is required" }
  }
  if (!eventType) {
    return { success: false, error: "Event type is required" }
  }

  const payload: Record<string, any> = {
    title: name.trim(),
    event_type: eventType,
    start_at: startDate,
    end_at: endDate || null,
    description: description?.trim() || null,
    intention: intention?.trim() || null,
    image_url: imageUrl?.trim() || null,
    access_details: accessDetails?.trim() || null,
  }

  if (status) {
    payload.status = status
  }

  const { data: eventData, error } = await supabase
    .from("group_events")
    .update(payload)
    .eq("id", eventId)
    .eq("group_id", groupId)
    .select("id, title, start_at, end_at, event_type, description, status")
    .single()

  if (error) {
    console.error("Error updating group event:", error)
    return { success: false, error: error.message }
  }

  if (eventData && eventData.status === "published") {
    const serviceSupabase = createServiceRoleClient()
    const postBody = formatEventPostBody({ ...eventData, name: eventData.title })

    const commentPayload: Record<string, unknown> = {
      author_id: user.id,
      parent_id: null,
      root_id: null,
      context_type: "group_feed",
      context_id: groupId,
      context_label: "Group",
      body: postBody,
      image_url: imageUrl?.trim() || null,
      status: "active",
    }

    if (additionalInfoLink?.trim()) {
      commentPayload.link_url = additionalInfoLink.trim()
    }

    const { error: commentError } = await serviceSupabase.from("comments").insert(commentPayload)

    if (commentError) {
      console.error("EVENT ANNOUNCEMENT INSERT FAILED", commentError)
    }
  }

  revalidatePath(`/members/community/groups/${groupId}`)
  return { success: true }
}

export async function publishGroupEvent(
  groupId: string,
  eventId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to publish an event" }
  }

  const { data: groupData } = await supabase.from("groups").select("created_by").eq("id", groupId).single()
  const isGroupOwner = groupData?.created_by === user.id

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()
  const isModerator = membership?.role === "moderator"

  if (!isGroupOwner && !isModerator) {
    return { success: false, error: "Only group owners and moderators can publish events" }
  }

  const { error } = await supabase
    .from("group_events")
    .update({ status: "published" })
    .eq("id", eventId)
    .eq("group_id", groupId)

  if (error) {
    console.error("Error publishing group event:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/members/community/groups/${groupId}`)
  return { success: true }
}

export async function deleteGroupEvent(
  groupId: string,
  eventId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to delete an event" }
  }

  const { data: groupData } = await supabase.from("groups").select("created_by").eq("id", groupId).single()
  const isGroupOwner = groupData?.created_by === user.id

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()
  const isModerator = membership?.role === "moderator"

  if (!isGroupOwner && !isModerator) {
    return { success: false, error: "Only group owners and moderators can delete events" }
  }

  const { error } = await supabase.rpc("delete_group_event", {
    p_event_id: eventId,
  })

  if (error) {
    console.error("Error deleting group event:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/members/community/groups/${groupId}`)
  return { success: true }
}

export async function getUpcomingGroupEvents(groupId: string): Promise<
  {
    id: string
    group_id: string
    created_by: string
    title: string
    event_type: string
    start_at: string
    end_at: string | null
    description: string | null
    intention: string | null
    image_url: string | null
    access_details: string | null
    additional_info_link: string | null
    status: string
    created_at: string
  }[]
> {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from("group_events")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(3)

  if (error) {
    console.error("Error fetching upcoming group events:", error)
    return []
  }

  return events || []
}

function formatEventPostBody(event: {
  name: string
  start_at: string
  end_at?: string | null
  event_type: string
  description?: string | null
}): string {
  const startDate = new Date(event.start_at)
  const formattedStart = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  let dateStr = formattedStart
  if (event.end_at) {
    const endDate = new Date(event.end_at)
    const formattedEnd = endDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    dateStr = `${formattedStart} - ${formattedEnd}`
  }

  const eventTypeLabel =
    event.event_type === "in_person" ? "In-Person" : event.event_type === "virtual" ? "Virtual" : "Hybrid"

  let body = `📅 **${event.name}**\n\n`
  body += `🕐 ${dateStr}\n`
  body += `📍 ${eventTypeLabel} Event\n`

  if (event.description) {
    body += `\n${event.description}`
  }

  body += `\n\nView details by clicking the event in the Event Calendar to the right.`

  return body
}
