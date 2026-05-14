"use server"

import { createClient } from "@/lib/supabase/server"

type GetDirectoryMembersInput = {
  page?: number
  pageSize?: number
  name?: string
  city?: string
  country?: string
}

/** Escape `%`, `_`, and `\` for use inside Postgres ILIKE patterns. */
function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

/**
 * PostgREST `.or()` splits on commas — strip/replace commas in user input so the filter string stays valid.
 */
function sanitizeForPostgrestOr(value: string): string {
  return escapeIlikePattern(value).replace(/,/g, " ").trim()
}

function normalizeSocial(raw: unknown): {
  linkedin: string | null
  youtube: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  twitter: string | null
  x: string | null
  website: string | null
} {
  const defaults = {
    linkedin: null,
    youtube: null,
    instagram: null,
    facebook: null,
    tiktok: null,
    twitter: null,
    x: null,
    website: null,
  }

  if (!raw || typeof raw !== "object") return defaults

  if (Array.isArray(raw)) {
    const result = { ...defaults }
    for (const item of raw) {
      if (item && typeof item === "object" && typeof item.platform === "string" && typeof item.url === "string") {
        const key = item.platform.toLowerCase() as keyof typeof defaults
        if (key in result) {
          result[key] = item.url
        }
      }
    }
    return result
  }

  const obj = raw as Record<string, unknown>
  return {
    linkedin: typeof obj.linkedin === "string" ? obj.linkedin : null,
    youtube: typeof obj.youtube === "string" ? obj.youtube : null,
    instagram: typeof obj.instagram === "string" ? obj.instagram : null,
    facebook: typeof obj.facebook === "string" ? obj.facebook : null,
    tiktok: typeof obj.tiktok === "string" ? obj.tiktok : null,
    twitter: typeof obj.twitter === "string" ? obj.twitter : null,
    x: typeof obj.x === "string" ? obj.x : null,
    website: typeof obj.website === "string" ? obj.website : null,
  }
}

type ProfileRow = {
  id: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  display_name: string | null
  avatar_url: string | null
  company: string | null
  job_title: string | null
  bio: string | null
  city: string | null
  country: string | null
  social_links: unknown
}

function resolveMemberDisplayName(profile: ProfileRow | null): string | null {
  if (!profile) return null
  const dn = profile.display_name?.trim()
  if (dn) return dn
  const fn = profile.full_name?.trim()
  if (fn) return fn
  const parts = [profile.first_name, profile.last_name].filter((s) => s != null && String(s).trim() !== "")
  if (parts.length > 0) return parts.map((s) => String(s).trim()).join(" ")
  return null
}

export async function getDirectoryMembers(input: GetDirectoryMembersInput = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { members: [], totalCount: 0, error: "You must be signed in to view the directory." }
  }

  const page = Math.max(1, input.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20))
  const nameFilter = (input.name ?? "").trim()
  const cityFilter = (input.city ?? "").trim()
  const countryFilter = (input.country ?? "").trim()

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from("directory_members").select(
    `
      user_id,
      created_at,
      profiles!inner (
        id,
        full_name,
        first_name,
        last_name,
        display_name,
        avatar_url,
        company,
        job_title,
        bio,
        city,
        country,
        social_links
      )
    `,
    { count: "exact" },
  )

  if (nameFilter.length > 0) {
    const safe = sanitizeForPostgrestOr(nameFilter)
    if (safe.length > 0) {
      const pattern = `%${safe}%`
      query = query.or(
        `full_name.ilike.${pattern},display_name.ilike.${pattern},first_name.ilike.${pattern},last_name.ilike.${pattern},company.ilike.${pattern}`,
        { foreignTable: "profiles" },
      )
    }
  }

  if (cityFilter.length > 0) {
    const pattern = `%${escapeIlikePattern(cityFilter)}%`
    query = query.ilike("profiles.city", pattern)
  }

  if (countryFilter.length > 0) {
    query = query.eq("profiles.country", countryFilter)
  }

  query = query.order("created_at", { ascending: false }).range(from, to)

  const { data: rows, error, count } = await query

  if (error || !rows) {
    console.error("[getDirectoryMembers] query failed:", error)
    return {
      members: [],
      totalCount: 0,
      error: error?.message ?? "Failed to load directory",
    }
  }

  const members = rows
    .filter((row) => row.profiles !== null)
    .map((row) => {
      const profile = row.profiles as ProfileRow | null

      return {
        id: row.user_id,
        memberSince: row.created_at,
        name: resolveMemberDisplayName(profile) ?? "",
        avatarUrl: profile?.avatar_url ?? null,
        businessName: profile?.company ?? null,
        expertise: profile?.job_title ?? null,
        bio: profile?.bio ?? null,
        social: normalizeSocial(profile?.social_links),
      }
    })

  return {
    members,
    totalCount: count ?? members.length,
    error: null,
  }
}
