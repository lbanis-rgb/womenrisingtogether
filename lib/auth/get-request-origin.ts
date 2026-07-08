/**
 * Resolve the public site origin from an incoming request.
 * Works on Vercel, custom domains, and local dev (via x-forwarded-* headers).
 */
export function getRequestOrigin(request: Request): string {
  const url = new URL(request.url)

  const forwardedHost = request.headers.get("x-forwarded-host")
  const host = (forwardedHost ?? request.headers.get("host") ?? url.host).split(",")[0]?.trim()

  const forwardedProto = request.headers.get("x-forwarded-proto")
  const protocol = (forwardedProto ?? url.protocol.replace(":", "") ?? "https").split(",")[0]?.trim()

  if (!host) {
    return url.origin
  }

  return `${protocol}://${host}`
}
