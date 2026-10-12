import type { Event } from '../domain/event'
import { getEventStatus } from './eventStatus'
import { MONTHS_SHORT, WEEKDAYS_SHORT, parseInstant } from './dates'

/** One device-local calendar day inside a Saved partition. */
export interface SavedDateGroup {
  /** Device-timezone `YYYY-MM-DD` of the event start; unique per partition. */
  key: string
  /** `Today`, `Tomorrow`, or `Tue, 15 Nov` in the device timezone. */
  label: string
  events: Event[]
}

export interface SavedPartitions {
  upcoming: SavedDateGroup[]
  past: SavedDateGroup[]
}

interface CalendarDate {
  year: number
  month: number
  day: number
}

/**
 * Device-local calendar date of an event instant. Saved grouping normalizes
 * every start into the device timezone so `Today`/`Tomorrow` and group keys
 * come from one consistent calendar; the event's own timezone stays explicit
 * on Event Details.
 */
function deviceDate(instant: Date): CalendarDate {
  return { year: instant.getFullYear(), month: instant.getMonth() + 1, day: instant.getDate() }
}

function dateKey(date: CalendarDate): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`
}

function sameDate(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

function addDays(date: CalendarDate, days: number): CalendarDate {
  return deviceDate(new Date(date.year, date.month - 1, date.day + days))
}

/** Weekday of a calendar date, computed without timezone conversion. */
function weekdayLabel(date: CalendarDate): string {
  return WEEKDAYS_SHORT[new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay()]
}

/**
 * Saved group label for an event start in the device timezone: `Today` or
 * `Tomorrow` when the device-local start date is `now`'s (or the next)
 * device calendar day, otherwise `Tue, 15 Nov`.
 */
export function eventDateLabel(iso: string, now: Date): string {
  const start = deviceDate(new Date(parseInstant(iso)))
  const today = deviceDate(now)
  if (sameDate(start, today)) {
    return 'Today'
  }
  if (sameDate(start, addDays(today, 1))) {
    return 'Tomorrow'
  }
  return `${weekdayLabel(start)}, ${start.day} ${MONTHS_SHORT[start.month - 1]}`
}

function groupByDeviceDate(events: readonly Event[], now: Date): SavedDateGroup[] {
  const groups: SavedDateGroup[] = []
  const byKey = new Map<string, SavedDateGroup>()
  for (const event of events) {
    const start = deviceDate(new Date(parseInstant(event.startAt)))
    const key = dateKey(start)
    let group = byKey.get(key)
    if (!group) {
      group = { key, label: eventDateLabel(event.startAt, now), events: [] }
      byKey.set(key, group)
      groups.push(group)
    }
    group.events.push(event)
  }
  return groups
}

/**
 * Partitions saved events into `Upcoming` (not ended, start ascending, grouped
 * by device-timezone start date) and `Past events` (ended, most recent end
 * first, grouped by start date). Pure: input order is never mutated.
 */
export function groupSavedEvents(events: readonly Event[], now: Date): SavedPartitions {
  const upcomingEvents = events
    .filter((event) => getEventStatus(event, now) !== 'ended')
    .slice()
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
  const pastEvents = events
    .filter((event) => getEventStatus(event, now) === 'ended')
    .slice()
    .sort((a, b) => Date.parse(b.endAt) - Date.parse(a.endAt))
  return { upcoming: groupByDeviceDate(upcomingEvents, now), past: groupByDeviceDate(pastEvents, now) }
}
