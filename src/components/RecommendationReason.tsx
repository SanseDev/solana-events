import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { COMMUNITIES_BY_ID } from '@/src/data/communities'
import { TOPIC_LABELS, type Intent, type Topic } from '@/src/domain/event'
import { colors } from '@/src/theme'

/** Noun phrases so `Because you chose …` reads naturally. */
const INTENT_CHOICE_PHRASES: Record<Intent, string> = {
  learn: 'Learning',
  meet_people: 'Meeting people',
  hackathons: 'Hackathons',
  communities: 'Communities',
}

/**
 * Human label for a recommender reason key (`topic:<t>` | `community:<id>` |
 * `intent:<i>`), e.g. `Matches Developers` or `Because you chose Hackathons`.
 * Unknown keys render null — never a fabricated reason.
 */
export function reasonLabel(key: string): string | null {
  const [kind, value] = key.split(':')
  if (kind === 'topic' && value in TOPIC_LABELS) {
    return `Matches ${TOPIC_LABELS[value as Topic]}`
  }
  if (kind === 'community' && COMMUNITIES_BY_ID.has(value)) {
    return `Because you follow ${COMMUNITIES_BY_ID.get(value)?.name}`
  }
  if (kind === 'intent' && value in INTENT_CHOICE_PHRASES) {
    return `Because you chose ${INTENT_CHOICE_PHRASES[value as Intent]}`
  }
  return null
}

/** Small truthful match reason shown only in personalized sections. */
export function RecommendationReason({ reasonKey }: { reasonKey: string }) {
  const label = reasonLabel(reasonKey)
  if (!label) {
    return null
  }
  return <Text style={styles.reason}>{label}</Text>
}

const styles = StyleSheet.create({
  reason: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
})
