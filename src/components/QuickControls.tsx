import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import type { EventFilters } from '../domain/filters'
import { FilterChip } from './FilterChip'
import { chipHeight, spacing } from '../theme'

/**
 * Discover quick controls, in fixed order: Personalized (sort-only),
 * This week, Online, Hackathons. They write the same filter state as the
 * sheet: values inside attendance/formats OR, categories AND.
 */
export function QuickControls({
  filters,
  onFiltersChange,
  personalized,
  onPersonalizedChange,
  canPersonalize,
}: {
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
  personalized: boolean
  onPersonalizedChange: (value: boolean) => void
  canPersonalize: boolean
}) {
  const onlineOn = filters.attendance.includes('online') && filters.attendance.includes('hybrid')
  const hackathonsOn = filters.formats.includes('hackathon')

  const toggleOnline = () => {
    // Union with any existing selection; removing drops both modes it owns.
    const attendance = onlineOn
      ? filters.attendance.filter((mode) => mode !== 'online' && mode !== 'hybrid')
      : [...new Set([...filters.attendance, 'online' as const, 'hybrid' as const])]
    onFiltersChange({ ...filters, attendance })
  }

  const toggleHackathons = () => {
    const formats = hackathonsOn
      ? filters.formats.filter((format) => format !== 'hackathon')
      : [...new Set([...filters.formats, 'hackathon' as const])]
    onFiltersChange({ ...filters, formats })
  }

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityLabel="Quick filters"
      >
        <FilterChip
          label="Personalized"
          selected={personalized}
          disabled={!canPersonalize}
          onPress={() => onPersonalizedChange(!personalized)}
        />
        <FilterChip
          label="This week"
          selected={filters.dateRange === 'this_week'}
          onPress={() =>
            onFiltersChange({ ...filters, dateRange: filters.dateRange === 'this_week' ? 'any' : 'this_week' })
          }
        />
        <FilterChip label="Online" selected={onlineOn} onPress={toggleOnline} />
        <FilterChip label="Hackathons" selected={hackathonsOn} onPress={toggleHackathons} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: chipHeight,
    alignItems: 'center',
  },
})
