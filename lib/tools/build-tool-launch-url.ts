const TOKEN_PLACEHOLDER = "{token}"
const SOURCE_PLACEHOLDER = "{source}"

export function launchUrlHasTokenPlaceholder(launchUrl: string | null | undefined): boolean {
  if (!launchUrl) return false
  return launchUrl.includes(TOKEN_PLACEHOLDER)
}

export function buildNormalToolLaunchUrl(launchUrl: string): string {
  return launchUrl.trim()
}

export function buildTokenizedToolLaunchUrl(launchUrl: string, signedToken: string): string {
  const encodedToken = encodeURIComponent(signedToken)
  let destination = launchUrl.split(TOKEN_PLACEHOLDER).join(encodedToken)

  if (destination.includes(SOURCE_PLACEHOLDER)) {
    destination = destination.split(SOURCE_PLACEHOLDER).join("actionera")
  }

  return destination
}

export function getLaunchDestinationHost(destination: string): string | null {
  try {
    return new URL(destination).host
  } catch {
    return null
  }
}
