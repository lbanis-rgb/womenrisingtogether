"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/browser"
import { templatePageTitle } from "@/lib/template-page-title"

function parseHashRecovery(): {
  access_token?: string
  refresh_token?: string
  type?: string
} {
  if (typeof window === "undefined") return {}

  const hash = window.location.hash.replace(/^#/, "")
  if (!hash) return {}

  const params = new URLSearchParams(hash)
  return {
    access_token: params.get("access_token") ?? undefined,
    refresh_token: params.get("refresh_token") ?? undefined,
    type: params.get("type") ?? undefined,
  }
}

export function ResetPasswordForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const brandLogoUrl = process.env.NEXT_PUBLIC_BRAND_LOGO_URL

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false)
      return
    }

    let active = true

    ;(async () => {
      const code = searchParams.get("code")
      const tokenHash = searchParams.get("token_hash")
      const recoveryType = searchParams.get("type")
      const hashRecovery = parseHashRecovery()
      const hasHashRecovery =
        !!hashRecovery.access_token &&
        !!hashRecovery.refresh_token &&
        hashRecovery.type === "recovery"

      console.log("[reset-password] recovery link:", {
        hasCode: !!code,
        hasTokenHash: !!tokenHash,
        recoveryType: recoveryType ?? null,
        hasHashRecovery,
        hashType: hashRecovery.type ?? null,
      })

      // Preferred: token_hash recovery (?token_hash=...&type=recovery)
      if (tokenHash && recoveryType === "recovery") {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        })

        if (!active) return

        if (verifyError) {
          console.error("[reset-password] token_hash verifyOtp failed:", verifyError.message)
          setError("This reset link is invalid or has expired. Please request a new password reset link.")
          setCheckingSession(false)
          return
        }

        console.log("[reset-password] token_hash verifyOtp succeeded:", {
          hasSession: !!data.session,
          hasUser: !!data.user,
        })

        const hasSession = !!data.session

        setSessionReady(hasSession)
        setCheckingSession(false)
        setError(
          hasSession
            ? null
            : "Reset link was verified, but no recovery session was created. Please request a new reset link.",
        )

        window.history.replaceState(null, "", window.location.pathname)
        return
      }

      // B) Hash/token recovery format (#access_token=...&type=recovery)
      if (hasHashRecovery) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: hashRecovery.access_token!,
          refresh_token: hashRecovery.refresh_token!,
        })

        if (!active) return

        if (sessionError) {
          console.error("[reset-password] setSession failed:", sessionError.message)
          setError("expired")
          setCheckingSession(false)
          return
        }

        console.log("[reset-password] hash recovery setSession succeeded")
        window.history.replaceState(null, "", window.location.pathname + window.location.search)
      }

      // A) PKCE/code format (?code=...)
      if (code) {
        console.log("[reset-password] attempting code exchange", { hasCode: !!code })

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!active) return

        if (exchangeError) {
          const isCodeVerifierError = exchangeError.message
            .toLowerCase()
            .includes("code verifier")

          console.error("[reset-password] code exchange failed:", {
            message: exchangeError.message,
            name: exchangeError.name,
            status: "status" in exchangeError ? (exchangeError as { status?: number }).status : undefined,
            isCodeVerifierError,
          })

          setError(
            isCodeVerifierError
              ? "This reset link uses an older format and could not be verified. Please request a new reset link."
              : `Reset code exchange failed: ${exchangeError.message}`,
          )
          setCheckingSession(false)
          return
        }

        console.log("[reset-password] code exchange succeeded")

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (!active) return

        console.log("[reset-password] post-exchange session:", {
          hasSession: !!sessionData.session,
          sessionError: sessionError?.message ?? null,
        })

        if (!sessionData.session) {
          setError(
            "Reset link was accepted, but no recovery session was created. Please request a new reset link.",
          )
          setCheckingSession(false)
          return
        }

        router.replace(window.location.pathname)
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!active) return

      const ready = !!session
      setSessionReady(ready)
      setCheckingSession(false)

      console.log("[reset-password] session check:", { sessionReady: ready })

      if (!ready && !code && !hasHashRecovery && !(tokenHash && recoveryType === "recovery")) {
        setError("expired")
      }
    })()

    return () => {
      active = false
    }
  }, [supabase, searchParams, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!supabase) {
      setError("Authentication is unavailable. Please try again later.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      console.error("[reset-password] updateUser failed:", updateError.message)
      if (updateError.message.toLowerCase().includes("auth session missing")) {
        setError("expired")
      } else {
        setError(updateError.message)
      }
      setLoading(false)
      return
    }

    console.log("[reset-password] updateUser succeeded")
    setSuccess(true)
    setTimeout(() => {
      router.push("/login?password_reset=success")
    }, 2000)
  }

  return (
    <>
      <title>{templatePageTitle("Reset Password")}</title>

      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-slate-50">
        <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-lg">
          {brandLogoUrl && (
            <div className="flex justify-center mb-6">
              <Image
                src={brandLogoUrl || "/placeholder.svg"}
                alt="Brand Logo"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
          )}

          <h1 className="text-2xl font-semibold text-[#0a1428]">Choose a new password</h1>
          <p className="mt-1 text-sm text-slate-600">Enter your new password below.</p>

          {checkingSession ? (
            <p className="mt-6 text-sm text-slate-600">Verifying your reset link…</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={!sessionReady || loading}
                    className="block w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-10 text-[15px] outline-none focus:ring-2 focus:ring-[#2f91cf] focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={!sessionReady || loading}
                    className="block w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-10 text-[15px] outline-none focus:ring-2 focus:ring-[#2f91cf] focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !sessionReady}
                className="w-full rounded-xl py-2.5 font-medium bg-[#2f91cf] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}

          {success && (
            <div
              role="status"
              className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800"
            >
              Password updated successfully! Redirecting to login…
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
            >
              {error === "expired" ? (
                <>
                  Reset time has expired. Try again by going back to{" "}
                  <Link href="/forgot-password" className="underline font-medium">
                    Forgot Password
                  </Link>
                  .
                </>
              ) : (
                error
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
