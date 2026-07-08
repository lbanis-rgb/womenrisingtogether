import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

/** Canonical password reset page — handles PKCE ?code= and hash #access_token recovery links. */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
