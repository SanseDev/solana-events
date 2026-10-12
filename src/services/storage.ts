import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  INTENTS,
  PARTICIPATION_PREFERENCES,
  TOPICS,
  type Intent,
  type Interests,
  type LocationPreference,
  type ParticipationPreference,
  type PreferenceProfile,
  type Topic,
} from '../domain/event'
import { countryCodeForName, isCountryCode } from '../data/countries'

/**
 * Versioned storage keys. Bump suffix and add a migration when the shape
 * changes. The v1 keys stay readable forever; v1 is never deleted.
 */
export const STORAGE_KEYS = {
  favorites: 'solana-events:favorites:v1',
  interests: 'solana-events:interests:v1',
  preferences: 'solana-events:preferences:v2',
  onboarding: 'solana-events:onboarding:v1',
} as const

export const emptyProfile: PreferenceProfile = {
  intent: [],
  topics: [],
  communityIds: [],
  participation: 'both',
  location: null,
}

export interface OnboardingState {
  completed: boolean
  step: 1 | 2 | 3
  draft: PreferenceProfile
}

/** Never throws: corrupt or missing data degrades to the default value. */
async function readJson<T>(key: string, parse: (raw: unknown) => T, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key)
    if (raw === null) {
      return fallback
    }
    return parse(JSON.parse(raw))
  } catch {
    return fallback
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}

function parseFavorites(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : []
}

function parseInterests(raw: unknown): Interests {
  if (typeof raw !== 'object' || raw === null) {
    return { topics: [], communityIds: [] }
  }
  const { topics, communityIds } = raw as { topics?: unknown; communityIds?: unknown }
  return {
    topics: Array.isArray(topics) ? topics.filter((t): t is Topic => TOPICS.includes(t as Topic)) : [],
    communityIds: Array.isArray(communityIds) ? communityIds.filter((id): id is string => typeof id === 'string') : [],
  }
}

function stringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : []
}

function enumArray<T extends string>(raw: unknown, allowed: readonly T[]): T[] {
  return Array.isArray(raw) ? raw.filter((value): value is T => allowed.includes(value as T)) : []
}

/**
 * Accepts the ISO-code shape (`{ countryCode, city? }`) and migrates the
 * legacy display-name shape (`{ city, country }`) by mapping the country name
 * to its ISO code. Unknown or invalid locations degrade to null.
 */
function parseLocation(raw: unknown): LocationPreference | null {
  if (typeof raw !== 'object' || raw === null) {
    return null
  }
  const { countryCode, city, country } = raw as {
    countryCode?: unknown
    city?: unknown
    country?: unknown
  }
  const hasCity = typeof city === 'string' && city.length > 0
  if (typeof countryCode === 'string') {
    const code = countryCode.toUpperCase()
    if (!isCountryCode(code)) {
      return null
    }
    return hasCity ? { countryCode: code, city: city as string } : { countryCode: code }
  }
  if (typeof country === 'string') {
    const code = countryCodeForName(country)
    if (code === null) {
      return null
    }
    return hasCity ? { countryCode: code, city: city as string } : { countryCode: code }
  }
  return null
}

function parseProfile(raw: unknown): PreferenceProfile {
  if (typeof raw !== 'object' || raw === null) {
    return emptyProfile
  }
  const profile = raw as Record<string, unknown>
  const participation = profile.participation as ParticipationPreference
  return {
    intent: enumArray<Intent>(profile.intent, INTENTS),
    topics: enumArray<Topic>(profile.topics, TOPICS),
    communityIds: stringArray(profile.communityIds),
    participation: PARTICIPATION_PREFERENCES.includes(participation) ? participation : 'both',
    location: parseLocation(profile.location),
  }
}

/** Stored favorites ids, deduplicated, order preserved. */
export async function loadFavorites(): Promise<string[]> {
  const ids = await readJson(STORAGE_KEYS.favorites, parseFavorites, [] as string[])
  return [...new Set(ids)]
}

export async function saveFavorites(ids: string[]): Promise<void> {
  await writeJson(STORAGE_KEYS.favorites, [...new Set(ids)])
}

/**
 * Loads the v2 preference profile. When v2 is absent, parses legacy
 * `interests:v1` into a profile, persists it as v2, and keeps v1 intact.
 * When a stored v2 profile still carries a legacy `{ city, country }`
 * location, the converted ISO location is persisted back once.
 */
export async function loadPreferences(): Promise<PreferenceProfile> {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.preferences)
  if (stored !== null) {
    const profile = await readJson(STORAGE_KEYS.preferences, parseProfile, emptyProfile)
    await persistLocationMigration(stored, profile).catch(() => undefined)
    return profile
  }
  const legacy = await readJson(STORAGE_KEYS.interests, parseInterests, null as Interests | null)
  if (legacy === null) {
    return emptyProfile
  }
  const migrated: PreferenceProfile = { ...emptyProfile, topics: legacy.topics, communityIds: legacy.communityIds }
  // A failed migration write is not fatal: the next launch migrates again.
  await writeJson(STORAGE_KEYS.preferences, migrated).catch(() => undefined)
  return migrated
}

/**
 * Rewrites a stored v2 profile whose location was parsed from the legacy
 * display-name shape, so storage converges on the ISO-code shape. Skipped
 * when there is nothing to convert; a failed write is retried next launch.
 */
async function persistLocationMigration(stored: string, profile: PreferenceProfile): Promise<void> {
  if (profile.location === null) {
    return
  }
  let rawLocation: unknown
  try {
    const raw = JSON.parse(stored) as { location?: unknown }
    rawLocation = raw.location
  } catch {
    return
  }
  if (typeof rawLocation !== 'object' || rawLocation === null) {
    return
  }
  if (typeof (rawLocation as { countryCode?: unknown }).countryCode === 'string') {
    return
  }
  await writeJson(STORAGE_KEYS.preferences, profile)
}

export async function savePreferences(profile: PreferenceProfile): Promise<void> {
  await writeJson(STORAGE_KEYS.preferences, profile)
}

const ONBOARDING_STEPS: readonly (1 | 2 | 3)[] = [1, 2, 3]

function parseOnboarding(raw: unknown): OnboardingState {
  if (typeof raw !== 'object' || raw === null) {
    return { completed: false, step: 1, draft: emptyProfile }
  }
  const state = raw as Record<string, unknown>
  const step = state.step as OnboardingState['step']
  return {
    completed: state.completed === true,
    step: ONBOARDING_STEPS.includes(step) ? step : 1,
    draft: parseProfile(state.draft),
  }
}

export async function loadOnboarding(): Promise<OnboardingState> {
  return readJson(STORAGE_KEYS.onboarding, parseOnboarding, {
    completed: false,
    step: 1,
    draft: emptyProfile,
  })
}

export async function saveOnboarding(state: OnboardingState): Promise<void> {
  await writeJson(STORAGE_KEYS.onboarding, state)
}

/**
 * Two-write onboarding completion: the profile persists first, then the
 * completed marker. Rejects on the first failing write so the caller can keep
 * the session on onboarding. A succeeded profile write without the marker is a
 * safe partial state: relaunch resumes onboarding (draft intact) and never
 * treats the incomplete save as completed onboarding.
 */
export async function persistOnboardingCompletion(profile: PreferenceProfile): Promise<void> {
  await savePreferences(profile)
  await saveOnboarding({ completed: true, step: 3, draft: profile })
}

/** True when this installation predates the v2 profile (a returning user). */
export async function hasLegacyData(): Promise<boolean> {
  const [favorites, interests] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.favorites),
    AsyncStorage.getItem(STORAGE_KEYS.interests),
  ])
  return favorites !== null || interests !== null
}

export type LaunchDestination = 'onboarding' | 'tabs'

/**
 * Pure launch decision: completed onboarding or legacy data mean a returning
 * user who must never see onboarding again.
 */
export function resolveLaunchDestination(input: {
  profile: PreferenceProfile
  onboarding: OnboardingState
  hasLegacyData: boolean
}): LaunchDestination {
  if (input.onboarding.completed || input.hasLegacyData) {
    return 'tabs'
  }
  return 'onboarding'
}
