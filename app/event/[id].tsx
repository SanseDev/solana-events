import React, { useMemo, useState } from 'react'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import { EmptyState } from '@/src/components/EmptyState'
import { getEventById } from '@/src/data/eventCatalog'
import { COMMUNITIES_BY_ID } from '@/src/data/communities'
import { ATTENDANCE_MODE_LABELS, EVENT_FORMAT_LABELS, TOPIC_LABELS } from '@/src/domain/event'
import { useFavorites } from '@/src/hooks/useFavorites'
import { addEventToCalendar } from '@/src/services/calendar'
import { openExternalUrl } from '@/src/services/externalLinks'
import { formatDateOnlySpan, formatDateTime, formatEventDateRange } from '@/src/utils/dates'
import { getEventStatus, getRegistrationState } from '@/src/utils/eventStatus'
import { colors, radius, spacing } from '@/src/theme'

function MetaBlock({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={detailStyles.block}>
      <AppText style={detailStyles.blockLabel}>{label}</AppText>
      <AppText style={[detailStyles.blockValue, valueColor ? { color: valueColor } : null]}>{value}</AppText>
    </View>
  )
}

function Badge({ text }: { text: string }) {
  return (
    <View style={detailStyles.badge}>
      <Text style={detailStyles.badgeText}>{text}</Text>
    </View>
  )
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const event = useMemo(() => (typeof id === 'string' ? getEventById(id) : undefined), [id])
  const now = useMemo(() => new Date(), [])
  const { isFavorite, toggleFavorite, persistError } = useFavorites()
  const [calendarState, setCalendarState] = useState<'idle' | 'adding' | 'added'>('idle')

  if (!event) {
    return (
      <SafeAreaView style={detailStyles.root} edges={['top']}>
        <EmptyState
          title="Event not found"
          message="This event is no longer in the catalog."
          ctaLabel="Back to Discover"
          onCta={() => router.push('/(tabs)/discover')}
        />
      </SafeAreaView>
    )
  }

  const status = getEventStatus(event, now)
  const registration = getRegistrationState(event, now)
  const saved = isFavorite(event.id)
  const dateText = event.allDay
    ? formatDateOnlySpan(event.startAt, event.endAt)
    : formatEventDateRange(event.startAt, event.endAt, event.timezoneLabel)
  const place =
    event.attendanceMode === 'online' ? 'Online' : [event.venue, event.city, event.country].filter(Boolean).join(', ')

  const openLink = (url: string | undefined, fallback: () => void) => {
    if (!url) {
      fallback()
      return
    }
    openExternalUrl(url).catch(() => {
      Alert.alert('Could not open link', 'Please try again later.')
    })
  }

  const onAddToCalendar = async () => {
    if (calendarState !== 'idle') {
      return
    }
    setCalendarState('adding')
    const result = await addEventToCalendar(event)
    setCalendarState(result === 'added' ? 'added' : 'idle')
    if (result === 'added') {
      return
    }
    if (result === 'permission-denied') {
      Alert.alert('Calendar access needed', 'Allow calendar access in Android settings to add this event.')
      return
    }
    if (result === 'no-calendar') {
      Alert.alert('No calendar found', 'Add a calendar account on this device, then try again.')
      return
    }
    Alert.alert('Could not add event', 'Please try again later.')
  }

  return (
    <SafeAreaView style={detailStyles.root} edges={['top']}>
      <ScrollView contentContainerStyle={detailStyles.content} keyboardShouldPersistTaps="handled">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [detailStyles.backButton, pressed && detailStyles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={detailStyles.hero}>
          <AppText style={detailStyles.title}>{event.title}</AppText>
          <AppText style={detailStyles.organizer}>{event.organizer}</AppText>
          <View style={detailStyles.badgeRow}>
            <Badge text={EVENT_FORMAT_LABELS[event.format]} />
            <Badge text={ATTENDANCE_MODE_LABELS[event.attendanceMode]} />
            {status === 'ended' ? <Badge text="Ended" /> : null}
            {status === 'ongoing' ? <Badge text="Happening now" /> : null}
          </View>
        </View>
        {persistError ? <AppText style={detailStyles.persistError}>{persistError}</AppText> : null}
        <MetaBlock label="When" value={dateText} />
        {event.registrationDeadline ? (
          <MetaBlock
            label="Registration deadline"
            value={formatDateTime(event.registrationDeadline, event.timezoneLabel)}
            valueColor={registration === 'closed' ? colors.danger : colors.warning}
          />
        ) : null}
        <MetaBlock label="Where" value={place} />
        <View style={detailStyles.block}>
          <AppText style={detailStyles.blockLabel}>About</AppText>
          <AppText style={detailStyles.description}>{event.description}</AppText>
        </View>
        <View style={detailStyles.block}>
          <AppText style={detailStyles.blockLabel}>Topics</AppText>
          <View style={detailStyles.chipWrap}>
            {event.topics.map((topic) => (
              <View key={topic} style={detailStyles.staticChip}>
                <Text style={detailStyles.staticChipText}>{TOPIC_LABELS[topic]}</Text>
              </View>
            ))}
          </View>
        </View>
        {event.communityIds.length > 0 ? (
          <View style={detailStyles.block}>
            <AppText style={detailStyles.blockLabel}>Communities</AppText>
            <View style={detailStyles.chipWrap}>
              {event.communityIds.map((communityId) => (
                <View key={communityId} style={detailStyles.staticChip}>
                  <Text style={detailStyles.staticChipText}>
                    {COMMUNITIES_BY_ID.get(communityId)?.name ?? communityId}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        <AppText style={detailStyles.verified}>Details verified on {event.lastVerifiedAt}.</AppText>
        <Pressable
          onPress={() => toggleFavorite(event.id)}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Unsave event' : 'Save event'}
          style={({ pressed }) => [detailStyles.primaryButton, pressed && detailStyles.pressed]}
        >
          <MaterialIcons name={saved ? 'bookmark' : 'bookmark-border'} size={20} color="#FFFFFF" />
          <Text style={detailStyles.primaryText}>{saved ? 'Saved' : 'Save event'}</Text>
        </Pressable>
        <Pressable
          onPress={() => openLink(event.registrationUrl ?? event.officialSourceUrl, () => undefined)}
          accessibilityRole="button"
          accessibilityLabel={event.registrationUrl ? 'Register' : 'View official source'}
          disabled={registration === 'closed' && Boolean(event.registrationUrl)}
          style={({ pressed }) => [
            detailStyles.outlineButton,
            pressed && detailStyles.pressed,
            registration === 'closed' && event.registrationUrl ? detailStyles.disabledButton : null,
          ]}
        >
          <Text
            style={[
              detailStyles.outlineText,
              registration === 'closed' && event.registrationUrl ? detailStyles.disabledText : null,
            ]}
          >
            {registration === 'closed' && event.registrationUrl
              ? 'Registration closed'
              : event.registrationUrl
                ? 'Register'
                : 'View official source'}
          </Text>
        </Pressable>
        {status !== 'ended' && Platform.OS !== 'web' ? (
          <Pressable
            onPress={onAddToCalendar}
            accessibilityRole="button"
            accessibilityLabel={
              calendarState === 'added'
                ? 'Added to calendar'
                : calendarState === 'adding'
                  ? 'Adding to calendar'
                  : 'Add to calendar'
            }
            accessibilityState={{ disabled: calendarState !== 'idle', busy: calendarState === 'adding' }}
            disabled={calendarState !== 'idle'}
            style={({ pressed }) => [
              detailStyles.outlineButton,
              calendarState === 'added' ? detailStyles.disabledButton : null,
              pressed && detailStyles.pressed,
            ]}
          >
            <MaterialIcons
              name={calendarState === 'added' ? 'check' : 'event'}
              size={20}
              color={calendarState === 'added' ? colors.textSecondary : colors.accent}
            />
            <Text style={[detailStyles.outlineText, calendarState === 'added' ? detailStyles.disabledText : null]}>
              {calendarState === 'added'
                ? 'Added to calendar'
                : calendarState === 'adding'
                  ? 'Adding…'
                  : 'Add to calendar'}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => openLink(event.officialSourceUrl, () => undefined)}
          accessibilityRole="button"
          accessibilityLabel="Official source"
          style={({ pressed }) => [detailStyles.ghostButton, pressed && detailStyles.pressed]}
        >
          <Text style={detailStyles.ghostText}>Official source</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const detailStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  hero: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  organizer: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  block: {
    gap: spacing.xs,
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  blockLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  blockValue: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  description: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  staticChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  staticChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  verified: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  persistError: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accentPressed,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  outlineText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    borderColor: colors.borderSubtle,
    opacity: 0.7,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  ghostButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
})
