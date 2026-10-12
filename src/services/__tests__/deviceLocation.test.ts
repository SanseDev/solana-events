import * as Location from 'expo-location'
import { preferenceFromGeocode, resolveDeviceLocation } from '../deviceLocation'

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}))

beforeEach(() => {
  jest.resetAllMocks()
})

describe('preferenceFromGeocode', () => {
  it('maps a hit with country code and city', () => {
    expect(preferenceFromGeocode([{ isoCountryCode: 'jp', city: 'Tokyo' }])).toEqual({
      countryCode: 'JP',
      city: 'Tokyo',
    })
  })

  it('falls back to country-only when the city is missing', () => {
    expect(preferenceFromGeocode([{ isoCountryCode: 'FR', city: null }])).toEqual({ countryCode: 'FR' })
  })

  it('skips unusable hits and uses the next one', () => {
    expect(
      preferenceFromGeocode([
        { isoCountryCode: null, city: 'Nowhere' },
        { isoCountryCode: 'gb', city: 'London' },
      ]),
    ).toEqual({ countryCode: 'GB', city: 'London' })
  })

  it('returns null when no hit has a supported country', () => {
    expect(preferenceFromGeocode([{ isoCountryCode: null }])).toBeNull()
    expect(preferenceFromGeocode([])).toBeNull()
  })
})

describe('resolveDeviceLocation', () => {
  it('reports permission denial without reading the position', async () => {
    ;(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })
    const outcome = await resolveDeviceLocation()
    expect(outcome).toEqual({ ok: false, reason: 'permission_denied' })
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled()
  })

  it('resolves through position and reverse geocoding', async () => {
    ;(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
    ;(Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 51.5, longitude: -0.12 } })
    ;(Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ isoCountryCode: 'GB', city: 'London' }])
    const outcome = await resolveDeviceLocation()
    expect(outcome).toEqual({ ok: true, location: { countryCode: 'GB', city: 'London' } })
    expect(Location.reverseGeocodeAsync).toHaveBeenCalledWith({ latitude: 51.5, longitude: -0.12 })
  })

  it('degrades to unavailable when geocoding fails', async () => {
    ;(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
    ;(Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 0, longitude: 0 } })
    ;(Location.reverseGeocodeAsync as jest.Mock).mockRejectedValue(new Error('network'))
    expect(await resolveDeviceLocation()).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('degrades to unavailable when no geocode hit is usable', async () => {
    ;(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
    ;(Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 0, longitude: 0 } })
    ;(Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ isoCountryCode: null }])
    expect(await resolveDeviceLocation()).toEqual({ ok: false, reason: 'unavailable' })
  })
})
