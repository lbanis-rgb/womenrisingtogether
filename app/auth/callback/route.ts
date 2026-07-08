import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getRequestOrigin } from "@/lib/auth/get-request-origin"
import { sanitizeNextPath } from "@/lib/auth/sanitize-next-path"
import {
  readAuthNextCookie,
  readAuthRegCookie,
  clearAuthFlowCookies,
  AUTH_NEXT_COOKIE,
  AUTH_PID_COOKIE,
  AUTH_NTP_COOKIE,
} from "@/lib/auth/auth-cookies"
import { createRouteHandlerClient, copyResponseCookies } from "@/lib/auth/create-route-handler-client"
import { ensureOAuthUserProfile } from "@/lib/auth/ensure-oauth-profile"

async function triggerGHLWebhookIfNewUser(
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  serviceClient: SupabaseClient,
) {
  let profile = null

  for (let i = 0; i < 5; i++) {
    const { data } = await serviceClient
      .from("profiles")
      .select("plan_id, created_at")
      .eq("id", user.id)
      .single()

    if (data) {
      profile = data
      break
    }

    await new Promise((res) => setTimeout(res, 500))
  }

  if (!profile?.plan_id || !profile?.created_at) {
    console.log("[auth/callback] GHL: profile not ready, skipping webhook")
    return
  }

  const createdAt = new Date(profile.created_at).getTime()
  const isNewUser = Date.now() - createdAt < 15 * 60 * 1000

  if (!isNewUser) return

  const { data: plan } = await serviceClient
    .from("plans")
    .select("ghl_webhook_url")
    .eq("id", profile.plan_id)
    .single()

  const webhookUrl = plan?.ghl_webhook_url
  if (!webhookUrl) return

  const metadata = user.user_metadata || {}
  const fullName = (metadata.full_name as string) || (metadata.name as string) || ""
  const nameParts = fullName.split(" ")

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      first_name: (metadata.first_name as string) || (metadata.given_name as string) || nameParts[0] || "",
      last_name: (metadata.last_name as string) || (metadata.family_name as string) || nameParts.slice(1).join(" ") || "",
    }),
  })

  console.log("[auth/callback] GHL webhook sent")
}

export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request)
  const { searchParams } = request.nextUrl
  const debug = searchParams.get("debug") === "1"

  const code = searchParams.get("code")
  const oauthError = searchParams.get("error")
  const oauthErrorDescription = searchParams.get("error_description")

  const rawAuthNextCookie = request.cookies.get(AUTH_NEXT_COOKIE)?.value ?? null
  const legacyNextQuery = searchParams.get("next")
  const nextPath = legacyNextQuery
    ? sanitizeNextPath(legacyNextQuery)
    : readAuthNextCookie(request)

  const pid = searchParams.get("pid") ?? readAuthRegCookie(request, AUTH_PID_COOKIE)
  const ntp = searchParams.get("ntp") ?? readAuthRegCookie(request, AUTH_NTP_COOKIE)

  console.log("[auth/callback]", {
    hasCode: !!code,
    origin,
    rawAuthNextCookie,
    legacyNextQuery,
    nextPath,
    pid: pid ?? null,
    ntp: ntp ?? null,
    oauthError: oauthError ?? null,
    debug,
  })

  if (oauthError) {
    console.error("[auth/callback] OAuth provider error:", oauthError, oauthErrorDescription ?? "")
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  if (!code) {
    console.warn("[auth/callback] Missing authorization code — Supabase may have rejected redirectTo or used Site URL")
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  // Exchange code and attach session cookies to this response.
  const sessionRedirect = NextResponse.redirect(`${origin}${nextPath}`)
  const supabase = createRouteHandlerClient(request, sessionRedirect)

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error("[auth/callback] exchangeCodeForSession failed:", exchangeError.message)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const sessionCookieNames = sessionRedirect.cookies.getAll().map((c) => c.name)

  console.log("[auth/callback] after exchange:", {
    exchangeOk: true,
    userId: user?.id ?? null,
    sessionCookieCount: sessionCookieNames.length,
    sessionCookieNames,
    nextPath,
  })

  if (!user) {
    console.warn("[auth/callback] No user after code exchange — session cookies may not have been set")
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const serviceClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  )

  const planToAssign = pid ?? null
  await ensureOAuthUserProfile(user, serviceClient, planToAssign)

  let finalRedirectUrl = `${origin}${nextPath}`

  // NTP FLOW (Temporary Plan → Stripe → Return to Login)
  if (ntp && pid) {
    await serviceClient.from("profiles").update({ plan_id: ntp }).eq("id", user.id)
    await triggerGHLWebhookIfNewUser(user, serviceClient)

    const { data: plan } = await serviceClient
      .from("plans")
      .select("stripe_payment_link")
      .eq("id", pid)
      .single()

    if (plan?.stripe_payment_link) {
      finalRedirectUrl = plan.stripe_payment_link
      console.log("[auth/callback] Redirecting to Stripe payment link")
    }
  } else if (pid) {
    await serviceClient.from("profiles").update({ plan_id: pid }).eq("id", user.id)
    await triggerGHLWebhookIfNewUser(user, serviceClient)
  } else {
    await triggerGHLWebhookIfNewUser(user, serviceClient)
  }

  let finalResponse = NextResponse.redirect(finalRedirectUrl)
  copyResponseCookies(sessionRedirect, finalResponse)
  clearAuthFlowCookies(finalResponse)

  console.log("[auth/callback] success:", {
    userId: user.id,
    finalRedirectUrl,
    rawAuthNextCookie,
    nextPath,
  })

  if (debug) {
    finalResponse.headers.set(
      "X-Auth-Debug",
      JSON.stringify({
        userId: user.id,
        nextPath,
        sessionCookieCount: sessionCookieNames.length,
      }),
    )
  }

  return finalResponse
}
