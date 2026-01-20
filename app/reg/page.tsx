import RegForm from "./reg-form"

export default function RegPage() {
  const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL || null
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL || null

  return (
    <>
      <title>Register | My JV Manager</title>
      <RegForm termsUrl={termsUrl} privacyUrl={privacyUrl} />
    </>
  )
}
