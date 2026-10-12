import React from 'react'
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
  return (
    <Pressable
      onPress={() => onOpen(event.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${event.title}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
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
      <Pressable
        onPress={() => onSave(event.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={saved ? `Unsave ${event.title}` : `Save ${event.title}`}
        style={({ pressed }) => [styles.saveButton, pressed && styles.savePressed]}
      >
        <MaterialIcons
          name={saved ? 'bookmark' : 'bookmark-border'}
          size={22}
          color={saved ? colors.accent : colors.textSecondary}
        />
      </Pressable>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePressed: {
    opacity: 0.7,
  },
})
