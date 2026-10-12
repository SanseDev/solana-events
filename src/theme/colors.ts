/**
 * Semantic color tokens (docs/specs/20261011-solwhere-redesign.md).
 * Dark-only palette; screens must consume tokens, never hard-code values.
 */
export const colors = {
  canvas: '#090D18',
  canvasRaised: '#0D1322',
  surface: '#12192A',
  surfaceRaised: '#182238',
  surfacePressed: '#202C46',
  borderSubtle: '#26334D',
  borderStrong: '#3A4A6B',
  textPrimary: '#F4F7FF',
  textSecondary: '#B6C1D8',
  textTertiary: '#7F8CA8',
  accent: '#9B8CFF',
  accentPressed: '#7C6DE0',
  accentMuted: '#29234C',
  success: '#59D7A6',
  warning: '#F3BF6B',
  danger: '#FF8295',
  focusRing: '#C3B9FF',
  /** Opaque primary-label color used on accent fills after contrast check. */
  onAccent: '#FFFFFF',
} as const

export type ColorToken = keyof typeof colors
