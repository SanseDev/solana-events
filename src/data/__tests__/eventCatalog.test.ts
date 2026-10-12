import { ATTENDANCE_MODES, EVENT_FORMATS, TOPICS } from '../../domain/event'
import { COMMUNITIES_BY_ID } from '../communities'
import rawEvents from '../events.json'
import { getAllEvents, getEventById, getUpcomingEvents } from '../eventCatalog'

const ISO_WITH_EXPLICIT_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/
const VERIFIED_ON_DATE = /^\d{4}-\d{2}-\d{2}$/

describe('event catalog integrity', () => {
  it('contains at least five events', () => {
    expect(getAllEvents().length).toBeGreaterThanOrEqual(5)
  })

  it('keeps every entry structurally valid', () => {
    expect(getAllEvents().length).toBe(rawEvents.length)
  })

  it('has unique ids', () => {
    const ids = getAllEvents().map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ships no fixture events', () => {
    expect(getAllEvents().some((e) => e.id.startsWith('fixture-'))).toBe(false)
  })

  it('references only known community ids', () => {
    for (const event of getAllEvents()) {
      for (const communityId of event.communityIds) {
        expect(COMMUNITIES_BY_ID.has(communityId)).toBe(true)
      }
    }
  })

  it('has only https official source urls', () => {
    for (const event of getAllEvents()) {
      expect(event.officialSourceUrl.startsWith('https://')).toBe(true)
    }
  })

  it('uses only https registration urls when present', () => {
    for (const event of getAllEvents()) {
      if (event.registrationUrl !== undefined) {
        expect(event.registrationUrl.startsWith('https://')).toBe(true)
      }
    }
  })

  it('fills every required field with non-empty strings', () => {
    for (const event of getAllEvents()) {
      for (const field of ['id', 'title', 'shortDescription', 'description', 'organizer', 'timezoneLabel'] as const) {
        expect(event[field].length).toBeGreaterThan(0)
      }
      expect(event.topics.length).toBeGreaterThan(0)
      expect(event.lastVerifiedAt.length).toBeGreaterThan(0)
    }
  })

  it('uses only known enum values', () => {
    for (const event of getAllEvents()) {
      expect(TOPICS).toEqual(expect.arrayContaining(event.topics))
      expect(EVENT_FORMATS).toContain(event.format)
      expect(ATTENDANCE_MODES).toContain(event.attendanceMode)
    }
  })

  it('writes every datetime with an explicit UTC offset', () => {
    for (const event of getAllEvents()) {
      expect(event.startAt).toMatch(ISO_WITH_EXPLICIT_OFFSET)
      expect(event.endAt).toMatch(ISO_WITH_EXPLICIT_OFFSET)
      if (event.registrationDeadline !== undefined) {
        expect(event.registrationDeadline).toMatch(ISO_WITH_EXPLICIT_OFFSET)
      }
    }
  })

  it('records lastVerifiedAt as a plain ISO date', () => {
    for (const event of getAllEvents()) {
      expect(event.lastVerifiedAt).toMatch(VERIFIED_ON_DATE)
    }
  })

  it('ends after it starts', () => {
    for (const event of getAllEvents()) {
      expect(Date.parse(event.endAt)).toBeGreaterThan(Date.parse(event.startAt))
    }
  })
})

describe('getUpcomingEvents', () => {
  it('excludes ended events and sorts by start instant ascending', () => {
    const now = new Date('2026-10-17T12:00:00Z')
    const upcoming = getUpcomingEvents(now)
    expect(upcoming.length).toBeGreaterThan(0)
    for (let i = 1; i < upcoming.length; i++) {
      expect(Date.parse(upcoming[i].startAt)).toBeGreaterThanOrEqual(Date.parse(upcoming[i - 1].startAt))
    }
    expect(upcoming.some((e) => e.id === 'solana-startup-connect-gh-2026')).toBe(false)
  })
})

describe('getEventById', () => {
  it('finds an event by id', () => {
    expect(getEventById('breakpoint-2026')?.title).toBe('Solana Breakpoint 2026')
  })

  it('returns undefined for unknown ids', () => {
    expect(getEventById('nope')).toBeUndefined()
  })
})
