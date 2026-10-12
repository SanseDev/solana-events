import React, { useMemo, useState } from 'react'
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { AppText } from '@/components/app-text'
import { EmptyState } from '@/src/components/EmptyState'
import { EventDetailsActionDock } from '@/src/components/EventDetailsActionDock'
import { EventArtwork } from '@/src/components/EventArtwork'
import { AppPressable } from '@/src/components/ui/AppPressable'
import { getEventById } from '@/src/data/eventCatalog'
import { COMMUNITIES_BY_ID } from '@/src/data/communities'
import { ATTENDANCE_MODE_LABELS, EVENT_FORMAT_LABELS, TOPIC_LABELS } from '@/src/domain/event'
import { useFavorites } from '@/src/hooks/useFavorites'
import { addEventToCalendar } from '@/src/services/calendar'
import { openExternalUrl } from '@/src/services/externalLinks'
import { formatDateOnlySpan, formatDateTime, formatEventDateRange } from '@/src/utils/dates'
import { getEventStatus, getRegistrationState } from '@/src/utils/eventStatus'
import { colors, radius, screenPadding, spacing, touchTarget, typography } from '@/src/theme'

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <AppText style={styles.blockLabel}>{label}</AppText>
      {children}
    </View>
  )
}

function StaticChip({ text }: { text: string }) {
  return (
    <View style={styles.staticChip}>
      <AppText style={styles.staticChipText}>{text}</AppText>
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
      <SafeAreaView style={styles.root} edges={['top']}>
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
  const primaryLabel =
    registration === 'closed' ? 'Registration closed' : event.registrationUrl ? 'Register' : 'View official source'
  const calendarEligible = status !== 'ended' && Platform.OS !== 'web'
  const dateText = event.allDay
    ? formatDateOnlySpan(event.startAt, event.endAt)
    : formatEventDateRange(event.startAt, event.endAt, event.timezoneLabel)
  const place =
    event.attendanceMode === 'online' ? 'Online' : [event.venue, event.city, event.country].filter(Boolean).join(', ')

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

  const onPrimary = () => {
    const url = event.registrationUrl ?? event.officialSourceUrl
    openExternalUrl(url).catch(() => {
      Alert.alert('Could not open link', 'Please try again later.')
    })
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.body}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppPressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
          </AppPressable>
          <View style={styles.coverWrap}>
            <EventArtwork event={event} variant="cover" />
          </View>
          <View style={styles.header}>
            <AppText style={styles.overline}>
              {EVENT_FORMAT_LABELS[event.format].toUpperCase()} ·{' '}
              {ATTENDANCE_MODE_LABELS[event.attendanceMode].toUpperCase()}
            </AppText>
            <AppText style={styles.title}>{event.title}</AppText>
            <AppText style={styles.organizer}>{event.organizer}</AppText>
          </View>
          {persistError ? <AppText style={styles.persistError}>{persistError}</AppText> : null}
          <InfoBlock label="When">
            <AppText style={styles.blockValue}>{dateText}</AppText>
          </InfoBlock>
          {event.registrationDeadline ? (
            <InfoBlock label="Registration deadline">
              <AppText
                style={[
                  styles.blockValue,
                  registration === 'closed' ? { color: colors.danger } : { color: colors.warning },
                ]}
              >
                {formatDateTime(event.registrationDeadline, event.timezoneLabel)}
              </AppText>
            </InfoBlock>
          ) : null}
          <InfoBlock label="Where">
            <AppText style={styles.blockValue}>{place}</AppText>
          </InfoBlock>
          <InfoBlock label="About">
            <AppText style={styles.description}>{event.description}</AppText>
          </InfoBlock>
          <InfoBlock label="Topics">
            <View style={styles.chipWrap}>
              {event.topics.map((topic) => (
                <StaticChip key={topic} text={TOPIC_LABELS[topic]} />
              ))}
            </View>
          </InfoBlock>
          {event.communityIds.length > 0 ? (
            <InfoBlock label="Communities">
              <View style={styles.chipWrap}>
                {event.communityIds.map((communityId) => (
                  <StaticChip key={communityId} text={COMMUNITIES_BY_ID.get(communityId)?.name ?? communityId} />
                ))}
              </View>
            </InfoBlock>
          ) : null}
          <AppText style={styles.verified}>
            Details verified on {event.lastVerifiedAt}.
            {status === 'ended' ? ' This event has ended.' : status === 'ongoing' ? ' Happening now.' : ''}
          </AppText>
        </ScrollView>
        <EventDetailsActionDock
          primaryLabel={primaryLabel}
          primaryDisabled={registration === 'closed'}
          saved={saved}
          calendarState={calendarState}
          showCalendar={calendarEligible}
          onPrimary={onPrimary}
          onSave={() => toggleFavorite(event.id)}
          onAddToCalendar={onAddToCalendar}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  body: {
    flex: 1,
  },
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  coverWrap: {
    marginHorizontal: -screenPadding,
  },
  backButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvasRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  header: {
    gap: spacing.xs,
  },
  overline: {
    color: colors.accent,
    ...typography.overline,
  },
  title: {
    color: colors.textPrimary,
    ...typography.detailTitle,
  },
  organizer: {
    color: colors.textSecondary,
    ...typography.bodyCompact,
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
    ...typography.overline,
  },
  blockValue: {
    color: colors.textPrimary,
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  description: {
    color: colors.textPrimary,
    ...typography.body,
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
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  staticChipText: {
    color: colors.textSecondary,
    ...typography.label,
  },
  verified: {
    color: colors.textTertiary,
    ...typography.label,
    fontSize: 12,
    lineHeight: 16,
  },
  persistError: {
    color: colors.warning,
    ...typography.label,
  },
})
