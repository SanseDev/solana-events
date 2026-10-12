# Release Validation — Physical Device Testing

> Truth source for hardware validation. Every item starts `pending`.
> No result may be recorded without real evidence (screenshot, video, or build URL).
> Never mark an item passed based on simulator runs or assumptions.

## Build under test

| Field                | Value                                                   |
| -------------------- | ------------------------------------------------------- |
| Android package ID   | `com.sansedev.solwhere`                                 |
| App version          | 1.0.0                                                   |
| EAS profile          | `preview` (distribution: internal, buildType: apk)      |
| Build command        | `npx eas-cli@latest build -p android --profile preview` |
| Build URL / ID       | **pending — no build has been run yet**                 |
| APK URL              | pending                                                 |
| APK SHA-256 checksum | pending                                                 |

## Standard Android device

| #   | Check                                              | Result  | Evidence |
| --- | -------------------------------------------------- | ------- | -------- |
| 1   | APK installs on device                             | pending |          |
| 2   | Cold launch with device offline (airplane mode)    | pending |          |
| 3   | Discover list renders all 6 catalog events offline | pending |          |
| 4   | Event detail opens; official link resolves         | pending |          |
| 5   | Filters (topic, format, attendance mode) work      | pending |          |
| 6   | Save event → kill app → relaunch → save persists   | pending |          |

## Seeker device (Solana Saga / Seeker)

| #   | Check                                                   | Result  | Evidence |
| --- | ------------------------------------------------------- | ------- | -------- |
| 1   | Seed Vault wallet detected; connect prompt appears      | pending |          |
| 2   | Wallet connect succeeds via MWA authorization-only flow | pending |          |
| 3   | Connect cancel path returns clean state, no crash       | pending |          |
| 4   | No-wallet error state is readable, non-blocking         | pending |          |
| 5   | Disconnect returns to pre-connect state                 | pending |          |

## Standalone launch

| #   | Check                                                             | Result  | Evidence |
| --- | ----------------------------------------------------------------- | ------- | -------- |
| 1   | APK launches with Metro/dev server stopped, computer disconnected | pending |          |

## Test session record

| Field                   | Value   |
| ----------------------- | ------- |
| Device model            | pending |
| Android version         | pending |
| Wallet app + version    | pending |
| Tester                  | pending |
| Date                    | pending |
| Screenshot/video folder | pending |

## Screenshot capture checklist (for demo + submission)

All captures from physical device, release APK build recorded above.

1. `01-discover.png` — Discover list, events visible
2. `02-filters.png` — active filter state
3. `03-event-detail.png` — detail screen with official link visible
4. `04-official-link.png` — external registration page opened from app
5. `05-saved.png` — Saved list with at least one event
6. `06-saved-restart.png` — Saved list after app kill + relaunch
7. `07-seeker-connect.png` — MWA connect sheet on Seeker (Seed Vault)
8. `08-seeker-connected.png` — connected wallet state in app

Store captures in `docs/evidence/` (folder created when first capture exists). Do not fabricate or render mock screenshots.
