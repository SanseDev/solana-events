import { useMemo, useState } from 'react'
import { applyFilters, emptyFilters, type EventFilters } from '../domain/filters'
import type { Event } from '../domain/event'

export function useEventFilters(events: Event[]) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<EventFilters>(emptyFilters)

  const filtered = useMemo(() => applyFilters(events, query, filters), [events, query, filters])

  return {
    query,
    setQuery,
    filters,
    setFilters,
    filtered,
    clearFilters: () => setFilters(emptyFilters),
  }
}
