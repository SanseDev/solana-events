import { COMMUNITIES_BY_ID } from '../communities'
import rawEvents from '../events.json'
import { getAllEvents, getEventById, getUpcomingEvents } from '../eventCatalog'

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
