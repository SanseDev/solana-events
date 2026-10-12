import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import { distinctLocations, locationLabel, type EventFilters } from '../domain/filters'
import type { Event } from '../domain/event'
import { AppPressable } from './ui/AppPressable'
import { colors, primaryHeight, radius, spacing, touchTarget, typography } from '../theme'
import { selectionFeedback } from '../utils/haptics'

/**
 * Compact location picker built from distinct catalog city/country pairs plus
 * `Anywhere`. It is catalog-derived — not GPS — and says `Choose location`.
 */
export function LocationSheet({
  visible,
  location,
  events,
  onClose,
  onSelect,
}: {
  visible: boolean
  location: EventFilters['location']
  events: readonly Event[]
  onClose: () => void
  onSelect: (location: EventFilters['location']) => void
}) {
  const locations = distinctLocations(events)
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      {visible ? (
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropPress} onPress={onClose} accessibilityLabel="Close location picker" />
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.header}>
              <AppText style={styles.title}>Choose location</AppText>
              <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <AppText style={styles.closeText}>Close</AppText>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.list}>
              <OptionRow
                key="anywhere"
                label="Anywhere"
                selected={location === null}
                onPress={() => {
                  selectionFeedback()
                  onSelect(null)
                  onClose()
                }}
              />
              {locations.map((item) => (
                <OptionRow
                  key={`${item.city}-${item.country}`}
                  label={locationLabel(item)}
                  detail={item.country}
                  selected={location?.city === item.city && location?.country === item.country}
                  onPress={() => {
                    selectionFeedback()
                    onSelect(item)
                    onClose()
                  }}
                />
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      ) : null}
    </Modal>
  )
}

function OptionRow({
  label,
  detail,
  selected,
  onPress,
}: {
  label: string
  detail?: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <AppPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Location ${label}`}
      accessibilityState={{ selected }}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <View style={styles.optionText}>
        <AppText style={styles.optionLabel}>{label}</AppText>
        {detail ? <AppText style={styles.optionDetail}>{detail}</AppText> : null}
      </View>
      {selected ? <AppText style={styles.check}>✓</AppText> : null}
    </AppPressable>
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
    maxHeight: '70%',
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
  list: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: primaryHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.borderStrong,
  },
  optionText: {
    flex: 1,
    minHeight: touchTarget,
    justifyContent: 'center',
    gap: 2,
  },
  optionLabel: {
    color: colors.textPrimary,
    ...typography.bodyCompact,
    fontWeight: '600',
  },
  optionDetail: {
    color: colors.textTertiary,
    fontSize: 12,
    lineHeight: 16,
  },
  check: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
})
