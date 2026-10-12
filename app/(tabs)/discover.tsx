import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import { EmptyState } from '@/src/components/EmptyState'
import { EventCard } from '@/src/components/EventCard'
import { FilterChip } from '@/src/components/FilterChip'
import { FilterSheet } from '@/src/components/FilterSheet'
import { SectionHeader } from '@/src/components/SectionHeader'
import { getUpcomingEvents } from '@/src/data/eventCatalog'
import { useEventFilters } from '@/src/hooks/useEventFilters'
import { useFavorites } from '@/src/hooks/useFavorites'
import { useInterests } from '@/src/hooks/useInterests'
import { rankByInterests } from '@/src/utils/ranking'
import { ATTENDANCE_MODE_LABELS, EVENT_FORMAT_LABELS, TOPIC_LABELS } from '@/src/domain/event'
import { hasActiveFilters } from '@/src/domain/filters'
import { colors, radius, spacing } from '@/src/theme'

export default function DiscoverScreen() {
  const now = useMemo(() => new Date(), [])
  const upcoming = useMemo(() => getUpcomingEvents(now), [now])
  const { query, setQuery, filters, setFilters, filtered, clearFilters } = useEventFilters(upcoming)
  const [filterSheetVisible, setFilterSheetVisible] = useState(false)
  const { isFavorite, toggleFavorite, hydrated, persistError } = useFavorites()
  const interests = useInterests()

  const hasInterests = interests.topics.length > 0 || interests.communityIds.length > 0
  const forYou = useMemo(
    () => (hasInterests ? rankByInterests(filtered, interests) : []),
    [filtered, hasInterests, interests],
  )
  const filtering = query.length > 0 || hasActiveFilters(filters)

  const openEvent = (id: string) => router.push(`/event/${id}`)
  const save = (id: string) => toggleFavorite(id)

  const activeChips: { key: string; label: string; remove: () => void }[] = [
    ...filters.topics.map((topic) => ({
      key: `topic-${topic}`,
      label: TOPIC_LABELS[topic],
      remove: () => setFilters({ ...filters, topics: filters.topics.filter((t) => t !== topic) }),
    })),
    ...filters.formats.map((format) => ({
      key: `format-${format}`,
      label: EVENT_FORMAT_LABELS[format],
      remove: () => setFilters({ ...filters, formats: filters.formats.filter((f) => f !== format) }),
    })),
    ...(filters.attendance !== 'any'
      ? [
          {
            key: 'attendance',
            label: ATTENDANCE_MODE_LABELS[filters.attendance],
            remove: () => setFilters({ ...filters, attendance: 'any' as const }),
          },
        ]
      : []),
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <AppText style={styles.pageTitle}>Solana Events</AppText>
          <AppText style={styles.subtitle}>Your ecosystem calendar</AppText>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events or organizers"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search events"
            autoCorrect={false}
          />
          <Pressable
            onPress={() => setFilterSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
            style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
          >
            <Text style={styles.filterButtonText}>Filters</Text>
          </Pressable>
        </View>
        {activeChips.length > 0 ? (
          <View style={styles.chipRow}>
            {activeChips.map((chip) => (
              <FilterChip key={chip.key} label={chip.label} selected onPress={chip.remove} onRemove={chip.remove} />
            ))}
          </View>
        ) : null}
        {persistError ? <AppText style={styles.persistError}>{persistError}</AppText> : null}
        {!hydrated ? null : filtered.length === 0 ? (
          <EmptyState
            title="No events match these filters"
            message="Try removing a filter or clearing your search."
            ctaLabel="Clear filters"
            onCta={() => {
              setQuery('')
              clearFilters()
            }}
          />
        ) : (
          <View style={styles.sections}>
            {hasInterests && !filtering ? (
              <View style={styles.section}>
                <SectionHeader title="For you" />
                {forYou.map((event) => (
                  <EventCard
                    key={`foryou-${event.id}`}
                    event={event}
                    saved={isFavorite(event.id)}
                    onSave={save}
                    onOpen={openEvent}
                    now={now}
                  />
                ))}
              </View>
            ) : null}
            <View style={styles.section}>
              <SectionHeader title={filtering ? 'Results' : 'All upcoming'} />
              {filtered.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  saved={isFavorite(event.id)}
                  onSave={save}
                  onOpen={openEvent}
                  now={now}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <FilterSheet
        visible={filterSheetVisible}
        filters={filters}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setFilters}
      />
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
  header: {
    gap: 2,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 15,
  },
  filterButton: {
    minHeight: 44,
    paddingHorizontal: spacing.base,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  persistError: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 18,
  },
  sections: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
})
