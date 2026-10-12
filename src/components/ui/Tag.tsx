import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { colors, radius, spacing } from '../../theme'

/** Static read-only tag for topics, communities, and status overlines. */
export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' }) {
  return (
    <Text style={[styles.tag, tone === 'accent' && styles.accent]} numberOfLines={1}>
      {label}
    </Text>
  )
}

const styles = StyleSheet.create({
  tag: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  accent: {
    color: colors.accent,
    borderColor: colors.borderStrong,
  },
})
