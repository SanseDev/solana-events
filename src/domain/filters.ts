import type { AttendanceMode, Event, EventFormat, Topic } from './event'

export type AttendanceFilter = 'any' | AttendanceMode

export interface EventFilters {
  topics: Topic[]
  formats: EventFormat[]
  attendance: AttendanceFilter
}

export const emptyFilters: EventFilters = {
  topics: [],
  formats: [],
  attendance: 'any',
}

export function hasActiveFilters(filters: EventFilters): boolean {
  return filters.topics.length > 0 || filters.formats.length > 0 || filters.attendance !== 'any'
}

/**
 * Categories AND, values inside a category OR.
 * Query is a case-insensitive substring match on title or organizer.
 */
export function applyFilters(events: Event[], query: string, filters: EventFilters): Event[] {
  const q = query.trim().toLowerCase()
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
    if (filters.attendance !== 'any' && event.attendanceMode !== filters.attendance) {
      return false
    }
    return true
  })
}
