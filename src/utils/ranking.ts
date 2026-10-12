import { INTENTS, type Event, type Intent, type PreferenceProfile } from '../domain/event'

/** Reason keys: `topic:<t>`, `community:<id>`, `intent:<i>`. */
export type ReasonKey = string

export interface EventRecommendation {
  event: Event
  score: number
  /** Deduplicated, only present when score > 0. */
  reasonKeys: ReasonKey[]
}

export const emptyProfile: PreferenceProfile = {
  intent: [],
  topics: [],
  communityIds: [],
  participation: 'both',
  location: null,
}

/** True when at least one profile answer could match some catalog rule. */
export function hasPersonalization(profile: PreferenceProfile): boolean {
  return profile.intent.length > 0 || profile.topics.length > 0 || profile.communityIds.length > 0
}

export function matchesIntentRule(event: Event, intent: Intent): boolean {
  switch (intent) {
    case 'learn':
      return event.format === 'workshop' || event.topics.includes('developers')
    case 'meet_people':
      return (event.format === 'meetup' || event.format === 'community_event') && event.attendanceMode !== 'online'
    case 'hackathons':
      return event.format === 'hackathon'
    case 'communities':
      return event.communityIds.length > 0
  }
}

/** +2 per matching topic, +1 per matching community, +1 per matching intent rule. */
export function scoreEvent(event: Event, profile: PreferenceProfile): number {
  return reasonKeysFor(event, profile).length > 0 ? computeScore(event, profile) : 0
}

function computeScore(event: Event, profile: PreferenceProfile): number {
  let score = 0
  for (const topic of event.topics) {
    if (profile.topics.includes(topic)) {
      score += 2
    }
  }
  for (const id of event.communityIds) {
    if (profile.communityIds.includes(id)) {
      score += 1
    }
  }
  for (const intent of profile.intent) {
    if (matchesIntentRule(event, intent)) {
      score += 1
    }
  }
  return score
}

function reasonKeysFor(event: Event, profile: PreferenceProfile): ReasonKey[] {
  const keys: ReasonKey[] = []
  for (const topic of event.topics) {
    if (profile.topics.includes(topic)) {
      keys.push(`topic:${topic}`)
    }
  }
  for (const id of event.communityIds) {
    if (profile.communityIds.includes(id)) {
      keys.push(`community:${id}`)
    }
  }
  // Canonical order keeps reason keys stable regardless of profile array order.
  for (const intent of INTENTS) {
    if (profile.intent.includes(intent) && matchesIntentRule(event, intent)) {
      keys.push(`intent:${intent}`)
    }
  }
  return keys
}

/**
 * Pure recommender: every event is returned with its score (0 allowed) so
 * callers can partition; sorting is score descending with `startAt` ascending
 * as the tie-break. Never mutates the input.
 */
export function recommendEvents(events: readonly Event[], profile: PreferenceProfile): EventRecommendation[] {
  return [...events]
    .map((event) => {
      const reasonKeys = reasonKeysFor(event, profile)
      return {
        event,
        score: reasonKeys.length > 0 ? computeScore(event, profile) : 0,
        reasonKeys,
      }
    })
    .sort((a, b) => {
      const scoreDiff = b.score - a.score
      if (scoreDiff !== 0) {
        return scoreDiff
      }
      return Date.parse(a.event.startAt) - Date.parse(b.event.startAt)
    })
}

/**
 * Split ranked recommendations for the personalized Discover layout:
 * `forYou` keeps score > 0 entries in personalized order (score desc,
 * `startAt` asc) with their truthful reasons; `upcoming` is the score === 0
 * remainder in chronological order. The two sections partition the input
 * exactly — no duplicates, no dropped events.
 */
export function partitionPersonalized(recommendations: readonly EventRecommendation[]): {
  forYou: EventRecommendation[]
  upcoming: Event[]
} {
  const forYou: EventRecommendation[] = []
  const upcoming: Event[] = []
  for (const recommendation of recommendations) {
    if (recommendation.score > 0) {
      forYou.push(recommendation)
    } else {
      upcoming.push(recommendation.event)
    }
  }
  return { forYou, upcoming }
}
