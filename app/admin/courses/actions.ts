"use server"

import { createServerClient } from "@supabase/ssr"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type AdminCourseActionResult =
  | { success: true }
  | { success: false; error: string }

const ALLOWED_COURSE_STATUSES = ["draft", "pending", "approved", "retired"] as const
type AllowedCourseStatus = (typeof ALLOWED_COURSE_STATUSES)[number]

const ALLOWED_ACCESS_TYPES = ["free", "paid", "plan"] as const
type AllowedAccessType = (typeof ALLOWED_ACCESS_TYPES)[number]

function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}

async function verifyAdminAccess() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false as const, error: "Not authenticated" }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_creator")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    console.error("[verifyAdminAccess] profile error", profileError)
    return { success: false as const, error: "Unable to verify admin access" }
  }

  if (!profile || profile.is_creator !== true) {
    return { success: false as const, error: "Not authorized" }
  }

  return { success: true as const, userId: user.id }
}

function isAllowedCourseStatus(status: string): status is AllowedCourseStatus {
  return (ALLOWED_COURSE_STATUSES as readonly string[]).includes(status)
}

function isAllowedAccessType(value: string): value is AllowedAccessType {
  return (ALLOWED_ACCESS_TYPES as readonly string[]).includes(value)
}

export async function approveCourse(courseId: string): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase.from("courses").update({ status: "approved" }).eq("id", courseId)

  if (error) {
    console.error("[approveCourse]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/members/courses")
  return { success: true }
}

export async function retireCourse(courseId: string): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase.from("courses").update({ status: "retired" }).eq("id", courseId)

  if (error) {
    console.error("[retireCourse]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/members/courses")
  return { success: true }
}

export async function restoreCourse(courseId: string): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase.from("courses").update({ status: "approved" }).eq("id", courseId)

  if (error) {
    console.error("[restoreCourse]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/members/courses")
  return { success: true }
}

export async function toggleFeaturedCourse(
  courseId: string,
  featured: boolean
): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase.from("courses").update({ featured: !featured }).eq("id", courseId)

  if (error) {
    console.error("[toggleFeaturedCourse]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/members/courses")
  return { success: true }
}

export async function deleteCourse(courseId: string): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase.from("courses").delete().eq("id", courseId)

  if (error) {
    console.error("[deleteCourse]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  return { success: true }
}

export async function sponsorCourse(courseId: string): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()

  const { error: clearError } = await serviceSupabase.from("courses").update({ is_sponsored: false }).eq("is_sponsored", true)

  if (clearError) {
    console.error("[sponsorCourse] clear sponsored", clearError)
    return { success: false, error: clearError.message }
  }

  const { error } = await serviceSupabase.from("courses").update({ is_sponsored: true }).eq("id", courseId)

  if (error) {
    console.error("[sponsorCourse]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/members/courses")
  return { success: true }
}

export async function unsponsorCourse(courseId: string): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase.from("courses").update({ is_sponsored: false }).eq("id", courseId)

  if (error) {
    console.error("[unsponsorCourse]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/members/courses")
  return { success: true }
}

export async function updateCourseStatus(
  courseId: string,
  status: string
): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const normalized = status.trim().toLowerCase()
  if (!isAllowedCourseStatus(normalized)) {
    return {
      success: false,
      error: `Invalid status. Allowed: ${ALLOWED_COURSE_STATUSES.join(", ")}`,
    }
  }

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase.from("courses").update({ status: normalized }).eq("id", courseId)

  if (error) {
    console.error("[updateCourseStatus]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/members/courses")
  return { success: true }
}

export async function updateCourseStripeDetails(
  courseId: string,
  price: number | null,
  stripe_price_id: string | null,
  payment_url: string | null
): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase
    .from("courses")
    .update({
      price,
      stripe_price_id,
      payment_url,
    })
    .eq("id", courseId)

  if (error) {
    console.error("[updateCourseStripeDetails]", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/members/courses")
  return { success: true }
}

export async function updateCourseAccessType(
  courseId: string,
  accessType: "free" | "paid" | "plan"
): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const normalized = accessType.trim().toLowerCase()
  if (!isAllowedAccessType(normalized)) {
    return { success: false, error: "Invalid access type. Use free, paid, or plan." }
  }

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase
    .from("courses")
    .update({
      access_type: normalized,
    })
    .eq("id", courseId)

  if (error) {
    console.error("Error updating course access type:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/members/courses")
  return { success: true }
}

export async function updateCoursePlans(courseId: string, planIds: string[]): Promise<AdminCourseActionResult> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()
  const { error } = await serviceSupabase
    .from("courses")
    .update({
      plan_ids: planIds,
    })
    .eq("id", courseId)

  if (error) {
    console.error("Error saving course plans:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/members/courses")
  return { success: true }
}

export async function getActivePlans(): Promise<
  { success: true; plans: { id: string; name: string }[] } | { success: false; error: string }
> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()
  const { data, error } = await serviceSupabase
    .from("plans")
    .select("id, name")
    .eq("active", true)
    .order("name")

  if (error) return { success: false, error: error.message }
  return { success: true, plans: (data ?? []) as { id: string; name: string }[] }
}

export async function getCourseAccessPlanIds(
  courseId: string
): Promise<{ success: true; planIds: string[] } | { success: false; error: string }> {
  const auth = await verifyAdminAccess()
  if (!auth.success) return auth

  const serviceSupabase = createServiceRoleClient()
  const { data, error } = await serviceSupabase.from("courses").select("plan_ids").eq("id", courseId).maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data) {
    return { success: false, error: "Course not found" }
  }

  return {
    success: true,
    planIds: data.plan_ids ?? [],
  }
}
