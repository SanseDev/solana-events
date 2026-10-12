import { makeFixtureEvent } from '../../domain/event-fixture'
import { eventDateLabel, groupSavedEvents } from '../dateGroups'

/** Tuesday 10 Nov 2026, 09:00 device-local. */
const NOW = new Date(2026, 10, 10, 9, 0)

/**
 * Builds an ISO string whose event-local calendar date equals the given
 * device-local date, so Today/Tomorrow assertions hold on any runner tz.
 */
function deviceLocalIso(date: Date, hour = 12): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:00:00${sign}${pad(
    Math.floor(abs / 60),
  )}:${pad(abs % 60)}`
}

describe('eventDateLabel', () => {
  it('labels an event-local today as Today', () => {
    expect(eventDateLabel(deviceLocalIso(NOW), NOW)).toBe('Today')
  })

  it('labels an event-local tomorrow as Tomorrow', () => {
    const tomorrow = new Date(2026, 10, 11, 9, 0)
    expect(eventDateLabel(deviceLocalIso(tomorrow), NOW)).toBe('Tomorrow')
  })

  it('uses weekday, day, month beyond tomorrow', () => {
    // 15 Nov 2026 is a Sunday regardless of the runner timezone.
    expect(eventDateLabel('2026-11-15T18:00:00+01:00', NOW)).toBe('Sun, 15 Nov')
    expect(eventDateLabel('2026-11-16T00:30:00+00:00', NOW)).toBe('Mon, 16 Nov')
  })

  it('never says Today for an event-local date the device has not reached', () => {
    // Event-local 12 Nov while the device is on 10 Nov.
    expect(eventDateLabel('2026-11-12T06:00:00+14:00', NOW)).toBe('Thu, 12 Nov')
  })
})

describe('groupSavedEvents', () => {
  const todayLate = makeFixtureEvent({
    id: 'fixture-today-late',
    startAt: deviceLocalIso(NOW, 18),
    endAt: deviceLocalIso(NOW, 22),
  })
  const todayEarly = makeFixtureEvent({
    id: 'fixture-today-early',
    startAt: deviceLocalIso(NOW, 10),
    endAt: deviceLocalIso(NOW, 12),
  })
  const nextSunday = makeFixtureEvent({
    id: 'fixture-sunday',
    startAt: '2026-11-15T18:00:00+01:00',
    endAt: '2026-11-15T22:00:00+01:00',
  })
  const pastFriday = makeFixtureEvent({
    id: 'fixture-past-friday',
    startAt: '2026-11-06T10:00:00+01:00',
    endAt: '2026-11-06T18:00:00+01:00',
  })
  const pastTuesday = makeFixtureEvent({
    id: 'fixture-past-tuesday',
    startAt: '2026-11-03T16:00:00+01:00',
    endAt: '2026-11-03T20:00:00+01:00',
  })

  it('partitions upcoming and past without overlap', () => {
    const { upcoming, past } = groupSavedEvents([todayLate, pastTuesday, nextSunday, todayEarly, pastFriday], NOW)
    const upcomingIds = upcoming.flatMap((group) => group.events.map((event) => event.id))
    const pastIds = past.flatMap((group) => group.events.map((event) => event.id))
    expect(upcomingIds).toHaveLength(3)
    expect(pastIds).toHaveLength(2)
    expect([...upcomingIds, ...pastIds]).toHaveLength(5)
  })

  it('groups same event-local date under one label, ordered ascending', () => {
    const { upcoming } = groupSavedEvents([todayLate, nextSunday, todayEarly], NOW)
    expect(upcoming.map((group) => group.label)).toEqual(['Today', 'Sun, 15 Nov'])
    expect(upcoming[0].events.map((event) => event.id)).toEqual(['fixture-today-early', 'fixture-today-late'])
  })

  it('orders past groups descending by recency', () => {
    const { past } = groupSavedEvents([pastTuesday, pastFriday], NOW)
    expect(past.map((group) => group.label)).toEqual(['Fri, 6 Nov', 'Tue, 3 Nov'])
  })

  it('uses unique event-local date keys', () => {
    const { upcoming } = groupSavedEvents([todayLate, todayEarly, nextSunday], NOW)
    const keys = upcoming.map((group) => group.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('returns empty partitions for no events', () => {
    expect(groupSavedEvents([], NOW)).toEqual({ upcoming: [], past: [] })
  })
})
