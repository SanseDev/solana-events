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
  country?: string
  venue?: string
  officialSourceUrl: string
  registrationUrl?: string
  /** Date the organizer page was manually checked, `YYYY-MM-DD`. */
  lastVerifiedAt: string
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
    e.officialSourceUrl.startsWith('https://')
  )
}
