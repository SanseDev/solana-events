export const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** Parses an ISO 8601 string with offset to epoch milliseconds (NaN when invalid). */
export function parseInstant(iso: string): number {
  return Date.parse(iso)
}

export interface EventLocalDate {
  year: string
  month: string
  day: string
  time: string
}

/**
 * Extracts date/time parts from the ISO string itself so display always uses the
 * event's own timezone (with offset), never the device timezone.
 */
export function toLocalParts(iso: string): EventLocalDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(iso)
  if (!match) {
    throw new Error(`Invalid event ISO date: ${iso}`)
  }
  return { year: match[1], month: match[2], day: match[3], time: match[4] }
}

/** Compact date block for event cards: uppercase month + day of the event-local date. */
export function formatDateBlock(iso: string): { month: string; day: string } {
  const parts = toLocalParts(iso)
  const monthName = MONTHS_SHORT[Number(parts.month) - 1]
  return { month: monthName.toUpperCase(), day: parts.day }
}

/** Event-local clock time, e.g. `18:00`. */
export function formatTimeShort(iso: string): string {
  return toLocalParts(iso).time
}

/** Event-local time span for cards: `18:00–22:00`, or the start time across days. */
export function formatCardTimeRange(startIso: string, endIso: string): string {
  const start = toLocalParts(startIso)
  const end = toLocalParts(endIso)
  const sameDay = start.year === end.year && start.month === end.month && start.day === end.day
  return sameDay ? `${start.time}–${end.time}` : start.time
}

/** Human-readable range, e.g. `10 Nov 2026, 18:00–22:00 CET`. */
export function formatEventDateRange(startIso: string, endIso: string, timezoneLabel: string) {
  const start = toLocalParts(startIso)
  const end = toLocalParts(endIso)
  const sameDay = start.year === end.year && start.month === end.month && start.day === end.day
  if (sameDay) {
    return `${start.day} ${MONTHS_SHORT[Number(start.month) - 1]} ${start.year}, ${start.time}–${end.time} ${timezoneLabel}`
  }
  const startDate = `${start.day} ${MONTHS_SHORT[Number(start.month) - 1]} ${start.year}`
  const endDate = `${end.day} ${MONTHS_SHORT[Number(end.month) - 1]} ${end.year}`
  return `${startDate}, ${start.time} – ${endDate}, ${end.time} ${timezoneLabel}`
}

/** True when `iso` instant is strictly before `thanIso` instant. */
export function isBefore(iso: string, thanIso: string): boolean {
  return parseInstant(iso) < parseInstant(thanIso)
}

/** Single datetime with timezone label, e.g. `1 Nov 2026, 23:59 CET`. */
export function formatDateTime(iso: string, timezoneLabel: string): string {
  const parts = toLocalParts(iso)
  return `${Number(parts.day)} ${MONTHS_SHORT[Number(parts.month) - 1]} ${parts.year}, ${parts.time} ${timezoneLabel}`
}

function dateLabel(parts: { year: string; month: string; day: string }): string {
  return `${parts.day} ${MONTHS_SHORT[Number(parts.month) - 1]} ${parts.year}`
}

/** Date-only span for events without published times, e.g. `15–17 Nov 2026`. */
export function formatDateOnlySpan(startIso: string, endIso: string): string {
  const start = toLocalParts(startIso)
  const end = toLocalParts(endIso)
  const sameDay = start.year === end.year && start.month === end.month && start.day === end.day
  if (sameDay) {
    return dateLabel(start)
  }
  const sameMonthAndYear = start.year === end.year && start.month === end.month
  if (sameMonthAndYear) {
    return `${start.day}–${end.day} ${MONTHS_SHORT[Number(start.month) - 1]} ${start.year}`
  }
  return `${start.day} ${MONTHS_SHORT[Number(start.month) - 1]} – ${dateLabel(end)}`
}
