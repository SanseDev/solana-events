import React, { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import type { AttendanceFilter, EventFilters } from '../domain/filters'
import {
  ATTENDANCE_MODES,
  ATTENDANCE_MODE_LABELS,
  EVENT_FORMATS,
  EVENT_FORMAT_LABELS,
  TOPICS,
  TOPIC_LABELS,
} from '../domain/event'
import { FilterChip } from './FilterChip'
import { colors, radius, spacing } from '../theme'

export function FilterSheet({
  visible,
  filters,
  onClose,
  onApply,
}: {
  visible: boolean
  filters: EventFilters
  onClose: () => void
  onApply: (filters: EventFilters) => void
}) {
  const [draft, setDraft] = useState<EventFilters>(filters)

  // Reset the draft whenever the sheet is opened with the current filters.
  React.useEffect(() => {
    if (visible) {
      setDraft(filters)
    }
  }, [visible, filters])

  const toggleTopic = (topic: EventFilters['topics'][number]) =>
    setDraft((d) => ({
      ...d,
      topics: d.topics.includes(topic) ? d.topics.filter((t) => t !== topic) : [...d.topics, topic],
    }))

  const toggleFormat = (format: EventFilters['formats'][number]) =>
    setDraft((d) => ({
      ...d,
      formats: d.formats.includes(format) ? d.formats.filter((f) => f !== format) : [...d.formats, format],
    }))

  const setAttendance = (attendance: AttendanceFilter) => setDraft((d) => ({ ...d, attendance }))

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={onClose} accessibilityLabel="Close filters" />
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.header}>
            <AppText style={styles.title}>Filters</AppText>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={styles.closeText}>Close</Text>
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
              {(['any', ...ATTENDANCE_MODES] as AttendanceFilter[]).map((mode) => (
                <FilterChip
                  key={mode}
                  label={mode === 'any' ? 'Any' : ATTENDANCE_MODE_LABELS[mode]}
                  selected={draft.attendance === mode}
                  onPress={() => setAttendance(mode)}
                />
              ))}
            </View>
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              onPress={() => setDraft({ topics: [], formats: [], attendance: 'any' })}
              accessibilityRole="button"
              accessibilityLabel="Reset filters"
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryText}>Reset</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onApply(draft)
                onClose()
              }}
              accessibilityRole="button"
              accessibilityLabel="Show results"
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryText}>Show results</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  closeText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  content: {
    flexGrow: 0,
  },
  contentPadding: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
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
    borderTopColor: colors.border,
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.control,
    backgroundColor: colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
})
