import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Interests } from '../domain/event'
import { emptyInterests, loadInterests, saveInterests } from '../services/storage'

interface InterestsState extends Interests {
  hydrated: boolean
  /** Non-null when the last persist attempt failed. */
  persistError: string | null
  setInterests: (interests: Interests) => void
  resetInterests: () => void
}

const InterestsContext = createContext<InterestsState | null>(null)

export function InterestsProvider({ children }: PropsWithChildren) {
  const [interests, setInterestsState] = useState<Interests>(emptyInterests)
  const [hydrated, setHydrated] = useState(false)
  const [persistError, setPersistError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    loadInterests()
      .then((loaded) => {
        if (active) {
          setInterestsState(loaded)
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

  const persist = useCallback((next: Interests) => {
    setPersistError(null)
    setInterestsState(next)
    saveInterests(next).catch(() => {
      setPersistError('Could not save your preferences. Please try again.')
    })
  }, [])

  const value = useMemo<InterestsState>(
    () => ({
      ...interests,
      hydrated,
      persistError,
      setInterests: persist,
      resetInterests: () => persist(emptyInterests),
    }),
    [interests, hydrated, persistError, persist],
  )

  return <InterestsContext.Provider value={value}>{children}</InterestsContext.Provider>
}

export function useInterests(): InterestsState {
  const context = useContext(InterestsContext)
  if (!context) {
    throw new Error('useInterests must be used within an InterestsProvider')
  }
  return context
}
