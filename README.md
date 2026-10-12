# Solwhere

Solwhere is an Android-first, offline-capable guide to curated Solana ecosystem events. It helps builders, community members, and newcomers find relevant events, save them locally, and open the organizer's official registration page.

The submitted app contains a bundled catalog of 51 manually curated events. Discovery, saved events, and preferences remain usable without an account, wallet, or network connection. External registration, wallet connection, location lookup, and calendar writing depend on their respective services.

Repository: <https://github.com/SanseDev/solana-events>

## Problem and users

Solana events are spread across organizer pages, community calendars, and social posts. Solwhere provides one curated mobile catalog for people deciding what to attend, whether they are looking for a local meetup, an online session, a conference, or a builder event.

It is designed for Solana ecosystem participants who want a quick event-discovery experience on Android, including Solana Mobile devices. Registration remains with each event's official organizer.

## Submitted version: what works

- Browse upcoming events from bundled catalog; view verified date, timezone, location, topics, community, and official links.
- Search event titles and organizers. Filter by topic, format, attendance mode, this week, and catalog location.
- Complete or skip three-step onboarding. Optional intent, topic, attendance, and location preferences are stored on device.
- See preference-based ranking with visible match reasons. This is local preference matching, not NFT ownership or community-holder discovery.
- Save events locally. Saved events persist across restarts and are grouped by the device's calendar date.
- Add a future event to an Android calendar after an in-context permission request. The app prefers a writable primary calendar, then another writable calendar.
- Connect a compatible Android wallet through Mobile Wallet Adapter to display its public address, copy it, or disconnect.

Wallet connection is authorization-only. Solwhere does not authenticate event access, check ownership, read balances, perform RPC reads, sign messages, sign transactions, or send transactions.

## Download and demo

No EAS build-details URL, direct APK artifact URL, demo-video URL, deck export, or device-validation evidence is recorded in this repository. Do not treat a future EAS build-details page as a direct APK download link: judges need the artifact's downloaded `.apk` URL or file.

There are no suitable submitted-app screenshots in the repository. The images under `assets/images/` are application branding assets, not product screenshots. See [Judge guide](docs/judge-guide.md) for artifact and test status.

## Install and quick test on Android

The intended submission artifact is an EAS `preview` standalone APK for package `com.sansedev.solwhere`. It is not an Expo Go project at runtime: a standalone APK should launch without Metro, Expo Go, or a computer.

1. Obtain original EAS-signed `.apk` artifact from submission once its direct link is supplied.
2. Install that file on an Android device. Start Solwhere from its launcher icon.
3. On first launch, complete or skip onboarding. Browse Discover, open an event, save it, and verify it in Saved.
4. Open a future event and use Calendar. Grant calendar access only if testing this feature.
5. Open Profile to test wallet connection only on a compatible Android wallet device. All catalog features work without a wallet.

If an older development build uses the same package ID with a different signing certificate, Android may reject the standalone APK as an update. Uninstalling that development build allows a clean install but deletes that app's local preferences and saved events. See [Judge guide](docs/judge-guide.md) for expected denied-permission and cancelled-wallet behavior.

## Local development

Use npm: this repository has `package-lock.json`. `eas.json` pins Node `22.23.1` for preview build; use that Node version locally when reproducing Android build behavior. Repository does not declare an `engines` field.

```bash
npm install
npm run start
```

Native wallet, location, and calendar modules require a custom development build; Expo Go is not a supported Android test environment.

```bash
npm run android
# In a separate terminal after installing development build:
npx expo start --dev-client
```

`npm run android:build` runs Expo prebuild only. It regenerates ignored native project files; it does not compile or sign a release APK. A native dependency change requires a new development build or standalone build, not only a Metro restart.

For web-only UI inspection:

```bash
npx expo start --web
```

Wallet connection is reported as unsupported on web. Calendar addition is hidden on web.

## Architecture

Solwhere is an Expo SDK 57 / React Native application using Expo Router. It has no backend, server API, database, login system, or remote catalog fetch. Catalog is imported from `src/data/events.json`; user state is stored with AsyncStorage.

See [architecture documentation](docs/architecture.md) for routing, state, storage migrations, catalog flow, artwork behavior, services, and preview-build configuration.

## Verification commands

These are repository scripts; this documentation update does not claim they were rerun.

```bash
npm run typecheck
npm run lint:check
npm run format:check
npm test -- --runInBand
```

`npm run ci` additionally runs `expo prebuild -p android`. It modifies ignored generated native directories, so record worktree state before running it.

## Limitations and planned work

- Catalog freshness is tied to app releases because events are bundled. There is no live feed or backend refresh.
- Offline use covers bundled catalog, filtering, local preferences, saved events, and fallback artwork. Organizer links, GPS/reverse geocoding, wallet protocol interaction, and calendar-provider behavior can require network or device services.
- Event artwork currently uses generated SVG fallback illustrations. Candidate organizer artwork is not bundled because no reuse permission or license basis has been recorded; see [artwork permission ledger](docs/event-artwork-permissions.md).
- Physical-device validation, signed standalone APK artifact, demo video, and deck export are not recorded as complete. See [release validation](docs/release-validation.md).
- Planned work includes refreshable catalog and opt-in NFT/collection-based community discovery. NFT data, collection detection, holder-only access, maps, payments, and SKR/ORE integrations are not implemented.

## Author and acknowledgments

Created by [SanseDev](https://github.com/SanseDev). Built with Expo, React Native, Expo Router, and Solana Mobile Wallet Adapter. Event details link to organizers' official sources; artwork licensing remains tracked separately.
