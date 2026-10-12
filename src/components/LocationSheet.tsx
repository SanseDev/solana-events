import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import { catalogCities, clampLocationToCatalog, type EventFilters } from '../domain/filters'
import type { Event } from '../domain/event'
import { COUNTRIES, type Country } from '../data/countries'
import { resolveDeviceLocation } from '../services/deviceLocation'
import { AppPressable } from './ui/AppPressable'
import { colors, primaryHeight, radius, spacing, touchTarget, typography } from '../theme'
import { selectionFeedback } from '../utils/haptics'

/**
 * Location picker with the full ISO country list (searchable), `Anywhere`,
 * an explicit "Use my location" action, and an optional city step built from
 * catalog cities of the chosen country. Choosing a country without catalog
 * cities applies the country-only filter immediately.
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
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      {visible ? (
        <LocationSheetContent location={location} events={events} onClose={onClose} onSelect={onSelect} />
      ) : null}
    </Modal>
  )
}

function LocationSheetContent({
  location,
  events,
  onClose,
  onSelect,
}: {
  location: EventFilters['location']
  events: readonly Event[]
  onClose: () => void
  onSelect: (location: EventFilters['location']) => void
}) {
  const [pendingCountry, setPendingCountry] = useState<Country | null>(null)
  const [search, setSearch] = useState('')
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cities = pendingCountry ? catalogCities(events, pendingCountry.code) : []

  const query = normalize(search)
  const matches = query
    ? COUNTRIES.filter((country) => normalize(country.name).includes(query) || country.code.toLowerCase() === query)
    : COUNTRIES

  const choose = (next: EventFilters['location']) => {
    selectionFeedback()
    onSelect(next)
    onClose()
  }

  const useMyLocation = async () => {
    setError(null)
    setLocating(true)
    const outcome = await resolveDeviceLocation()
    setLocating(false)
    if (outcome.ok) {
      // A GPS city absent from the catalog would filter everything out;
      // keep it only when the catalog actually has events for that city.
      choose(clampLocationToCatalog(events, outcome.location))
    } else {
      setError(
        outcome.reason === 'permission_denied'
          ? 'Location permission denied. Pick a country manually below.'
          : 'Could not detect your location. Pick a country manually below.',
      )
    }
  }

  const backToCountries = () => {
    setPendingCountry(null)
    setSearch('')
  }

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropPress} onPress={onClose} accessibilityLabel="Close location picker" />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.header}>
          {pendingCountry ? (
            <Pressable
              onPress={backToCountries}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back to countries"
            >
              <AppText style={styles.closeText}>Back</AppText>
            </Pressable>
          ) : (
            <View />
          )}
          <AppText style={styles.title} numberOfLines={1}>
            {pendingCountry ? pendingCountry.name : 'Choose location'}
          </AppText>
          <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
            <AppText style={styles.closeText}>Close</AppText>
          </Pressable>
        </View>
        {error ? (
          <AppText style={styles.error} accessibilityRole="alert">
            {error}
          </AppText>
        ) : null}
        {pendingCountry ? (
          <ScrollView contentContainerStyle={styles.list}>
            <OptionRow
              key={`all-${pendingCountry.code}`}
              label={`All of ${pendingCountry.name}`}
              selected={location?.countryCode === pendingCountry.code && !location?.city}
              onPress={() => choose({ countryCode: pendingCountry.code })}
            />
            {cities.map((city) => (
              <OptionRow
                key={`${city}-${pendingCountry.code}`}
                label={city}
                detail={pendingCountry.name}
                selected={location?.countryCode === pendingCountry.code && location?.city === city}
                onPress={() => choose({ countryCode: pendingCountry.code, city })}
              />
            ))}
          </ScrollView>
        ) : (
          <>
            <View style={styles.list}>
              <AppPressable
                onPress={useMyLocation}
                disabled={locating}
                accessibilityRole="button"
                accessibilityLabel="Use my location"
                accessibilityState={{ disabled: locating }}
                style={styles.deviceRow}
              >
                <MaterialIcons name="my-location" size={18} color={colors.accent} />
                <AppText style={styles.deviceText}>{locating ? 'Locating…' : 'Use my location'}</AppText>
              </AppPressable>
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries"
                placeholderTextColor={colors.textTertiary}
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="Search countries"
                autoCorrect={false}
              />
            </View>
            <ScrollView contentContainerStyle={styles.list}>
              <OptionRow key="anywhere" label="Anywhere" selected={location === null} onPress={() => choose(null)} />
              {matches.length === 0 ? (
                <AppText style={styles.emptyText}>No countries match your search.</AppText>
              ) : null}
              {matches.map((country) => (
                <OptionRow
                  key={country.code}
                  label={country.name}
                  selected={location?.countryCode === country.code && !location?.city}
                  onPress={() => {
                    if (catalogCities(events, country.code).length > 0) {
                      selectionFeedback()
                      setPendingCountry(country)
                    } else {
                      choose({ countryCode: country.code })
                    }
                  }}
                />
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </View>
  )
}

/** Case-folded, diacritic-stripped comparison key for country search. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    ...typography.sectionTitle,
    textAlign: 'center',
  },
  closeText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  error: {
    color: colors.warning,
    ...typography.label,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: primaryHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  deviceText: {
    color: colors.accent,
    ...typography.bodyCompact,
    fontWeight: '600',
  },
  searchInput: {
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
  emptyText: {
    color: colors.textTertiary,
    ...typography.label,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
