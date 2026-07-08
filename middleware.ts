import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

/**
 * Public auth/recovery routes (never force-redirect away in middleware):
 * /auth/callback, /auth/update-password, /reset-password,
 * /login, /reg, /register, /forgot-password
 *
 * /members/* protection is handled in app/members/layout.tsx.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[middleware] Supabase env vars missing — skipping session refresh.")
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (pathname === "/auth/callback") {
    console.log("[middleware] /auth/callback request — session refresh only, no redirect")
  }

  if (pathname === "/reset-password" || pathname === "/forgot-password") {
    console.log("[middleware] public reset route — no redirect:", pathname)
  }

  if (pathname.startsWith("/members") && !user) {
    console.warn("[middleware] No session on members route:", pathname, {
      cookieNames: request.cookies.getAll().map((c) => c.name),
    })
  }

  if (pathname === "/members/dashboard" && user) {
    console.log("[middleware] Session present on /members/dashboard:", { userId: user.id })
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
