import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import { applyFilters, distinctLocations, locationLabel, type EventFilters } from '../domain/filters'
import {
  ATTENDANCE_MODES,
  ATTENDANCE_MODE_LABELS,
  EVENT_FORMATS,
  EVENT_FORMAT_LABELS,
  TOPICS,
  TOPIC_LABELS,
  type AttendanceMode,
  type Event,
  type EventFormat,
  type Topic,
} from '../domain/event'
import { FilterChip } from './FilterChip'
import { AppPressable } from './ui/AppPressable'
import { colors, primaryHeight, radius, spacing, typography } from '../theme'
import { selectionFeedback } from '../utils/haptics'

/**
 * The sheet content is mounted only while the modal is visible, so the draft
 * filter state is initialized from the current filters on every open. It owns
 * topics, formats, attendance, date range, and location, and shows the result
 * count on apply. Quick controls write the same filter state.
 */
export function FilterSheet({
  visible,
  filters,
  events,
  query,
  now,
  onClose,
  onApply,
}: {
  visible: boolean
  filters: EventFilters
  events: readonly Event[]
  query: string
  now: Date
  onClose: () => void
  onApply: (filters: EventFilters) => void
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      {visible ? (
        <FilterSheetContent
          filters={filters}
          events={events}
          query={query}
          now={now}
          onClose={onClose}
          onApply={onApply}
        />
      ) : null}
    </Modal>
  )
}

function FilterSheetContent({
  filters,
  events,
  query,
  now,
  onClose,
  onApply,
}: {
  filters: EventFilters
  events: readonly Event[]
  query: string
  now: Date
  onClose: () => void
  onApply: (filters: EventFilters) => void
}) {
  const [draft, setDraft] = useState<EventFilters>(filters)
  const locations = distinctLocations(events)
  const resultCount = applyFilters(events, query, draft, now).length

  const toggleTopic = (topic: Topic) =>
    setDraft((d) => ({
      ...d,
      topics: d.topics.includes(topic) ? d.topics.filter((t) => t !== topic) : [...d.topics, topic],
    }))

  const toggleFormat = (format: EventFormat) =>
    setDraft((d) => ({
      ...d,
      formats: d.formats.includes(format) ? d.formats.filter((f) => f !== format) : [...d.formats, format],
    }))

  const toggleAttendance = (mode: AttendanceMode) =>
    setDraft((d) => ({
      ...d,
      attendance: d.attendance.includes(mode) ? d.attendance.filter((m) => m !== mode) : [...d.attendance, mode],
    }))

  const setLocation = (location: EventFilters['location']) => setDraft((d) => ({ ...d, location }))

  const toggleThisWeek = () => setDraft((d) => ({ ...d, dateRange: d.dateRange === 'this_week' ? 'any' : 'this_week' }))

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropPress} onPress={onClose} accessibilityLabel="Close filters" />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.header}>
          <AppText style={styles.title}>Filters</AppText>
          <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
            <AppText style={styles.closeText}>Close</AppText>
          </Pressable>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
          <AppText style={styles.sectionLabel}>Topics</AppText>
          <View style={styles.chipWrap}>
            {TOPICS.map((topic) => (
              <FilterChip
                key={topic}
                label={TOPIC_LABELS[topic]}
                selected={draft.topics.includes(topic)}
                onPress={() => toggleTopic(topic)}
              />
            ))}
          </View>
          <AppText style={styles.sectionLabel}>Format</AppText>
          <View style={styles.chipWrap}>
            {EVENT_FORMATS.map((format) => (
              <FilterChip
                key={format}
                label={EVENT_FORMAT_LABELS[format]}
                selected={draft.formats.includes(format)}
                onPress={() => toggleFormat(format)}
              />
            ))}
          </View>
          <AppText style={styles.sectionLabel}>Attendance</AppText>
          <View style={styles.chipWrap}>
            {ATTENDANCE_MODES.map((mode) => (
              <FilterChip
                key={mode}
                label={ATTENDANCE_MODE_LABELS[mode]}
                selected={draft.attendance.includes(mode)}
                onPress={() => toggleAttendance(mode)}
              />
            ))}
          </View>
          <AppText style={styles.sectionLabel}>Dates</AppText>
          <View style={styles.chipWrap}>
            <FilterChip label="This week" selected={draft.dateRange === 'this_week'} onPress={toggleThisWeek} />
          </View>
          <AppText style={styles.sectionLabel}>Location</AppText>
          <View style={styles.chipWrap}>
            <FilterChip label="Anywhere" selected={draft.location === null} onPress={() => setLocation(null)} />
            {locations.map((location) => (
              <FilterChip
                key={`${location.countryCode}-${location.city ?? ''}`}
                label={locationLabel(location)}
                selected={
                  draft.location?.countryCode === location.countryCode && draft.location?.city === location.city
                }
                onPress={() => setLocation(location)}
              />
            ))}
          </View>
        </ScrollView>
        <View style={styles.actions}>
          <AppPressable
            onPress={() => {
              selectionFeedback()
              setDraft({ topics: [], formats: [], attendance: [], dateRange: 'any', location: null })
            }}
            accessibilityRole="button"
            accessibilityLabel="Reset filters"
            style={styles.secondaryButton}
          >
            <AppText style={styles.secondaryText}>Reset</AppText>
          </AppPressable>
          <AppPressable
            onPress={() => {
              onApply(draft)
              onClose()
            }}
            accessibilityRole="button"
            accessibilityLabel={`Show results, ${resultCount} events`}
            style={styles.primaryButton}
          >
            <AppText style={styles.primaryText}>Show results ({resultCount})</AppText>
          </AppPressable>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
    backgroundColor: 'rgba(4,7,14,0.6)',
  },
  sheet: {
    backgroundColor: colors.canvasRaised,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    ...typography.sectionTitle,
  },
  closeText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  content: {
    flexGrow: 0,
  },
  contentPadding: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.base,
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.textSecondary,
    ...typography.label,
    marginTop: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  primaryButton: {
    flex: 1,
    minHeight: primaryHeight,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    minHeight: primaryHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: colors.onAccent,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  secondaryText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
})
