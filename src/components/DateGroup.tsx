import React from 'react'
import { StyleSheet, View } from 'react-native'
import type { Event } from '../domain/event'
import { EventCard } from './EventCard'
import { SectionHeader } from './SectionHeader'
import { spacing } from '../theme'

/**
 * One Saved date group: an event-local date label plus the compact cards for
 * that day. Cards never carry recommendation reasons here.
 */
export function DateGroup({
  group,
  now,
  isFavorite,
  onSave,
  onOpen,
}: {
  group: { key: string; label: string; events: Event[] }
  now: Date
  isFavorite: (eventId: string) => boolean
  onSave: (eventId: string) => void
  onOpen: (eventId: string) => void
}) {
  return (
    <View style={styles.group}>
      <SectionHeader title={group.label} />
      {group.events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          saved={isFavorite(event.id)}
          onSave={onSave}
          onOpen={onOpen}
          now={now}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.md,
  },
})
