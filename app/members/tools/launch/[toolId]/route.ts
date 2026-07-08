import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@/lib/supabase/server"
import {
  buildNormalToolLaunchUrl,
  buildTokenizedToolLaunchUrl,
  getLaunchDestinationHost,
  launchUrlHasTokenPlaceholder,
} from "@/lib/tools/build-tool-launch-url"
import { userHasToolAccess } from "@/lib/tools/check-tool-access"
import { signToolLaunchToken, type ToolLaunchTokenPayload } from "@/lib/tools/sign-tool-token"

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

function resolveName(
  profile: {
    full_name?: string | null
    first_name?: string | null
    last_name?: string | null
  } | null,
  userMetadata: Record<string, unknown> | undefined,
  fallbackEmail?: string | null,
): string {
  const candidates = [
    profile?.full_name,
    userMetadata?.full_name,
    userMetadata?.name,
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || null,
    fallbackEmail,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim()
    }
  }

  return ""
}

function resolveFirstName(
  profile: { first_name?: string | null } | null,
  userMetadata: Record<string, unknown> | undefined,
): string {
  const candidates = [profile?.first_name, userMetadata?.first_name, userMetadata?.given_name]
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim()
    }
  }
  return ""
}

function resolveLastName(
  profile: { last_name?: string | null } | null,
  userMetadata: Record<string, unknown> | undefined,
): string {
  const candidates = [profile?.last_name, userMetadata?.last_name, userMetadata?.family_name]
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim()
    }
  }
  return ""
}

function logToolLaunch(details: {
  toolId: string
  userId: string
  accessGranted: boolean
  launchUrlHasTokenPlaceholder: boolean
  hasTokenSecret: boolean
  tokenLaunchUsed: boolean
  destinationHost: string | null
}) {
  console.info("[tool-launch]", details)
}

export async function GET(
  request: Request,
  context: { params: Promise<{ toolId: string }> },
) {
  const { toolId } = await context.params
  const requestUrl = new URL(request.url)
  const toolsPageUrl = new URL("/members/tools", requestUrl.origin)

  if (!toolId?.trim()) {
    toolsPageUrl.searchParams.set("error", "tool_launch_failed")
    return NextResponse.redirect(toolsPageUrl)
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    const loginUrl = new URL("/login", toolsPageUrl.origin)
    loginUrl.searchParams.set("redirectTo", "/members/tools")
    return NextResponse.redirect(loginUrl)
  }

  const adminClient = createServiceRoleClient()

  const { data: tool, error: toolError } = await adminClient
    .from("tools")
    .select("id, name, slug, launch_url, is_active")
    .eq("id", toolId)
    .maybeSingle()

  if (toolError || !tool || tool.is_active !== true) {
    toolsPageUrl.searchParams.set("error", "tool_unavailable")
    return NextResponse.redirect(toolsPageUrl)
  }

  const launchUrl = tool.launch_url?.trim()
  if (!launchUrl) {
    toolsPageUrl.searchParams.set("error", "tool_missing_launch_url")
    return NextResponse.redirect(toolsPageUrl)
  }

  const hasAccess = await userHasToolAccess(user.id, tool.id)
  const hasTokenSecret = Boolean(process.env.TOOLS_TOKEN_SECRET?.trim())
  const shouldUseToken = launchUrlHasTokenPlaceholder(launchUrl)

  if (!hasAccess) {
    logToolLaunch({
      toolId: tool.id,
      userId: user.id,
      accessGranted: false,
      launchUrlHasTokenPlaceholder: shouldUseToken,
      hasTokenSecret,
      tokenLaunchUsed: false,
      destinationHost: null,
    })
    toolsPageUrl.searchParams.set("upgrade", "required")
    return NextResponse.redirect(toolsPageUrl)
  }

  if (shouldUseToken && !hasTokenSecret) {
    console.warn("[tool-launch] launch_url requires token but TOOLS_TOKEN_SECRET is missing", {
      toolId: tool.id,
      userId: user.id,
    })
    toolsPageUrl.searchParams.set("error", "token_secret_missing")
    return NextResponse.redirect(toolsPageUrl)
  }

  try {
    if (shouldUseToken) {
      const signingSecret = process.env.TOOLS_TOKEN_SECRET!.trim()

      const { data: profile } = await adminClient
        .from("profiles")
        .select("id, full_name, first_name, last_name, plan_id, email")
        .eq("id", user.id)
        .maybeSingle()

      let planName = ""
      if (profile?.plan_id) {
        const { data: plan } = await adminClient
          .from("plans")
          .select("id, name")
          .eq("id", profile.plan_id)
          .maybeSingle()
        planName = plan?.name ?? ""
      }

      const userMetadata = (user.user_metadata ?? {}) as Record<string, unknown>
      const now = Math.floor(Date.now() / 1000)
      const payload: ToolLaunchTokenPayload = {
        email: user.email || profile?.email || "",
        name: resolveName(profile, userMetadata, user.email),
        first_name: resolveFirstName(profile, userMetadata),
        last_name: resolveLastName(profile, userMetadata),
        user_id: user.id,
        plan_id: profile?.plan_id ?? null,
        plan_name: planName,
        tool_id: tool.id,
        tool_slug: tool.slug,
        iat: now,
        exp: now + 600,
      }

      const signedToken = signToolLaunchToken(payload, signingSecret)
      const destination = buildTokenizedToolLaunchUrl(launchUrl, signedToken)
      const destinationHost = getLaunchDestinationHost(destination)

      logToolLaunch({
        toolId: tool.id,
        userId: user.id,
        accessGranted: true,
        launchUrlHasTokenPlaceholder: true,
        hasTokenSecret: true,
        tokenLaunchUsed: true,
        destinationHost,
      })

      return NextResponse.redirect(destination)
    }

    const destination = buildNormalToolLaunchUrl(launchUrl)
    const destinationHost = getLaunchDestinationHost(destination)

    logToolLaunch({
      toolId: tool.id,
      userId: user.id,
      accessGranted: true,
      launchUrlHasTokenPlaceholder: false,
      hasTokenSecret,
      tokenLaunchUsed: false,
      destinationHost,
    })

    return NextResponse.redirect(destination)
  } catch (error) {
    console.error("[tool-launch] Failed to build launch URL", {
      toolId: tool.id,
      userId: user.id,
      error: error instanceof Error ? error.message : "unknown",
    })
    toolsPageUrl.searchParams.set("error", "tool_launch_failed")
    return NextResponse.redirect(toolsPageUrl)
  }
}
