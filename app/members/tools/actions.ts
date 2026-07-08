"use server"

import { createClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"
import { getAccessibleToolIdsForUser, isToolAvailableForUser } from "@/lib/tools/check-tool-access"

function createServiceRoleClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })
}

export interface MemberTool {
  id: string
  name: string
  slug: string
  short_description: string | null
  full_description: string | null
  image_url: string | null
  launch_url: string | null
  isAvailable: boolean
}

export async function getMemberTools(): Promise<MemberTool[]> {
  try {
    const userClient = await createClient()

    const {
      data: { user },
    } = await userClient.auth.getUser()

    if (!user) return []

    const adminClient = createServiceRoleClient()

    const { data: tools, error: toolsError } = await adminClient
      .from("tools")
      .select("id, name, slug, short_description, full_description, image_url, launch_url, plan_only")
      .eq("is_active", true)
      .order("created_at", { ascending: true })

    if (toolsError) {
      console.error("[getMemberTools] Error fetching tools:", toolsError)
      return []
    }

    if (!tools || tools.length === 0) {
      return []
    }

    const accessibleToolIds = await getAccessibleToolIdsForUser(user.id)

    const filteredTools = tools.filter((tool) => {
      const hasAccess = isToolAvailableForUser(accessibleToolIds, tool.id)
      if (tool.plan_only) {
        return hasAccess
      }
      return true
    })

    return filteredTools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      short_description: tool.short_description,
      full_description: tool.full_description,
      image_url: tool.image_url,
      launch_url: tool.launch_url,
      isAvailable: isToolAvailableForUser(accessibleToolIds, tool.id),
    }))
  } catch (error) {
    console.error("[getMemberTools] Unexpected error:", error)
    return []
  }
}
