import { createServerClient } from "@supabase/ssr"

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

export async function getAccessibleToolIdsForUser(userId: string): Promise<Set<string>> {
  const adminClient = createServiceRoleClient()

  const { data: profile } = await adminClient.from("profiles").select("plan_id").eq("id", userId).single()

  if (!profile?.plan_id) {
    return new Set()
  }

  const { data: toolAccess } = await adminClient
    .from("tool_plan_access")
    .select("tool_id")
    .eq("plan_id", profile.plan_id)

  if (!toolAccess || toolAccess.length === 0) {
    return new Set()
  }

  return new Set(toolAccess.map((row) => row.tool_id))
}

export async function userHasToolAccess(userId: string, toolId: string): Promise<boolean> {
  const accessibleToolIds = await getAccessibleToolIdsForUser(userId)
  return accessibleToolIds.has(toolId)
}

export function isToolAvailableForUser(accessibleToolIds: Set<string>, toolId: string): boolean {
  return accessibleToolIds.has(toolId)
}
