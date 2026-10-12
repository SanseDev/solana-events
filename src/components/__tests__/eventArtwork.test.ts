import { getAllEvents } from '../../data/eventCatalog'
import { artworkFamilyForFormat, artworkSeed, getEventArtworkConfig } from '../eventArtworkConfig'

/** Fixed expectation table, intentionally independent of `artworkFamilyForFormat`. */
const EXPECTED_FAMILY_BY_FORMAT = {
  hackathon: 'hackathon',
  conference: 'conference',
  meetup: 'community',
  workshop: 'workshop',
  community_event: 'community',
} as const

describe('event artwork selection', () => {
  it('assigns catalog events to their format family', () => {
    const families = Object.fromEntries(getAllEvents().map((event) => [event.id, getEventArtworkConfig(event).family]))
    const expected = Object.fromEntries(
      getAllEvents().map((event) => [event.id, EXPECTED_FAMILY_BY_FORMAT[event.format]]),
    )

    expect(families).toEqual(expected)
    expect(families['breakpoint-2026']).toBe('conference')
  })

  it('keeps artwork selection stable for an event id', () => {
    const event = getAllEvents().find(({ id }) => id === 'breakpoint-2026')!
    expect(getEventArtworkConfig(event)).toEqual(getEventArtworkConfig(event))
    expect(artworkSeed(event.id)).toBe(artworkSeed(event.id))
  })

  it('varies artwork across events in the same family', () => {
    const conferenceConfigs = getAllEvents()
      .filter(({ format }) => format === 'conference')
      .map(getEventArtworkConfig)

    expect(new Set(conferenceConfigs.map(({ seed }) => seed)).size).toBe(conferenceConfigs.length)
  })

  it('uses default artwork for unknown formats', () => {
    expect(artworkFamilyForFormat('festival')).toBe('default')
  })
})
