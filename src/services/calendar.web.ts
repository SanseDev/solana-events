import type { CalendarAddResult } from './calendar'
import type { Event } from '@/src/domain/event'

/**
 * Web stub for the calendar service. `expo-calendar` has no web support, so
 * the web build reports `unsupported` instead of simulating a write. The
 * detail screen hides the button on web, mirroring `wallet.web.ts`.
 */
export async function addEventToCalendar(_event: Event): Promise<CalendarAddResult> {
  return 'unsupported'
}
