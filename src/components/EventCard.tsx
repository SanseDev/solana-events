import React, { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import type { Event } from '../domain/event'
import { formatDateBlock } from '../utils/dates'
import { getEventStatus } from '../utils/eventStatus'
import { EventMetaRow } from './EventMetaRow'
import { colors, radius, spacing } from '../theme'

export function EventCard({
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
  const ended = getEventStatus(event, now) === 'ended'
  // The open target is an absolutely-positioned Pressable filling the whole
  // card (padding included), so any tap outside the save control opens the
  // event. The save Pressable is a sibling — never a child — which keeps
  // react-native-web HTML valid (<button> inside <button> is illegal) and
  // save presses from ever triggering onOpen; it stacks above the open
  // target (zIndex + draw order) and its layout slot is reserved by the
  // trailing spacer View. The pressed highlight lives on the card root so
  // it never covers the content (the touch overlay sits above the content).
  const [pressed, setPressed] = useState(false)
  return (
    <View style={[styles.card, pressed && styles.cardPressed]}>
      <View style={styles.contentRow}>
        <View style={styles.dateBlock}>
          <AppText style={styles.dateMonth}>{month}</AppText>
          <AppText style={styles.dateDay}>{day}</AppText>
        </View>
        <View style={styles.body}>
          <AppText style={styles.title} numberOfLines={2}>
            {event.title}
          </AppText>
          <EventMetaRow event={event} />
          {ended ? <AppText style={styles.ended}>Ended</AppText> : null}
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
        onPress={() => onSave(event.id)}
        hitSlop={8}
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
    padding: spacing.base,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  // Reserve the trailing 44pt slot so the absolutely-positioned save control
  // aligns exactly where the in-flow save button used to sit.
  saveSlot: {
    width: 44,
  },
  // Transparent absolute-fill touch overlay drawn above the content row;
  // the visual pressed state is applied to the card root instead.
  openTarget: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.card,
    zIndex: 1,
  },
  cardPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  dateBlock: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.control,
    backgroundColor: colors.surfaceElevated,
  },
  dateMonth: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  dateDay: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 23,
  },
  ended: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  saveButton: {
    position: 'absolute',
    right: spacing.base,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  savePressed: {
    opacity: 0.7,
  },
})
