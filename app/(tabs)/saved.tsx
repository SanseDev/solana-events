import React, { useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import { EmptyState } from '@/src/components/EmptyState'
import { EventCard } from '@/src/components/EventCard'
import { SectionHeader } from '@/src/components/SectionHeader'
import { getAllEvents } from '@/src/data/eventCatalog'
import { useFavorites } from '@/src/hooks/useFavorites'
import { getEventStatus } from '@/src/utils/eventStatus'
import { colors, spacing } from '@/src/theme'

export default function SavedScreen() {
  const now = useMemo(() => new Date(), [])
  const { favoriteIds, hydrated, isFavorite, toggleFavorite, persistError } = useFavorites()

  const saved = useMemo(() => {
    // Ids missing from the catalog are ignored quietly (plan §9).
    const events = favoriteIds
      .map((id) => getAllEvents().find((event) => event.id === id))
      .filter((event): event is NonNullable<typeof event> => Boolean(event))
    const upcoming = events
      .filter((event) => getEventStatus(event, now) !== 'ended')
      .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
    const ended = events
      .filter((event) => getEventStatus(event, now) === 'ended')
      .sort((a, b) => Date.parse(b.endAt) - Date.parse(a.endAt))
    return [...upcoming, ...ended]
  }, [favoriteIds, now])

  const openEvent = (id: string) => router.push(`/event/${id}`)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText style={styles.pageTitle}>Saved</AppText>
        {persistError ? <AppText style={styles.persistError}>{persistError}</AppText> : null}
        {hydrated && saved.length === 0 ? (
          <EmptyState
            title="No saved events yet"
            message="Save events from Discover to find them here, even after restarting the app."
            ctaLabel="Explore events"
            onCta={() => router.push('/(tabs)/discover')}
          />
        ) : (
          <View style={styles.section}>
            <SectionHeader title={`Your events (${saved.length})`} />
            {saved.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                saved={isFavorite(event.id)}
                onSave={toggleFavorite}
                onOpen={openEvent}
                now={now}
              />
            ))}
          </View>
        )}
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
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  persistError: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: spacing.md,
  },
})
