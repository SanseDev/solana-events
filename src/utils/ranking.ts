import type { Event, Interests } from '../domain/event'

/** +2 per matching topic, +1 per matching community. */
export function scoreEvent(event: Event, interests: Interests): number {
  const topicScore = event.topics.reduce((sum, topic) => (interests.topics.includes(topic) ? sum + 2 : sum), 0)
  const communityScore = event.communityIds.reduce(
    (sum, id) => (interests.communityIds.includes(id) ? sum + 1 : sum),
    0,
  )
  return topicScore + communityScore
}

/** Sorts by score descending; ties and zero-score entries fall back to startAt ascending. */
export function rankByInterests(events: Event[], interests: Interests): Event[] {
  return [...events].sort((a, b) => {
    const scoreDiff = scoreEvent(b, interests) - scoreEvent(a, interests)
    if (scoreDiff !== 0) {
      return scoreDiff
    }
    return Date.parse(a.startAt) - Date.parse(b.startAt)
  })
}
