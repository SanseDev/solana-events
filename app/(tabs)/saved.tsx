import React, { useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import { DateGroup } from '@/src/components/DateGroup'
import { EmptyState } from '@/src/components/EmptyState'
import { SectionHeader } from '@/src/components/SectionHeader'
import { getAllEvents } from '@/src/data/eventCatalog'
import { useFavorites } from '@/src/hooks/useFavorites'
import { groupSavedEvents } from '@/src/utils/dateGroups'
import { colors, screenPadding, sectionGap, spacing, typography } from '@/src/theme'

/**
 * Saved shortlist. Upcoming first (start ascending, grouped by event-local
 * date), then Past events (most recent first). Saving never implies
 * registration; unsave stays independent of navigation.
 */
export default function SavedScreen() {
  const now = useMemo(() => new Date(), [])
  const { favoriteIds, hydrated, isFavorite, toggleFavorite, persistError } = useFavorites()

  const { upcoming, past } = useMemo(() => {
    // Ids missing from the catalog are ignored quietly (plan §9).
    const events = favoriteIds
      .map((id) => getAllEvents().find((event) => event.id === id))
      .filter((event): event is NonNullable<typeof event> => Boolean(event))
    return groupSavedEvents(events, now)
  }, [favoriteIds, now])

  const openEvent = (id: string) => router.push(`/event/${id}`)
  const savedCount = favoriteIds.length

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText style={styles.pageTitle}>Saved</AppText>
        {savedCount > 0 ? <AppText style={styles.count}>{savedCount} saved</AppText> : null}
        {persistError ? <AppText style={styles.persistError}>{persistError}</AppText> : null}
        {hydrated && savedCount === 0 ? (
          <EmptyState
            icon="bookmark-border"
            title="Nothing saved yet"
            message="Save events from Discover to find them here, even after restarting the app."
            ctaLabel="Explore events"
            onCta={() => router.push('/(tabs)/discover')}
          />
        ) : (
          <View style={styles.sections}>
            {upcoming.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader title="Upcoming" />
                {upcoming.map((group) => (
                  <DateGroup
                    key={group.key}
                    group={group}
                    now={now}
                    isFavorite={isFavorite}
                    onSave={toggleFavorite}
                    onOpen={openEvent}
                  />
                ))}
              </View>
            ) : null}
            {past.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader title="Past events" />
                {past.map((group) => (
                  <DateGroup
                    key={group.key}
                    group={group}
                    now={now}
                    isFavorite={isFavorite}
                    onSave={toggleFavorite}
                    onOpen={openEvent}
                  />
                ))}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  pageTitle: {
    color: colors.textPrimary,
    ...typography.pageTitle,
  },
  count: {
    color: colors.textSecondary,
    ...typography.label,
  },
  persistError: {
    color: colors.warning,
    ...typography.label,
  },
  sections: {
    gap: sectionGap,
  },
  section: {
    gap: spacing.lg,
  },
})
