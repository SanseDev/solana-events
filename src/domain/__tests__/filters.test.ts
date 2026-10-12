import { makeFixtureEvent } from '../event-fixture'
import { emptyProfile } from '../../utils/ranking'
import {
  applyFilters,
  clampLocationToCatalog,
  defaultFiltersForProfile,
  emptyFilters,
  hasActiveFilters,
  locationLabel,
  thisWeekWindow,
} from '../filters'

describe('hasActiveFilters', () => {
  it('is false for empty filters', () => {
    expect(hasActiveFilters(emptyFilters)).toBe(false)
  })

  it('is false for location only (location constrains but does not switch layout)', () => {
    expect(hasActiveFilters({ ...emptyFilters, location: { countryCode: 'GB' } })).toBe(false)
  })

  it('is true when topics selected', () => {
    expect(hasActiveFilters({ ...emptyFilters, topics: ['defi'] })).toBe(true)
  })

  it('is true when attendance selected', () => {
    expect(hasActiveFilters({ ...emptyFilters, attendance: ['online'] })).toBe(true)
  })

  it('is true when dateRange is this week', () => {
    expect(hasActiveFilters({ ...emptyFilters, dateRange: 'this_week' })).toBe(true)
  })
})

describe('applyFilters', () => {
  const defiWorkshop = makeFixtureEvent({
    id: 'fixture-defi-w',
    title: 'DeFi Workshop',
    topics: ['defi'],
    format: 'workshop',
    attendanceMode: 'online',
    startAt: '2026-11-10T18:00:00+01:00',
    endAt: '2026-11-10T22:00:00+01:00',
  })
  const defiConference = makeFixtureEvent({
    id: 'fixture-defi-c',
    title: 'DeFi Conference',
    topics: ['defi', 'dao'],
    format: 'conference',
    attendanceMode: 'in_person',
    startAt: '2026-11-20T18:00:00+01:00',
    endAt: '2026-11-20T22:00:00+01:00',
  })
  const nftMeetup = makeFixtureEvent({
    id: 'fixture-nft-m',
    title: 'NFT Meetup',
    topics: ['nfts'],
    format: 'meetup',
    attendanceMode: 'hybrid',
    startAt: '2026-11-05T18:00:00+01:00',
    endAt: '2026-11-05T22:00:00+01:00',
  })
  const events = [defiWorkshop, defiConference, nftMeetup]

  it('returns all events with empty filters and query', () => {
    expect(applyFilters(events, '', emptyFilters)).toHaveLength(3)
  })

  it('ORs values inside the topics category', () => {
    const result = applyFilters(events, '', { ...emptyFilters, topics: ['defi', 'nfts'] })
    expect(result.map((e) => e.id)).toEqual(['fixture-defi-w', 'fixture-defi-c', 'fixture-nft-m'])
  })

  it('ANDs topics with format categories', () => {
    const result = applyFilters(events, '', {
      ...emptyFilters,
      topics: ['defi'],
      formats: ['workshop'],
    })
    expect(result.map((e) => e.id)).toEqual(['fixture-defi-w'])
  })

  it('ORs formats inside the format category', () => {
    const result = applyFilters(events, '', { ...emptyFilters, formats: ['conference', 'meetup'] })
    expect(result.map((e) => e.id)).toEqual(['fixture-defi-c', 'fixture-nft-m'])
  })

  it('ORs attendance modes inside the attendance category (online + hybrid)', () => {
    const result = applyFilters(events, '', { ...emptyFilters, attendance: ['online', 'hybrid'] })
    expect(result.map((e) => e.id)).toEqual(['fixture-defi-w', 'fixture-nft-m'])
  })

  it('ANDs attendance with formats', () => {
    const result = applyFilters(events, '', {
      ...emptyFilters,
      attendance: ['in_person'],
      formats: ['conference'],
    })
    expect(result.map((e) => e.id)).toEqual(['fixture-defi-c'])
  })

  it('returns nothing when attendance and formats are incompatible', () => {
    const result = applyFilters(events, '', {
      ...emptyFilters,
      attendance: ['online'],
      formats: ['conference'],
    })
    expect(result).toEqual([])
  })

  it('filters by country code + city', () => {
    const london = makeFixtureEvent({
      id: 'fixture-london',
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
    })
    const londonUsa = makeFixtureEvent({
      id: 'fixture-london-us',
      city: 'London',
      country: 'United States',
      countryCode: 'US',
    })
    const result = applyFilters([london, londonUsa], '', {
      ...emptyFilters,
      location: { countryCode: 'GB', city: 'London' },
    })
    expect(result.map((e) => e.id)).toEqual(['fixture-london'])
  })

  it('matches every catalog city for a country-only selection', () => {
    const london = makeFixtureEvent({
      id: 'fixture-london',
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
    })
    const edinburgh = makeFixtureEvent({
      id: 'fixture-edinburgh',
      city: 'Edinburgh',
      country: 'United Kingdom',
      countryCode: 'GB',
    })
    const vegas = makeFixtureEvent({
      id: 'fixture-vegas',
      city: 'Las Vegas',
      country: 'United States',
      countryCode: 'US',
    })
    const result = applyFilters([london, edinburgh, vegas], '', { ...emptyFilters, location: { countryCode: 'GB' } })
    expect(result.map((e) => e.id)).toEqual(['fixture-london', 'fixture-edinburgh'])
  })

  it('excludes other cities in the same country on a city selection', () => {
    const london = makeFixtureEvent({
      id: 'fixture-london',
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
    })
    const edinburgh = makeFixtureEvent({
      id: 'fixture-edinburgh',
      city: 'Edinburgh',
      country: 'United Kingdom',
      countryCode: 'GB',
    })
    const result = applyFilters([london, edinburgh], '', {
      ...emptyFilters,
      location: { countryCode: 'GB', city: 'Edinburgh' },
    })
    expect(result.map((e) => e.id)).toEqual(['fixture-edinburgh'])
  })

  it('Anywhere (null location) keeps all events regardless of place', () => {
    const london = makeFixtureEvent({
      id: 'fixture-london',
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
    })
    const online = makeFixtureEvent({
      id: 'fixture-online',
      city: undefined,
      country: undefined,
      countryCode: undefined,
    })
    expect(applyFilters([london, online], '', emptyFilters).map((e) => e.id)).toEqual([
      'fixture-london',
      'fixture-online',
    ])
  })

  it('excludes events without a country code when location is set', () => {
    const online = makeFixtureEvent({
      id: 'fixture-online',
      city: undefined,
      country: undefined,
      countryCode: undefined,
    })
    const result = applyFilters([online], '', { ...emptyFilters, location: { countryCode: 'GB' } })
    expect(result).toEqual([])
  })

  it('keeps events without a city when no location is set', () => {
    const online = makeFixtureEvent({ id: 'fixture-online', city: undefined, country: undefined })
    expect(applyFilters([online], '', emptyFilters)).toHaveLength(1)
  })

  describe('this week', () => {
    const now = new Date('2026-11-03T10:00:00+01:00')

    it('includes an event starting later today', () => {
      const todayEvening = makeFixtureEvent({
        id: 'fixture-today',
        startAt: '2026-11-03T20:00:00+01:00',
        endAt: '2026-11-03T22:00:00+01:00',
      })
      const result = applyFilters([todayEvening], '', { ...emptyFilters, dateRange: 'this_week' }, now)
      expect(result.map((e) => e.id)).toEqual(['fixture-today'])
    })

    it('includes an event starting on the 7th local day (end of window)', () => {
      const lastDay = makeFixtureEvent({
        id: 'fixture-last-day',
        startAt: '2026-11-09T09:00:00+01:00',
        endAt: '2026-11-09T11:00:00+01:00',
      })
      const result = applyFilters([lastDay], '', { ...emptyFilters, dateRange: 'this_week' }, now)
      expect(result.map((e) => e.id)).toEqual(['fixture-last-day'])
    })

    it('excludes an event starting after the 7th local day', () => {
      const nextWeek = makeFixtureEvent({
        id: 'fixture-next-week',
        startAt: '2026-11-10T09:00:00+01:00',
        endAt: '2026-11-10T11:00:00+01:00',
      })
      const result = applyFilters([nextWeek], '', { ...emptyFilters, dateRange: 'this_week' }, now)
      expect(result).toEqual([])
    })

    it('includes a long event that started before now but ends inside the window', () => {
      const spanning = makeFixtureEvent({
        id: 'fixture-spanning',
        startAt: '2026-11-01T09:00:00+01:00',
        endAt: '2026-11-06T11:00:00+01:00',
      })
      const result = applyFilters([spanning], '', { ...emptyFilters, dateRange: 'this_week' }, now)
      expect(result.map((e) => e.id)).toEqual(['fixture-spanning'])
    })

    it('excludes an event that already ended before now', () => {
      const ended = makeFixtureEvent({
        id: 'fixture-ended',
        startAt: '2026-11-01T09:00:00+01:00',
        endAt: '2026-11-02T11:00:00+01:00',
      })
      const result = applyFilters([ended], '', { ...emptyFilters, dateRange: 'this_week' }, now)
      expect(result).toEqual([])
    })
  })

  it('matches query case-insensitively on title', () => {
    const result = applyFilters(events, 'nft MEET', emptyFilters)
    expect(result.map((e) => e.id)).toEqual(['fixture-nft-m'])
  })

  it('matches query on organizer', () => {
    const result = applyFilters(events, 'fixture org', emptyFilters)
    expect(result).toHaveLength(3)
  })

  it('combines query AND filters', () => {
    const result = applyFilters(events, 'defi', { ...emptyFilters, formats: ['conference'] })
    expect(result.map((e) => e.id)).toEqual(['fixture-defi-c'])
  })

  it('returns empty array when nothing matches', () => {
    expect(applyFilters(events, 'nope', emptyFilters)).toEqual([])
  })
})

describe('defaultFiltersForProfile', () => {
  it('returns empty filters for a neutral profile', () => {
    expect(defaultFiltersForProfile(emptyProfile)).toEqual(emptyFilters)
  })

  it('seeds the location constraint from the profile', () => {
    const filters = defaultFiltersForProfile({
      ...emptyProfile,
      location: { countryCode: 'GB', city: 'London' },
    })
    expect(filters.location).toEqual({ countryCode: 'GB', city: 'London' })
    expect(hasActiveFilters(filters)).toBe(false)
  })

  it('maps online participation to online + hybrid attendance', () => {
    const filters = defaultFiltersForProfile({ ...emptyProfile, participation: 'online' })
    expect(filters.attendance).toEqual(['online', 'hybrid'])
  })

  it('maps in-person participation to in-person + hybrid attendance', () => {
    const filters = defaultFiltersForProfile({ ...emptyProfile, participation: 'in_person' })
    expect(filters.attendance).toEqual(['in_person', 'hybrid'])
  })
})

describe('clampLocationToCatalog', () => {
  const london = makeFixtureEvent({
    id: 'fixture-london',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
  })

  it('keeps a city the catalog actually has', () => {
    expect(clampLocationToCatalog([london], { countryCode: 'GB', city: 'London' })).toEqual({
      countryCode: 'GB',
      city: 'London',
    })
  })

  it('drops a city the catalog lacks, keeping the country', () => {
    expect(clampLocationToCatalog([london], { countryCode: 'GB', city: 'Croydon' })).toEqual({ countryCode: 'GB' })
  })

  it('drops the city when the country has no catalog events at all', () => {
    expect(clampLocationToCatalog([london], { countryCode: 'JP', city: 'Tokyo' })).toEqual({ countryCode: 'JP' })
  })

  it('passes a country-only selection through unchanged', () => {
    expect(clampLocationToCatalog([london], { countryCode: 'GB' })).toEqual({ countryCode: 'GB' })
  })
})

describe('locationLabel', () => {
  it('formats null as Anywhere', () => {
    expect(locationLabel(null)).toBe('Anywhere')
  })

  it('formats a country-only selection as the country name', () => {
    expect(locationLabel({ countryCode: 'FR' })).toBe('France')
  })

  it('formats a city selection as `City, Country`', () => {
    expect(locationLabel({ countryCode: 'FR', city: 'Paris' })).toBe('Paris, France')
  })
})

describe('thisWeekWindow', () => {
  it('starts at now and ends at the last millisecond of the 7th local day', () => {
    const now = new Date('2026-11-03T10:00:00.500+01:00')
    const window = thisWeekWindow(now)
    expect(window.start).toBe(now.getTime())
    const end = new Date(window.end)
    // Local day of now + 6 days, at 23:59:59.999 local.
    expect(end.getDate()).toBe(9)
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getMilliseconds()).toBe(999)
  })

  it('rolls across a month boundary', () => {
    const now = new Date('2026-10-28T08:00:00+02:00')
    const window = thisWeekWindow(now)
    const end = new Date(window.end)
    expect(end.getMonth()).toBe(10) // November
    expect(end.getDate()).toBe(3)
  })
})
