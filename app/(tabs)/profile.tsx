import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import { SectionHeader } from '@/src/components/SectionHeader'
import { WalletStatusCard } from '@/src/components/WalletStatusCard'
import { AppPressable } from '@/src/components/ui/AppPressable'
import { COMMUNITIES, COMMUNITIES_BY_ID } from '@/src/data/communities'
import { INTENT_LABELS, PARTICIPATION_LABELS, TOPIC_LABELS, type PreferenceProfile } from '@/src/domain/event'
import { locationLabel } from '@/src/domain/filters'
import { usePreferences } from '@/src/hooks/usePreferences'
import { useWalletSession } from '@/src/services/wallet'
import { colors, radius, screenPadding, sectionGap, spacing, touchTarget, typography } from '@/src/theme'

function preferenceSummaryLines(profile: PreferenceProfile): [string, string] {
  const answers = [
    profile.intent.map((intent) => INTENT_LABELS[intent]).join(', '),
    profile.topics.map((topic) => TOPIC_LABELS[topic]).join(', '),
  ]
  const context = [
    PARTICIPATION_LABELS[profile.participation],
    profile.location ? locationLabel(profile.location) : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const line1 = answers.filter(Boolean).join(' · ')
  if (!line1 && profile.participation === 'both' && !profile.location) {
    return ['No answers yet.', 'Discover stays chronological until you add preferences.']
  }
  return [line1 || 'No topic or intent answers yet.', context]
}

/**
 * Profile. `Your preferences` is always visible — local preferences are never
 * gated behind wallet state. The wallet section below stays authorization-only.
 */
export default function ProfileScreen() {
  const session = useWalletSession()
  const { profile } = usePreferences()
  const [summaryLine1, summaryLine2] = preferenceSummaryLines(profile)
  const followed = profile.communityIds
    .map((id) => COMMUNITIES_BY_ID.get(id)?.name)
    .filter((name): name is string => Boolean(name))
  const hasAnyPreference =
    profile.intent.length > 0 ||
    profile.topics.length > 0 ||
    followed.length > 0 ||
    profile.participation !== 'both' ||
    Boolean(profile.location)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText style={styles.pageTitle}>Profile</AppText>
        <View style={styles.preferencesCard}>
          <View style={styles.summary}>
            <AppText style={styles.summaryLine}>{summaryLine1}</AppText>
            <AppText style={styles.summaryLine}>{summaryLine2}</AppText>
          </View>
          <AppText style={styles.followedLabel}>
            {followed.length > 0
              ? `Following ${followed.length} ${followed.length === 1 ? 'community' : 'communities'}: ${followed.join(', ')}`
              : `Following 0 of ${COMMUNITIES.length} communities`}
          </AppText>
          <AppPressable
            onPress={() => router.push('/preferences')}
            accessibilityRole="button"
            accessibilityLabel="Edit preferences"
            style={styles.editButton}
          >
            <MaterialIcons name="tune" size={20} color={colors.accent} />
            <AppText style={styles.editText}>Edit preferences</AppText>
          </AppPressable>
        </View>
        {!hasAnyPreference ? (
          <AppText style={styles.hint}>
            Preferences are optional answers that rank events in Discover. They are stored on this device only.
          </AppText>
        ) : null}
        <View style={styles.walletSection}>
          <SectionHeader title="Wallet" />
          <WalletStatusCard session={session} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: screenPadding,
    paddingBottom: spacing.xxl,
    gap: sectionGap,
  },
  pageTitle: {
    color: colors.textPrimary,
    ...typography.pageTitle,
  },
  preferencesCard: {
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  summary: {
    gap: 2,
  },
  summaryLine: {
    color: colors.textPrimary,
    ...typography.bodyCompact,
  },
  followedLabel: {
    color: colors.textSecondary,
    ...typography.label,
  },
  editButton: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  editText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  hint: {
    color: colors.textSecondary,
    ...typography.bodyCompact,
  },
  walletSection: {
    gap: spacing.md,
  },
})
