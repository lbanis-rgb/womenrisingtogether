import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
