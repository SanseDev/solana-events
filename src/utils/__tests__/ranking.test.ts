import { makeFixtureEvent } from '../../domain/event-fixture'
import type { PreferenceProfile } from '../../domain/event'
import { emptyProfile, partitionPersonalized, recommendEvents, scoreEvent } from '../ranking'

const profile: PreferenceProfile = {
  intent: [],
  topics: ['defi', 'mobile'],
  communityIds: ['community-a'],
  participation: 'both',
  location: null,
}

describe('scoreEvent', () => {
  it('scores zero with no overlap', () => {
    const event = makeFixtureEvent({ topics: ['nfts'], communityIds: ['community-x'] })
    expect(scoreEvent(event, profile)).toBe(0)
  })

  it('adds 2 per matching topic', () => {
    const event = makeFixtureEvent({ topics: ['defi', 'mobile', 'nfts'], communityIds: [] })
    expect(scoreEvent(event, profile)).toBe(4)
  })

  it('adds 1 per matching community', () => {
    const event = makeFixtureEvent({ topics: [], communityIds: ['community-a'] })
    expect(scoreEvent(event, profile)).toBe(1)
  })

  it('combines topics and communities', () => {
    const event = makeFixtureEvent({
      topics: ['defi', 'mobile'],
      communityIds: ['community-a', 'community-b'],
    })
    expect(scoreEvent(event, profile)).toBe(5)
  })

  it('scores zero with an empty profile', () => {
    expect(scoreEvent(makeFixtureEvent(), emptyProfile)).toBe(0)
  })

  describe('intent rules', () => {
    it('learn scores workshops and developer-topic events', () => {
      const learn: PreferenceProfile = { ...emptyProfile, intent: ['learn'] }
      const workshop = makeFixtureEvent({ topics: ['nfts'], format: 'workshop' })
      const devTalk = makeFixtureEvent({ topics: ['developers'], format: 'conference' })
      const other = makeFixtureEvent({ topics: ['nfts'], format: 'meetup' })
      expect(scoreEvent(workshop, learn)).toBe(1)
      expect(scoreEvent(devTalk, learn)).toBe(1)
      expect(scoreEvent(other, learn)).toBe(0)
    })

    it('meet_people scores in-person or hybrid community formats', () => {
      const social: PreferenceProfile = { ...emptyProfile, intent: ['meet_people'] }
      const meetup = makeFixtureEvent({ format: 'meetup', attendanceMode: 'in_person' })
      const hybridCommunity = makeFixtureEvent({ format: 'community_event', attendanceMode: 'hybrid' })
      const onlineMeetup = makeFixtureEvent({ format: 'meetup', attendanceMode: 'online' })
      const inPersonConference = makeFixtureEvent({ format: 'conference', attendanceMode: 'in_person' })
      expect(scoreEvent(meetup, social)).toBe(1)
      expect(scoreEvent(hybridCommunity, social)).toBe(1)
      expect(scoreEvent(onlineMeetup, social)).toBe(0)
      expect(scoreEvent(inPersonConference, social)).toBe(0)
    })

    it('hackathons scores hackathon format', () => {
      const builder: PreferenceProfile = { ...emptyProfile, intent: ['hackathons'] }
      const hackathon = makeFixtureEvent({ format: 'hackathon' })
      expect(scoreEvent(hackathon, builder)).toBe(1)
      expect(scoreEvent(makeFixtureEvent({ format: 'workshop' }), builder)).toBe(0)
    })

    it('communities scores events that carry community ids', () => {
      const curious: PreferenceProfile = { ...emptyProfile, intent: ['communities'] }
      const withCommunity = makeFixtureEvent({ communityIds: ['superteam'] })
      const solo = makeFixtureEvent({ communityIds: [] })
      expect(scoreEvent(withCommunity, curious)).toBe(1)
      expect(scoreEvent(solo, curious)).toBe(0)
    })
  })
})

describe('recommendEvents', () => {
  it('sorts by score descending with startAt ascending tie-break', () => {
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
    const result = recommendEvents([later, earlier], profile)
    expect(result.map((r) => r.event.id)).toEqual(['fixture-earlier', 'fixture-later'])
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
    const result = recommendEvents([zeroLater, matched, zeroEarlier], profile)
    expect(result.map((r) => r.event.id)).toEqual(['fixture-matched', 'fixture-zero-earlier', 'fixture-zero-later'])
  })

  it('returns deduplicated reason keys', () => {
    const event = makeFixtureEvent({
      topics: ['defi', 'mobile'],
      communityIds: ['community-a'],
    })
    const [recommendation] = recommendEvents([event], profile)
    expect(recommendation.score).toBe(5)
    expect(recommendation.reasonKeys).toEqual(['topic:defi', 'topic:mobile', 'community:community-a'])
  })

  it('includes intent reason keys once per matching intent', () => {
    const builderProfile: PreferenceProfile = { ...emptyProfile, intent: ['hackathons', 'learn'] }
    const hackathon = makeFixtureEvent({ format: 'hackathon', topics: ['developers'] })
    const [recommendation] = recommendEvents([hackathon], builderProfile)
    expect(recommendation.reasonKeys).toEqual(['intent:learn', 'intent:hackathons'])
  })

  it('returns no reasons and zero score for unmatched events', () => {
    const event = makeFixtureEvent({ topics: ['nfts'], communityIds: [] })
    const [recommendation] = recommendEvents([event], profile)
    expect(recommendation.score).toBe(0)
    expect(recommendation.reasonKeys).toEqual([])
  })

  it('never mutates the input array', () => {
    const a = makeFixtureEvent({ id: 'fixture-a', topics: ['nfts'] })
    const b = makeFixtureEvent({ id: 'fixture-b', topics: ['defi'] })
    const input = [a, b]
    recommendEvents(input, profile)
    expect(input.map((e) => e.id)).toEqual(['fixture-a', 'fixture-b'])
  })
})

describe('partitionPersonalized', () => {
  const matchedEarlier = makeFixtureEvent({
    id: 'fixture-matched-earlier',
    topics: ['defi'],
    startAt: '2026-11-02T18:00:00+01:00',
    endAt: '2026-11-02T22:00:00+01:00',
  })
  const matchedLater = makeFixtureEvent({
    id: 'fixture-matched-later',
    topics: ['defi', 'mobile'],
    startAt: '2026-11-04T18:00:00+01:00',
    endAt: '2026-11-04T22:00:00+01:00',
  })
  const zeroLater = makeFixtureEvent({
    id: 'fixture-zero-later',
    topics: ['gaming'],
    startAt: '2026-11-05T18:00:00+01:00',
    endAt: '2026-11-05T22:00:00+01:00',
  })
  const zeroEarlier = makeFixtureEvent({
    id: 'fixture-zero-earlier',
    topics: ['nfts'],
    startAt: '2026-11-01T18:00:00+01:00',
    endAt: '2026-11-01T22:00:00+01:00',
  })
  const ranked = recommendEvents([zeroLater, matchedLater, zeroEarlier, matchedEarlier], profile)

  it('puts score > 0 events in forYou, preserving personalized ranking and reasons', () => {
    const { forYou } = partitionPersonalized(ranked)
    expect(forYou.map((r) => r.event.id)).toEqual(['fixture-matched-later', 'fixture-matched-earlier'])
    expect(forYou.every((r) => r.score > 0)).toBe(true)
    expect(forYou.map((r) => r.reasonKeys[0])).toEqual(['topic:defi', 'topic:defi'])
  })

  it('puts score === 0 events in upcoming, ordered chronologically', () => {
    const { upcoming } = partitionPersonalized(ranked)
    expect(upcoming.map((e) => e.id)).toEqual(['fixture-zero-earlier', 'fixture-zero-later'])
  })

  it('never duplicates or drops events across sections', () => {
    const { forYou, upcoming } = partitionPersonalized(ranked)
    const forYouIds = forYou.map((r) => r.event.id)
    const upcomingIds = upcoming.map((e) => e.id)
    expect(forYouIds.filter((id) => upcomingIds.includes(id))).toEqual([])
    expect(new Set([...forYouIds, ...upcomingIds]).size).toBe(ranked.length)
  })
})
