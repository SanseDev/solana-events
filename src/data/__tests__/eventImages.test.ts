import rawEvents from '../events.json'
import {
  EVENT_IMAGES,
  PENDING_EVENT_ARTWORK,
  getEventImage,
  getPendingEventArtwork,
  preferredContentFit,
  shouldRenderEventImage,
  type EventImageAsset,
} from '../eventImages'
import { isValidEvent, type Event } from '../../domain/event'

const catalogIds = (rawEvents as unknown[]).filter(isValidEvent).map((event) => (event as Event).id)

describe('event image registry', () => {
  it('has no unverified event artwork', () => {
    expect(getEventImage('breakpoint-2026')).toBeUndefined()
    expect(Object.keys(EVENT_IMAGES)).toHaveLength(0)
  })

  const asset: EventImageAsset = {
    source: 42,
    aspect: 1,
    sourceUrl: 'https://assets.example.com/event.jpg',
    attribution: 'Example photographer',
    permissionOrLicense: 'CC BY 4.0',
  }

  it('renders a verified local asset before it has failed', () => {
    expect(shouldRenderEventImage(asset, false)).toBe(true)
  })

  it('uses fallback when an event has no image', () => {
    expect(shouldRenderEventImage(undefined, false)).toBe(false)
  })

  it('uses fallback after image loading fails', () => {
    expect(shouldRenderEventImage(asset, true)).toBe(false)
  })

  it('requires source and provenance metadata for every future local asset', () => {
    expect(asset.source).toBe(42)
    expect(asset.sourceUrl).toMatch(/^https:\/\//)
    expect(asset.attribution.length).toBeGreaterThan(0)
    expect(asset.permissionOrLicense.length).toBeGreaterThan(0)
  })
})

describe('pending event artwork mapping', () => {
  it('maps every catalog event exactly, with no extras', () => {
    expect(Object.keys(PENDING_EVENT_ARTWORK).sort()).toEqual([...catalogIds].sort())
  })

  it('records source page, dimensions, and checksum for each candidate', () => {
    for (const [eventId, pending] of Object.entries(PENDING_EVENT_ARTWORK)) {
      expect(pending.sourcePage).toMatch(/^https:\/\//)
      expect(pending.file).toMatch(/^candidates\//)
      expect(pending.sha256).toMatch(/^[0-9a-f]{64}$/)
      expect(pending.width).toBeGreaterThan(0)
      expect(pending.height).toBeGreaterThan(0)
      expect(getPendingEventArtwork(eventId)).toBe(pending)
    }
  })

  it('reuses one file per identical checksum so recurring series bundle once', () => {
    const fileBySha = new Map<string, string>()
    for (const pending of Object.values(PENDING_EVENT_ARTWORK)) {
      const known = fileBySha.get(pending.sha256)
      if (known === undefined) {
        fileBySha.set(pending.sha256, pending.file)
      } else {
        expect(pending.file).toBe(known)
      }
    }
    // 51 mappings, 43 unique files: the 11 VibeStation occurrences share 3 files.
    expect(Object.keys(PENDING_EVENT_ARTWORK)).toHaveLength(51)
    expect(new Set(Object.values(PENDING_EVENT_ARTWORK).map((pending) => pending.file)).size).toBe(43)
  })
})

describe('preferredContentFit', () => {
  it('covers when the image aspect is close to the box aspect', () => {
    expect(preferredContentFit(16 / 9, 16 / 9)).toBe('cover')
    expect(preferredContentFit(1200 / 630, 16 / 9)).toBe('cover')
  })

  it('contains square and portrait posters instead of cropping them', () => {
    expect(preferredContentFit(1, 16 / 9)).toBe('contain')
    expect(preferredContentFit(1, 4 / 3)).toBe('contain')
    expect(preferredContentFit(572 / 1024, 16 / 9)).toBe('contain')
    expect(preferredContentFit(1200 / 630, 4 / 3)).toBe('contain')
  })
})
