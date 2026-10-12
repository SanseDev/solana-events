# Solana Events

Offline-first calendar of verified Solana ecosystem events, built for Android and the Solana Mobile Seeker. Created for the Solana Mobile **CLOCK IN** hackathon (2026).

Repository: <https://github.com/SanseDev/solana-events>

The catalog ships inside the app: every event is researched and verified against its official source before release. No network permission, no tracking, no accounts. Connect a wallet via Mobile Wallet Adapter to identify yourself — nothing else.

## P0 scope (exactly what ships)

- Discover, search, and filter the verified local catalog (topic, format, attendance mode).
- Event detail with timezone-safe dates, official source, and registration link.
- Saved events persisted locally across restarts.
- Manual interest preferences with light `For you` ranking.
- Wallet connection via Mobile Wallet Adapter: authorization only — connect, show public address, copy, disconnect.

## Scope limits (by design)

- No balance, no transactions, no signing, no push, no accounts, no backend, no auth, no database.
- The wallet flow is authorization-only: it calls MWA `connect()` and never `signIn()`, never requests a message or transaction signature, and never performs an RPC read.
- Catalog updates ship with app releases — it is a verified snapshot, not a feed.
- Registration always happens on the official organizer page; this app links out to `https` sources only.
- Out of P0 scope (not built): add-to-calendar, NFT/collection detection, any backend or payments.

## Future work

- Catalog API to refresh events without an app release.
- Improved calendar integration (P1 of the implementation plan).
- Opt-in collection-based community suggestions using verified collection IDs. Not implemented — the app does not read NFT data and never claims to.

## What it does

- **Discover** upcoming verified events with dates in the event's own timezone.
- **Search and filter** by topic, format, and attendance mode — locally, instantly.
- **Save events** persistently and keep them across restarts.
- **For you** ranking from your interest topics and communities.
- **Wallet connect** via Mobile Wallet Adapter (view address only).

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

## Run on web

```bash
npx expo start --web
```

Opens `http://localhost:8081` with the same event catalog: search, filters, event details, saved events, and interests all work. Wallet connection is native-only (Mobile Wallet Adapter); on web the Profile screen explains that a native wallet such as Seeker or Phantom on Android is required. See `docs/specs/20261006-web-platform-support.md`.

## Build the APK

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

The `preview` profile in `eas.json` sets `android.buildType: "apk"`, producing a universal APK installable on any Android device including the Seeker.

Release identity: Android package ID `com.sansedev.solwhere` (owner-approved 2026-10-08; fixed before first store publication).

**Build status: no EAS cloud build has been run yet.** As of 2026-10-08 no EAS CLI login session exists on the development machine, so the build above is the exact next command to run. No APK artifact exists until that build succeeds — status will be recorded here and in `docs/release-validation.md`.

## Event sources

| Event                        | Organizer              | Official source              |
| ---------------------------- | ---------------------- | ---------------------------- |
| Solana Breakpoint 2026       | Solana Foundation      | solana.com/breakpoint        |
| Solana Hacker House — London | Solana Foundation      | luma.com/london-hh-26        |
| Solana Intelligence Summit   | Solana Foundation      | luma.com/intelligence-summit |
| Solana Summit India          | Superteam India        | luma.com/solana-summit-india |
| IslandDAO v5                 | IslandDAO/Superteam BR | luma.com/6laijuyn            |
| solanaStartupConnectGH       | Ghana Solana builders  | luma.com/nx9ps6ud            |

Each event records `lastVerifiedAt`; all six events and every registration URL were re-verified against these pages on **2026-10-08**. The detail screen shows "Details verified on {date}".

## Wallet security

The app never asks for a recovery phrase, never requests balances, and never initiates transactions. Connecting a wallet shares only the public address. If any prompt asks for a recovery phrase, it is not from this app.

## Tests

```bash
npm run typecheck
npm run lint:check
npm test
```

Typecheck, lint, and unit tests must all pass before every commit; `npm run ci` additionally runs the Android prebuild.

| Area                                          | Coverage   | Status  |
| --------------------------------------------- | ---------- | ------- |
| Typecheck (`tsc --noEmit`)                    | command    | passing |
| Lint (`expo lint`)                            | command    | passing |
| Android prebuild (`expo prebuild -p android`) | command    | passing |
| Domain logic (filters, ranking, status)       | unit tests | passing |
| Date formatting (timezone-safe)               | unit tests | passing |
| Storage (favorites, interests)                | unit tests | passing |
| External links (https-only)                   | unit tests | passing |
| Catalog integrity (80 tests total, 8 suites)  | unit tests | passing |
| Wallet service safety guards                  | unit tests | passing |
| Seeker device validation                      | manual     | pending |
| Standard Android device                       | manual     | pending |
| EAS APK build                                 | manual     | pending |
| Demo video / pitch deck                       | manual     | pending |

Automated results above were produced by the commands in this README on 2026-10-08. Manual items are **not yet done**: they require the release-candidate APK on real hardware (standard Android and Seeker) and have not been run — no hardware test, APK build, video, or deck exists yet. Remaining blockers: EAS login for the cloud build (or a local `eas build --local` with the Android SDK), then on-device validation.

## Release status and submission checklist

| Item                                                 | Status                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| Android package ID                                   | done — `com.sansedev.solwhere`                              |
| Automated checks (typecheck, lint, format, 80 tests) | done — 2026-10-08                                           |
| Android prebuild with final package ID               | done — native files regenerated 2026-10-08                  |
| EAS APK cloud build                                  | pending — command above; requires `eas-cli` login           |
| Standard Android device validation                   | pending — checklist in `docs/release-validation.md`         |
| Seeker device validation (Seed Vault MWA)            | pending — checklist in `docs/release-validation.md`         |
| Demo video                                           | pending — script ready: `docs/demo-script.md`               |
| Pitch deck                                           | pending — source ready: `docs/pitch-deck.md`                |
| Screenshots                                          | pending — capture checklist in `docs/release-validation.md` |
| Store/judging submission                             | pending — after all above                                   |

Release documentation:

- `docs/release-validation.md` — hardware test checklist, evidence fields, screenshot capture plan
- `docs/demo-script.md` — 60–90s demo video script
- `docs/pitch-deck.md` — 7-slide pitch deck source
- `docs/versions.md` — installed toolchain versions
- `docs/implementation-plan.md` — scope source of truth
