import React, { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import type { Event } from '../domain/event'
import { formatDateBlock } from '../utils/dates'
import { getEventStatus } from '../utils/eventStatus'
import { EventMetaRow } from './EventMetaRow'
import { RecommendationReason } from './RecommendationReason'
import { colors, radius, spacing, touchTarget } from '../theme'
import { selectionFeedback } from '../utils/haptics'
import { EventArtwork } from './EventArtwork'

/**
 * Compact catalog card. The open target is an absolutely-positioned Pressable
 * filling the whole card, so any tap outside the save control opens the
 * event. The save Pressable is a sibling — never a child — keeping
 * react-native-web HTML valid and save presses from ever triggering onOpen;
 * it stacks above the open target (zIndex + draw order) and its layout slot
 * is reserved by the trailing spacer View. The pressed highlight lives on the
 * card root so it never covers the content.
 */
export function EventCard({
  event,
  saved,
  onSave,
  onOpen,
  now,
  reasonKey,
}: {
  event: Event
  saved: boolean
  onSave: (eventId: string) => void
  onOpen: (eventId: string) => void
  now: Date
  /** Truthful match reason; only pass it inside personalized sections. */
  reasonKey?: string
}) {
  const { month, day } = formatDateBlock(event.startAt)
  const ended = getEventStatus(event, now) === 'ended'
  const [pressed, setPressed] = useState(false)
  return (
    <View style={[styles.card, pressed && styles.cardPressed]}>
      <View style={styles.contentRow}>
        <EventArtwork event={event} variant="thumb" />
        <View style={styles.body}>
          <AppText style={styles.dateOverline}>
            {month} {day}
          </AppText>
          <AppText style={styles.title} numberOfLines={2}>
            {event.title}
          </AppText>
          <AppText style={styles.organizer} numberOfLines={1}>
            {event.organizer}
          </AppText>
          <EventMetaRow event={event} />
          {ended ? <AppText style={styles.ended}>Ended</AppText> : null}
          {reasonKey ? <RecommendationReason reasonKey={reasonKey} /> : null}
        </View>
        <View style={styles.saveSlot} />
      </View>
      <Pressable
        onPress={() => onOpen(event.id)}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${event.title}`}
        style={styles.openTarget}
      />
      <Pressable
        onPress={() => {
          selectionFeedback()
          onSave(event.id)
        }}
        accessibilityRole="button"
        accessibilityLabel={saved ? `Unsave ${event.title}` : `Save ${event.title}`}
        style={({ pressed: savePressed }) => [styles.saveButton, savePressed && styles.savePressed]}
      >
        <MaterialIcons
          name={saved ? 'bookmark' : 'bookmark-border'}
          size={22}
          color={saved ? colors.accent : colors.textSecondary}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  // Reserve the trailing 48pt slot so the absolutely-positioned save control
  // aligns with the reserved space and never overlaps the text body.
  saveSlot: {
    width: touchTarget,
  },
  openTarget: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.md,
    zIndex: 1,
  },
  cardPressed: {
    backgroundColor: colors.surfacePressed,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  dateOverline: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 23,
  },
  organizer: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  ended: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  saveButton: {
    position: 'absolute',
    right: spacing.xs,
    top: '50%',
    marginTop: -touchTarget / 2,
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  savePressed: {
    opacity: 0.7,
  },
})
