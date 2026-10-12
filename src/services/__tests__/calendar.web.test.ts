import { makeFixtureEvent } from '../../domain/event-fixture'
import { addEventToCalendar } from '../calendar.web'

describe('web stub', () => {
  it('reports calendar as unsupported on web without touching the native module', async () => {
    const result = await addEventToCalendar(makeFixtureEvent())
    expect(result).toBe('unsupported')
  })
})
