import React from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { AppText } from '@/components/app-text'
import { EVENT_FORMAT_LABELS, type Event } from '../domain/event'
import { formatDateBlock } from '../utils/dates'
import { colors, radius, spacing } from '../theme'

/**
 * Editorial artwork slot. The catalog carries no licensed images, so this is
 * always the designed fallback: a surface block with the event-local date and
 * format overlines plus a muted rule. Presentation only — it must never
 * suggest a real photograph. When `event.image` gains provenance, an
 * `expo-image` branch renders here with an onError fallback to this block.
 */
export function EventArtwork({ event, variant }: { event: Event; variant: 'feature' | 'thumb' | 'cover' }) {
  const { month, day } = formatDateBlock(event.startAt)
  return (
    <View style={[styles.block, variantStyles[variant]]}>
      <View style={styles.content}>
        <AppText style={[styles.overline, variant === 'thumb' && styles.overlineSmall]}>
          {month} · {EVENT_FORMAT_LABELS[event.format].toUpperCase()}
        </AppText>
        <AppText style={[styles.day, variant === 'thumb' && styles.daySmall]}>{day}</AppText>
      </View>
      <View style={styles.rule} />
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
  },
  overline: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  overlineSmall: {
    fontSize: 10,
    lineHeight: 12,
  },
  day: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
  },
  daySmall: {
    fontSize: 18,
    lineHeight: 22,
  },
  rule: {
    alignSelf: 'stretch',
    height: 2,
    marginHorizontal: spacing.md,
    borderRadius: 1,
    backgroundColor: colors.accentMuted,
  },
})

/** Feature and detail covers are 16:9; compact card thumbnails are 4:3 at 84×63. */
const variantStyles = StyleSheet.create<{
  feature: ViewStyle
  thumb: ViewStyle
  cover: ViewStyle
}>({
  feature: { aspectRatio: 16 / 9, borderRadius: radius.lg },
  thumb: { width: 84, height: 63, borderRadius: radius.sm },
  cover: { aspectRatio: 16 / 9, borderRadius: radius.lg },
})
