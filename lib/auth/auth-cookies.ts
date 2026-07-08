import type { NextRequest, NextResponse } from "next/server"
import { sanitizeNextPath, DEFAULT_MEMBER_DESTINATION } from "./sanitize-next-path"

/** Short-lived cookie holding the post-auth destination (relative path only). */
export const AUTH_NEXT_COOKIE = "auth_next"
export const AUTH_PID_COOKIE = "auth_reg_pid"
export const AUTH_NTP_COOKIE = "auth_reg_ntp"
export const AUTH_COOKIE_MAX_AGE_SECONDS = 600

type AuthFlowCookieOptions = {
  next?: string | null
  pid?: string | null
  ntp?: string | null
}

/** Client-side: set before starting OAuth or password reset. */
export function setAuthFlowCookies(options: AuthFlowCookieOptions): void {
  if (typeof document === "undefined") return

  const secure = window.location.protocol === "https:"
  const suffix = `Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure ? "; Secure" : ""}`

  if (options.next) {
    const safeNext = sanitizeNextPath(options.next)
    document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(safeNext)}; ${suffix}`
  }

  if (options.pid) {
    document.cookie = `${AUTH_PID_COOKIE}=${encodeURIComponent(options.pid)}; ${suffix}`
  }

  if (options.ntp) {
    document.cookie = `${AUTH_NTP_COOKIE}=${encodeURIComponent(options.ntp)}; ${suffix}`
  }
}

export function readAuthNextCookie(request: NextRequest): string {
  const raw = request.cookies.get(AUTH_NEXT_COOKIE)?.value
  if (!raw) return DEFAULT_MEMBER_DESTINATION
  try {
    return sanitizeNextPath(decodeURIComponent(raw))
  } catch {
    return sanitizeNextPath(raw)
  }
}

export function readAuthRegCookie(request: NextRequest, name: typeof AUTH_PID_COOKIE | typeof AUTH_NTP_COOKIE): string | null {
  const raw = request.cookies.get(name)?.value
  if (!raw) return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function clearAuthFlowCookies(response: NextResponse): void {
  for (const name of [AUTH_NEXT_COOKIE, AUTH_PID_COOKIE, AUTH_NTP_COOKIE]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 })
  }
}
