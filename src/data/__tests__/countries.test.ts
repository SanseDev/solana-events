import rawEvents from '../events.json'
import { COUNTRIES, countryCodeForName, countryName, isCountryCode } from '../countries'
import type { Event } from '../../domain/event'

describe('country data', () => {
  it('has unique codes', () => {
    const codes = COUNTRIES.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('resolves codes and names both ways', () => {
    expect(countryName('FR')).toBe('France')
    expect(countryName('fr')).toBe('France')
    expect(countryCodeForName('United Kingdom')).toBe('GB')
    expect(countryCodeForName('Atlantis')).toBeNull()
    expect(isCountryCode('US')).toBe(true)
    expect(isCountryCode('ZZ')).toBe(false)
  })
})

describe('catalog country codes', () => {
  const located = (rawEvents as Event[]).filter((event) => event.country)

  it('every catalog country name maps to an ISO code', () => {
    for (const event of located) {
      expect(countryCodeForName(event.country as string)).not.toBeNull()
    }
  })

  it('every stored countryCode is a known ISO code consistent with the country name', () => {
    for (const event of located) {
      expect(isCountryCode(event.countryCode as string)).toBe(true)
      expect(event.countryCode).toBe(countryCodeForName(event.country as string))
    }
  })
})
