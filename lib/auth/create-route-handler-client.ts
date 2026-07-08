import { createServerClient } from "@supabase/ssr"
import type { NextRequest, NextResponse } from "next/server"

/**
 * Supabase client for Route Handlers — session cookies are written onto the
 * NextResponse returned to the browser (required for exchangeCodeForSession).
 */
export function createRouteHandlerClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )
}

/** Copy Supabase auth cookies from one redirect response to another. */
export function copyResponseCookies(from: NextResponse, to: NextResponse): void {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie)
  })
}
