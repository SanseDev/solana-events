import type { Event } from '../domain/event'
import { parseInstant } from './dates'

export type EventStatus = 'upcoming' | 'ongoing' | 'ended'

export function getEventStatus(event: Event, now: Date): EventStatus {
  const nowMs = now.getTime()
  if (parseInstant(event.startAt) > nowMs) {
    return 'upcoming'
  }
  if (parseInstant(event.endAt) <= nowMs) {
    return 'ended'
  }
  return 'ongoing'
}

export type RegistrationState = 'none' | 'open' | 'closed'

export function getRegistrationState(event: Event, now: Date): RegistrationState {
  if (!event.registrationUrl) {
    return 'none'
  }
  if (event.registrationDeadline && parseInstant(event.registrationDeadline) <= now.getTime()) {
    return 'closed'
  }
  return 'open'
}
