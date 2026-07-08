const PACIFIC_TZ = "America/Los_Angeles"
const EASTERN_TZ = "America/New_York"

function normalizeTimePart(time: string): string {
  const parts = time.split(":")
  const hh = parts[0]?.padStart(2, "0") ?? "00"
  const mm = parts[1]?.padStart(2, "0") ?? "00"
  const ss = (parts[2] ?? "00").split(".")[0].padStart(2, "0")
  return `${hh}:${mm}:${ss}`
}

function extractDateAndTimeFromStoredValue(iso: string): { date: string; time: string } | null {
  const normalized = iso.trim().replace(" ", "T")
  const match = normalized.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?)/)
  if (!match) return null
  return { date: match[1], time: normalizeTimePart(match[2]) }
}

function getZonedParts(instant: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  const parts = formatter.formatToParts(instant)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0")

  let hour = get("hour")
  if (hour === 24) hour = 0

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour,
    minute: get("minute"),
    second: get("second"),
  }
}

/**
 * Masterclass setup stores a Pacific-local date/time in scheduled_at (often saved as UTC
 * with the same clock digits). Reconstruct the absolute instant from those digits.
 */
export function parseMasterclassScheduledAt(iso: string | null | undefined): Date | null {
  if (!iso) return null

  const extracted = extractDateAndTimeFromStoredValue(iso)
  if (!extracted) return new Date(iso)

  const { date, time } = extracted
  const [year, month, day] = date.split("-").map(Number)
  const [hour, minute, second = 0] = time.split(":").map(Number)

  let guessMs = Date.UTC(year, month - 1, day, hour, minute, second)

  for (let i = 0; i < 5; i++) {
    const pacific = getZonedParts(new Date(guessMs), PACIFIC_TZ)
    const targetMs = Date.UTC(year, month - 1, day, hour, minute, second)
    const actualMs = Date.UTC(
      pacific.year,
      pacific.month - 1,
      pacific.day,
      pacific.hour,
      pacific.minute,
      pacific.second,
    )
    const diff = targetMs - actualMs
    if (Math.abs(diff) < 1000) break
    guessMs += diff
  }

  return new Date(guessMs)
}

function formatTimeInZone(instant: Date, timeZone: string): string {
  return instant.toLocaleString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatMasterclassDualTimezone(iso: string | null | undefined): string {
  const instant = parseMasterclassScheduledAt(iso)
  if (!instant) return ""

  const pt = formatTimeInZone(instant, PACIFIC_TZ)
  const et = formatTimeInZone(instant, EASTERN_TZ)
  return `${pt} PT / ${et} ET`
}

/** Short Pacific-only time for compact UI (calendar cells, etc.). */
export function formatMasterclassPacificTime(iso: string | null | undefined): string {
  const instant = parseMasterclassScheduledAt(iso)
  if (!instant) return ""

  return `${formatTimeInZone(instant, PACIFIC_TZ)} PT`
}

/** Match a masterclass to a calendar cell using Pacific-local date parts. */
export function isMasterclassOnDate(iso: string | null | undefined, date: Date): boolean {
  const instant = parseMasterclassScheduledAt(iso)
  if (!instant) return false

  const pacific = getZonedParts(instant, PACIFIC_TZ)
  return (
    pacific.year === date.getFullYear() &&
    pacific.month === date.getMonth() + 1 &&
    pacific.day === date.getDate()
  )
}

export function formatMasterclassDate(iso: string | null | undefined): string {
  const instant = parseMasterclassScheduledAt(iso)
  if (!instant) return ""

  return instant.toLocaleDateString("en-US", {
    timeZone: PACIFIC_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function formatMasterclassScheduledAtForAdmin(iso: string | null | undefined): string {
  if (!iso) return "—"
  const date = formatMasterclassDate(iso)
  const time = formatMasterclassDualTimezone(iso)
  if (!date || !time) return "—"
  return `${date}, ${time}`
}

/** Form values for date/time inputs — stored digits are Pacific wall clock. */
export function getMasterclassScheduleInputValues(
  iso: string | null | undefined,
): { date: string; time: string } | null {
  if (!iso) return null

  const extracted = extractDateAndTimeFromStoredValue(iso)
  if (!extracted) return null

  const [hh, mm] = extracted.time.split(":")
  return { date: extracted.date, time: `${hh}:${mm}` }
}

/** Build the naive ISO string saved to scheduled_at (Pacific wall clock digits). */
export function buildMasterclassScheduledAtIso(date: string, time: string): string {
  const normalizedTime = time.length === 5 ? `${time}:00` : normalizeTimePart(time)
  return `${date}T${normalizedTime}`
}
