import React, { useState } from 'react'
import { Image } from 'expo-image'
import { StyleSheet, View, type ImageStyle } from 'react-native'
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { getEventImage, preferredContentFit, shouldRenderEventImage } from '@/src/data/eventImages'
import type { Event } from '../domain/event'
import { colors, radius } from '../theme'
import { getEventArtworkConfig, type EventArtworkConfig } from './eventArtworkConfig'

/** Must mirror the aspect ratios in variantStyles below. */
const VARIANT_ASPECT: Record<'feature' | 'thumb' | 'cover', number> = {
  feature: 16 / 9,
  thumb: 84 / 63,
  cover: 16 / 9,
}

/**
 * Verified local assets come from a static Metro registry. Missing or failed
 * assets use deterministic, format-aware SVG illustrations with no text.
 */
export function EventArtwork({ event, variant }: { event: Event; variant: 'feature' | 'thumb' | 'cover' }) {
  // Keyed by asset module, not event id: a late error from a previous artwork
  // must not suppress the next one the component renders.
  const [failedSource, setFailedSource] = useState<number | null>(null)
  const image = getEventImage(event.id)
  const loadFailed = image !== undefined && failedSource === image.source

  if (shouldRenderEventImage(image, loadFailed)) {
    const contentFit = preferredContentFit(image.aspect, VARIANT_ASPECT[variant])
    return (
      <Image
        key={image.source}
        source={image.source}
        contentFit={contentFit}
        accessibilityLabel={`${event.title} artwork`}
        onError={() => setFailedSource(image.source)}
        style={[styles.block, contentFit === 'contain' && styles.containBackground, variantStyles[variant]]}
      />
    )
  }

  return (
    <View accessible={false} style={[styles.block, variantStyles[variant]]}>
      <EventIllustration config={getEventArtworkConfig(event)} />
    </View>
  )
}

function EventIllustration({ config }: { config: EventArtworkConfig }) {
  const { palette, family, variant, seed } = config
  const gradientId = `artwork-gradient-${seed}`
  return (
    <Svg accessible={false} width="100%" height="100%" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={palette.background} />
          <Stop offset="1" stopColor={palette.shade} />
        </LinearGradient>
      </Defs>
      <Rect width="160" height="90" fill={`url(#${gradientId})`} />
      {family === 'hackathon' ? <HackathonArtwork palette={palette} variant={variant} /> : null}
      {family === 'conference' ? <ConferenceArtwork palette={palette} variant={variant} /> : null}
      {family === 'community' ? <CommunityArtwork palette={palette} variant={variant} /> : null}
      {family === 'workshop' ? <WorkshopArtwork palette={palette} variant={variant} /> : null}
      {family === 'default' ? <DefaultArtwork palette={palette} variant={variant} /> : null}
    </Svg>
  )
}

type IllustrationProps = Pick<EventArtworkConfig, 'palette' | 'variant'>

function HackathonArtwork({ palette, variant }: IllustrationProps) {
  const offset = variant * 8
  return (
    <>
      <Path
        d={`M-8 ${66 - offset} C32 35, 48 84, 80 46 S126 16, 170 32`}
        fill="none"
        stroke={palette.secondary}
        strokeWidth="2"
        opacity="0.72"
      />
      <Path
        d={`M-4 ${28 + offset} C28 8, 58 52, 91 34 S132 56, 164 14`}
        fill="none"
        stroke={palette.highlight}
        strokeWidth="1"
        opacity="0.55"
      />
      <Circle cx={31 + offset} cy="53" r="5" fill={palette.highlight} />
      <Circle cx={85 - offset / 2} cy="45" r="4" fill={palette.secondary} />
      <Circle cx="128" cy={30 + offset / 2} r="5" fill={palette.primary} />
      <Rect
        x={15 + offset}
        y="22"
        width="22"
        height="22"
        rx="4"
        fill={palette.primary}
        transform={`rotate(${12 + variant * 7} ${26 + offset} 33)`}
      />
      <Rect
        x="108"
        y={49 - offset / 2}
        width="28"
        height="28"
        rx="5"
        fill={palette.secondary}
        transform={`rotate(${-10 - variant * 5} 122 ${63 - offset / 2})`}
      />
      <Rect x="56" y="59" width="14" height="14" rx="3" fill={palette.highlight} opacity="0.9" />
    </>
  )
}

function ConferenceArtwork({ palette, variant }: IllustrationProps) {
  const cx = 80 + (variant - 1) * 12
  const cy = 45 + (variant - 1) * 5
  return (
    <>
      <Circle cx={cx} cy={cy} r="55" fill="none" stroke={palette.secondary} strokeWidth="1" opacity="0.25" />
      <Circle cx={cx} cy={cy} r="39" fill="none" stroke={palette.primary} strokeWidth="2" opacity="0.52" />
      <Circle cx={cx} cy={cy} r="24" fill="none" stroke={palette.highlight} strokeWidth="1.5" opacity="0.7" />
      <Circle cx={cx} cy={cy} r="10" fill={palette.primary} />
      <Circle cx={cx} cy={cy} r="4" fill={palette.highlight} />
      <Path
        d={`M0 ${cy + 22} Q${cx} ${cy - 24} 160 ${cy + 18}`}
        fill="none"
        stroke={palette.secondary}
        strokeWidth="5"
        opacity="0.35"
      />
      <Path
        d={`M0 ${cy + 30} Q${cx} ${cy - 8} 160 ${cy + 28}`}
        fill="none"
        stroke={palette.highlight}
        strokeWidth="1.5"
        opacity="0.5"
      />
    </>
  )
}

function CommunityArtwork({ palette, variant }: IllustrationProps) {
  const shift = (variant - 1) * 7
  return (
    <>
      <Circle cx="80" cy="45" r="21" fill={palette.secondary} opacity="0.35" />
      <Circle cx="80" cy="45" r="12" fill={palette.highlight} />
      <Circle cx={42 + shift} cy="30" r="16" fill={palette.primary} />
      <Circle cx={118 - shift} cy="29" r="14" fill={palette.secondary} />
      <Circle cx="123" cy="64" r="17" fill={palette.primary} opacity="0.86" />
      <Circle cx="39" cy="63" r="13" fill={palette.secondary} opacity="0.92" />
      <Path
        d="M48 34 Q80 16 112 33 M49 61 Q80 80 111 62"
        fill="none"
        stroke={palette.highlight}
        strokeWidth="2"
        opacity="0.65"
      />
    </>
  )
}

function WorkshopArtwork({ palette, variant }: IllustrationProps) {
  const columns = [28, 58, 88, 118]
  return (
    <>
      {columns.map((x) => (
        <Line key={x} x1={x} y1="8" x2={x} y2="82" stroke={palette.highlight} strokeWidth="1" opacity="0.24" />
      ))}
      {[22, 45, 68].map((y) => (
        <Line key={y} x1="12" y1={y} x2="148" y2={y} stroke={palette.highlight} strokeWidth="1" opacity="0.24" />
      ))}
      <Rect x={18 + variant * 7} y="14" width="30" height="23" rx="4" fill={palette.primary} />
      <Rect x={66 - variant * 5} y="29" width="32" height="29" rx="4" fill={palette.secondary} />
      <Rect x={111 - variant * 5} y="12" width="22" height="22" rx="4" fill={palette.highlight} />
      <Rect x={32 + variant * 4} y="58" width="26" height="18" rx="4" fill={palette.highlight} opacity="0.9" />
      <Rect x={106 + variant * 2} y="61" width="30" height="15" rx="4" fill={palette.primary} />
    </>
  )
}

function DefaultArtwork({ palette, variant }: IllustrationProps) {
  const cx = 46 + variant * 28
  return (
    <>
      <Circle cx={cx} cy="45" r="34" fill={palette.secondary} opacity="0.34" />
      <Circle cx={cx} cy="45" r="18" fill={palette.primary} />
      <Path d={`M0 70 L${cx} 27 L160 64`} fill="none" stroke={palette.highlight} strokeWidth="2" opacity="0.65" />
    </>
  )
}

const styles = StyleSheet.create({
  block: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  containBackground: {
    backgroundColor: colors.canvasRaised,
  },
})

/** Feature and detail covers are 16:9; compact card thumbnails are 4:3 at 84×63. */
const variantStyles = StyleSheet.create<{
  feature: ImageStyle
  thumb: ImageStyle
  cover: ImageStyle
}>({
  feature: { aspectRatio: 16 / 9, borderRadius: radius.lg },
  thumb: { width: 84, height: 63, borderRadius: radius.sm },
  cover: { aspectRatio: 16 / 9, borderRadius: radius.lg },
})
