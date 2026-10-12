import { formatDateBlock, formatEventDateRange, isBefore, parseInstant } from '../dates'

describe('parseInstant', () => {
  it('parses ISO 8601 with offset to epoch milliseconds', () => {
    expect(parseInstant('2026-11-10T18:00:00+01:00')).toBe(Date.parse('2026-11-10T18:00:00+01:00'))
  })

  it('returns NaN for garbage', () => {
    expect(Number.isNaN(parseInstant('not-a-date'))).toBe(true)
  })
})

describe('formatDateBlock', () => {
  it('extracts uppercase month and day from the ISO string, preserving event timezone', () => {
    expect(formatDateBlock('2026-11-10T18:00:00+01:00')).toEqual({ month: 'NOV', day: '10' })
  })

  it('keeps the event-local day even when device timezone differs', () => {
    // 23:30 in UTC+8 is still the 10th locally but the 9th in UTC: block must show 10.
    expect(formatDateBlock('2026-11-10T23:30:00+08:00')).toEqual({ month: 'NOV', day: '10' })
  })
})

describe('formatEventDateRange', () => {
  it('formats same-day range with single date and time span', () => {
    const text = formatEventDateRange('2026-11-10T18:00:00+01:00', '2026-11-10T22:00:00+01:00', 'CET')
    expect(text).toBe('10 Nov 2026, 18:00–22:00 CET')
  })

  it('formats multi-day range with both dates', () => {
    const text = formatEventDateRange('2026-11-10T09:00:00+01:00', '2026-11-13T18:00:00+01:00', 'CET')
    expect(text).toBe('10 Nov 2026, 09:00 – 13 Nov 2026, 18:00 CET')
  })
})

describe('isBefore', () => {
  it('compares an ISO instant against another', () => {
    expect(isBefore('2026-11-10T18:00:00+01:00', '2026-11-10T19:00:00+01:00')).toBe(true)
    expect(isBefore('2026-11-10T19:00:00+01:00', '2026-11-10T18:00:00+01:00')).toBe(false)
  })
})
