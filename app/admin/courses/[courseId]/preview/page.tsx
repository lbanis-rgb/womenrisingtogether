import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@/lib/supabase/server"
import { CourseOverviewContent } from "@/app/members/courses/[courseId]/_components/CourseOverviewContent"

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

export default async function AdminCoursePreviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Not authenticated</p>
      </div>
    )
  }

  const { data: profile } = await supabase.from("profiles").select("id, is_creator").eq("id", user.id).maybeSingle()

  if (!profile || profile.is_creator !== true) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Not authorized</p>
      </div>
    )
  }

  const serviceSupabase = createServiceRoleClient()

  const { data: course, error: courseError } = await serviceSupabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      instructions,
      instruction_video,
      thumbnail_url,
      group_id
    `
    )
    .eq("id", courseId)
    .maybeSingle()

  if (courseError || !course) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-muted-foreground">Course not found.</p>
        <Link href="/admin/courses" className="text-sm text-primary mt-4 inline-block">
          Back to Admin Courses
        </Link>
      </div>
    )
  }

  const { data: sectionsData } = await serviceSupabase
    .from("course_sections")
    .select(
      `
      id,
      title,
      sort_order
    `
    )
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true })

  const { data: lessonsData } = await serviceSupabase
    .from("course_lessons")
    .select(
      `
      id,
      section_id,
      title,
      sort_order,
      release_date,
      drip_days,
      requires_previous_completion
    `
    )
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true })

  const sections = sectionsData ?? []
  const lessons = lessonsData ?? []
  const totalLessons = lessons.length

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Admin preview — this view loads course content for any course.{" "}
          <Link href="/admin/courses" className="underline font-medium">
            Back to course list
          </Link>
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin courses
          </Link>
        </div>
      </div>
      <CourseOverviewContent
        course={course}
        sections={sections}
        lessons={lessons}
        progressMap={{}}
        enrollment={null}
        nextLesson={null}
        progressPercent={0}
        completedLessons={0}
        totalLessons={totalLessons}
        learningStats={{ notes: 0, highlights: 0, savedResources: 0 }}
      />
    </>
  )
}
