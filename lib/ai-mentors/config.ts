const DEFAULT_MODULE_URL = "https://www.aimentormodule.com"

export function getAiMentorModuleUrl(): string {
  return process.env.AI_MENTOR_MODULE_URL?.trim() || DEFAULT_MODULE_URL
}

export function isAiMentorModuleConfigured(): boolean {
  const siteKey = process.env.AI_MENTOR_MODULE_SITE_KEY?.trim()
  const signingSecret = process.env.AI_MENTOR_MODULE_SIGNING_SECRET?.trim()
  return Boolean(siteKey && signingSecret)
}

export function getAiMentorModuleCredentials():
  | { siteKey: string; signingSecret: string }
  | null {
  const siteKey = process.env.AI_MENTOR_MODULE_SITE_KEY?.trim()
  const signingSecret = process.env.AI_MENTOR_MODULE_SIGNING_SECRET?.trim()

  if (!siteKey || !signingSecret) {
    return null
  }

  return { siteKey, signingSecret }
}
