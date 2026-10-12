import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import { EmptyState } from '@/src/components/EmptyState'
import { EventCard } from '@/src/components/EventCard'
import { FeaturedEvent } from '@/src/components/FeaturedEvent'
import { FilterChip } from '@/src/components/FilterChip'
import { FilterSheet } from '@/src/components/FilterSheet'
import { LocationSheet } from '@/src/components/LocationSheet'
import { QuickControls } from '@/src/components/QuickControls'
import { SectionHeader } from '@/src/components/SectionHeader'
import { IconButton } from '@/src/components/ui/IconButton'
import { getAllEvents, getUpcomingEvents } from '@/src/data/eventCatalog'
import { useEventFilters } from '@/src/hooks/useEventFilters'
import { useFavorites } from '@/src/hooks/useFavorites'
import { usePreferences } from '@/src/hooks/usePreferences'
import { ATTENDANCE_MODE_LABELS, EVENT_FORMAT_LABELS, TOPIC_LABELS } from '@/src/domain/event'
import { defaultFiltersForProfile, hasActiveFilters, locationLabel, type EventFilters } from '@/src/domain/filters'
import { hasPersonalization, recommendEvents } from '@/src/utils/ranking'
import { colors, radius, screenPadding, sectionGap, spacing, touchTarget, typography } from '@/src/theme'

export default function DiscoverScreen() {
  const now = useMemo(() => new Date(), [])
  const catalog = useMemo(() => getAllEvents(), [])
  const upcoming = useMemo(() => getUpcomingEvents(now), [now])
  const { query, setQuery, filters, setFilters, filtered, clearFilters } = useEventFilters(upcoming)
  const [filterSheetVisible, setFilterSheetVisible] = useState(false)
  const [locationSheetVisible, setLocationSheetVisible] = useState(false)
  const [personalized, setPersonalized] = useState(false)
  const { isFavorite, toggleFavorite, hydrated, persistError } = useFavorites()
  const { profile, hydrated: preferencesHydrated } = usePreferences()

  // A completed profile seeds default constraints (participation + location)
  // exactly once; afterwards the filter state is purely user-owned.
  const seeded = useRef(false)
  useEffect(() => {
    if (preferencesHydrated && !seeded.current) {
      seeded.current = true
      setFilters(defaultFiltersForProfile(profile))
    }
  }, [preferencesHydrated, profile, setFilters])

  const filtering = query.length > 0 || hasActiveFilters(filters)

  const located = filtered

  // Availability follows actual nonzero-score matches in the current eligible
  // results, not merely nonempty profile answers: without a match the control
  // would reorder nothing, so a selected state would lie.
  const rankedResults = useMemo(() => recommendEvents(filtered, profile), [filtered, profile])
  const canPersonalize = useMemo(
    () => rankedResults.some((recommendation) => recommendation.score > 0),
    [rankedResults],
  )
  // A stale `personalized` selection (filters changed, matches disappeared)
  // must never render as active while it does nothing.
  const personalizedActive = personalized && canPersonalize
  // Personalized alone is a real layout: one ranked, duplicate-free list.
  const showingResults = filtering || personalizedActive

  // Default layout partitions the located catalog without duplicates:
  // earliest `Coming up` feature, up to two nonzero-score `Matched for you`
  // picks with truthful reasons, and the chronological remainder.
  const showFeature = !filtering && located.length >= 3
  const feature = showFeature ? located[0] : undefined
  const remainder = feature ? located.slice(1) : located
  const matched = useMemo(() => {
    if (filtering || located.length < 3) {
      return []
    }
    return recommendEvents(remainder, profile)
      .filter((recommendation) => recommendation.score > 0)
      .slice(0, 2)
  }, [filtering, located.length, remainder, profile])
  const matchedIds = useMemo(() => new Set(matched.map((m) => m.event.id)), [matched])
  const upcomingRest = matched.length > 0 ? remainder.filter((event) => !matchedIds.has(event.id)) : remainder

  const results = useMemo(() => {
    if (!showingResults) {
      return []
    }
    if (personalizedActive) {
      return rankedResults.map((recommendation) => ({
        event: recommendation.event,
        // Truthful reason only when a persisted choice actually matched.
        reasonKey: recommendation.score > 0 ? recommendation.reasonKeys[0] : undefined,
      }))
    }
    return filtered.map((event) => ({ event, reasonKey: undefined }))
  }, [showingResults, personalizedActive, rankedResults, filtered])

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
    ...filters.attendance.map((mode) => ({
      key: `attendance-${mode}`,
      label: ATTENDANCE_MODE_LABELS[mode],
      remove: () => setFilters({ ...filters, attendance: filters.attendance.filter((m) => m !== mode) }),
    })),
    ...(filters.dateRange !== 'any'
      ? [
          {
            key: 'date-range',
            label: 'This week',
            remove: () => setFilters({ ...filters, dateRange: 'any' as const }),
          },
        ]
      : []),
    ...(filters.location
      ? [
          {
            key: 'location',
            label: locationLabel(filters.location),
            remove: () => setFilters({ ...filters, location: null }),
          },
        ]
      : []),
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <AppText style={styles.pageTitle}>Solwhere</AppText>
            <AppText style={styles.tagline}>Find your next place in Solana.</AppText>
          </View>
          <Pressable
            onPress={() => setLocationSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Choose location, current ${locationLabel(filters.location)}`}
            style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="place" size={18} color={colors.accent} />
            <AppText style={styles.locationLabel} numberOfLines={1}>
              {locationLabel(filters.location)}
            </AppText>
          </Pressable>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events or organizers"
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search events"
            autoCorrect={false}
          />
          <IconButton
            name="tune"
            label="Open filters"
            onPress={() => setFilterSheetVisible(true)}
            color={colors.textPrimary}
          />
        </View>
        <QuickControls
          filters={filters}
          onFiltersChange={setFilters}
          personalized={personalizedActive}
          onPersonalizedChange={setPersonalized}
          canPersonalize={canPersonalize}
        />
        {hasPersonalization(profile) && !canPersonalize ? (
          <AppText style={styles.personalizedHint}>No current events match your preferences.</AppText>
        ) : null}
        {activeChips.length > 0 ? (
          <View style={styles.chipRow}>
            {activeChips.map((chip) => (
              <FilterChip key={chip.key} label={chip.label} selected onPress={chip.remove} onRemove={chip.remove} />
            ))}
          </View>
        ) : null}
        {persistError ? <AppText style={styles.persistError}>{persistError}</AppText> : null}
        {!hydrated ? null : catalog.length === 0 ? (
          <EmptyState
            title="Catalog unavailable"
            message="The local event catalog could not be loaded. Please restart the app."
          />
        ) : showingResults ? (
          <View style={styles.sections}>
            <View style={styles.section}>
              <SectionHeader title={filtering ? 'Results' : 'For you'} />
              {results.length === 0 ? (
                located.length === 0 ? (
                  <EmptyState
                    title="No events for this location"
                    message="Try another location or clear the location filter."
                    ctaLabel="Anywhere"
                    onCta={() => setFilters({ ...filters, location: null } as EventFilters)}
                  />
                ) : (
                  <EmptyState
                    title="No events match these filters"
                    message="Try removing a filter or clearing your search."
                    ctaLabel="Clear filters"
                    onCta={() => {
                      setQuery('')
                      clearFilters()
                    }}
                  />
                )
              ) : (
                results.map(({ event, reasonKey }) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    saved={isFavorite(event.id)}
                    onSave={save}
                    onOpen={openEvent}
                    now={now}
                    reasonKey={reasonKey}
                  />
                ))
              )}
            </View>
          </View>
        ) : (
          <View style={styles.sections}>
            {feature ? (
              <View style={styles.section}>
                <SectionHeader title="Coming up" />
                <FeaturedEvent
                  event={feature}
                  saved={isFavorite(feature.id)}
                  onSave={save}
                  onOpen={openEvent}
                  now={now}
                />
              </View>
            ) : null}
            {matched.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader title="Matched for you" />
                {matched.map((recommendation) => (
                  <EventCard
                    key={recommendation.event.id}
                    event={recommendation.event}
                    saved={isFavorite(recommendation.event.id)}
                    onSave={save}
                    onOpen={openEvent}
                    now={now}
                    reasonKey={recommendation.reasonKeys[0]}
                  />
                ))}
              </View>
            ) : null}
            <View style={styles.section}>
              <SectionHeader title="Upcoming" />
              {upcomingRest.length === 0 && !feature && matched.length === 0 ? (
                <EmptyState
                  title="No events for this location"
                  message="Try another location or clear the location filter."
                  ctaLabel="Anywhere"
                  onCta={() => setFilters({ ...filters, location: null } as EventFilters)}
                />
              ) : (
                upcomingRest.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    saved={isFavorite(event.id)}
                    onSave={save}
                    onOpen={openEvent}
                    now={now}
                  />
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
      <FilterSheet
        visible={filterSheetVisible}
        filters={filters}
        events={upcoming}
        query={query}
        now={now}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setFilters}
      />
      <LocationSheet
        visible={locationSheetVisible}
        location={filters.location}
        events={catalog}
        onClose={() => setLocationSheetVisible(false)}
        onSelect={(location) => setFilters({ ...filters, location })}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    paddingBottom: sectionGap,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  pageTitle: {
    color: colors.textPrimary,
    ...typography.pageTitle,
  },
  tagline: {
    color: colors.textSecondary,
    ...typography.bodyCompact,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  locationLabel: {
    color: colors.textPrimary,
    ...typography.label,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    minHeight: touchTarget,
    paddingHorizontal: spacing.base,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  persistError: {
    color: colors.warning,
    ...typography.label,
  },
  personalizedHint: {
    color: colors.textTertiary,
    ...typography.label,
  },
  sections: {
    gap: sectionGap,
  },
  section: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
})
