import { isCountryCode } from '../data/countries'

export type AttendanceMode = 'online' | 'in_person' | 'hybrid'

export type EventFormat = 'hackathon' | 'conference' | 'meetup' | 'workshop' | 'community_event'

export type Topic = 'defi' | 'nfts' | 'developers' | 'gaming' | 'consumer' | 'mobile' | 'dao'

export const TOPICS: readonly Topic[] = ['defi', 'nfts', 'developers', 'gaming', 'consumer', 'mobile', 'dao'] as const

export const EVENT_FORMATS: readonly EventFormat[] = [
  'hackathon',
  'conference',
  'meetup',
  'workshop',
  'community_event',
] as const

export const ATTENDANCE_MODES: readonly AttendanceMode[] = ['online', 'in_person', 'hybrid'] as const

export const TOPIC_LABELS: Record<Topic, string> = {
  defi: 'DeFi',
  nfts: 'NFTs',
  developers: 'Developers',
  gaming: 'Gaming',
  consumer: 'Consumer',
  mobile: 'Mobile',
  dao: 'DAO',
}

export const EVENT_FORMAT_LABELS: Record<EventFormat, string> = {
  hackathon: 'Hackathon',
  conference: 'Conference',
  meetup: 'Meetup',
  workshop: 'Workshop',
  community_event: 'Community event',
}

export const ATTENDANCE_MODE_LABELS: Record<AttendanceMode, string> = {
  online: 'Online',
  in_person: 'In person',
  hybrid: 'Hybrid',
}

export type Intent = 'learn' | 'meet_people' | 'hackathons' | 'communities'

export const INTENTS: readonly Intent[] = ['learn', 'meet_people', 'hackathons', 'communities'] as const

export const INTENT_LABELS: Record<Intent, string> = {
  learn: 'Learn',
  meet_people: 'Meet people',
  hackathons: 'Join hackathons',
  communities: 'Discover communities',
}

export type ParticipationPreference = 'online' | 'in_person' | 'both'

export const PARTICIPATION_PREFERENCES: readonly ParticipationPreference[] = ['online', 'in_person', 'both'] as const

export const PARTICIPATION_LABELS: Record<ParticipationPreference, string> = {
  online: 'Online',
  in_person: 'In person',
  both: 'Both',
}

export interface LocationPreference {
  /** ISO 3166-1 alpha-2 code — the stable filter key, never a display name. */
  countryCode: string
  /** Optional city that narrows the country filter. */
  city?: string
}

/** Local preference profile persisted under `solana-events:preferences:v2`. */
export interface PreferenceProfile {
  intent: Intent[]
  topics: Topic[]
  communityIds: string[]
  participation: ParticipationPreference
  location: LocationPreference | null
}

export interface Event {
  id: string
  title: string
  shortDescription: string
  description: string
  organizer: string
  topics: Topic[]
  format: EventFormat
  communityIds: string[]
  /** ISO 8601 with explicit offset, e.g. `2026-10-12T18:00:00-04:00`. */
  startAt: string
  /** ISO 8601 with explicit offset, e.g. `2026-10-12T22:00:00-04:00`. */
  endAt: string
  timezoneLabel: string
  registrationDeadline?: string
  attendanceMode: AttendanceMode
  city?: string
  /** Human-readable country label for display. */
  country?: string
  /** ISO 3166-1 alpha-2 code used for location filtering. */
  countryCode?: string
  venue?: string
  officialSourceUrl: string
  registrationUrl?: string
  /** Date the organizer page was manually checked, `YYYY-MM-DD`. */
  lastVerifiedAt: string
  /** True when the official source publishes dates without times. */
  allDay?: boolean
  image?: string
}

export interface Community {
  id: string
  name: string
  description: string
}

export interface Interests {
  topics: Topic[]
  communityIds: string[]
}

/** Light structural validation used when the catalog is loaded. */
export function isValidEvent(value: unknown): value is Event {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const e = value as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    e.id.length > 0 &&
    typeof e.title === 'string' &&
    typeof e.organizer === 'string' &&
    Array.isArray(e.topics) &&
    typeof e.format === 'string' &&
    typeof e.startAt === 'string' &&
    !Number.isNaN(Date.parse(e.startAt)) &&
    typeof e.endAt === 'string' &&
    !Number.isNaN(Date.parse(e.endAt)) &&
    typeof e.officialSourceUrl === 'string' &&
    e.officialSourceUrl.startsWith('https://') &&
    (e.countryCode === undefined || (typeof e.countryCode === 'string' && isCountryCode(e.countryCode)))
  )
}
