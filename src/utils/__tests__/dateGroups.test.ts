import { makeFixtureEvent } from '../../domain/event-fixture'
import { eventDateLabel, groupSavedEvents } from '../dateGroups'

/** Tuesday 10 Nov 2026, 09:00 device-local. */
const NOW = new Date(2026, 10, 10, 9, 0)

/**
 * ISO string for an instant at a fixed device-local date and hour, so label
 * assertions hold on any runner timezone.
 */
function deviceIso(year: number, month: number, day: number, hour = 12): string {
  return new Date(year, month - 1, day, hour).toISOString()
}

describe('eventDateLabel', () => {
  it('labels a device-local today as Today', () => {
    expect(eventDateLabel(deviceIso(2026, 11, 10, 18), NOW)).toBe('Today')
  })

  it('keeps late same-day starts as Today across the midnight boundary', () => {
    expect(eventDateLabel(deviceIso(2026, 11, 10, 23), NOW)).toBe('Today')
  })

  it('labels a device-local tomorrow as Tomorrow just after midnight', () => {
    expect(eventDateLabel(deviceIso(2026, 11, 11, 0), NOW)).toBe('Tomorrow')
  })

  it('uses weekday, day, month beyond tomorrow', () => {
    // 15 Nov 2026 is a Sunday.
    expect(eventDateLabel(deviceIso(2026, 11, 15, 18), NOW)).toBe('Sun, 15 Nov')
    expect(eventDateLabel(deviceIso(2026, 11, 16, 1), NOW)).toBe('Mon, 16 Nov')
  })

  it('labels by the instant in the device timezone, never by the ISO-local text', () => {
    // Same instant expressed with a +14:00 offset and as UTC must agree:
    // grouping converts timestamps, it does not read the raw ISO date.
    const withOffset = '2026-11-11T23:00:00+14:00'
    const asUtc = new Date(Date.parse(withOffset)).toISOString()
    expect(eventDateLabel(withOffset, NOW)).toBe(eventDateLabel(asUtc, NOW))
  })
})

describe('groupSavedEvents', () => {
  const todayLate = makeFixtureEvent({
    id: 'fixture-today-late',
    startAt: deviceIso(2026, 11, 10, 18),
    endAt: deviceIso(2026, 11, 10, 22),
  })
  const todayEarly = makeFixtureEvent({
    id: 'fixture-today-early',
    startAt: deviceIso(2026, 11, 10, 10),
    endAt: deviceIso(2026, 11, 10, 12),
  })
  const nextSunday = makeFixtureEvent({
    id: 'fixture-sunday',
    startAt: deviceIso(2026, 11, 15, 18),
    endAt: deviceIso(2026, 11, 15, 22),
  })
  const pastFriday = makeFixtureEvent({
    id: 'fixture-past-friday',
    startAt: deviceIso(2026, 11, 6, 10),
    endAt: deviceIso(2026, 11, 6, 18),
  })
  const pastTuesday = makeFixtureEvent({
    id: 'fixture-past-tuesday',
    startAt: deviceIso(2026, 11, 3, 16),
    endAt: deviceIso(2026, 11, 3, 20),
  })

  it('partitions upcoming and past without overlap', () => {
    const { upcoming, past } = groupSavedEvents([todayLate, pastTuesday, nextSunday, todayEarly, pastFriday], NOW)
    const upcomingIds = upcoming.flatMap((group) => group.events.map((event) => event.id))
    const pastIds = past.flatMap((group) => group.events.map((event) => event.id))
    expect(upcomingIds).toHaveLength(3)
    expect(pastIds).toHaveLength(2)
    expect([...upcomingIds, ...pastIds]).toHaveLength(5)
  })

  it('groups same device-local date under one label, ordered ascending', () => {
    const { upcoming } = groupSavedEvents([todayLate, nextSunday, todayEarly], NOW)
    expect(upcoming.map((group) => group.label)).toEqual(['Today', 'Sun, 15 Nov'])
    expect(upcoming[0].events.map((event) => event.id)).toEqual(['fixture-today-early', 'fixture-today-late'])
  })

  it('splits groups at device midnight', () => {
    const beforeMidnight = makeFixtureEvent({
      id: 'fixture-pre-midnight',
      startAt: deviceIso(2026, 11, 10, 23),
      endAt: deviceIso(2026, 11, 11, 1),
    })
    const afterMidnight = makeFixtureEvent({
      id: 'fixture-post-midnight',
      startAt: deviceIso(2026, 11, 11, 0),
      endAt: deviceIso(2026, 11, 11, 2),
    })
    const { upcoming } = groupSavedEvents([afterMidnight, beforeMidnight], NOW)
    expect(upcoming.map((group) => group.label)).toEqual(['Today', 'Tomorrow'])
  })

  it('groups the same instant expressed in different offsets together', () => {
    const withOffset = makeFixtureEvent({
      id: 'fixture-offset',
      startAt: '2026-11-10T18:00:00+01:00',
      endAt: '2026-11-10T22:00:00+01:00',
    })
    const asUtc = makeFixtureEvent({
      id: 'fixture-utc',
      startAt: new Date(Date.parse('2026-11-10T18:00:00+01:00')).toISOString(),
      endAt: new Date(Date.parse('2026-11-10T22:00:00+01:00')).toISOString(),
    })
    const { upcoming } = groupSavedEvents([asUtc, withOffset], NOW)
    expect(upcoming).toHaveLength(1)
    expect(upcoming[0].events.map((event) => event.id).sort()).toEqual(['fixture-offset', 'fixture-utc'])
  })

  it('orders past groups descending by recency', () => {
    const { past } = groupSavedEvents([pastTuesday, pastFriday], NOW)
    expect(past.map((group) => group.label)).toEqual(['Fri, 6 Nov', 'Tue, 3 Nov'])
  })

  it('uses unique device-local date keys', () => {
    const { upcoming } = groupSavedEvents([todayLate, todayEarly, nextSunday], NOW)
    const keys = upcoming.map((group) => group.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('returns empty partitions for no events', () => {
    expect(groupSavedEvents([], NOW)).toEqual({ upcoming: [], past: [] })
  })
})
