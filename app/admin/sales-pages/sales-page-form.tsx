"use client"

const SECTION_HEADERS: Record<"main" | "founders", string> = {
  main: "Main Sales Page Settings",
  founders: "Founders Sales Page Settings",
}

export function SalesPageForm({ pageType }: { pageType: "main" | "founders" }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{SECTION_HEADERS[pageType]}</h2>
      <p className="text-gray-600">
        Form fields for this sales page will be added in a future update.
      </p>
    </div>
  )
}
