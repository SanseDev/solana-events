import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadFavorites, saveFavorites } from '../services/storage'

interface FavoritesState {
  favoriteIds: string[]
  hydrated: boolean
  /** Non-null when the last persist attempt failed. */
  persistError: string | null
  isFavorite: (eventId: string) => boolean
  toggleFavorite: (eventId: string) => void
}

const FavoritesContext = createContext<FavoritesState | null>(null)

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [persistError, setPersistError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    loadFavorites()
      .then((ids) => {
        if (active) {
          setFavoriteIds(ids)
        }
      })
      .finally(() => {
        if (active) {
          setHydrated(true)
        }
      })
    return () => {
      active = false
    }
  }, [])

  const toggleFavorite = useCallback((eventId: string) => {
    setPersistError(null)
    setFavoriteIds((current) => {
      const next = current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
      saveFavorites(next).catch(() => {
        setPersistError('Could not save your change. Please try again.')
      })
      return next
    })
  }, [])

  const value = useMemo<FavoritesState>(
    () => ({
      favoriteIds,
      hydrated,
      persistError,
      isFavorite: (eventId: string) => favoriteIds.includes(eventId),
      toggleFavorite,
    }),
    [favoriteIds, hydrated, persistError, toggleFavorite],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesState {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
