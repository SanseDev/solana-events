# Judge guide: Android APK testing

## Artifact status

This repository records no completed EAS build, direct APK download URL, EAS build-details URL, checksum, or physical-device test evidence. A submission must provide the original EAS-signed standalone `.apk` artifact before this guide can be executed.

An EAS build-details page is not itself a direct APK download link. Record both URLs when available, together with build ID, checksum, version code, and device-test evidence in [release validation](release-validation.md).

## Install

1. Download the original EAS-signed standalone APK supplied with the submission.
2. Install downloaded `.apk` on Android and launch Solwhere from its icon.
3. No Expo Go, Metro server, USB connection, or computer should be required after installation.

The submission profile is EAS `preview`: internal distribution, `developmentClient: false`, and Android `buildType: apk`. The package ID is `com.sansedev.solwhere`.

If Android refuses an update because an older development build has the same package ID but a different signing certificate, uninstall that development build or use a clean device/profile. Uninstalling deletes that installation's local app data, including preferences, onboarding state, and saved events. Do not disable Play Protect globally; follow normal Android install prompts for the supplied APK.

## Reproducible test path

1. Launch Solwhere. Complete the three onboarding steps or choose Skip. No wallet, location, calendar, notification, or network permission should be requested during onboarding.
2. In **Discover**, browse the bundled events. Search by event or organizer, then try topic, format, attendance, “this week,” and location filters.
3. Set optional preferences in **Profile** or onboarding. Return to Discover and verify any “For you”/matched result displays a reason based on those choices. This is local preference matching, not NFT-based discovery.
4. Open an event. Verify the date, timezone, location, topics, communities, verification date, and Register/View official source action. The official page opens outside the app and requires network access.
5. Save an event. Open **Saved**, then force-close and reopen the app to confirm the saved item remains.
6. On a future event, select **Calendar**. Grant calendar permission if testing it. Confirm one event is added to a writable device calendar with title, dates, location, and official URL in notes.
7. In **Profile**, test wallet connection only with compatible Android wallet/Mobile Wallet Adapter environment. Connect, check public address display, copy it, then disconnect.

## Expected permission and wallet outcomes

- **Without a wallet:** onboarding, discovery, filters, preferences, saved events, event details, and official links still work. Wallet is optional and does not authenticate event access.
- **Location denied:** choosing device location shows a non-blocking denial message. Pick a country/city manually instead.
- **Calendar denied:** Calendar action explains that calendar access must be allowed in Android settings; event browsing remains available.
- **Wallet connection cancelled or fails:** Profile returns to a readable disconnected/error state. The user can retry; no catalog feature is blocked.
- **No writable calendar:** Calendar action explains that a calendar account is needed; no catalog data is changed.

## Known limitations

- The catalog is bundled and does not refresh without an app release.
- Offline mode covers catalog discovery, filtering, preferences, saved events, and fallback artwork. Organizer links, device location, wallet interaction, and calendar-provider behavior may need network or device services.
- Event images are generated SVG fallback illustrations. No organizer artwork is bundled without documented reuse basis.
- Physical-device validation and a release APK are currently unrecorded. Treat all hardware results as pending until captured in [release validation](release-validation.md).
- NFT checks, holder-only access, maps, transactions, payments, SKR/ORE integrations, and backend accounts are not implemented.
