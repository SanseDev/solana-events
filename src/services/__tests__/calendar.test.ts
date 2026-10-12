import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { requestCalendarPermissions, getCalendars } from 'expo-calendar'
import { makeFixtureEvent } from '../../domain/event-fixture'
import { addEventToCalendar, buildCalendarDetails } from '../calendar'

jest.mock('expo-calendar', () => ({
  requestCalendarPermissions: jest.fn(),
  getCalendars: jest.fn(),
}))

const projectRoot = path.resolve(__dirname, '../../..')

function readSource(relativePath: string): string {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

function makeNativeCalendar(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cal-1',
    allowsModifications: true,
    isPrimary: true,
    createEvent: jest.fn().mockResolvedValue('evt-1'),
    ...overrides,
  }
}

const granted = () => (requestCalendarPermissions as jest.Mock).mockResolvedValue({ granted: true })
const denied = () => (requestCalendarPermissions as jest.Mock).mockResolvedValue({ granted: false })
const calendars = (...cals: ReturnType<typeof makeNativeCalendar>[]) =>
  (getCalendars as jest.Mock).mockResolvedValue(cals)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('buildCalendarDetails (pure mapping)', () => {
  it('maps offset-explicit ISO strings to epoch-correct Dates', () => {
    const details = buildCalendarDetails(makeFixtureEvent())
    expect(details.startDate).toEqual(new Date('2026-11-10T18:00:00+01:00'))
    expect(details.endDate).toEqual(new Date('2026-11-10T22:00:00+01:00'))
  })

  it('defaults to a timed entry and carries the title', () => {
    const details = buildCalendarDetails(makeFixtureEvent())
    expect(details.title).toBe('Fixture Event')
    expect(details.allDay).toBe(false)
  })

  it('flags all-day events', () => {
    const details = buildCalendarDetails(
      makeFixtureEvent({ allDay: true, startAt: '2026-11-15T00:00:00+01:00', endAt: '2026-11-17T00:00:00+01:00' }),
    )
    expect(details.allDay).toBe(true)
  })

  it('joins venue/city/country for in-person events', () => {
    const details = buildCalendarDetails(makeFixtureEvent({ venue: 'Station F' }))
    expect(details.location).toBe('Station F, Paris, France')
  })

  it('uses Online as the location for online events', () => {
    const details = buildCalendarDetails(
      makeFixtureEvent({ attendanceMode: 'online', city: undefined, country: undefined }),
    )
    expect(details.location).toBe('Online')
  })

  it('embeds the official source URL in the notes', () => {
    const details = buildCalendarDetails(makeFixtureEvent())
    expect(details.notes).toContain('A fixture event used in tests.')
    expect(details.notes).toContain('https://example.com/fixture')
  })
})

describe('addEventToCalendar result contract', () => {
  it('returns permission-denied and never writes when permission is refused', async () => {
    denied()
    const result = await addEventToCalendar(makeFixtureEvent())
    expect(result).toBe('permission-denied')
    expect(getCalendars).not.toHaveBeenCalled()
  })

  it('returns error instead of rejecting when the permission request itself fails', async () => {
    ;(requestCalendarPermissions as jest.Mock).mockRejectedValue(new Error('permissions module crashed'))
    const result = await addEventToCalendar(makeFixtureEvent())
    expect(result).toBe('error')
    expect(getCalendars).not.toHaveBeenCalled()
  })

  it('returns no-calendar when the calendar list cannot be read', async () => {
    granted()
    ;(getCalendars as jest.Mock).mockRejectedValue(new Error('provider unavailable'))
    const result = await addEventToCalendar(makeFixtureEvent())
    expect(result).toBe('no-calendar')
  })

  it('returns no-calendar when no writable calendar exists', async () => {
    granted()
    calendars(makeNativeCalendar({ allowsModifications: false }))
    const result = await addEventToCalendar(makeFixtureEvent())
    expect(result).toBe('no-calendar')
  })

  it('prefers the primary calendar and returns added', async () => {
    granted()
    const secondary = makeNativeCalendar({ id: 'cal-2', isPrimary: false })
    const primary = makeNativeCalendar({ id: 'cal-1' })
    calendars(secondary, primary)
    const result = await addEventToCalendar(makeFixtureEvent())
    expect(result).toBe('added')
    expect(primary.createEvent).toHaveBeenCalledWith(expect.objectContaining({ title: 'Fixture Event' }))
    expect(secondary.createEvent).not.toHaveBeenCalled()
  })

  it('falls back to the first writable calendar when none is primary', async () => {
    granted()
    const writable = makeNativeCalendar({ id: 'cal-9', isPrimary: false })
    calendars(makeNativeCalendar({ allowsModifications: false }), writable)
    const result = await addEventToCalendar(makeFixtureEvent())
    expect(result).toBe('added')
    expect(writable.createEvent).toHaveBeenCalledTimes(1)
  })

  it('returns error when the native write fails', async () => {
    granted()
    calendars(makeNativeCalendar({ createEvent: jest.fn().mockRejectedValue(new Error('write failed')) }))
    const result = await addEventToCalendar(makeFixtureEvent())
    expect(result).toBe('error')
  })
})

describe('calendar service safety (spec 20261008-p1)', () => {
  it('is the only app code importing expo-calendar', () => {
    const dirs = ['app', 'src/components', 'src/hooks', 'src/data', 'src/domain', 'src/utils']
    for (const dir of dirs) {
      const entries = readdirSync(path.join(projectRoot, dir), { recursive: true }) as string[]
      const codeFiles = entries.filter((f) => /\.(tsx|ts)$/.test(f))
      for (const file of codeFiles) {
        expect(readSource(`${dir}/${file}`)).not.toContain('expo-calendar')
      }
    }
    expect(readSource('src/services/calendar.ts')).toContain("from 'expo-calendar'")
  })
})
