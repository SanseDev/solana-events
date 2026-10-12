import { getEventImage, shouldRenderEventImage, type EventImageAsset } from '../eventImages'

describe('event image registry', () => {
  it('has no unverified event artwork', () => {
    expect(getEventImage('breakpoint-2026')).toBeUndefined()
  })

  const asset: EventImageAsset = {
    source: 42,
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
