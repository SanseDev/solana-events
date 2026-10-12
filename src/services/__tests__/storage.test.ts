jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>()
  return {
    __esModule: true,
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        store.set(key, value)
      },
    },
  }
})

import type { Interests } from '../../domain/event'
import { loadFavorites, loadInterests, saveFavorites, saveInterests, STORAGE_KEYS } from '../storage'

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
    const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage').default
    await AsyncStorage.setItem(STORAGE_KEYS.favorites, '{not json')
    expect(await loadFavorites()).toEqual([])
  })

  it('treats non-array JSON as empty', async () => {
    const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage').default
    await AsyncStorage.setItem(STORAGE_KEYS.favorites, '{"nope":true}')
    expect(await loadFavorites()).toEqual([])
  })
})

describe('interests storage', () => {
  it('returns empty interests when nothing stored', async () => {
    expect(await loadInterests()).toEqual({ topics: [], communityIds: [] })
  })

  it('round-trips interests', async () => {
    const interests: Interests = { topics: ['defi', 'mobile'], communityIds: ['superteam'] }
    await saveInterests(interests)
    expect(await loadInterests()).toEqual(interests)
  })

  it('drops unknown topic values from stored interests', async () => {
    const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage').default
    await AsyncStorage.setItem(
      STORAGE_KEYS.interests,
      JSON.stringify({ topics: ['defi', 'bogus'], communityIds: ['superteam'] }),
    )
    expect(await loadInterests()).toEqual({ topics: ['defi'], communityIds: ['superteam'] })
  })

  it('treats corrupt interests JSON as empty', async () => {
    const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage').default
    await AsyncStorage.setItem(STORAGE_KEYS.interests, 'nope')
    expect(await loadInterests()).toEqual({ topics: [], communityIds: [] })
  })
})
