import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { AppText } from '@/components/app-text'
import { COMMUNITIES } from '@/src/data/communities'
import {
  INTENTS,
  INTENT_LABELS,
  PARTICIPATION_PREFERENCES,
  PARTICIPATION_LABELS,
  TOPICS,
  TOPIC_LABELS,
  type Intent,
  type ParticipationPreference,
  type PreferenceProfile,
  type Topic,
} from '@/src/domain/event'
import { locationLabel } from '@/src/domain/filters'
import { FilterChip } from './FilterChip'
import { LocationSheet } from './LocationSheet'
import { getAllEvents } from '@/src/data/eventCatalog'
import { colors, spacing, typography } from '@/src/theme'

export type PreferenceSection = 'intent' | 'topics' | 'participation' | 'communities'

/**
 * Shared preference selectors used by onboarding (one section per step) and
 * Profile (all sections). Pure controlled component: the caller owns the
 * draft and persistence.
 */
export function PreferenceEditor({
  value,
  onChange,
  sections = ['intent', 'topics', 'participation', 'communities'],
}: {
  value: PreferenceProfile
  onChange: (next: PreferenceProfile) => void
  sections?: PreferenceSection[]
}) {
  const [locationSheetVisible, setLocationSheetVisible] = useState(false)
  const catalog = getAllEvents()

  const toggleIntent = (intent: Intent) =>
    onChange({
      ...value,
      intent: value.intent.includes(intent) ? value.intent.filter((i) => i !== intent) : [...value.intent, intent],
    })

  const toggleTopic = (topic: Topic) =>
    onChange({
      ...value,
      topics: value.topics.includes(topic) ? value.topics.filter((t) => t !== topic) : [...value.topics, topic],
    })

  const setParticipation = (participation: ParticipationPreference) => onChange({ ...value, participation })

  const toggleCommunity = (communityId: string) =>
    onChange({
      ...value,
      communityIds: value.communityIds.includes(communityId)
        ? value.communityIds.filter((c) => c !== communityId)
        : [...value.communityIds, communityId],
    })

  return (
    <View style={styles.container}>
      {sections.includes('intent') ? (
        <View style={styles.section}>
          <AppText style={styles.question}>What brings you to Solana?</AppText>
          <View style={styles.chipWrap}>
            {INTENTS.map((intent) => (
              <FilterChip
                key={intent}
                label={INTENT_LABELS[intent]}
                selected={value.intent.includes(intent)}
                onPress={() => toggleIntent(intent)}
              />
            ))}
          </View>
        </View>
      ) : null}
      {sections.includes('topics') ? (
        <View style={styles.section}>
          <AppText style={styles.question}>Which topics interest you?</AppText>
          <View style={styles.chipWrap}>
            {TOPICS.map((topic) => (
              <FilterChip
                key={topic}
                label={TOPIC_LABELS[topic]}
                selected={value.topics.includes(topic)}
                onPress={() => toggleTopic(topic)}
              />
            ))}
          </View>
        </View>
      ) : null}
      {sections.includes('participation') ? (
        <View style={styles.section}>
          <AppText style={styles.question}>How do you like to take part?</AppText>
          <View style={styles.chipWrap}>
            {PARTICIPATION_PREFERENCES.map((participation) => (
              <FilterChip
                key={participation}
                label={PARTICIPATION_LABELS[participation]}
                selected={value.participation === participation}
                onPress={() => setParticipation(participation)}
              />
            ))}
          </View>
          <FilterChip
            label={value.location ? locationLabel(value.location) : 'Choose location (optional)'}
            selected={value.location !== null}
            onPress={() => setLocationSheetVisible(true)}
          />
        </View>
      ) : null}
      {sections.includes('communities') ? (
        <View style={styles.section}>
          <AppText style={styles.question}>Communities you follow</AppText>
          <View style={styles.chipWrap}>
            {COMMUNITIES.map((community) => (
              <FilterChip
                key={community.id}
                label={community.name}
                selected={value.communityIds.includes(community.id)}
                onPress={() => toggleCommunity(community.id)}
              />
            ))}
          </View>
        </View>
      ) : null}
      <LocationSheet
        visible={locationSheetVisible}
        location={value.location}
        events={catalog}
        onClose={() => setLocationSheetVisible(false)}
        onSelect={(location) => onChange({ ...value, location })}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  question: {
    color: colors.textPrimary,
    ...typography.sectionTitle,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
})
