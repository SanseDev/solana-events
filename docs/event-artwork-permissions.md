# Event artwork permission ledger

Package reviewed: `solwhere-event-images/` (manifest dated 2026-10-12, 51 entries).
Policy (redesign plan §Images and provenance): an image on an organizer page is
not approval. Bundled artwork requires a recorded permission or license basis.

## Current status

**0 of 51 assets cleared. All 51 catalog events remain on the designed SVG
fallback.** Every manifest entry carries `permissionStatus: "unverified"`,
`permissionBasis: null`, `integrationApproved: false`. No permission or license
for these assets exists in this repository, and none has been supplied by the
package source. Official hosting (solana.com, Luma event covers) does not
establish reuse rights.

## What is already prepared

`src/data/eventImages.ts` holds the complete technical mapping in
`PENDING_EVENT_ARTWORK` — data only, no `require()`, so nothing enters the
bundle. It maps all 51 catalog event IDs by exact ID to source page, package
file, SHA-256, and intrinsic dimensions. `EventArtwork` already supports the
promoted form: aspect-aware `cover` vs `contain` (contain gets the
`canvasRaised` background), per-source failure state, and `key={source}` reset.
Regression tests cover mapping completeness, checksum/file dedupe consistency,
and the fit rule.

## Dedupe note

The 11 VibeStation occurrences share 3 files by identical SHA-256:

- Toronto (2026-10-16, 10-23, 10-30, 11-06): `6cec89c4…`
- Montréal (2026-10-16, 10-23, 10-30, 11-06): `103da847…`
- Vancouver (2026-10-16, 10-23, 10-30): `14d386a9…`

51 mappings → 43 unique files (8 redundant copies never need bundling).

## Promotion procedure (per asset, after documented permission)

1. Copy the unique file from `solwhere-event-images/candidates/` into
   `assets/event-artwork/` (keep one copy per SHA-256).
2. In `src/data/eventImages.ts`, add a literal
   `require('../../assets/event-artwork/<file>')` constant and an
   `EVENT_IMAGES[eventId]` entry per event ID sharing that file, with
   `aspect: width / height`, `sourceUrl`, `attribution`, and the concrete
   `permissionOrLicense` basis (e.g. "CC BY 4.0", written organizer consent with
   date and channel, Solana Foundation brand-assets terms). Record the same
   basis in this ledger.
3. Never promote on hosting alone. Leave others on fallback.
4. Verify on device: Discover thumb, featured card, details cover, and
   airplane-mode rendering for each promoted asset.

## Recorded bases

None yet.

## Separate data issue (not artwork)

`hacker-house-london-2026` poster reads "NOV 01–13" while the catalog ends
Nov 12 (catalog verified against solana.com/events and the Luma page's
structured data on 2026-10-12; see docs/catalog-audit-2026-10-12.md). Catalog
intentionally unchanged; confirm the end date with the organizer before any
edit.
