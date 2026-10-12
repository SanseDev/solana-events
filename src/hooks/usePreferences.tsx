import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PreferenceProfile } from '../domain/event'
import {
  emptyProfile as emptyStoredProfile,
  hasLegacyData,
  loadOnboarding,
  loadPreferences,
  persistOnboardingCompletion,
  saveOnboarding,
  savePreferences,
  type OnboardingState,
} from '../services/storage'

interface PreferencesState {
  /** Active, completed profile. Drafts live in the onboarding state. */
  profile: PreferenceProfile
  hydrated: boolean
  /** Non-null when the last persist attempt failed. */
  persistError: string | null
  onboardingCompleted: boolean
  onboardingStep: 1 | 2 | 3
  onboardingDraft: PreferenceProfile
  /** Persisted profile edit; affects Discover immediately. */
  setProfile: (profile: PreferenceProfile) => void
  /** Persists draft + step so kill/relaunch resumes in place. */
  saveOnboardingDraft: (step: 1 | 2 | 3, draft: PreferenceProfile) => void
  /**
   * Persists profile then the completed marker, and only flips the in-memory
   * `onboardingCompleted` after both writes succeed. Resolves false on
   * failure; the caller must keep the session on onboarding and let the user
   * retry with the draft intact.
   */
  completeOnboarding: (profile: PreferenceProfile) => Promise<boolean>
}

const PreferencesContext = createContext<PreferencesState | null>(null)

const PERSIST_ERROR = 'Could not save your preferences. Please try again.'
const FRESH_ONBOARDING: OnboardingState = { completed: false, step: 1, draft: emptyStoredProfile }

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [profile, setProfileState] = useState<PreferenceProfile>(emptyStoredProfile)
  const [onboarding, setOnboarding] = useState<OnboardingState>(FRESH_ONBOARDING)
  const [hydrated, setHydrated] = useState(false)
  const [persistError, setPersistError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      let loadedProfile = emptyStoredProfile
      let loadedOnboarding = FRESH_ONBOARDING
      let legacy = false
      try {
        ;[loadedProfile, loadedOnboarding, legacy] = await Promise.all([
          loadPreferences(),
          loadOnboarding(),
          hasLegacyData(),
        ])
      } catch {
        // Storage reads degrade to safe defaults; the app stays usable.
      }
      if (!active) {
        return
      }
      setProfileState(loadedProfile)
      if (legacy && !loadedOnboarding.completed) {
        // Returning users never see onboarding; the profile itself was
        // already migrated by loadPreferences().
        const completedState: OnboardingState = { ...loadedOnboarding, completed: true, draft: loadedProfile }
        setOnboarding(completedState)
        saveOnboarding(completedState).catch(() => undefined)
      } else {
        setOnboarding(loadedOnboarding)
      }
      setHydrated(true)
    }
    void bootstrap()
    return () => {
      active = false
    }
  }, [])

  const persistProfile = useCallback((next: PreferenceProfile) => {
    setPersistError(null)
    setProfileState(next)
    savePreferences(next).catch(() => setPersistError(PERSIST_ERROR))
  }, [])

  const saveOnboardingDraft = useCallback((step: 1 | 2 | 3, draft: PreferenceProfile) => {
    setPersistError(null)
    setOnboarding((current) => {
      const next: OnboardingState = { ...current, step, draft }
      saveOnboarding(next).catch(() => setPersistError(PERSIST_ERROR))
      return next
    })
  }, [])

  const completeOnboarding = useCallback(async (finalProfile: PreferenceProfile) => {
    setPersistError(null)
    try {
      // Profile write first: if the marker write then fails (or the app dies),
      // relaunch resumes onboarding with the draft — an incomplete save is
      // never treated as completed onboarding.
      await persistOnboardingCompletion(finalProfile)
      setProfileState(finalProfile)
      setOnboarding({ completed: true, step: 3, draft: finalProfile })
      return true
    } catch {
      setPersistError(PERSIST_ERROR)
      return false
    }
  }, [])

  const value = useMemo<PreferencesState>(
    () => ({
      profile,
      hydrated,
      persistError,
      onboardingCompleted: onboarding.completed,
      onboardingStep: onboarding.step,
      onboardingDraft: onboarding.draft,
      setProfile: persistProfile,
      saveOnboardingDraft,
      completeOnboarding,
    }),
    [profile, hydrated, persistError, onboarding, persistProfile, saveOnboardingDraft, completeOnboarding],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesState {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}
