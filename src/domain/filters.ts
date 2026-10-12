import type { AttendanceMode, Event, EventFormat, LocationPreference, PreferenceProfile, Topic } from './event'
import { countryName } from '../data/countries'

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

/**
 * Compares ISO country codes only — display names are never filter keys.
 * Country-only preferences match every catalog city in that country; a city
 * narrows the match further.
 */
function matchesLocation(event: Event, location: LocationPreference | null): boolean {
  if (!location) {
    return true
  }
  if (event.countryCode !== location.countryCode) {
    return false
  }
  if (location.city && event.city !== location.city) {
    return false
  }
  return true
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

/**
 * Default Discover constraints seeded from a completed profile:
 * location filters exactly; participation maps to an attendance set
 * (`online` → online+hybrid, `in_person` → in-person+hybrid, `both` → any).
 */
export function defaultFiltersForProfile(profile: PreferenceProfile): EventFilters {
  const attendance: AttendanceMode[] =
    profile.participation === 'online'
      ? ['online', 'hybrid']
      : profile.participation === 'in_person'
        ? ['in_person', 'hybrid']
        : []
  return {
    ...emptyFilters,
    attendance,
    location: profile.location,
  }
}

/** Distinct catalog city selections (`{ countryCode, city }`), sorted by city. */
export function distinctLocations(events: readonly Event[]): LocationPreference[] {
  const seen = new Map<string, LocationPreference>()
  for (const event of events) {
    if (event.countryCode && event.city) {
      const key = `${event.city}\n${event.countryCode}`
      if (!seen.has(key)) {
        seen.set(key, { countryCode: event.countryCode, city: event.city })
      }
    }
  }
  return [...seen.values()].sort((a, b) => (a.city ?? '').localeCompare(b.city ?? ''))
}

/** Distinct catalog cities for a country code, alphabetically sorted. */
export function catalogCities(events: readonly Event[], countryCode: string): string[] {
  const cities = new Set<string>()
  for (const event of events) {
    if (event.countryCode === countryCode && event.city) {
      cities.add(event.city)
    }
  }
  return [...cities].sort((a, b) => a.localeCompare(b))
}

/**
 * Drops the city when the catalog has no event for it, so a GPS-derived city
 * never hides the country's valid matches. Country-only selections and known
 * cities pass through unchanged.
 */
export function clampLocationToCatalog(events: readonly Event[], location: LocationPreference): LocationPreference {
  if (!location.city) {
    return location
  }
  const known = events.some((event) => event.countryCode === location.countryCode && event.city === location.city)
  return known ? location : { countryCode: location.countryCode }
}

/** `Anywhere`, `France`, or `Paris, France`. */
export function locationLabel(location: LocationPreference | null): string {
  if (!location) {
    return 'Anywhere'
  }
  const name = countryName(location.countryCode)
  return location.city ? `${location.city}, ${name}` : name
}
