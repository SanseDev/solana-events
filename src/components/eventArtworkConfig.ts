import type { Event } from '../domain/event'

export type ArtworkFamily = 'hackathon' | 'conference' | 'community' | 'workshop' | 'default'

export interface ArtworkPalette {
  background: string
  shade: string
  primary: string
  secondary: string
  highlight: string
}

export interface EventArtworkConfig {
  family: ArtworkFamily
  palette: ArtworkPalette
  variant: number
  seed: number
}

const PALETTES: Record<ArtworkFamily, readonly ArtworkPalette[]> = {
  hackathon: [
    { background: '#111136', shade: '#201855', primary: '#7A5CFF', secondary: '#2196F3', highlight: '#A7F3FF' },
    { background: '#15103B', shade: '#28205F', primary: '#9B6CFF', secondary: '#3B82F6', highlight: '#C4B5FD' },
    { background: '#0D1635', shade: '#142A5A', primary: '#675CFF', secondary: '#00A6FB', highlight: '#84E8FF' },
  ],
  conference: [
    { background: '#091E38', shade: '#0B3555', primary: '#22B8CF', secondary: '#337CFF', highlight: '#8FF7E9' },
    { background: '#071B35', shade: '#10375C', primary: '#32D4C8', secondary: '#3487E8', highlight: '#9BE7FF' },
    { background: '#09243D', shade: '#124C65', primary: '#17C3B2', secondary: '#4F78FF', highlight: '#A7F5E5' },
  ],
  community: [
    { background: '#30163B', shade: '#572355', primary: '#EF6C8D', secondary: '#A855F7', highlight: '#FFB3A7' },
    { background: '#321535', shade: '#65234B', primary: '#FF7A70', secondary: '#8B5CF6', highlight: '#FFC1AD' },
    { background: '#281440', shade: '#4A235E', primary: '#FF6F91', secondary: '#B15CFF', highlight: '#F9B6D7' },
  ],
  workshop: [
    { background: '#38200D', shade: '#633917', primary: '#F59E0B', secondary: '#F97316', highlight: '#FFD56A' },
    { background: '#321C0C', shade: '#5C3214', primary: '#FFB020', secondary: '#FB7B2D', highlight: '#FFE08A' },
    { background: '#3B1D10', shade: '#6E3217', primary: '#F6A623', secondary: '#FF7849', highlight: '#FFD38A' },
  ],
  default: [
    { background: '#151B35', shade: '#28325D', primary: '#7D8DFF', secondary: '#43C5D8', highlight: '#C3CCFF' },
  ],
}

export function artworkFamilyForFormat(format: string): ArtworkFamily {
  switch (format) {
    case 'hackathon':
      return 'hackathon'
    case 'conference':
      return 'conference'
    case 'meetup':
    case 'community_event':
      return 'community'
    case 'workshop':
      return 'workshop'
    default:
      return 'default'
  }
}

/** Stable 32-bit ID hash. Never use render-time randomness for artwork choices. */
export function artworkSeed(eventId: string): number {
  let hash = 2166136261
  for (let index = 0; index < eventId.length; index += 1) {
    hash ^= eventId.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function getEventArtworkConfig(event: Pick<Event, 'id' | 'format'>): EventArtworkConfig {
  const seed = artworkSeed(event.id)
  const family = artworkFamilyForFormat(event.format)
  const palettes = PALETTES[family]
  return {
    family,
    palette: palettes[seed % palettes.length],
    variant: Math.floor(seed / palettes.length) % 3,
    seed,
  }
}
