# Environment versions

## Current — recorded 2026-10-08 (SDK 57 upgrade applied)

Versions below match `package.json` / installed `node_modules` exactly.

| Tool              | Version                                                   |
| ----------------- | --------------------------------------------------------- |
| Node              | v24.10.0                                                  |
| npm               | 11.6.1                                                    |
| Java              | OpenJDK 17.0.15 (Zulu)                                    |
| Android SDK       | `/Users/sanse/Library/Android/sdk`, platform `android-36` |
| Expo CLI          | 57.0.28                                                   |
| Expo SDK (`expo`) | 57.0.27 (`^57.0.0`)                                       |
| React Native      | 0.86.3                                                    |
| React / React DOM | 19.2.3                                                    |
| TypeScript        | 6.0.3 (`~6.0.3`)                                          |
| expo-router       | 57.0.25 (`~57.0.25`)                                      |
| Jest / jest-expo  | 29.7.0 / ~57.0.5                                          |

Wallet layer: `@wallet-ui/react-native-web3js` ^4.0.1 (resolved 4.3.0; Mobile Wallet Adapter underneath).
Storage: `@react-native-async-storage/async-storage` 2.2.0.
Navigation: `expo-router` (file-based, single navigation solution).

Android package still `com.anonymous.solana_events_app` — final package ID is a pending owner decision (it cannot change after Play Store release).

## History — Milestone 0 scaffold, recorded 2026-10-05

Scaffolded with `create-solana-dapp` 4.8.5, template `gh:solana-foundation/templates/mobile/web3js-expo` on Expo SDK ~55.0.23 / RN 0.83.6 / TS ^5.9.3. Later upgraded to Expo SDK 57 (see git history: typecheck gate and navigation fixes for SDK 57).
