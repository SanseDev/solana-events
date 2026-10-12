import React, { useEffect, useState } from 'react'
import { Alert, BackHandler, Platform, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import { PreferenceEditor, type PreferenceSection } from '@/src/components/PreferenceEditor'
import { AppPressable } from '@/src/components/ui/AppPressable'
import type { PreferenceProfile } from '@/src/domain/event'
import { usePreferences } from '@/src/hooks/usePreferences'
import { colors, primaryHeight, radius, screenPadding, spacing, typography } from '@/src/theme'

const STEPS: { section: PreferenceSection; hint: string }[] = [
  { section: 'intent', hint: 'Pick any that apply — you can change these later in Profile.' },
  { section: 'topics', hint: 'Topics help rank events for you. Optional.' },
  { section: 'participation', hint: 'This sets your default Discover filters. Optional.' },
]

/**
 * Three-step skippable onboarding. Every selection is optional; the draft is
 * persisted after each change so an interrupted session resumes in place.
 * No wallet, GPS, notification, calendar, or network permission is involved.
 */
export default function OnboardingScreen() {
  const { onboardingStep, onboardingDraft, saveOnboardingDraft, completeOnboarding, persistError } = usePreferences()
  const [step, setStep] = useState<1 | 2 | 3>(onboardingStep)
  const [draft, setDraft] = useState<PreferenceProfile>(onboardingDraft)

  const total = STEPS.length
  const isLast = step === total

  const persist = (nextStep: 1 | 2 | 3, nextDraft: PreferenceProfile) => {
    setStep(nextStep)
    setDraft(nextDraft)
    saveOnboardingDraft(nextStep, nextDraft)
  }

  const finish = (profile: PreferenceProfile) => {
    completeOnboarding(profile)
    router.replace('/(tabs)/discover')
  }

  const skip = () => {
    finish({
      intent: [],
      topics: [],
      communityIds: [],
      participation: 'both',
      location: null,
    })
  }

  const confirmSkipFromFirstStep = () => {
    if (step !== 1) {
      return
    }
    if (Platform.OS === 'web') {
      skip()
      return
    }
    Alert.alert('Skip onboarding?', 'You can set preferences any time in Profile.', [
      { text: 'Keep setting up', style: 'cancel' },
      { text: 'Skip', style: 'destructive', onPress: skip },
    ])
  }

  // Android Back edits the prior step; on step one it asks before abandoning
  // the saved draft instead of silently discarding it.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 1) {
        setStep((step - 1) as 1 | 2)
        return true
      }
      confirmSkipFromFirstStep()
      return true
    })
    return () => subscription.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <AppText style={styles.progress}>
            {step} of {total}
          </AppText>
          <AppPressable
            onPress={skip}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            style={styles.skip}
          >
            <AppText style={styles.skipText}>Skip</AppText>
          </AppPressable>
        </View>
        <PreferenceEditor value={draft} onChange={(next) => persist(step, next)} sections={[STEPS[step - 1].section]} />
        <AppText style={styles.hint}>{STEPS[step - 1].hint}</AppText>
        {persistError ? <AppText style={styles.persistError}>{persistError}</AppText> : null}
        <View style={styles.footer}>
          {step > 1 ? (
            <AppPressable
              onPress={() => persist((step - 1) as 1 | 2, draft)}
              accessibilityRole="button"
              accessibilityLabel="Previous question"
              style={styles.backButton}
            >
              <AppText style={styles.backText}>Back</AppText>
            </AppPressable>
          ) : null}
          <AppPressable
            onPress={() => (isLast ? finish(draft) : persist((step + 1) as 2 | 3, draft))}
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Start exploring' : 'Continue'}
            style={styles.continueButton}
          >
            <AppText style={styles.continueText}>{isLast ? 'Start exploring' : 'Continue'}</AppText>
          </AppPressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flex: 1,
    padding: screenPadding,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: primaryHeight,
  },
  progress: {
    color: colors.textTertiary,
    ...typography.overline,
  },
  skip: {
    minHeight: primaryHeight,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  skipText: {
    color: colors.textSecondary,
    ...typography.label,
  },
  hint: {
    color: colors.textSecondary,
    ...typography.bodyCompact,
  },
  persistError: {
    color: colors.warning,
    ...typography.label,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
  continueButton: {
    flex: 1,
    minHeight: primaryHeight,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  backButton: {
    minHeight: primaryHeight,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
})
