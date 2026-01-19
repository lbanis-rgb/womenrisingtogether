import { Suspense } from "react"
import { getCommunityEvents } from "./actions"
import { canUserCreateEvents } from "./can-user-create-events"
import { EventsPageContent } from "./events-page-content"
import { createClient } from "@/lib/supabase/server"

export default async function CommunityEventsPage() {
  const events = await getCommunityEvents()
  const canCreateEvents = await canUserCreateEvents()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const currentUserId = user?.id ?? null

  return (
    <Suspense fallback={null}>
      <EventsPageContent events={events} canCreateEvents={canCreateEvents} currentUserId={currentUserId} />
    </Suspense>
  )
}
