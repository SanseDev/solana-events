# Solana Events

Offline-first calendar of verified Solana ecosystem events, built for Android and the Solana Mobile Seeker. Created for the Solana Mobile **CLOCK IN** hackathon (2026).

The catalog ships inside the app: every event is researched and verified against its official source before release. No network permission, no tracking, no accounts. Connect a wallet via Mobile Wallet Adapter to identify yourself — nothing else.

## What it does

- **Discover** upcoming verified events with dates in the event's own timezone.
- **Search and filter** by topic, format, and attendance mode — locally, instantly.
- **Save events** persistently and keep them across restarts.
- **For you** ranking from your interest topics and communities.
- **Wallet connect** via Mobile Wallet Adapter (view address only).

## Scope limits (by design)

- No balance, no transactions, no signing, no push, no accounts.
- Catalog updates ship with app releases — it is a verified snapshot, not a feed.
- Registration always happens on the official organizer page; this app links out to `https` sources only.

## Architecture

```
app/                  expo-router screens (tabs: Discover, Saved, Profile; event/[id]; interests)
src/domain/           Event/Community/Interests types, filter logic, fixtures
src/data/             verified catalog (events.json), communities, catalog accessors
src/services/         AsyncStorage persistence, external links, wallet session
src/hooks/            Favorites and Interests providers, filter state
src/components/       EventCard, FilterSheet, WalletStatusCard, shared UI
src/utils/            dates (timezone-safe string parsing), ranking, event status
src/theme/            dark design tokens (colors, spacing, typography)
```

Key decisions:

- **Timezone-safe dates.** Formatters parse the ISO 8601 string directly so `10 Nov` stays `10 Nov` in the event's timezone regardless of device locale.
- **Verifiable catalog.** `src/data/eventCatalog.ts` filters the raw dataset through `isValidEvent` at runtime; a test asserts id uniqueness, https-only URLs, and valid date ranges.
- **Wallet isolation.** The wallet layer exposes an address and nothing else. All forbidden flows (transfers, signing, balances) were removed from the starter template.
- **Versioned storage.** AsyncStorage keys carry a version suffix (`solana-events:favorites:v1`, `solana-events:interests:v1`) so future migrations are explicit.

## Setup

Requirements: Node 24, JDK 17, Android SDK (see `docs/versions.md`).

```bash
npm install
npx expo start --dev-client
```

This is a custom dev build project — use the development build on a device or emulator, not Expo Go (Mobile Wallet Adapter requires it).

## Build the APK

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

The `preview` profile in `eas.json` sets `android.buildType: "apk"`, producing a universal APK installable on any Android device including the Seeker.

## Event sources

| Event                        | Organizer              | Official source              |
| ---------------------------- | ---------------------- | ---------------------------- |
| Solana Breakpoint 2026       | Solana Foundation      | solana.com/breakpoint        |
| Solana Hacker House — London | Solana Foundation      | luma.com/london-hh-26        |
| Solana Intelligence Summit   | Solana Foundation      | luma.com/intelligence-summit |
| Solana Summit India          | Superteam India        | luma.com/solana-summit-india |
| IslandDAO v5                 | IslandDAO/Superteam BR | luma.com/6laijuyn            |
| solanaStartupConnectGH       | Ghana Solana builders  | luma.com/nx9ps6ud            |

Each event records `lastVerifiedAt`; the detail screen shows "Details verified on {date}".

## Wallet security

The app never asks for a recovery phrase, never requests balances, and never initiates transactions. Connecting a wallet shares only the public address. If any prompt asks for a recovery phrase, it is not from this app.

## Tests

```bash
npm test
```

| Area                                    | Coverage      | Status  |
| --------------------------------------- | ------------- | ------- |
| Domain logic (filters, ranking, status) | 61 unit tests | passing |
| Date formatting (timezone-safe)         | unit tests    | passing |
| Storage (favorites, interests)          | unit tests    | passing |
| External links (https-only)             | unit tests    | passing |
| Catalog integrity                       | unit tests    | passing |
| Seeker device validation                | manual        | pending |
| Standard Android device                 | manual        | pending |
| EAS APK build                           | manual        | pending |

Manual items run against the release candidate APK on real hardware before submission.
