import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import { SectionHeader } from '@/src/components/SectionHeader'
import { WalletStatusCard } from '@/src/components/WalletStatusCard'
import { COMMUNITIES } from '@/src/data/communities'
import { useInterests } from '@/src/hooks/useInterests'
import { useWalletSession } from '@/src/services/wallet'
import { colors, radius, spacing } from '@/src/theme'

export default function ProfileScreen() {
  const session = useWalletSession()
  const interests = useInterests()
  // Interests are stored locally and never require a wallet; on web the
  // session is `unsupported`, so keep the section visible there too.
  const connected = session.status === 'connected' || session.status === 'unsupported'

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText style={styles.pageTitle}>Profile</AppText>
        <WalletStatusCard session={session} />
        {connected ? (
          <>
            <View style={styles.section}>
              <SectionHeader title="Communities" />
              <View style={styles.communityList}>
                {COMMUNITIES.map((community) => {
                  const followed = interests.communityIds.includes(community.id)
                  return (
                    <View key={community.id} style={styles.communityCard}>
                      <View style={styles.communityText}>
                        <AppText style={styles.communityName}>{community.name}</AppText>
                        <AppText style={styles.communityDescription}>{community.description}</AppText>
                      </View>
                      {followed ? <View style={styles.followedDot} /> : null}
                    </View>
                  )
                })}
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/interests')}
              accessibilityRole="button"
              accessibilityLabel="Manage interests"
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            >
              <Text style={styles.linkText}>Manage interests</Text>
            </Pressable>
          </>
        ) : (
          <AppText style={styles.hint}>Connect your wallet to follow communities and manage interest topics.</AppText>
        )}
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
    padding: spacing.base,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  section: {
    gap: spacing.md,
  },
  communityList: {
    gap: spacing.sm,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  communityText: {
    flex: 1,
    gap: 2,
  },
  communityName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  communityDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  followedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  linkButton: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.8,
  },
})
