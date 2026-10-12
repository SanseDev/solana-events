import { getAllEvents } from '../../data/eventCatalog'
import { artworkFamilyForFormat, artworkSeed, getEventArtworkConfig } from '../eventArtworkConfig'

describe('event artwork selection', () => {
  it('assigns catalog events to their format family', () => {
    const families = Object.fromEntries(getAllEvents().map((event) => [event.id, getEventArtworkConfig(event).family]))

    expect(families).toEqual({
      'breakpoint-2026': 'conference',
      'hacker-house-london-2026': 'hackathon',
      'solana-intelligence-summit-2026': 'conference',
      'solana-summit-india-2026': 'community',
      'islanddao-v5': 'community',
      'solana-startup-connect-gh-2026': 'workshop',
    })
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
