import type { Event } from './event'

/** Fixture factory for tests only. Ids are prefixed `fixture-` and never ship in the production catalog. */
export function makeFixtureEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'fixture-1',
    title: 'Fixture Event',
    shortDescription: 'A fixture event used in tests.',
    description: 'A fixture event used in tests. Never rendered in production.',
    organizer: 'Fixture Org',
    topics: ['developers'],
    format: 'meetup',
    communityIds: ['community-fixture'],
    startAt: '2026-11-10T18:00:00+01:00',
    endAt: '2026-11-10T22:00:00+01:00',
    timezoneLabel: 'CET',
    attendanceMode: 'in_person',
    city: 'Paris',
    country: 'France',
    officialSourceUrl: 'https://example.com/fixture',
    lastVerifiedAt: '2026-10-05',
    ...overrides,
  }
}
