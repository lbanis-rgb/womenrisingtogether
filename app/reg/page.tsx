import { createClient } from "@/lib/supabase/server"
import RegForm from "./reg-form"

export default async function RegPage() {
  const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL || null
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL || null

  const supabase = await createClient()
  const { data: settings } = await supabase
    .from("site_settings")
    .select("enable_google_auth, dashboard_settings")
    .eq("id", 1)
    .single()

  const enableGoogleAuth = settings?.enable_google_auth ?? false

  const dashboard = (settings?.dashboard_settings as Record<string, unknown>) || {}
  const enableRecaptcha = dashboard?.enable_recaptcha === true

  return (
    <>
      <title>Register | My JV Manager</title>
      <RegForm
        termsUrl={termsUrl}
        privacyUrl={privacyUrl}
        enableGoogleAuth={enableGoogleAuth}
        enableRecaptcha={enableRecaptcha}
      />
    </>
  )
}
