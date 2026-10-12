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

function parseLocation(raw: unknown): LocationPreference | null {
  if (typeof raw !== 'object' || raw === null) {
    return null
  }
  const { city, country } = raw as { city?: unknown; country?: unknown }
  if (typeof city !== 'string' || typeof country !== 'string' || city.length === 0 || country.length === 0) {
    return null
  }
  return { city, country }
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
 */
export async function loadPreferences(): Promise<PreferenceProfile> {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.preferences)
  if (stored !== null) {
    return readJson(STORAGE_KEYS.preferences, parseProfile, emptyProfile)
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
