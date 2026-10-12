import type { Community } from '../domain/event'

/** Curated communities referenced by events.json. Every id must exist here. */
export const COMMUNITIES: readonly Community[] = [
  {
    id: 'solana-foundation',
    name: 'Solana Foundation',
    description: 'Core ecosystem organization behind Breakpoint, Hacker Houses, and grants.',
  },
  {
    id: 'superteam',
    name: 'Superteam',
    description: 'Regional Solana builder collectives across India, Brazil, and beyond.',
  },
  {
    id: 'la-familia',
    name: 'La Familia',
    description: 'Solana builder community behind El Encuentro and ecosystem growth in Spain.',
  },
  {
    id: 'islanddao',
    name: 'IslandDAO',
    description: 'Builder residency community based in Florianópolis, Brazil.',
  },
] as const

export const COMMUNITIES_BY_ID: ReadonlyMap<string, Community> = new Map(
  COMMUNITIES.map((community) => [community.id, community]),
)
