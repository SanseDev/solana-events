import {
  emptyProfile,
  hasLegacyData,
  loadFavorites,
  loadOnboarding,
  loadPreferences,
  saveFavorites,
  saveOnboarding,
  savePreferences,
  STORAGE_KEYS,
} from '../storage'
import type { PreferenceProfile } from '../../domain/event'

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>()
  return {
    __esModule: true,
    __store: store,
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        store.set(key, value)
      },
    },
  }
})

beforeEach(() => {
  mockModule().__store.clear()
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
      location: { city: 'London', country: 'United Kingdom' },
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
