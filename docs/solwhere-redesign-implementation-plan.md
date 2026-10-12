# Solwhere redesign — GLM 5.1 implementation plan

## 0. Delivery decision

Ship one coherent local-first redesign. Start with theme and Discover, review it in the existing Seeker custom development build, then propagate the system to Details, Saved, Profile, and onboarding.

Core does not add a dependency or change Expo SDK, Android application ID (`com.sansedev.solwhere`), signing, wallet identity URI, or existing favorite/interest storage keys. Keep using a custom development build or APK: Expo Go is unsupported for Mobile Wallet Adapter and native calendar integration.

Do not use deadline dates in older documents as a schedule. Work from milestones below.

## 1. Verified current-state audit

### Evidence collected

| Area             | Verified implementation                                                                                                                                  | Evidence / exact paths                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Stack            | Expo SDK 57, React Native 0.86.3, React 19.2.3, TypeScript strict, Expo Router                                                                           | `package.json`, `tsconfig.json`                                                                            |
| Android identity | Visible name is **Solana Events**; Android package is already final `com.sansedev.solwhere`                                                              | `app.json`, `constants/app-config.ts`                                                                      |
| Navigation       | Three tabs: Discover, Saved, Profile; detail route and interests route                                                                                   | `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/event/[id].tsx`, `app/interests.tsx`                     |
| Catalog          | Six local curated events; fields include organizer, topics, community IDs, offset-explicit dates, location, official/registration URLs, optional `image` | `src/data/events.json`, `src/domain/event.ts`, `src/data/eventCatalog.ts`                                  |
| Discover         | Search title/organizer, topic/format/attendance sheet, active chips, favorites, ranked `For you`, upcoming catalog                                       | `app/(tabs)/discover.tsx`, `src/domain/filters.ts`, `src/hooks/useEventFilters.ts`, `src/utils/ranking.ts` |
| Saving           | Optimistic save/unsave persisted in AsyncStorage, survives relaunch; card save control does not navigate                                                 | `src/hooks/useFavorites.tsx`, `src/services/storage.ts`, `src/components/EventCard.tsx`                    |
| Preferences      | Topics and manually followed communities persist; ranking is +2 topic / +1 community                                                                     | `app/interests.tsx`, `src/hooks/useInterests.tsx`, `src/utils/ranking.ts`                                  |
| Details          | Date/timezone, location, description, topics, communities, favorite, registration/source, registration state, and calendar action exist                  | `app/event/[id].tsx`, `src/utils/dates.ts`, `src/utils/eventStatus.ts`                                     |
| Calendar         | Native `expo-calendar` service handles permission, writable calendar selection, epoch-correct dates; hidden on web                                       | `src/services/calendar.ts`, `src/services/calendar.web.ts`                                                 |
| External URLs    | Only `https://` URLs open                                                                                                                                | `src/services/externalLinks.ts`                                                                            |
| Wallet           | MWA authorization-only connect, copy, disconnect, cancellation/error state; no signing, transaction, balance, or RPC calls                               | `components/app-providers.tsx`, `src/services/wallet.ts`, `src/components/WalletStatusCard.tsx`            |
| Theme            | Dark token set exists, but screens mostly own duplicated styles                                                                                          | `src/theme/*`, `app/(tabs)/*.tsx`, `app/event/[id].tsx`                                                    |
| Assets           | App icons, splash, one SpaceMono font. No legitimate event-cover assets exist in repository.                                                             | `assets/images/*`, `assets/fonts/SpaceMono-Regular.ttf`                                                    |

### Current behavior and gaps

- Existing MVP behavior is implemented in code and baseline gates pass: `npm test -- --runInBand` (95 tests), `npm run typecheck`, and `npm run lint:check` all passed during this audit.
- No onboarding route, completion marker, intent, participation, or location preference exists.
- Discover renders every ranked event in `For you` and then renders same catalog in `All upcoming`. This duplicates cards and labels zero-match events as personalized.
- Profile contradicts storage architecture: native users cannot manage interests or communities until wallet connects, although interests are local and wallet-independent. Web bypasses this gate through its `unsupported` wallet state.
- Saved separates upcoming from ended internally but renders one `Your events` list. It is not grouped by date.
- No share action exists. Native `Share` can support it without a new package; it is optional, not core.
- `Event.image` type exists but catalog contains no images and no image component is used.
- Visible product identity is still `Solana Events` in `app.json`, `package.json`, Discover, and wallet identity (`constants/app-config.ts`). Rename visible strings to **Solwhere** only. Do not rename package ID, URL scheme, or storage keys.
- NFT collection detection and wallet-based community suggestions are absent. No code supports them. Current wallet only authorizes and displays an address.

### Documentation discrepancies

- `docs/implementation-plan.md` describes calendar as conditional P1. Calendar is now implemented, covered by tests, and rendered in Details.
- `docs/pitch-deck.md` still describes calendar as future P1. It is stale.
- Existing plan says Profile exposes interests after wallet connection. Current native code does gate them, but that conflicts with its own local-only preferences model and with requested behavior.
- `docs/release-validation.md` correctly marks physical-device, APK, MWA, and standalone-launch evidence as pending. Do not claim those checks passed.

### Native and build constraints

- Keep installed native dependencies and SDK versions. `@wallet-ui/react-native-web3js`, `react-native-quick-crypto`, and `expo-calendar` require a custom development build/APK; Expo Go is not valid.
- `expo-calendar` was added after at least one earlier dev client. Any build that predates it must be rebuilt; Metro reload cannot load missing native module `CalendarNext`.
- `expo-image`, `expo-haptics`, `react-native-reanimated`, `@expo/vector-icons`, `react-native-safe-area-context`, and `react-native-gesture-handler` are already installed. Core uses them only where stated; no new dependency is needed.
- `eas.json` has development-client and internal APK preview profiles. Standalone APK verification remains manual.

## 2. Final product and visual decisions

### Product rules

- Product name shown to users: **Solwhere**. Tagline: **Find your next place in Solana.**
- Local curated catalog stays source of truth. No network fetch, scraping, popularity count, attendance count, or invented community partnership.
- Wallet remains optional. Its present benefit is a familiar Seeker-native connection and displayed public address only. It must never claim recommendation, NFT, ticket, or attendance benefits.
- Saving is a personal shortlist only. Copy must never imply registration, ticketing, RSVP, or attendance.
- Personalization is transparent: only show a reason when a persisted choice actually matches that event.

### Design tokens

Replace current minimal tokens with these semantic values in `src/theme/colors.ts`, `spacing.ts`, and `typography.ts`; screens must consume tokens, not hard-code palette values.

| Group      | Token                            | Value / rule                      |
| ---------- | -------------------------------- | --------------------------------- |
| Background | `canvas`                         | `#090D18`                         |
|            | `canvasRaised`                   | `#0D1322`                         |
| Surfaces   | `surface`                        | `#12192A`                         |
|            | `surfaceRaised`                  | `#182238`                         |
|            | `surfacePressed`                 | `#202C46`                         |
| Border     | `borderSubtle`                   | `#26334D`                         |
|            | `borderStrong`                   | `#3A4A6B`                         |
| Text       | `textPrimary`                    | `#F4F7FF`                         |
|            | `textSecondary`                  | `#B6C1D8`                         |
|            | `textTertiary`                   | `#7F8CA8`                         |
| Accent     | `accent`                         | `#9B8CFF`                         |
|            | `accentPressed`                  | `#7C6DE0`                         |
|            | `accentMuted`                    | `#29234C`                         |
| Semantic   | `success` / `warning` / `danger` | `#59D7A6` / `#F3BF6B` / `#FF8295` |
| Focus      | `focusRing`                      | `#C3B9FF`, 2 px outside control   |

Use `textPrimary` on `canvas` and `surface`, `textSecondary` only for supporting copy, and never use accent text below 14 px on `canvas`. Verify normal text reaches WCAG AA 4.5:1; large title text reaches 3:1. Violet fills use white primary-label text only after contrast check. Do not use decorative gradients, glass blur, neon glow, or heavy shadows.

| Token group  | Specification                                                                                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type family  | System font for all product text. Keep SpaceMono only where a wallet address benefits from monospacing.                                                                                                  |
| Display      | 32/38, 700; page title 28/34, 700; detail title 26/32, 700; section title 18/24, 700                                                                                                                     |
| Body         | 16/24 regular; compact body 14/20 regular; label 13/18, 600; overline 11/14, 700 with 0.8 px tracking                                                                                                    |
| Font scaling | Do not set `maxFontSizeMultiplier` below system preference. Use wrapping layouts, `minHeight`, and `numberOfLines` only where truncated content has a full detail destination.                           |
| Spacing      | `4, 8, 12, 16, 20, 24, 32, 40`; screen horizontal padding 20, major section separation 32                                                                                                                |
| Shape        | `radius.sm=10`, `md=14`, `lg=18`, `pill=999`; cards use 14, feature media 18, controls 12. Avoid enclosing every text group.                                                                             |
| Controls     | Minimum 48 × 48 touch target; primary height 52; compact chip height 36; icon-only 48; bottom tab target retained by native tabs.                                                                        |
| Images       | Feature 16:9; detail cover 16:9; compact card thumbnail 4:3 at 84 × 63. Use `resizeMode="cover"`; fallback has same ratio.                                                                               |
| Motion       | 120 ms press opacity/scale feedback, 180 ms chip/background state transition, 200 ms section entrance only on first mount. Respect reduced-motion setting; never block navigation or state on animation. |

Use Material Icons already installed. Standardize icon meanings: search, tune, bookmark/bookmark-border, calendar-today, share, place, language, wallet, chevron-right. Add accessible labels and selected/disabled state to every icon control. Apply `expo-haptics` light selection feedback only when a chip/filter/save toggle actually changes state; skip failures and unsupported platforms.

## 3. Screen specifications

### Discover

**First visible viewport, 360–412 dp Android:** safe-area top; 20 dp left/right. Row one: `Solwhere` wordmark (28) and a 48 dp location button reading `Anywhere` with place icon. Row two: compact tagline only when room permits. Row three: full-width 48 dp search (`Search events or organizers`) with trailing 48 dp filter button. Row four: horizontally scrollable 36 dp quick controls. Then feature media/card begins above fold; do not show a dashboard grid.

1. Header: `Solwhere`; no subtitle when it would push search below initial viewport. Location opens a compact modal/list built from distinct catalog city/country pairs plus `Anywhere`; it is not GPS and must say `Choose location`.
2. Search remains local, case-insensitive title/organizer matching. Clear affordance appears only with a query.
3. Filter button opens existing bottom-sheet concept, restyled. Sheet owns topics, formats, attendance, location, and reset/apply count. It writes same filter state as quick controls.
4. Quick controls, in this order: `Personalized`, `This week`, `Online`, `Hackathons`.
   - `Personalized` is sort-only. It ranks matches first and leaves date as tie-break. It is disabled with explanatory text until at least one profile answer produces a nonzero match; it never labels arbitrary results personal.
   - `This week` filters starts from now through end of seventh local calendar day. It combines with all other controls using AND.
   - `Online` includes `online` and `hybrid` attendance. It combines with the sheet attendance constraint by intersection; no result when incompatible.
   - `Hackathons` adds `hackathon` to selected formats. Values within format are OR; all other filter categories are AND. Sheet visibly reflects it.
5. When query or any filter is active, show one `Results` list only. No feature or personalized section; no duplicated catalog.
6. Default unfiltered layout:
   - Show one `Coming up` feature only with at least three upcoming events. Pick earliest event after current active location constraint; this is chronology, not popularity. Do not repeat it below.
   - Show `Matched for you` only when at least one remaining event has a nonzero score. Render at most two events and a truthful reason per card, for example `Matches Developers` or `Because you chose Hackathons`. Exclude these event IDs from remainder.
   - Show `Upcoming` for every remaining event, chronological. Never render an event twice.
   - With one or two catalog events, omit feature and show a single chronological `Upcoming` list. With no preference matches, omit personalized section entirely.
7. Compact card: optional 84×63 image/fallback left; date overline and day; title two lines; organizer one line; one combined location/time row; small truthful match reason only in personal section; save icon in independent 48 dp target. Entire remaining card opens Details. Preserve existing sibling-pressable mechanism or an equivalent that guarantees save never navigates.
8. States: no match provides `Clear filters`; no catalog provides local catalog error; image failure falls back without layout jump; long title truncates only on card and remains complete in Details; no selected location means `Anywhere`.

### Onboarding

New route: `app/onboarding.tsx`; root navigation sends first-run users there before tabs. No wallet, GPS, notification, calendar, or network permission.

Shared shell: progress `1 of 3`, Skip in top right, Back except first step, one question, selectable 48 dp options, and primary `Continue`/`Start exploring`. Selection is optional in every step. Copy states that choices can change in Profile.

| Step          | Choices                                                                         | Stored behavior             | Discover effect                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent        | Learn, Meet people, Join hackathons, Discover communities; multi-select         | `intent[]`                  | Score workshops/developer-oriented catalog entries for Learn; in-person/hybrid community formats for Meet people; `hackathon` format for Join hackathons; events with `communityIds` for Discover communities. Reasons name selected intent only when its rule matched. |
| Topics        | Existing `TOPICS` values: Developers, NFTs, DeFi, Gaming, Consumer, Mobile, DAO | `topics[]`                  | Existing topic score remains; reason names matching topic.                                                                                                                                                                                                              |
| Participation | Online, In person, Both, then optional `Choose location` catalog-derived picker | `participation`, `location` | Participation becomes default Discover availability constraint only after onboarding completion; location filters results by exact catalog city/country. `Both`/blank location does not constrain results.                                                              |

Completion behavior:

- Save the draft after each selection and Next. Relaunch resumes same step and choices.
- Skip writes default profile (`intent: []`, `topics: []`, `communityIds: []`, `participation: 'both'`, `location: null`) and completed marker, then replaces onboarding with Discover.
- Back modifies prior draft; Android Back moves one step, and on first step asks to skip rather than silently abandoning saved draft. Onboarded users use normal tab/back navigation.
- Complete writes profile first, then completed state; if app dies between writes, resumed onboarding has its draft and never loses favorites.
- Existing installations are returning users: when old favorites or old interests key exists, migrate preferences and set completed marker without showing onboarding. They can edit all choices from Profile. A fresh install with no legacy data sees onboarding.

### Event Details

**First viewport:** cover/fallback 16:9 under safe-area back button; then format and attendance overlines, 26 px title, organizer, date/timezone, and a visible sticky primary `Register` or `View official source` action. Do not bury action below description.

- Cover uses verified local/licensed image when present. Otherwise use a non-gradient editorial fallback: surface block, event date/format, title fragment, and muted geometric rule. It is presentation only and must not suggest a real photograph.
- Information order: title/organizer; date range plus source timezone label; location/online; registration deadline/status; description; topics; communities; last verification date.
- Persistent bottom action bar: primary is `Register` when registration is open, otherwise `View official source`; primary is disabled and labelled `Registration closed` when verified deadline passed. Existing HTTPS guard remains mandatory.
- Secondary row: save/unsave, add to calendar (existing native action, when eligible), and optional Share only if optional milestone ships. Save label is `Save`, then `Saved`; no confirmation copy implies registration.
- Existing calendar permission/error handling remains. On web hide calendar as now. For share, use React Native `Share.share` with title and official URL; catch cancellation/failure without navigating.

### Saved

**First viewport:** `Saved` title, compact count `N saved`, then `Upcoming` date groups. Group labels are event-local date labels (`Today`, `Tomorrow`, or `Tue, 15 Nov` only when accurate in event timezone). Do not use device-local conversion for stored source dates.

- Render upcoming first, ascending; ended/past second, descending, under `Past events`.
- Group only within each partition by start date. Do not change favorite order or storage values.
- Saved cards reuse compact card without recommendation reasons. Unsave remains independent from navigation.
- Empty state: bookmark icon, `Nothing saved yet`, concise explanation, primary `Explore events` switches to Discover. It does not offer fake content.

### Profile

**First viewport:** `Profile`; `Your preferences` card visible before wallet; two-line summary, `Edit preferences`, then `Following communities` compact summary. Wallet is a distinct lower `Wallet` section.

- Preferences are always accessible, including native disconnected, canceled, error, web unsupported, and connected states.
- Edit route reuses onboarding selectors in edit mode or extracts shared `PreferenceEditor`; it must include Intent, Topics, Participation, Location, and manual community follows. Save/Reset affects Discover immediately after persistence.
- Followed communities means manual selection only. No NFT-derived copy or wallet prerequisite.
- Wallet copy when disconnected: `Connect a compatible wallet to show its public address on this device.` Do not say it personalizes events. Connected copy: `Connected address`; retain copy, cancellation, error, and disconnect behavior. Keep recovery-phrase safety note.

## 4. Data, state, assets, and storage

### Domain and ranking changes

In `src/domain/event.ts`, retain existing event and catalog fields. Add exported profile types:

```ts
export type Intent = 'learn' | 'meet_people' | 'hackathons' | 'communities'
export type ParticipationPreference = 'online' | 'in_person' | 'both'
export interface LocationPreference {
  city: string
  country: string
}
export interface PreferenceProfile {
  intent: Intent[]
  topics: Topic[]
  communityIds: string[]
  participation: ParticipationPreference
  location: LocationPreference | null
}
```

Replace simple numeric-only `rankByInterests` contract in `src/utils/ranking.ts` with a pure scorer returning `score` and deduplicated reason keys. Preserve topic weighting (+2) and community weighting (+1); add +1 per matching intent rule. Return no recommendation reason for zero score. Add a stable rank helper with `startAt` tie-break. Date/location/availability filtering remains in `src/domain/filters.ts`, before ranking.

Extend `EventFilters` to include `dateRange: 'any' | 'this_week'`, `availability: 'any' | 'online_available'`, and `location: LocationPreference | null`; use arrays for selected attendance modes if needed to express `online + hybrid`. Keep established invariant: values inside a category use OR; categories use AND. Add pure helpers for distinct catalog locations and date window.

### Storage migration

Keep these exact keys readable forever:

- `solana-events:favorites:v1`
- `solana-events:interests:v1`

Add only:

- `solana-events:preferences:v2` — `PreferenceProfile`
- `solana-events:onboarding:v1` — `{ completed: boolean; step: 1 | 2 | 3; draft: PreferenceProfile }`

`loadPreferences()` reads valid v2 first. If absent, it parses old interests v1 into `topics` and `communityIds`, defaults other fields, persists v2, and returns it. It must not delete v1 in this release. Bootstrap detects either legacy key or favorites key before deciding fresh versus returning user. Invalid/corrupt values degrade to safe defaults as current storage does. Never rename favorite storage identifiers for the visual rename.

Replace `src/hooks/useInterests.tsx` with one `src/hooks/usePreferences.tsx` provider/hook; update `components/app-providers.tsx` and all consumers. Do not run competing providers or duplicate writes. Hydration must complete before root chooses onboarding/tabs, avoiding a first-frame Discover flash or accidental onboarding for returning users.

### Images and provenance

Core ships no new event image because repository has none with documented permission. Keep all current catalog `image` values absent and use designed fallback.

If image extension is approved later, change `Event.image` from opaque `string` to:

```ts
{
  uri: string
  alt: string
  sourceName: string
  licenseOrPermission: string
  updatedAt: string
}
```

Accept only local bundled files or HTTPS assets with recorded written license/permission in repository documentation. An image on an organizer page alone is not approval. Load remote images with installed `expo-image`, disk cache policy, neutral ratio-preserving placeholder, and `onError` fallback. Never block cards or Details on remote image load; offline must display fallback. Do not add image URLs to current events without provenance.

## 5. Reuse / change / create map

| Action              | Paths                                                                                                                                                                                       | Responsibility                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Change              | `src/theme/colors.ts`, `spacing.ts`, `typography.ts`, `index.ts`                                                                                                                            | Semantic visual tokens and shared metrics                                                                                        |
| Create              | `src/components/ui/AppPressable.tsx`, `src/components/ui/IconButton.tsx`, `src/components/ui/Tag.tsx`, `src/components/EventArtwork.tsx`                                                    | Press/focus/haptic behavior, accessible controls, chip semantics, image/fallback                                                 |
| Change              | `src/components/EventCard.tsx`, `EventMetaRow.tsx`, `FilterChip.tsx`, `FilterSheet.tsx`, `EmptyState.tsx`, `SectionHeader.tsx`                                                              | Compact cards, filter controls, empty states, shared typography                                                                  |
| Create              | `src/components/FeaturedEvent.tsx`, `src/components/RecommendationReason.tsx`, `src/components/DateGroup.tsx`, `src/components/PreferenceEditor.tsx`                                        | Discover feature, truthful reason, Saved grouping, onboarding/Profile shared editor                                              |
| Change              | `app/(tabs)/discover.tsx`, `saved.tsx`, `profile.tsx`, `app/event/[id].tsx`, `app/(tabs)/_layout.tsx`, `app/_layout.tsx`, `app/interests.tsx`                                               | Screen composition, routes, tab styling; replace interests route with preferences editor or remove route only after links update |
| Create              | `app/onboarding.tsx`, optionally `app/location-picker.tsx`                                                                                                                                  | First-run flow and catalog-derived location selection                                                                            |
| Change              | `src/domain/event.ts`, `src/domain/filters.ts`, `src/utils/ranking.ts`, `src/services/storage.ts`, `components/app-providers.tsx`                                                           | Profile schema, pure behavior, migration, provider                                                                               |
| Replace             | `src/hooks/useInterests.tsx` with `src/hooks/usePreferences.tsx`                                                                                                                            | Single persisted preference state                                                                                                |
| Change tests        | `src/domain/__tests__/filters.test.ts`, `src/utils/__tests__/ranking.test.ts`, `src/services/__tests__/storage.test.ts`, `src/data/__tests__/eventCatalog.test.ts`                          | New pure contracts and migration                                                                                                 |
| Create tests        | `src/domain/__tests__/recommendations.test.ts`, `src/utils/__tests__/dateGroups.test.ts`; component/screen tests only if project test setup can render Expo Router without new dependencies | Recommendation reasons, grouping, onboarding decisions                                                                           |
| Rename strings only | `app.json`, `package.json`, `constants/app-config.ts`, visible screen copy                                                                                                                  | Solwhere branding; no package, scheme, signing, or storage identifier changes                                                    |

Do not reuse `components/app-page.tsx` / `components/app-view.tsx` until visual inspection confirms they fit. Current screens use `SafeAreaView` directly; forcing them into layout would add a second styling layer with no benefit.

## 6. Ordered milestones

### M1 — Design foundation and Discover review slice

**Files:** theme files; `src/components/ui/*`; `EventCard.tsx`; `EventMetaRow.tsx`; `FilterChip.tsx`; `FilterSheet.tsx`; `FeaturedEvent.tsx`; `RecommendationReason.tsx`; `EventArtwork.tsx`; `app/(tabs)/discover.tsx`; filter/ranking files and focused tests; branding strings.

**Steps:**

1. Apply final tokens and shared pressable/icon/tag primitives. Preserve safe areas, 48 dp targets, system font scaling, and Material Icons.
2. Implement compact card, designed image fallback, restyled sheet/search/quick controls, and duplicate-free Discover layout.
3. Extend pure filters and scoring. Implement exact quick-control rules and truthful reason generation.
4. Rename visible product strings to Solwhere. Preserve application ID, scheme, storage keys, signing, AppConfig URI, and wallet behavior.
5. Review this slice on Seeker before styling every other screen.

**Dependencies:** none beyond installed packages. `expo-haptics`/Reanimated use does not add a package or require a new rebuild by itself. Existing dev client remains required for wallet/calendar tests.

**Acceptance:** one compact chronological catalog; featured/personalized entries never duplicate; no `For you` label for zero-score events; quick-control combination follows documented rules; save never opens Details; all content remains readable at increased font size; no unproven image is shown.

**Checks:** unit tests for filters/reasons/rank order; `npm test -- --runInBand`; `npm run typecheck`; `npm run lint:check`; Android emulator visual check at 360 dp and 412 dp; Seeker custom build check of first viewport, press feedback, tabs, and dark contrast. Report unavailable device checks.

### M2 — Preference profile, migration, and onboarding

**Files:** `src/domain/event.ts`, `src/services/storage.ts`, `src/hooks/usePreferences.tsx`, `components/app-providers.tsx`, `app/_layout.tsx`, `app/onboarding.tsx`, `src/components/PreferenceEditor.tsx`, location picker route if needed, `app/interests.tsx` or its replacement, filters/ranking, storage/domain tests.

**Steps:**

1. Add profile/onboarding types, v2 migration, completion/draft state, and hydration gate.
2. Extract one reusable preference editor for onboarding and Profile. Do not duplicate selection logic.
3. Implement three skippable/resumable onboarding steps and returning-user migration decision.
4. Connect profile answers to score/filter defaults and recommendation copy; community follows stay manual.

**Dependencies:** M1 pure scoring/filter interface. No permission, wallet, GPS, or dependency change.

**Acceptance:** fresh user can finish or skip; interrupted step resumes; old favorites/interests survive and existing user does not see unwanted onboarding; no selected answer is decorative; profile modifications change Discover immediately after persistence; corrupted persisted data remains safe.

**Checks:** storage migration/invalid-data tests; unit tests for intent reasons and participation/location filters; manual fresh-install, Skip, Back, kill/relaunch, and old-key migration tests; Android Back behavior; `npm test -- --runInBand`, typecheck, lint.

### M3 — Details, Saved, and Profile propagation

**Files:** `app/event/[id].tsx`, `app/(tabs)/saved.tsx`, `app/(tabs)/profile.tsx`, `WalletStatusCard.tsx`, `EmptyState.tsx`, `DateGroup.tsx`, `EventArtwork.tsx`, shared components, date grouping tests.

**Steps:**

1. Apply shared surface/type/action system to details; add cover fallback and persistent registration/source bar.
2. Retain existing date/timezone, HTTPS link, calendar, save, registration-state, and error contracts.
3. Group Saved events by source date under Upcoming/Past and restyle empty state.
4. Make preferences/community follows available above an independent wallet section. Correct wallet copy.

**Dependencies:** M1 tokens/components, M2 editor. Calendar service is reused unchanged unless a regression test exposes a needed UI wiring fix.

**Acceptance:** registration stays distinct from saving; date/timezone/link behavior survives; Saved grouping is stable; disconnected/cancelled wallet never blocks preferences; wallet connect/disconnect behavior is unchanged; long content and no-image fallback remain usable.

**Checks:** existing calendar, URL, wallet tests plus new grouping tests; emulator external-link/calendar error-state check; Seeker wallet success, cancellation, failure, disconnect tests; manual screenshot comparison at normal and increased font sizes.

### M4 — Release regression and APK proof

**Files:** `docs/release-validation.md` only for real evidence, plus any narrowly necessary test files. Do not edit app code unless a regression appears.

**Steps:**

1. Run all project gates and build/reinstall a current dev client if native module set changed; core should not change it.
2. Build preview APK with existing EAS profile. Install on Seeker offline with Metro stopped.
3. Complete physical validation matrix and attach real screenshot/video/build evidence. Record failures as pending/fail, never pass by inference.

**Dependencies:** M1–M3 complete; access to Seeker, wallet, EAS account, and build artifact.

**Acceptance:** APK launches without Metro; catalog/favorites/preferences work offline; wallet and calendar native flows behave as documented; all known regressions either fixed or explicitly recorded before submission.

**Checks:** full automated suite, typecheck, lint, build log, emulator checks, physical Seeker checklist in section 9.

## 7. Optional extensions — separate from core

| Extension                                      | Decision / dependency                                                                                                                                                          | Tradeoff / ship rule                                                                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Native Share                                   | Small optional. Use built-in React Native `Share` from Details; no package or native rebuild.                                                                                  | Adds a useful secondary action; ship only after M3. Must share title plus official URL, handle cancel/failure, and never imply registration. |
| Local reminders / registration-deadline alerts | Excluded from core. Needs product permission language, time-zone/notification scheduling policy, cancellation/edit logic, and likely `expo-notifications` plugin plus rebuild. | High permission and stale-data risk. Do not start tonight unless core APK is proven.                                                         |
| Remote catalog with offline cache              | Excluded from core. Needs trusted source/backend, schema validation, cache freshness, stale/offline policy, security review, and event provenance.                             | Local curated JSON is more reliable for hackathon delivery. Never make network a dependency of catalog rendering.                            |
| Community pages                                | Excluded from core. Needs real community descriptions, destinations, and navigation model.                                                                                     | Existing chips/manual follows are sufficient. Do not create empty destination pages.                                                         |
| NFT community suggestions                      | Excluded. Needs explicit consent, verified collection registry, account/asset lookup strategy, privacy copy, failure/offline states, and security review.                      | MWA connection alone is insufficient. Do not claim or simulate this feature.                                                                 |

## 8. Effort and fallback

Ranges assume one experienced React Native implementer and a working Seeker/EAS environment. They exclude waiting for remote builds.

| Scope                             |              Estimate | Uncertainty                                             |
| --------------------------------- | --------------------: | ------------------------------------------------------- |
| M1 design foundation + Discover   |             5–8 hours | Font scaling and compact-card tuning on physical Seeker |
| M2 profile migration + onboarding |             4–7 hours | Root hydration / legacy-state edge cases                |
| M3 Details, Saved, Profile        |             4–6 hours | Calendar/wallet physical verification and layout polish |
| M4 release proof                  | 2–5 hours active work | EAS queue, wallet availability, device access           |
| Core total                        |           15–26 hours | Hardware and build availability dominate                |

Reduced-scope fallback, in order:

1. Keep M1 visual foundation, compact Discover, no duplicate catalog, and Profile ungating.
2. Onboarding uses Topics + Participation only; retain intent editor in Profile behind a clear later task. Do not collect an intent that is not scored.
3. Use designed fallbacks only; do not source event photos.
4. Keep current Details calendar action and omit optional Share.
5. Style Saved empty state and partitions, but defer date subgroups only if device regression blocks release.

Do not cut storage migration, wallet safety, URL guard, safe areas, font scaling, offline fallback, or physical APK checks.

## 9. Final release and regression checklist

### Automated

- [ ] `npm test -- --runInBand` passes, including new filters, ranking/reasons, migration, date grouping, calendar, wallet, and external-link tests.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint:check` passes.
- [ ] Add tests for no Discover duplicates, zero-score exclusion from personalized section, quick-control intersections, legacy v1 migration, onboarding Skip/completion/resume decision, and saved date grouping.
- [ ] Do not claim screen-level navigation tests unless a compatible renderer is actually added and run.

### Emulator / development build

- [ ] Search title and organizer; clear search; combine topic/format/attendance/location/date controls; verify rank order and reasons.
- [ ] Save/unsave from card and Details; confirm save does not navigate; relaunch and verify persistence.
- [ ] Verify source dates, all-day spans, timezone labels, registration closed state, HTTPS external-link guard, and calendar error paths.
- [ ] Verify image failure/offline fallback has no blank area or layout jump.
- [ ] Test Android Back from Details, Preferences, location picker, and each onboarding step; test keyboard dismissal and sheet interactions.
- [ ] Check 360 dp width, 412 dp width, long organizer/title/location, and increased Android font size with no clipped critical action.
- [ ] Inspect top/bottom safe areas, tab bar overlap, and bottom detail action bar with keyboard open.

### Physical Seeker / APK

- [ ] Build and install current custom development build for native debugging if required; test MWA connect success, cancellation, no-wallet/failure, copied address, and disconnect.
- [ ] Test calendar permission allowed, denied, no writable calendar, and successful write on real device.
- [ ] Build `preview` APK using existing `eas.json`; record actual build URL, APK checksum, device, Android version, and tester in `docs/release-validation.md`.
- [ ] With Metro stopped and computer disconnected, cold-launch installed APK offline; browse catalog, open Details, save, kill/relaunch, and verify favorite/profile persistence.
- [ ] Capture only real evidence in `docs/evidence/`; update pending fields only after observed success.

## 10. Explicit exclusions and blockers

Excluded from core: NFT suggestions, community pages, backend/catalog sync, reminders, notifications, GPS, wallet-driven recommendations, registration/ticketing, analytics, new icons/fonts/images, dependency upgrades, Android identity changes, and broad refactors.

Current blockers to release proof, not to implementation: no recorded current Seeker device test, no recorded preview APK, no standalone launch proof, and no licensed event image assets. Treat each as pending until actual evidence exists.

## Recommended first milestone

Execute M1 only: tokenize current theme, redesign compact Discover, prevent duplicate/pseudo-personalized results, and rename visible strings to Solwhere. Review first viewport and interactions on Seeker before touching onboarding or other screens. This produces a shippable visual direction without risking storage, wallet, or native setup.
