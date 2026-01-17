"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { FeedPost, FeedReply } from "@/lib/types/community"

export async function getFeedPosts(): Promise<FeedPost[]> {
  const supabase = await createClient()

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
      video_title,
      context_type,
      context_label,
      parent_id,
      status,
      created_at,
      profiles!comments_author_id_fkey (
        display_name,
        avatar_url
      )
    `)
    .eq("context_type", "member_feed")
    .is("parent_id", null)
    .in("status", ["active", "approved"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching feed posts:", error)
    return []
  }

  // Map the joined profiles data
  return (posts || []).map((post: any) => ({
    ...post,
    author: post.profiles
      ? {
          display_name: post.profiles.display_name || "Unknown User",
          avatar_url: post.profiles.avatar_url,
        }
      : undefined,
    profiles: undefined, // Remove the raw profiles object
  }))
}

export async function getFeedReplies(postId: string): Promise<FeedReply[]> {
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
      profiles!comments_author_id_fkey (
        display_name,
        avatar_url
      )
    `)
    .eq("parent_id", postId)
    .in("status", ["active", "approved"])
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching replies:", error)
    return []
  }

  return (replies || []).map((reply: any) => ({
    ...reply,
    author: reply.profiles
      ? {
          display_name: reply.profiles.display_name || "Unknown User",
          avatar_url: reply.profiles.avatar_url,
        }
      : undefined,
    profiles: undefined,
  }))
}

export async function createFeedPost(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to create a post" }
  }

  const body = formData.get("body") as string
  const imageUrl = formData.get("imageUrl") as string | null
  const documentUrl = formData.get("documentUrl") as string | null
  const documentName = formData.get("documentName") as string | null
  const linkUrl = formData.get("linkUrl") as string | null
  const videoUrl = formData.get("videoUrl") as string | null
  const videoTitle = formData.get("videoTitle") as string | null

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
    video_title: videoTitle || null,
    context_type: "member_feed",
    context_label: "Member Feed",
    status: "active",
  })

  if (error) {
    console.error("Error creating post:", error)
    return { success: false, error: "Failed to create post" }
  }

  revalidatePath("/members/community")
  return { success: true }
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

  // Accept both field names defensively
  const body = (formData.get("body") as string) || (formData.get("content") as string) || ""

  const imageUrl = formData.get("imageUrl") as string | null
  const documentUrl = formData.get("documentUrl") as string | null
  const documentName = formData.get("documentName") as string | null
  const linkUrl = formData.get("linkUrl") as string | null

  if (!body.trim()) {
    return { success: false, error: "Post content is required" }
  }

  // Membership check
  const { data: membership } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { success: false, error: "You are not a member of this group" }
  }

  const { error } = await supabase.from("comments").insert({
    author_id: user.id,
    body: body.trim(),
    image_url: imageUrl || null,
    document_url: documentUrl || null,
    document_name: documentName || null,
    link_url: linkUrl || null,
    context_type: "group_feed",
    context_id: groupId,
    context_label: "Group",
    status: "active",
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/members/community/groups/${groupId}`)
  return { success: true }
}

export async function createFeedReply(parentId: string, body: string): Promise<{ success: boolean; error?: string }> {
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

  const { error } = await supabase.from("comments").insert({
    author_id: user.id,
    parent_id: parentId,
    body: body.trim(),
    context_type: "member_feed",
    context_label: "Member Feed",
    status: "active",
  })

  if (error) {
    console.error("Error creating reply:", error)
    return { success: false, error: "Failed to create reply" }
  }

  revalidatePath("/members/community")
  return { success: true }
}

export async function reportFeedItem(
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
    console.error("Error reporting item:", error)
    return { success: false, error: "Failed to report content" }
  }

  revalidatePath("/members/community")
  return { success: true }
}

// Fetch community guidelines (placeholder for now)
export async function getGuidelines(): Promise<string> {
  // For now, return placeholder content - will be wired to admin later
  return "Be respectful to other members, avoid spam, and keep discussions constructive. Violations may result in content removal or account suspension."
}

export async function updateFeedComment(
  commentId: string,
  body: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to edit a comment" }
  }

  if (!body?.trim()) {
    return { success: false, error: "Comment content is required" }
  }

  // Verify the comment exists and user owns it
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("author_id, context_type, context_id")
    .eq("id", commentId)
    .single()

  if (fetchError || !comment) {
    return { success: false, error: "Comment not found" }
  }

  if (comment.author_id !== user.id) {
    return { success: false, error: "You can only edit your own comments" }
  }

  // Update only the body field
  const { error: updateError } = await supabase.from("comments").update({ body: body.trim() }).eq("id", commentId)

  if (updateError) {
    console.error("Error updating comment:", updateError)
    return { success: false, error: "Failed to update comment" }
  }

  // Revalidate based on context type
  if (comment.context_type === "member_feed") {
    revalidatePath("/members/community")
  } else if (comment.context_type === "group_feed" && comment.context_id) {
    revalidatePath(`/members/community/groups/${comment.context_id}`)
  }

  return { success: true }
}

export async function deleteFeedComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "You must be logged in to delete a comment" }
  }

  // Verify the comment exists and user owns it
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("author_id, context_type, context_id")
    .eq("id", commentId)
    .single()

  if (fetchError || !comment) {
    return { success: false, error: "Comment not found" }
  }

  if (comment.author_id !== user.id) {
    return { success: false, error: "You can only delete your own comments" }
  }

  // Hard delete the comment
  const { error: deleteError } = await supabase.from("comments").delete().eq("id", commentId)

  if (deleteError) {
    console.error("Error deleting comment:", deleteError)
    return { success: false, error: "Failed to delete comment" }
  }

  // Revalidate based on context type
  if (comment.context_type === "member_feed") {
    revalidatePath("/members/community")
  } else if (comment.context_type === "group_feed" && comment.context_id) {
    revalidatePath(`/members/community/groups/${comment.context_id}`)
  }

  return { success: true }
}
