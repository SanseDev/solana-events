import * as Location from 'expo-location'
import type { LocationPreference } from '../domain/event'
import { isCountryCode } from '../data/countries'

export type DeviceLocationOutcome =
  { ok: true; location: LocationPreference } | { ok: false; reason: 'permission_denied' | 'unavailable' }

export interface GeocodedPlace {
  isoCountryCode?: string | null
  city?: string | null
}

/**
 * Maps reverse-geocode hits to a location preference, skipping results whose
 * country cannot be identified. Returns null when no hit is usable.
 */
export function preferenceFromGeocode(results: readonly GeocodedPlace[]): LocationPreference | null {
  for (const place of results) {
    const code = typeof place.isoCountryCode === 'string' ? place.isoCountryCode.toUpperCase() : ''
    if (!isCountryCode(code)) {
      continue
    }
    const city = typeof place.city === 'string' && place.city.length > 0 ? place.city : undefined
    return city ? { countryCode: code, city } : { countryCode: code }
  }
  return null
}

/**
 * Resolves the device location after an explicit user action. Permission is
 * requested here only — never at app startup. Any failure is reported as a
 * non-fatal outcome so the manual picker stays usable.
 */
export async function resolveDeviceLocation(): Promise<DeviceLocationOutcome> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync()
    if (permission.status !== 'granted') {
      return { ok: false, reason: 'permission_denied' }
    }
    const position = await Location.getCurrentPositionAsync({})
    const addresses = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    })
    const location = preferenceFromGeocode(addresses)
    return location ? { ok: true, location } : { ok: false, reason: 'unavailable' }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}
