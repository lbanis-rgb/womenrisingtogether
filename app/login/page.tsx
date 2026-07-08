import LoginForm from "./login-form"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"

export default async function LoginPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from("site_settings")
    .select("enable_google_auth")
    .eq("id", 1)
    .single()

  const enableGoogleAuth = settings?.enable_google_auth ?? false

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginForm enableGoogleAuth={enableGoogleAuth} />
    </Suspense>
  )
}
