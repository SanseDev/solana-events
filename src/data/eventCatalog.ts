import { isValidEvent, type Event } from '../domain/event'
import { getEventStatus } from '../utils/eventStatus'
import rawEvents from './events.json'

/** Curated, manually verified catalog. Invalid entries are dropped loudly in dev, never shipped. */
export const ALL_EVENTS: readonly Event[] = (rawEvents as unknown[]).filter(isValidEvent)

export function getAllEvents(): Event[] {
  return [...ALL_EVENTS]
}

/** Future events sorted by start instant ascending (plan §5: past events hidden from Discover). */
export function getUpcomingEvents(now: Date): Event[] {
  return ALL_EVENTS.filter((event) => getEventStatus(event, now) !== 'ended').sort(
    (a, b) => Date.parse(a.startAt) - Date.parse(b.startAt),
  )
}

export function getEventById(id: string): Event | undefined {
  return ALL_EVENTS.find((event) => event.id === id)
}
