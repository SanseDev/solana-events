import * as Calendar from 'expo-calendar'
import type { Event } from '@/src/domain/event'

export type CalendarAddResult = 'unsupported' | 'added' | 'permission-denied' | 'no-calendar' | 'error'

/**
 * Pure mapping from a catalog event to a native calendar entry. Dates come
 * from offset-explicit ISO strings (plan §5), so the epochs are unambiguous
 * regardless of the device timezone. Screens must use `addEventToCalendar`,
 * never the `expo-calendar` module directly (plan §4 isolation rule).
 */
export function buildCalendarDetails(event: Event): Partial<Calendar.ModifiableEventProperties> {
  return {
    title: event.title,
    startDate: new Date(event.startAt),
    endDate: new Date(event.endAt),
    allDay: event.allDay ?? false,
    location:
      event.attendanceMode === 'online'
        ? 'Online'
        : [event.venue, event.city, event.country].filter(Boolean).join(', '),
    notes: `${event.shortDescription}\n\n${event.officialSourceUrl}`,
  }
}

/**
 * Adds the event to a writable device calendar after an in-context permission
 * request. Android exposes no single default calendar (SDK 57 API), so the
 * primary writable calendar is preferred, then any writable one. Never reads
 * existing events, never sets reminders, and never blocks the catalog on
 * failure — each failure maps to a distinct result the screen can explain
 * (spec 20261008-p1-add-to-calendar).
 */
export async function addEventToCalendar(event: Event): Promise<CalendarAddResult> {
  let permission: Awaited<ReturnType<typeof Calendar.requestCalendarPermissions>>
  try {
    permission = await Calendar.requestCalendarPermissions()
  } catch {
    return 'error'
  }
  if (!permission.granted) {
    return 'permission-denied'
  }
  let calendars: Calendar.ExpoCalendar[]
  try {
    calendars = await Calendar.getCalendars()
  } catch {
    return 'no-calendar'
  }
  const writable = calendars.filter((calendar) => calendar.allowsModifications)
  const target = writable.find((calendar) => calendar.isPrimary) ?? writable[0]
  if (!target) {
    return 'no-calendar'
  }
  try {
    await target.createEvent(buildCalendarDetails(event))
    return 'added'
  } catch {
    return 'error'
  }
}
