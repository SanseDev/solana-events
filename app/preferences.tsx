import React, { useState } from 'react'
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import { PreferenceEditor } from '@/src/components/PreferenceEditor'
import { AppPressable } from '@/src/components/ui/AppPressable'
import type { PreferenceProfile } from '@/src/domain/event'
import { usePreferences } from '@/src/hooks/usePreferences'
import { emptyProfile } from '@/src/utils/ranking'
import { colors, primaryHeight, radius, screenPadding, spacing, touchTarget, typography } from '@/src/theme'

/**
 * Full preference editor (Profile destination). Save persists the profile and
 * affects Discover immediately; Reset clears the local draft only.
 */
export default function PreferencesScreen() {
  const { profile, setProfile, persistError } = usePreferences()
  const [draft, setDraft] = useState<PreferenceProfile>(profile)
  const [savedFeedback, setSavedFeedback] = useState(false)

  const save = () => {
    setProfile(draft)
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  const confirmReset = () => {
    // Alert.alert renders nothing on react-native-web, so reset directly.
    if (Platform.OS === 'web') {
      setDraft(emptyProfile)
      return
    }
    Alert.alert('Reset preferences', 'Clear all your selections?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => setDraft(emptyProfile) },
    ])
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <AppPressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
        </AppPressable>
        <AppText style={styles.pageTitle}>Your preferences</AppText>
      </View>
      <AppText style={styles.intro}>Optional answers that rank events in Discover. Change them at any time.</AppText>
      {persistError ? <AppText style={styles.persistError}>{persistError}</AppText> : null}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PreferenceEditor value={draft} onChange={setDraft} />
        <AppPressable
          onPress={save}
          accessibilityRole="button"
          accessibilityLabel="Save preferences"
          style={styles.primaryButton}
        >
          <AppText style={styles.primaryText}>{savedFeedback ? 'Saved ✓' : 'Save preferences'}</AppText>
        </AppPressable>
        <AppPressable
          onPress={confirmReset}
          accessibilityRole="button"
          accessibilityLabel="Reset preferences"
          style={styles.ghostButton}
        >
          <AppText style={styles.ghostText}>Reset preferences</AppText>
        </AppPressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
  },
  backButton: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.md,
  },
  pageTitle: {
    color: colors.textPrimary,
    ...typography.pageTitle,
  },
  intro: {
    color: colors.textSecondary,
    ...typography.bodyCompact,
    paddingHorizontal: screenPadding,
    paddingTop: spacing.xs,
  },
  persistError: {
    color: colors.warning,
    ...typography.label,
    paddingHorizontal: screenPadding,
  },
  content: {
    padding: screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  primaryButton: {
    minHeight: primaryHeight,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  ghostButton: {
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
})
