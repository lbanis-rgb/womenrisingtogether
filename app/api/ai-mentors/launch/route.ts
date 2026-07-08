import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@/lib/supabase/server"
import { getAiMentorModuleCredentials, getAiMentorModuleUrl } from "@/lib/ai-mentors/config"
import { getUserPlanIds } from "@/lib/ai-mentors/get-user-plan-ids"
import { signAiMentorLaunchToken } from "@/lib/ai-mentors/sign-launch-token"

function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  )
}

function resolveDisplayName(profile: {
  full_name?: string | null
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string | null
} | null, fallbackEmail?: string | null): string {
  const candidates = [
    profile?.full_name,
    profile?.display_name,
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || null,
    profile?.email,
    fallbackEmail,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim()
    }
  }

  return "Member"
}

export async function POST() {
  try {
    const credentials = getAiMentorModuleCredentials()
    if (!credentials) {
      return NextResponse.json({ error: "AI Mentor Module is not configured." }, { status: 503 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminClient = createServiceRoleClient()

    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, display_name, first_name, last_name, email")
      .eq("id", user.id)
      .maybeSingle()

    const planIds = await getUserPlanIds(adminClient, user.id)
    if (planIds.length === 0) {
      return NextResponse.json({ error: "No membership plan found." }, { status: 400 })
    }

    const now = Math.floor(Date.now() / 1000)
    // The token is intentionally valid for 2 hours so members can keep the library modal open while browsing and launching mentors.
    const tokenLifetimeSeconds = 60 * 60 * 2
    const payload = {
      site_key: credentials.siteKey,
      external_user_id: user.id,
      email: user.email || profile?.email || "",
      name: resolveDisplayName(profile, user.email),
      plan_ids: planIds,
      iat: now,
      exp: now + tokenLifetimeSeconds,
    }

    const token = signAiMentorLaunchToken(payload, credentials.signingSecret)
    const moduleUrl = getAiMentorModuleUrl()
    const launchUrl = `${moduleUrl}/embed/community?token=${token}`

    return NextResponse.json({ launchUrl })
  } catch {
    return NextResponse.json({ error: "Launch failed" }, { status: 500 })
  }
}
