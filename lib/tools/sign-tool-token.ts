import { createHmac } from "crypto"

export type ToolLaunchTokenPayload = {
  email: string
  name: string
  first_name: string
  last_name: string
  user_id: string
  plan_id: string | null
  plan_name: string
  tool_id: string
  tool_slug: string
  iat: number
  exp: number
}

function base64UrlEncode(value: Buffer | string): string {
  const buffer = typeof value === "string" ? Buffer.from(value, "utf8") : value
  return buffer.toString("base64url")
}

/** Sign a JWT using HS256. */
export function signToolLaunchToken(payload: ToolLaunchTokenPayload, signingSecret: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = base64UrlEncode(JSON.stringify(payload))
  const signature = createHmac("sha256", signingSecret).update(`${header}.${body}`).digest()
  return `${header}.${body}.${base64UrlEncode(signature)}`
}
