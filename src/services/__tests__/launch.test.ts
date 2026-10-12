import { resolveLaunchDestination } from '../storage'
import { emptyProfile } from '../../utils/ranking'

const onboardingState = { completed: false, step: 1 as const, draft: emptyProfile }

describe('resolveLaunchDestination', () => {
  it('routes to tabs when onboarding is completed', () => {
    expect(
      resolveLaunchDestination({
        profile: emptyProfile,
        onboarding: { ...onboardingState, completed: true },
        hasLegacyData: false,
      }),
    ).toBe('tabs')
  })

  it('routes to onboarding for a fresh user', () => {
    expect(resolveLaunchDestination({ profile: emptyProfile, onboarding: onboardingState, hasLegacyData: false })).toBe(
      'onboarding',
    )
  })

  it('routes returning legacy users to tabs even without a completion marker', () => {
    expect(resolveLaunchDestination({ profile: emptyProfile, onboarding: onboardingState, hasLegacyData: true })).toBe(
      'tabs',
    )
  })
})
