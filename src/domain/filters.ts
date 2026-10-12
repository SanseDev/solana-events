import type { AttendanceMode, Event, EventFormat, LocationPreference, Topic } from './event'

export type DateRangeFilter = 'any' | 'this_week'

/**
 * Filter state shared by Discover quick controls and the filter sheet.
 * Categories combine with AND; values inside one category combine with OR.
 * `attendance: []` means any mode. `location` constrains results in both the
 * default and the Results layouts, so it is not treated as "active" for the
 * layout switch.
 */
export interface EventFilters {
  topics: Topic[]
  formats: EventFormat[]
  attendance: AttendanceMode[]
  dateRange: DateRangeFilter
  location: LocationPreference | null
}

export const emptyFilters: EventFilters = {
  topics: [],
  formats: [],
  attendance: [],
  dateRange: 'any',
  location: null,
}

export function hasActiveFilters(filters: EventFilters): boolean {
  return (
    filters.topics.length > 0 ||
    filters.formats.length > 0 ||
    filters.attendance.length > 0 ||
    filters.dateRange !== 'any'
  )
}

/** `[now, end of the 7th local calendar day]` — today counts as day one. */
export function thisWeekWindow(now: Date): { start: number; end: number } {
  const end = new Date(now)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start: now.getTime(), end: end.getTime() }
}

function matchesLocation(event: Event, location: LocationPreference | null): boolean {
  if (!location) {
    return true
  }
  return event.city === location.city && event.country === location.country
}

/**
 * Categories AND, values inside a category OR.
 * Query is a case-insensitive substring match on title or organizer.
 * Optional `now` drives the `this_week` window (injected for testability).
 */
export function applyFilters(events: readonly Event[], query: string, filters: EventFilters, now?: Date): Event[] {
  const q = query.trim().toLowerCase()
  const week = filters.dateRange === 'this_week' ? thisWeekWindow(now ?? new Date()) : null
  return events.filter((event) => {
    if (q.length > 0) {
      const inTitle = event.title.toLowerCase().includes(q)
      const inOrganizer = event.organizer.toLowerCase().includes(q)
      if (!inTitle && !inOrganizer) {
        return false
      }
    }
    if (filters.topics.length > 0 && !event.topics.some((topic) => filters.topics.includes(topic))) {
      return false
    }
    if (filters.formats.length > 0 && !filters.formats.includes(event.format)) {
      return false
    }
    if (filters.attendance.length > 0 && !filters.attendance.includes(event.attendanceMode)) {
      return false
    }
    if (week) {
      const overlapsWindow = Date.parse(event.endAt) >= week.start && Date.parse(event.startAt) <= week.end
      if (!overlapsWindow) {
        return false
      }
    }
    if (!matchesLocation(event, filters.location)) {
      return false
    }
    return true
  })
}

/** Distinct catalog `city, country` pairs, alphabetically sorted. */
export function distinctLocations(events: readonly Event[]): LocationPreference[] {
  const seen = new Map<string, LocationPreference>()
  for (const event of events) {
    if (event.city && event.country) {
      const key = `${event.city}\n${event.country}`
      if (!seen.has(key)) {
        seen.set(key, { city: event.city, country: event.country })
      }
    }
  }
  return [...seen.values()].sort((a, b) => a.city.localeCompare(b.city))
}

export function locationLabel(location: LocationPreference | null): string {
  return location ? location.city : 'Anywhere'
}
