"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Start or get an existing conversation with another user
 */
export async function startConversation(otherUserId: string): Promise<{ conversationId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`,
    )
    .maybeSingle()

  if (existing) return { conversationId: existing.id }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      created_by: user.id,
      participant_one: user.id,
      participant_two: otherUserId,
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) throw error
  return { conversationId: data.id }
}

/**
 * Get all conversations for the current user
 */
export async function getConversations() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      "id, participant_one, participant_two, last_message_at, participant_one_last_read_at, participant_two_last_read_at",
    )
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
    .order("last_message_at", { ascending: false })

  if (!conversations || conversations.length === 0) return []

  const otherUserIds = conversations.map((c) => (c.participant_one === user.id ? c.participant_two : c.participant_one))

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", otherUserIds)

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? [])

  const conversationIds = conversations.map((c) => c.id)
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      conversation_id,
      body,
      created_at,
      sender_id,
      sender_profile:profiles!messages_sender_id_fkey (
        id,
        full_name,
        display_name,
        username,
        avatar_url
      )
    `)
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })

  const latestMessageMap = new Map<string, string>()
  const latestSenderNameMap = new Map<string, string>()
  const latestSenderAvatarMap = new Map<string, string | null>()

  for (const msg of messages ?? []) {
    if (!latestMessageMap.has(msg.conversation_id)) {
      latestMessageMap.set(msg.conversation_id, msg.body)
      const profile = msg.sender_profile as {
        full_name?: string | null
        display_name?: string | null
        username?: string | null
        avatar_url?: string | null
      } | null
      const senderName = profile?.full_name || profile?.display_name || profile?.username || "Unknown User"
      latestSenderNameMap.set(msg.conversation_id, senderName)
      latestSenderAvatarMap.set(msg.conversation_id, profile?.avatar_url ?? null)
    }
  }

  return conversations.map((c) => {
    const isParticipantOne = c.participant_one === user.id
    const otherUserId = isParticipantOne ? c.participant_two : c.participant_one
    const profile = profileMap.get(otherUserId)

    const myLastReadAt = isParticipantOne ? c.participant_one_last_read_at : c.participant_two_last_read_at

    const isUnread = c.last_message_at && (!myLastReadAt || new Date(c.last_message_at) > new Date(myLastReadAt))

    return {
      id: c.id,
      participant_one: c.participant_one,
      participant_two: c.participant_two,
      last_message_at: c.last_message_at,
      participant_one_last_read_at: c.participant_one_last_read_at,
      participant_two_last_read_at: c.participant_two_last_read_at,
      other_user_id: otherUserId,
      other_user_name: profile?.full_name ?? "Unknown User",
      other_user_username: profile?.username ?? null,
      other_user_avatar_url: profile?.avatar_url ?? null,
      latest_message_body: latestMessageMap.get(c.id) ?? null,
      latest_message_sender_name: latestSenderNameMap.get(c.id) ?? null,
      latest_message_sender_avatar_url: latestSenderAvatarMap.get(c.id) ?? null,
      is_unread: !!isUnread,
    }
  })
}

/**
 * Get all messages for a conversation
 */
export async function getConversationMessages(conversationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: messages } = await supabase
    .from("messages")
    .select(`
      id,
      body,
      sender_id,
      created_at,
      profiles:profiles!messages_sender_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (!messages) return []

  return messages.map((m: any) => ({
    id: m.id,
    body: m.body,
    sender_id: m.sender_id,
    sender_name: m.profiles?.full_name ?? null,
    sender_avatar_url: m.profiles?.avatar_url ?? null,
    created_at: m.created_at,
  }))
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId: string, body: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  })

  const { data: convo } = await supabase
    .from("conversations")
    .select("participant_one, participant_two")
    .eq("id", conversationId)
    .single()

  const now = new Date().toISOString()
  const update =
    convo?.participant_one === user.id ? { participant_one_last_read_at: now } : { participant_two_last_read_at: now }

  await supabase
    .from("conversations")
    .update({ ...update, last_message_at: now, updated_at: now })
    .eq("id", conversationId)
}

/**
 * Mark a conversation as read for current user
 */
export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: convo } = await supabase
    .from("conversations")
    .select("participant_one, participant_two")
    .eq("id", conversationId)
    .single()

  const now = new Date().toISOString()
  const update =
    convo?.participant_one === user.id ? { participant_one_last_read_at: now } : { participant_two_last_read_at: now }

  await supabase.from("conversations").update(update).eq("id", conversationId)
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase.from("conversations").delete().eq("id", conversationId)
}
