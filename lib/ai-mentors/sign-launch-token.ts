import { createHmac } from "crypto"

export type AiMentorLaunchPayload = {
  site_key: string
  external_user_id: string
  email: string
  name: string
  plan_ids: string[]
  iat: number
  exp: number
}

function base64UrlEncode(value: Buffer | string): string {
  const buffer = typeof value === "string" ? Buffer.from(value, "utf8") : value
  return buffer.toString("base64url")
}

export function signAiMentorLaunchToken(payload: AiMentorLaunchPayload, signingSecret: string): string {
  const payloadJson = JSON.stringify(payload)
  const payloadBase64Url = base64UrlEncode(payloadJson)
  const signature = createHmac("sha256", signingSecret).update(payloadBase64Url).digest()
  const signatureBase64Url = base64UrlEncode(signature)
  return `${payloadBase64Url}.${signatureBase64Url}`
}
