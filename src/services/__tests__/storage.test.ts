import {
  emptyProfile,
  hasLegacyData,
  loadFavorites,
  loadOnboarding,
  loadPreferences,
  persistOnboardingCompletion,
  saveFavorites,
  saveOnboarding,
  savePreferences,
  STORAGE_KEYS,
} from '../storage'
import type { PreferenceProfile } from '../../domain/event'

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>()
  const failKeys = new Set<string>()
  return {
    __esModule: true,
    __store: store,
    __failKeys: failKeys,
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        if (failKeys.has(key)) {
          throw new Error(`simulated write failure for ${key}`)
        }
        store.set(key, value)
      },
    },
  }
})

beforeEach(() => {
  mockModule().__store.clear()
  mockModule().__failKeys.clear()
})

function mockModule() {
  return jest.requireMock('@react-native-async-storage/async-storage')
}

function mockStorage() {
  return mockModule().default
}

describe('favorites storage', () => {
  it('returns empty array when nothing stored', async () => {
    expect(await loadFavorites()).toEqual([])
  })

  it('round-trips favorites ids', async () => {
    await saveFavorites(['a', 'b'])
    expect(await loadFavorites()).toEqual(['a', 'b'])
  })

  it('deduplicates ids on save', async () => {
    await saveFavorites(['a', 'a', 'b'])
    expect(await loadFavorites()).toEqual(['a', 'b'])
  })

  it('treats corrupt JSON as empty', async () => {
    await mockStorage().setItem(STORAGE_KEYS.favorites, '{not json')
    expect(await loadFavorites()).toEqual([])
  })
})

describe('preferences storage (v2)', () => {
  it('returns defaults when nothing stored and no legacy data', async () => {
    expect(await loadPreferences()).toEqual(emptyProfile)
  })

  it('round-trips a full profile', async () => {
    const profile = {
      intent: ['learn', 'hackathons'],
      topics: ['defi'],
      communityIds: ['superteam'],
      participation: 'online',
      location: { countryCode: 'GB', city: 'London' },
    } satisfies PreferenceProfile
    await savePreferences(profile)
    expect(await loadPreferences()).toEqual(profile)
  })

  it('drops unknown enum values and keeps valid ones', async () => {
    await mockStorage().setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({
        intent: ['learn', 'bogus'],
        topics: ['defi', 'bogus'],
        communityIds: ['superteam', 42],
        participation: 'nope',
        location: { city: 'London', country: 7 },
      }),
    )
    expect(await loadPreferences()).toEqual({
      intent: ['learn'],
      topics: ['defi'],
      communityIds: ['superteam'],
      participation: 'both',
      location: null,
    })
  })

  it('treats corrupt v2 JSON as absent', async () => {
    await mockStorage().setItem(STORAGE_KEYS.preferences, 'nope')
    expect(await loadPreferences()).toEqual(emptyProfile)
  })
})

describe('location migration', () => {
  it('maps a legacy { city, country } location to ISO codes', async () => {
    await mockStorage().setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({ ...emptyProfile, location: { city: 'London', country: 'United Kingdom' } }),
    )
    expect((await loadPreferences()).location).toEqual({ countryCode: 'GB', city: 'London' })
  })

  it('drops an invalid legacy location with an unknown country', async () => {
    await mockStorage().setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({ ...emptyProfile, location: { city: 'Atlantis', country: 'Atlantis' } }),
    )
    expect((await loadPreferences()).location).toBeNull()
  })

  it('keeps a country-only preference as-is', async () => {
    await mockStorage().setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({ ...emptyProfile, location: { countryCode: 'FR' } }),
    )
    expect((await loadPreferences()).location).toEqual({ countryCode: 'FR' })
  })

  it('drops an unknown ISO country code', async () => {
    await mockStorage().setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({ ...emptyProfile, location: { countryCode: 'ZZ', city: 'Nowhere' } }),
    )
    expect((await loadPreferences()).location).toBeNull()
  })

  it('drops a location without a country', async () => {
    await mockStorage().setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({ ...emptyProfile, location: { city: 'London' } }),
    )
    expect((await loadPreferences()).location).toBeNull()
  })
})

describe('v1 interests migration', () => {
  it('migrates legacy topics and communityIds into a v2 profile', async () => {
    await mockStorage().setItem(
      STORAGE_KEYS.interests,
      JSON.stringify({ topics: ['defi', 'mobile'], communityIds: ['superteam'] }),
    )
    expect(await loadPreferences()).toEqual({
      ...emptyProfile,
      topics: ['defi', 'mobile'],
      communityIds: ['superteam'],
    })
  })

  it('persists the migrated profile as v2 without deleting v1', async () => {
    await mockStorage().setItem(STORAGE_KEYS.interests, JSON.stringify({ topics: ['defi'], communityIds: [] }))
    await loadPreferences()
    const raw = await mockStorage().getItem(STORAGE_KEYS.preferences)
    expect(raw).toEqual(JSON.stringify({ ...emptyProfile, topics: ['defi'], communityIds: [] }))
    expect(await mockStorage().getItem(STORAGE_KEYS.interests)).toEqual(
      JSON.stringify({ topics: ['defi'], communityIds: [] }),
    )
  })

  it('prefers a valid v2 profile over legacy v1', async () => {
    await mockStorage().setItem(STORAGE_KEYS.interests, JSON.stringify({ topics: ['defi'], communityIds: [] }))
    await savePreferences({ ...emptyProfile, topics: ['nfts'] })
    expect((await loadPreferences()).topics).toEqual(['nfts'])
  })
})

describe('onboarding storage', () => {
  it('returns the fresh-install default when nothing stored', async () => {
    expect(await loadOnboarding()).toEqual({ completed: false, step: 1, draft: emptyProfile })
  })

  it('round-trips draft step and completion', async () => {
    const state = {
      completed: false,
      step: 2 as const,
      draft: { ...emptyProfile, topics: ['defi' as const] },
    }
    await saveOnboarding(state)
    expect(await loadOnboarding()).toEqual(state)
  })

  it('keeps a completed marker', async () => {
    await saveOnboarding({ completed: true, step: 3, draft: emptyProfile })
    expect((await loadOnboarding()).completed).toBe(true)
  })

  it('degrades corrupt state to fresh defaults', async () => {
    await mockStorage().setItem(STORAGE_KEYS.onboarding, '{oops')
    expect(await loadOnboarding()).toEqual({ completed: false, step: 1, draft: emptyProfile })
  })
})

describe('onboarding completion persistence', () => {
  it('persists the profile and then the completed marker', async () => {
    const profile: PreferenceProfile = { ...emptyProfile, topics: ['defi' as const] }
    await persistOnboardingCompletion(profile)
    expect(JSON.parse((await mockStorage().getItem(STORAGE_KEYS.preferences)) ?? 'null')).toEqual(profile)
    expect(JSON.parse((await mockStorage().getItem(STORAGE_KEYS.onboarding)) ?? 'null')).toEqual({
      completed: true,
      step: 3,
      draft: profile,
    })
  })

  it('rejects and writes no completed marker when the profile write fails', async () => {
    mockModule().__failKeys.add(STORAGE_KEYS.preferences)
    await expect(persistOnboardingCompletion({ ...emptyProfile, topics: ['defi' as const] })).rejects.toThrow(
      'simulated write failure',
    )
    expect(await mockStorage().getItem(STORAGE_KEYS.preferences)).toBeNull()
    expect(await mockStorage().getItem(STORAGE_KEYS.onboarding)).toBeNull()
    expect((await loadOnboarding()).completed).toBe(false)
  })

  it('stays resumable when the marker write fails after the profile saved', async () => {
    mockModule().__failKeys.add(STORAGE_KEYS.onboarding)
    const profile: PreferenceProfile = { ...emptyProfile, topics: ['defi' as const] }
    await expect(persistOnboardingCompletion(profile)).rejects.toThrow('simulated write failure')
    // Partial state: the profile exists, but relaunch must resume onboarding
    // rather than treat the session as completed.
    expect(await loadPreferences()).toEqual(profile)
    expect((await loadOnboarding()).completed).toBe(false)
  })
})

describe('legacy detection', () => {
  it('is false on a fresh install', async () => {
    expect(await hasLegacyData()).toBe(false)
  })

  it('is true when favorites exist', async () => {
    await saveFavorites(['a'])
    expect(await hasLegacyData()).toBe(true)
  })

  it('is true when interests v1 exists', async () => {
    await mockStorage().setItem(STORAGE_KEYS.interests, JSON.stringify({ topics: [], communityIds: [] }))
    expect(await hasLegacyData()).toBe(true)
  })
})
