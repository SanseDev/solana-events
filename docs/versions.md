# Environment versions

## Build target

EAS `preview` builds pin Node `22.23.1` in `eas.json`. Use that version when reproducing the standalone APK build. The project uses npm and `package-lock.json`; it has no `engines` field.

## Dependency versions

Versions below are resolved by `package-lock.json` or declared in `package.json`.

| Tool              | Version              |
| ----------------- | -------------------- |
| Expo CLI          | 57.0.28              |
| Expo SDK (`expo`) | 57.0.27 (`^57.0.0`)  |
| React Native      | 0.86.3               |
| React / React DOM | 19.2.3               |
| TypeScript        | 6.0.3 (`~6.0.3`)     |
| expo-router       | 57.0.25 (`~57.0.25`) |
| Jest / jest-expo  | 29.7.0 / ~57.0.5     |

Wallet layer: `@wallet-ui/react-native-web3js` ^4.0.1 (resolved 4.3.0; Mobile Wallet Adapter underneath).
Storage: `@react-native-async-storage/async-storage` 2.2.0.
Navigation: `expo-router` (file-based, single navigation solution).

Android package ID: `com.sansedev.solwhere`.

## Recorded local environment

On 2026-10-13, the repository was inspected with Node `v25.8.2` and npm `11.11.1`. Those are inspection-tool versions, not the standalone APK build target. A previously recorded development environment used OpenJDK `17.0.15` and Android SDK platform `android-36`; no machine-specific SDK path is required for setup.

## History — Milestone 0 scaffold, recorded 2026-10-05

Scaffolded with `create-solana-dapp` 4.8.5, template `gh:solana-foundation/templates/mobile/web3js-expo` on Expo SDK ~55.0.23 / RN 0.83.6 / TS ^5.9.3. Later upgraded to Expo SDK 57 (see git history: typecheck gate and navigation fixes for SDK 57).
