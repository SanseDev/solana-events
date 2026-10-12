import type { Event } from '../domain/event'
import { getEventStatus } from './eventStatus'
import { MONTHS_SHORT, WEEKDAYS_SHORT, toLocalParts } from './dates'

/** One event-local calendar day inside a Saved partition. */
export interface SavedDateGroup {
  /** Event-local `YYYY-MM-DD`; unique within a partition. */
  key: string
  /** `Today`, `Tomorrow`, or `Tue, 15 Nov` in the event's own timezone. */
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

function deviceDate(date: Date): CalendarDate {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
}

function eventDate(iso: string): CalendarDate {
  const parts = toLocalParts(iso)
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) }
}

function sameDate(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

function addDays(date: CalendarDate, days: number): CalendarDate {
  const shifted = new Date(date.year, date.month - 1, date.day + days)
  return deviceDate(shifted)
}

/** Weekday of an event-local date, computed without timezone conversion. */
function weekdayLabel(date: CalendarDate): string {
  return WEEKDAYS_SHORT[new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay()]
}

/**
 * Saved group label for an event's start date. `Today`/`Tomorrow` compare the
 * event-local date against the device calendar of `now`; other dates render as
 * `Tue, 15 Nov` using the event's own timezone.
 */
export function eventDateLabel(iso: string, now: Date): string {
  const event = eventDate(iso)
  const today = deviceDate(now)
  if (sameDate(event, today)) {
    return 'Today'
  }
  if (sameDate(event, addDays(today, 1))) {
    return 'Tomorrow'
  }
  return `${weekdayLabel(event)}, ${event.day} ${MONTHS_SHORT[event.month - 1]}`
}

function groupByStartDate(events: readonly Event[], now: Date): SavedDateGroup[] {
  const groups: SavedDateGroup[] = []
  const byKey = new Map<string, SavedDateGroup>()
  for (const event of events) {
    const parts = toLocalParts(event.startAt)
    const key = `${parts.year}-${parts.month}-${parts.day}`
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
 * by event-local start date) and `Past events` (ended, most recent end first,
 * grouped by start date). Pure: input order is never mutated.
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
  return { upcoming: groupByStartDate(upcomingEvents, now), past: groupByStartDate(pastEvents, now) }
}
