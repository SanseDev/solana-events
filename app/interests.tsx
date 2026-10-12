import React, { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import { FilterChip } from '@/src/components/FilterChip'
import { SectionHeader } from '@/src/components/SectionHeader'
import { COMMUNITIES } from '@/src/data/communities'
import { TOPICS, TOPIC_LABELS, type Interests, type Topic } from '@/src/domain/event'
import { useInterests } from '@/src/hooks/useInterests'
import { colors, radius, spacing } from '@/src/theme'

export default function InterestsScreen() {
  const stored = useInterests()
  const [draft, setDraft] = useState<Interests>({
    topics: stored.topics,
    communityIds: stored.communityIds,
  })
  const [savedFeedback, setSavedFeedback] = useState(false)

  const toggleTopic = (topic: Topic) =>
    setDraft((d) => ({
      ...d,
      topics: d.topics.includes(topic) ? d.topics.filter((t) => t !== topic) : [...d.topics, topic],
    }))

  const toggleCommunity = (communityId: string) =>
    setDraft((d) => ({
      ...d,
      communityIds: d.communityIds.includes(communityId)
        ? d.communityIds.filter((c) => c !== communityId)
        : [...d.communityIds, communityId],
    }))

  const save = () => {
    stored.setInterests(draft)
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  const confirmReset = () => {
    Alert.alert('Reset preferences', 'Clear all topics and communities?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => setDraft({ topics: [], communityIds: [] }),
      },
    ])
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <AppText style={styles.pageTitle}>My Interests</AppText>
        <AppText style={styles.intro}>
          Pick topics and communities to rank events in For you. You can change these at any time — this is optional.
        </AppText>
        {stored.persistError ? <AppText style={styles.persistError}>{stored.persistError}</AppText> : null}
        <View style={styles.section}>
          <SectionHeader title="Topics" />
          <View style={styles.chipWrap}>
            {TOPICS.map((topic) => (
              <FilterChip
                key={topic}
                label={TOPIC_LABELS[topic]}
                selected={draft.topics.includes(topic)}
                onPress={() => toggleTopic(topic)}
              />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader title="Communities" />
          <View style={styles.chipWrap}>
            {COMMUNITIES.map((community) => (
              <FilterChip
                key={community.id}
                label={community.name}
                selected={draft.communityIds.includes(community.id)}
                onPress={() => toggleCommunity(community.id)}
              />
            ))}
          </View>
        </View>
        <Pressable
          onPress={save}
          accessibilityRole="button"
          accessibilityLabel="Save preferences"
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>{savedFeedback ? 'Saved ✓' : 'Save preferences'}</Text>
        </Pressable>
        <Pressable
          onPress={confirmReset}
          accessibilityRole="button"
          accessibilityLabel="Reset preferences"
          style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
        >
          <Text style={styles.ghostText}>Reset preferences</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  intro: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  persistError: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: radius.control,
    backgroundColor: colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ghostButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
})
