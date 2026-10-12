/**
 * Typography scale (docs/specs/20261011-solwhere-redesign.md).
 * System font only; SpaceMono is reserved for wallet addresses.
 * No `maxFontSizeMultiplier` below system preference — layouts must wrap.
 */
export const typography = {
  display: { fontSize: 32, fontWeight: '700', lineHeight: 38 },
  pageTitle: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  detailTitle: { fontSize: 26, fontWeight: '700', lineHeight: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  cardTitle: { fontSize: 17, fontWeight: '600', lineHeight: 23 },
  body: { fontSize: 16, lineHeight: 24 },
  bodyCompact: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  overline: { fontSize: 11, fontWeight: '700', lineHeight: 14, letterSpacing: 0.8 },
} as const

export type TypographyToken = keyof typeof typography
