import React, { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import type { Event } from '../domain/event'
import { formatDateBlock } from '../utils/dates'
import { getEventStatus } from '../utils/eventStatus'
import { colors, radius, spacing, touchTarget } from '../theme'
import { selectionFeedback } from '../utils/haptics'
import { EventArtwork } from './EventArtwork'
import { EventMetaRow } from './EventMetaRow'

/**
 * `Coming up` feature card: earliest upcoming event under the current location
 * constraint. Chronology, not popularity. Save control is an absolutely
 * positioned sibling (see EventCard) so saving never opens the event.
 */
export function FeaturedEvent({
  event,
  saved,
  onSave,
  onOpen,
  now,
}: {
  event: Event
  saved: boolean
  onSave: (eventId: string) => void
  onOpen: (eventId: string) => void
  now: Date
}) {
  const { month, day } = formatDateBlock(event.startAt)
  const [pressed, setPressed] = useState(false)
  const ended = getEventStatus(event, now) === 'ended'
  return (
    <View style={[styles.card, pressed && styles.cardPressed]}>
      <EventArtwork event={event} variant="feature" />
      <View style={styles.body}>
        <AppText style={styles.overline}>
          {month} {day} · Coming up
        </AppText>
        <AppText style={styles.title} numberOfLines={2}>
          {event.title}
        </AppText>
        <AppText style={styles.organizer} numberOfLines={1}>
          {event.organizer}
        </AppText>
        <EventMetaRow event={event} />
        {ended ? <AppText style={styles.ended}>Ended</AppText> : null}
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
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  cardPressed: {
    backgroundColor: colors.surfacePressed,
  },
  body: {
    gap: 4,
    paddingRight: touchTarget,
  },
  overline: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  organizer: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  ended: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  openTarget: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.lg,
    zIndex: 1,
  },
  saveButton: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
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
