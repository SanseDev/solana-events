import { makeFixtureEvent } from '../event-fixture'
import { applyFilters, emptyFilters, hasActiveFilters } from '../filters'

describe('hasActiveFilters', () => {
  it('is false for empty filters', () => {
    expect(hasActiveFilters(emptyFilters)).toBe(false)
  })

  it('is true when topics selected', () => {
    expect(hasActiveFilters({ ...emptyFilters, topics: ['defi'] })).toBe(true)
  })

  it('is true when attendance is not any', () => {
    expect(hasActiveFilters({ ...emptyFilters, attendance: 'online' })).toBe(true)
  })
})

describe('applyFilters', () => {
  const defiWorkshop = makeFixtureEvent({
    id: 'fixture-defi-w',
    title: 'DeFi Workshop',
    topics: ['defi'],
    format: 'workshop',
    attendanceMode: 'online',
  })
  const defiConference = makeFixtureEvent({
    id: 'fixture-defi-c',
    title: 'DeFi Conference',
    topics: ['defi', 'dao'],
    format: 'conference',
    attendanceMode: 'in_person',
  })
  const nftMeetup = makeFixtureEvent({
    id: 'fixture-nft-m',
    title: 'NFT Meetup',
    topics: ['nfts'],
    format: 'meetup',
    attendanceMode: 'hybrid',
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

  it('filters by attendance mode exactly', () => {
    const result = applyFilters(events, '', { ...emptyFilters, attendance: 'hybrid' })
    expect(result.map((e) => e.id)).toEqual(['fixture-nft-m'])
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
