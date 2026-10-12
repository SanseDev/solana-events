# Solwhere

Offline-first calendar of verified Solana ecosystem events, built for Android and the Solana Mobile Seeker. Created for the Solana Mobile **CLOCK IN** hackathon (2026).

Repository: <https://github.com/SanseDev/solana-events>

The catalog ships inside the app: every event is researched and verified against its official source before release. No network permission, no tracking, no accounts. Connect a wallet via Mobile Wallet Adapter to identify yourself — nothing else.

The catalog holds 51 verified events as of 2026-10-12 (Breakpoint week, Superteam chapter happenings, online sessions, and recurring co-working days). Per-event verification evidence, restrictions, and contradiction flags live in `docs/catalog-audit-2026-10-12.md`; the expansion process is specified in `docs/specs/20261012-catalog-expansion.md`.

## P0 scope (exactly what ships)

- Discover, search, and filter the verified local catalog (topic, format, attendance mode, this-week, location).
- Skippable three-step onboarding seeding an optional preference profile (intent, topics, participation, location).
- Truthful personalization: `Matched for you` cards only appear when a persisted choice actually matches, with the reason shown.
- Event detail with timezone-safe dates, 16:9 editorial cover, and a persistent bottom action bar (Register / View official source, Save, Add to calendar).
- Saved events persisted locally, grouped by device-timezone date (`Today`, `Tomorrow`, `Tue, 15 Nov`), upcoming then past; event details keep the event's own timezone.
- Wallet connection via Mobile Wallet Adapter: authorization only — connect, show public address, copy, disconnect. Preferences are never gated behind it.

## P1 scope

- **Add to calendar** (Android native): from Event Details, copy a verified event into the device's primary writable calendar — title, timezone-correct start/end, all-day span when the source publishes no times, location, and the official URL in the notes. Calendar permission is requested in context at button press; denial, a device without writable calendars, and write failures each show a clear message and never block the catalog. Hidden on web and for ended events.

## Scope limits (by design)

- No balance, no transactions, no signing, no push, no accounts, no backend, no auth, no database.
- The wallet flow is authorization-only: it calls MWA `connect()` and never `signIn()`, never requests a message or transaction signature, and never performs an RPC read.
- Catalog updates ship with app releases — it is a verified snapshot, not a feed.
- Registration always happens on the official organizer page; this app links out to `https` sources only.
- Not built: NFT/collection detection, any backend or payments.

## Future work

- Catalog API to refresh events without an app release.
- Calendar reminders and calendar picker (current P1 writes one event to the primary writable calendar only).
- Opt-in collection-based community suggestions using verified collection IDs. Not implemented — the app does not read NFT data and never claims to.

## What it does

- **Discover** upcoming verified events with dates in the event's own timezone: a featured `Coming up` card, up to two truthfully-reasoned `Matched for you` picks, and the chronological remainder — no duplicates.
- **Search and filter** by topic, format, attendance mode, this-week, and catalog location — locally, instantly.
- **Onboard in three optional steps** (intent, topics, participation + location) that rank Discover; Skip works at any time and the draft resumes after a kill.
- **Save events** persistently, grouped by device-timezone date in Saved (upcoming ascending, past descending).
- **Add to calendar** on Android from Event Details (P1).
- **Wallet connect** via Mobile Wallet Adapter (view address only); local preferences never require it.

## Architecture

```
app/                  expo-router screens (onboarding; tabs: Discover, Saved, Profile; event/[id]; preferences)
src/domain/           Event/Community/PreferenceProfile types, filter logic, fixtures
src/data/             verified catalog (events.json), communities, catalog accessors
src/services/         AsyncStorage persistence (v1→v2 migration), external links, wallet session, calendar
src/hooks/            Favorites and Preferences providers, filter state
src/components/       EventCard, FeaturedEvent, FilterSheet, PreferenceEditor, DateGroup, WalletStatusCard, shared UI
src/utils/            dates (timezone-safe string parsing), dateGroups, ranking, event status
src/theme/            semantic dark design tokens (colors, spacing, typography)
```

Key decisions:

- **Timezone-safe dates.** Formatters parse the ISO 8601 string directly so `10 Nov` stays `10 Nov` in the event's timezone regardless of device locale.
- **Verifiable catalog.** `src/data/eventCatalog.ts` filters the raw dataset through `isValidEvent` at runtime; a test asserts id uniqueness, https-only URLs, and valid date ranges.
- **Wallet isolation.** The wallet layer exposes an address and nothing else. All forbidden flows (transfers, signing, balances) were removed from the starter template.
- **Versioned storage.** AsyncStorage keys carry a version suffix (`solana-events:favorites:v1`, `solana-events:interests:v1`, `solana-events:preferences:v2`, `solana-events:onboarding:v1`) so migrations are explicit. `loadPreferences()` migrates legacy interests v1 into a v2 profile in place and never deletes v1.

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

Opens `http://localhost:8081` with the same event catalog: search, filters, event details, saved events, onboarding, and preferences all work. Wallet connection is native-only (Mobile Wallet Adapter); on web the Profile screen explains that a native wallet such as Seeker or Phantom on Android is required. See `docs/specs/20261006-web-platform-support.md`.

## Build the APK

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

The `preview` profile in `eas.json` sets `android.buildType: "apk"`, producing a universal APK installable on any Android device including the Seeker.

Android package ID selected for this release: `com.sansedev.solwhere`.

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

| Area                                           | Coverage   | Status  |
| ---------------------------------------------- | ---------- | ------- |
| Typecheck (`tsc --noEmit`)                     | command    | passing |
| Lint (`expo lint`)                             | command    | passing |
| Android prebuild (`expo prebuild -p android`)  | command    | passing |
| Domain logic (filters, ranking, status)        | unit tests | passing |
| Date formatting (timezone-safe)                | unit tests | passing |
| Saved date grouping (device-timezone labels)   | unit tests | passing |
| Storage (favorites, preferences, onboarding)   | unit tests | passing |
| External links (https-only)                    | unit tests | passing |
| Calendar service (P1 add-to-calendar)          | unit tests | passing |
| Catalog integrity (150 tests total, 12 suites) | unit tests | passing |
| Wallet service safety guards                   | unit tests | passing |
| Seeker device validation                       | manual     | pending |
| Standard Android device                        | manual     | pending |
| EAS APK build                                  | manual     | pending |
| Demo video / pitch deck                        | manual     | pending |

Automated results above were produced by the commands in this README on 2026-10-11. The redesign (onboarding, personalized Discover, Saved grouping, Details action bar) is covered by these automated checks only — it has **not** been validated on a physical device. Manual items are **not yet done**: they require the release-candidate APK on real hardware (standard Android and Seeker) and have not been run — no hardware test, APK build, video, or deck exists yet. Remaining blockers: EAS login for the cloud build (or a local `eas build --local` with the Android SDK), then on-device validation.

## Release status and submission checklist

| Item                                                  | Status                                                      |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Android package ID                                    | done — `com.sansedev.solwhere`                              |
| Automated checks (typecheck, lint, format, 150 tests) | done — 2026-10-11                                           |
| Android prebuild with final package ID                | done — native files regenerated 2026-10-08                  |
| EAS APK cloud build                                   | pending — command above; requires `eas-cli` login           |
| Standard Android device validation                    | pending — checklist in `docs/release-validation.md`         |
| Seeker device validation (Seed Vault MWA)             | pending — checklist in `docs/release-validation.md`         |
| Demo video                                            | pending — script ready: `docs/demo-script.md`               |
| Pitch deck                                            | pending — source ready: `docs/pitch-deck.md`                |
| Screenshots                                           | pending — capture checklist in `docs/release-validation.md` |
| Store/judging submission                              | pending — after all above                                   |

Release documentation:

- `docs/release-validation.md` — hardware test checklist, evidence fields, screenshot capture plan
- `docs/demo-script.md` — 60–90s demo video script
- `docs/pitch-deck.md` — 7-slide pitch deck source
- `docs/versions.md` — installed toolchain versions
- `docs/implementation-plan.md` — scope source of truth
- `docs/specs/20261011-solwhere-redesign.md` — redesign feature spec (design system, Discover, preferences, onboarding)
