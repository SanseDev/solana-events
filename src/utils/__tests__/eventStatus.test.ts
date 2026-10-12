import { makeFixtureEvent } from '../../domain/event-fixture'
import { getEventStatus, getRegistrationState } from '../eventStatus'

const now = new Date('2026-10-05T12:00:00Z')

describe('getEventStatus', () => {
  it('is upcoming before the start instant', () => {
    const event = makeFixtureEvent({
      startAt: '2026-11-10T18:00:00+01:00',
      endAt: '2026-11-10T22:00:00+01:00',
    })
    expect(getEventStatus(event, now)).toBe('upcoming')
  })

  it('is ongoing between start and end', () => {
    const event = makeFixtureEvent({
      startAt: '2026-10-05T10:00:00Z',
      endAt: '2026-10-05T14:00:00Z',
    })
    expect(getEventStatus(event, now)).toBe('ongoing')
  })

  it('is ended after the end instant', () => {
    const event = makeFixtureEvent({
      startAt: '2026-10-01T10:00:00Z',
      endAt: '2026-10-02T10:00:00Z',
    })
    expect(getEventStatus(event, now)).toBe('ended')
  })
})

describe('getRegistrationState', () => {
  it('is none when no registration deadline and no registration url', () => {
    expect(getRegistrationState(makeFixtureEvent(), now)).toBe('none')
  })

  it('is open when a registration url exists and deadline is in the future', () => {
    const event = makeFixtureEvent({
      registrationUrl: 'https://example.com/register',
      registrationDeadline: '2026-11-01T23:59:00+01:00',
    })
    expect(getRegistrationState(event, now)).toBe('open')
  })

  it('is open when a registration url exists without a deadline', () => {
    const event = makeFixtureEvent({ registrationUrl: 'https://example.com/register' })
    expect(getRegistrationState(event, now)).toBe('open')
  })

  it('is closed once the deadline has passed', () => {
    const event = makeFixtureEvent({
      registrationUrl: 'https://example.com/register',
      registrationDeadline: '2026-10-01T23:59:00+01:00',
    })
    expect(getRegistrationState(event, now)).toBe('closed')
  })
})
