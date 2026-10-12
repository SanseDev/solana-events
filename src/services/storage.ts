import AsyncStorage from '@react-native-async-storage/async-storage'
import { TOPICS, type Interests, type Topic } from '../domain/event'

/** Versioned storage keys (plan §9). Bump suffix and add a migration when the shape changes. */
export const STORAGE_KEYS = {
  favorites: 'solana-events:favorites:v1',
  interests: 'solana-events:interests:v1',
} as const

export const emptyInterests: Interests = { topics: [], communityIds: [] }

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
    return emptyInterests
  }
  const { topics, communityIds } = raw as { topics?: unknown; communityIds?: unknown }
  return {
    topics: Array.isArray(topics) ? topics.filter((t): t is Topic => TOPICS.includes(t as Topic)) : [],
    communityIds: Array.isArray(communityIds) ? communityIds.filter((id): id is string => typeof id === 'string') : [],
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

export async function loadInterests(): Promise<Interests> {
  return readJson(STORAGE_KEYS.interests, parseInterests, emptyInterests)
}

export async function saveInterests(interests: Interests): Promise<void> {
  await writeJson(STORAGE_KEYS.interests, interests)
}
