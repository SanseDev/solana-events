---
title: P0 User Stories — Solana Events
date: 2026-10-05
status: implemented
type: user-stories
---

# P0 User Stories

## Discovery

**Story**: As a Solana builder, I open Discover and immediately see upcoming verified events, so I understand the ecosystem calendar in under five seconds.

- Acceptance: upcoming events sorted by date, compact date block, title, format/mode/city meta line.
- Implemented in: `app/(tabs)/discover.tsx`, `src/components/EventCard.tsx`.

**Story**: As a user with specific interests, I search and filter events by topic, format, and attendance mode, so I find relevant events without network access.

- Acceptance: case-insensitive local search over title/organizer; filters combine categories with AND, values within a category with OR; removable active chips; empty state with `Clear filters`.
- Implemented in: `src/domain/filters.ts` (tested), `src/components/FilterSheet.tsx`.

## Event details

**Story**: As an attendee, I open an event and verify date, timezone, location, topics, communities, and the official source, so I can trust what I register for.

- Acceptance: date range with explicit timezone label; registration deadline block when present; `Registration closed` state; `Register` or `View official source` opens only `https` URLs; `Official source` secondary link always present; `Details verified on YYYY-MM-DD` line.
- Implemented in: `app/event/[id].tsx`, `src/services/externalLinks.ts` (tested).

## Saving

**Story**: As a busy attendee, I save events and find them in Saved after restarting the app, so I never lose track.

- Acceptance: save/unsave from card and detail; persisted via AsyncStorage (`solana-events:favorites:v1`); upcoming sorted ascending, ended events after with `Ended` badge; empty state with `Explore events` CTA; ids missing from the catalog ignored without crash.
- Implemented in: `src/hooks/useFavorites.tsx`, `src/services/storage.ts` (tested), `app/(tabs)/saved.tsx`.

## Personalization

**Story**: As a community member, I pick interest topics and communities, so `For you` ranks matching events first.

- Acceptance: explicit `Save preferences` button with feedback; reset with confirmation; ranking = +2 per topic match, +1 per community match, ties by start date (pure, tested).
- Implemented in: `app/interests.tsx`, `src/utils/ranking.ts`, `src/hooks/useInterests.tsx`.

## Wallet

**Story**: As a Seeker owner, I connect my wallet via Mobile Wallet Adapter and see my public address, without the app ever asking for sensitive material.

- Acceptance: connect/disconnect/cancel/error states; truncated address + copy; catalog fully usable when disconnected or when wallet errors; no balance, no signing, no transactions; security note about recovery phrase.
- Implemented in: `src/services/wallet.ts`, `src/components/WalletStatusCard.tsx`, `app/(tabs)/profile.tsx`.
- Hardened 2026-10-08: connection is authorization-only — `useMobileWallet().connect()`, never `signIn()` or any signature/RPC operation (guarded by `src/services/__tests__/wallet.test.ts`). See `docs/specs/20261008-p0-hardening.md`.

## Platform availability (2026-10-06)

All Discovery, Event details, Saving, and Personalization stories also run on web (`npx expo start --web`, Metro static output). On web the wallet story renders an informational "Wallet unavailable on web" card — MWA requires the Android app with a native wallet such as Seeker or Phantom; interests and saved events work without one (`src/services/wallet.web.ts`, `components/app-providers.web.tsx`). See `docs/specs/20261006-web-platform-support.md`.
