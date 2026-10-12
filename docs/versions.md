# Environment versions — Milestone 0

Recorded 2026-10-05, at scaffold time.

| Tool               | Version                                                   |
| ------------------ | --------------------------------------------------------- |
| Node               | v24.10.0                                                  |
| npm                | 11.6.1                                                    |
| Java               | OpenJDK 17.0.15 (Zulu 17.58+21-CA)                        |
| Android SDK        | `/Users/sanse/Library/Android/sdk`, platform `android-36` |
| Android Studio     | 2025.1                                                    |
| Expo CLI           | 55.0.36                                                   |
| Expo SDK           | ~55.0.23                                                  |
| React Native       | 0.83.6                                                    |
| React              | 19.2.0                                                    |
| TypeScript         | ^5.9.3                                                    |
| create-solana-dapp | 4.8.5                                                     |
| Template           | `gh:solana-foundation/templates/mobile/web3js-expo`       |

Wallet layer: `@wallet-ui/react-native-web3js` ^4.0.1 (Mobile Wallet Adapter underneath).
Storage: `@react-native-async-storage/async-storage` 2.2.0 (bundled by starter).
Navigation: `expo-router` ~55.0.7 (file-based, single navigation solution).

Starter untouched except renames: package name → `solana-events`, app display name → `Solana Events`, slug → `solana-events`. Android package still `com.anonymous.solana_events_app` until final naming (Milestone 6).
