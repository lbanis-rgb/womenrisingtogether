import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@/lib/supabase/server"
import CourseTable from "@/components/admin/courses/CourseTable"

export const dynamic = "force-dynamic"

function createServiceRoleClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })
}

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_creator")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || profile.is_creator !== true) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Not authorized</p>
      </div>
    )
  }

  const serviceSupabase = createServiceRoleClient()
  const { data: courses, error: coursesError } = await serviceSupabase
    .from("courses")
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      status,
      access_type,
      price,
      stripe_price_id,
      payment_url,
      featured,
      is_sponsored,
      created_by,
      created_at
    `)
    .order("is_sponsored", { ascending: false })
    .order("created_at", { ascending: false })

  if (coursesError) {
    console.error("[AdminCoursesPage] courses query error:", coursesError)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin • Courses
          </h1>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Unable to load courses right now. Please refresh and try again.
          </p>
        </div>
      </div>
    )
  }

  const rows = courses ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin • Courses
        </h1>
      </div>

      <CourseTable courses={rows} />
    </div>
  )
}
