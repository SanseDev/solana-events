import { isValidEvent } from '../event'
import { makeFixtureEvent } from '../event-fixture'

describe('isValidEvent location rules', () => {
  it('accepts a located event with a valid ISO country code', () => {
    expect(isValidEvent(makeFixtureEvent({ city: 'London', country: 'United Kingdom', countryCode: 'GB' }))).toBe(true)
  })

  it('accepts an online event without any country code', () => {
    expect(
      isValidEvent(
        makeFixtureEvent({ attendanceMode: 'online', city: undefined, country: undefined, countryCode: undefined }),
      ),
    ).toBe(true)
  })

  it('rejects a located event that omits the country code', () => {
    expect(isValidEvent(makeFixtureEvent({ countryCode: undefined }))).toBe(false)
  })

  it('rejects a located event with an unknown country code', () => {
    expect(isValidEvent(makeFixtureEvent({ countryCode: 'ZZ' }))).toBe(false)
  })

  it('rejects an online event carrying an invalid country code', () => {
    expect(isValidEvent(makeFixtureEvent({ city: undefined, country: undefined, countryCode: 'nope' }))).toBe(false)
  })
})
