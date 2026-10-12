import { makeFixtureEvent } from '../../domain/event-fixture'
import type { Interests } from '../../domain/event'
import { rankByInterests, scoreEvent } from '../ranking'

const interests: Interests = { topics: ['defi', 'mobile'], communityIds: ['community-a'] }

describe('scoreEvent', () => {
  it('scores zero with no overlap', () => {
    const event = makeFixtureEvent({ topics: ['nfts'], communityIds: ['community-x'] })
    expect(scoreEvent(event, interests)).toBe(0)
  })

  it('adds 2 per matching topic', () => {
    const event = makeFixtureEvent({ topics: ['defi', 'mobile', 'nfts'], communityIds: [] })
    expect(scoreEvent(event, interests)).toBe(4)
  })

  it('adds 1 per matching community', () => {
    const event = makeFixtureEvent({ topics: [], communityIds: ['community-a'] })
    expect(scoreEvent(event, interests)).toBe(1)
  })

  it('combines topics and communities', () => {
    const event = makeFixtureEvent({
      topics: ['defi', 'mobile'],
      communityIds: ['community-a', 'community-b'],
    })
    expect(scoreEvent(event, interests)).toBe(5)
  })

  it('scores zero with empty interests', () => {
    expect(scoreEvent(makeFixtureEvent(), { topics: [], communityIds: [] })).toBe(0)
  })
})

describe('rankByInterests', () => {
  it('sorts by score descending', () => {
    const low = makeFixtureEvent({ id: 'fixture-low', topics: ['nfts'] })
    const high = makeFixtureEvent({ id: 'fixture-high', topics: ['defi', 'mobile'] })
    const result = rankByInterests([low, high], interests)
    expect(result.map((e) => e.id)).toEqual(['fixture-high', 'fixture-low'])
  })

  it('breaks ties by startAt ascending', () => {
    const later = makeFixtureEvent({
      id: 'fixture-later',
      topics: ['defi'],
      startAt: '2026-12-01T18:00:00+01:00',
      endAt: '2026-12-01T22:00:00+01:00',
    })
    const earlier = makeFixtureEvent({
      id: 'fixture-earlier',
      topics: ['mobile'],
      startAt: '2026-11-01T18:00:00+01:00',
      endAt: '2026-11-01T22:00:00+01:00',
    })
    const result = rankByInterests([later, earlier], interests)
    expect(result.map((e) => e.id)).toEqual(['fixture-earlier', 'fixture-later'])
  })

  it('keeps zero-score events at the end sorted by startAt', () => {
    const zeroLater = makeFixtureEvent({
      id: 'fixture-zero-later',
      topics: ['nfts'],
      startAt: '2026-12-01T18:00:00+01:00',
      endAt: '2026-12-01T22:00:00+01:00',
    })
    const matched = makeFixtureEvent({ id: 'fixture-matched', topics: ['defi'] })
    const zeroEarlier = makeFixtureEvent({
      id: 'fixture-zero-earlier',
      topics: ['gaming'],
      startAt: '2026-11-01T18:00:00+01:00',
      endAt: '2026-11-01T22:00:00+01:00',
    })
    const result = rankByInterests([zeroLater, matched, zeroEarlier], interests)
    expect(result.map((e) => e.id)).toEqual(['fixture-matched', 'fixture-zero-earlier', 'fixture-zero-later'])
  })
})
