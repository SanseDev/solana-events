# Standalone Android APK Plan

Status: implementation plan only. No build, credential, device, or publishing action was performed during this audit.

## 1. Readiness assessment

**Ready for release-candidate build after one small configuration clarification.** The repository is an Expo SDK 57 app, not SDK 55. `preview` already targets an internal universal APK. Make `developmentClient: false` explicit in that profile before building, then use EAS cloud signing and validate exact downloaded APK on Seeker.

No source, catalog, asset, navigation, wallet, or native-dependency change is required by current evidence. No EAS build, signing-credential check, physical-device test, or public artifact exists yet.

Current source commit at audit: `998336281350deca3d56c242e90adcf8c0bda562` (`9983362`, 2026-10-12). Worktree is not clean: `README.md` is modified and `pictures/.gitignore` is untracked. Do not build a submission artifact until intended release changes are committed or otherwise recorded.

## 2. Verified repository findings

### App identity and versions

- Expo package range is `^57.0.0`; `package-lock.json` resolves `expo` to **57.0.27**. This confirms SDK 57, not SDK 55. See `package.json`, `package-lock.json`, and `docs/versions.md`.
- React Native is `0.86.3`; React is `19.2.3`.
- Native release-sensitive packages include `@wallet-ui/react-native-web3js` `^4.0.1` (lockfile **4.3.0**), Mobile Wallet Adapter protocol **2.3.0**, `react-native-quick-crypto` `^1.0.6` (lockfile **1.1.7**), `expo-calendar` `~57.0.5`, and `expo-location` `~57.0.20`. `expo-dev-client` `~57.0.19` remains installed for development builds.
- App display name: `Solwhere`; Android application ID: `com.sansedev.solwhere`; app version: `1.0.0`. See `app.json`.
- `app.json` declares no `android.versionCode`. `eas.json` uses `cli.appVersionSource: "remote"`; therefore EAS remote state, not this repository, is source of truth for cloud-build version code. Current ignored local CNG output shows `versionCode 1` and `versionName "1.0.0"`, but this does **not** prove cloud remote version code. Confirm it in EAS before build.
- Existing EAS association is `340b53b9-af1a-4be4-b79f-b00a37a9bec3` in `app.json`. Preserve it. Git remote is `git@github.com:SanseDev/solana-events.git`.

### EAS and native generation path

- `eas.json` profiles:
  - `base`: `pnpm: "10.12.3"` only.
  - `development`: extends `base`, sets `developmentClient: true`, `distribution: internal`.
  - `preview`: extends `base`, sets `distribution: internal`, `android.buildType: "apk"`.
  - `production`: extends `base`, sets `autoIncrement: true`.
- `preview` has no `gradleCommand`, build variant override, or inherited `developmentClient: true`. It should produce an APK, but `developmentClient: false` is currently implicit rather than explicit. Add explicit `false` only to `preview`.
- No `.easignore` exists. `.gitignore` excludes `/android` and `/ios`; neither native tree is tracked by Git. An ignored `android/` directory exists locally from Expo prebuild/CNG. EAS must use generated native project input, not untracked local Android edits.
- Generated local Android output has package/namespace `com.sansedev.solwhere`, release bundle command `export:embed`, and Expo Updates `ENABLED=false`. This confirms release JS bundling configuration and no configured EAS Update strategy. Do not add one.
- Generated local `android/app/build.gradle` signs its local `release` type with its debug keystore. This is generated, ignored output and is **not proof of EAS signing**. EAS cloud credentials must be inspected/reused through authenticated EAS account flow. Do not commit, copy, or change keystores.

### Standalone behavior and included content

- `android/app/build.gradle` uses Expo `bundleCommand = "export:embed"` for non-debug variants. Release APK embeds JavaScript bundle and Metro assets.
- Catalog is static `src/data/events.json`, imported by `src/data/eventCatalog.ts`. No catalog network fetch exists.
- App icon, adaptive icon, splash image, and SpaceMono font use repository files in `assets/`; root layout statically requires font. Event artwork is deterministic `react-native-svg` fallback; `src/data/eventImages.ts` intentionally contains no remote images.
- Favorites, preferences, onboarding state, and migrations use AsyncStorage. Storage keys are versioned and preserve old values; see `src/services/storage.ts`.
- Mobile Wallet Adapter is provided once in `components/app-providers.tsx`. `src/services/wallet.ts` calls authorization-only `connect()` and has no signing, transaction, balance, or RPC operation.
- Calendar uses `expo-calendar` with in-context permission request. Links permit only `https://` URLs.
- No runtime environment-variable read, localhost/LAN URL, `exp://` URL, or Expo Updates API/configuration was found in application source. Only `__DEV__` is a Profile-only onboarding-review control; it is excluded from release behavior.
- Expected network-dependent features: opening external organizer links, wallet protocol/wallet app interaction, devnet endpoint resolution used by wallet provider, and calendar provider behavior. Catalog, discovery, filtering, details, artwork fallback, favorites, preferences, and onboarding must work without network.

### Required build/runtime variables

No required app build/runtime environment variables were found. `eas.json` contains no `env` block and no repository `.env*` file was found. EAS authentication is account state, not an app environment variable.

## 3. Minimum required change

Edit only `eas.json`, preserving all existing profiles, EAS project association, application ID, and `base` settings. Add this field inside `build.preview`:

```json
"developmentClient": false
```

Effective `preview` requirements after edit:

```json
"developmentClient": false,
"distribution": "internal",
"android": { "buildType": "apk" }
```

Do not remove `expo-dev-client`; it remains needed by `development`. Do not alter `development`, `production`, `app.json`, native files, SDK, dependencies, catalog, or Expo Updates. Do not run `expo prebuild --clean`: current Android tree is CNG output, ignored, and no inspected native customization requires cleaning.

## 4. Execution milestones

### M1 — Release configuration audit and minimal fix

**Objective:** Establish exact release input and prevent accidental development-client artifact.

**GLM executes:**

1. Confirm worktree scope. Preserve unrelated `README.md` and `pictures/.gitignore` changes.
2. Inspect `package.json`, `package-lock.json`, `app.json`, `eas.json`, `.gitignore`, and absence of `.easignore`.
3. Confirm `preview` inherits only `base`; it must not inherit `development`.
4. Edit `eas.json` only: add `developmentClient: false` in `preview`.
5. Review resulting EAS profile. Confirm app ID, project ID, package versions, and all other profiles are unchanged.
6. Inspect ignored generated `android/` only for parity after later prebuild verification. Do not hand-edit it.

**Commands from repository root:**

```bash
rtk git status --short
rtk git diff -- eas.json app.json package.json package-lock.json .gitignore
rtk sed -n '1,220p' eas.json
rtk git ls-files android ios
rtk git check-ignore -v android ios
```

**Depends on:** none.

**Acceptance:** `preview` explicitly has `developmentClient: false`, `distribution: internal`, and `android.buildType: "apk"`; no unrelated config changed.

**Evidence GLM reports:** exact `eas.json` diff; current commit SHA; clean/intentional release commit SHA after owner decides how to handle existing worktree changes; confirmation Android/iOS are ignored and untracked.

**Recovery:** If `preview` has a hidden inherited `gradleCommand` or development setting, stop and report profile chain before editing. If EAS configuration validation contradicts expected effective profile, restore only this planned change and fix concrete configuration cause; do not create a new EAS project.

**Owner action:** Decide whether existing README/untracked-file changes belong in release commit. GLM must not silently include them.

### M2 — Relevant automated verification

**Objective:** Prove release input still typechecks, lints, formats, passes repository tests, and generates expected native configuration.

**Files inspected:** `package.json`, `jest.config.js`, `eslint.config.js`, `tsconfig.json`, `app.json`, generated `android/app/build.gradle`, generated `android/app/src/main/AndroidManifest.xml`.

**GLM executes:**

```bash
rtk npm run typecheck
rtk npm run lint:check
rtk npm run format:check
rtk npm test -- --runInBand
rtk npm run android:build
rtk rg -n 'applicationId|namespace|versionCode|versionName|bundleCommand|expo.modules.updates.ENABLED' android/app/build.gradle android/app/src/main/AndroidManifest.xml
```

`npm run android:build` is repository's `expo prebuild -p android` check. It regenerates ignored native output; it does not compile or sign APK. Run it only after recording worktree state. It is justified because CNG output contains Android identity, native modules, permissions, embedded bundle configuration, and Updates state used by EAS.

**Depends on:** M1.

**Acceptance:** all four automated gates pass; generated Android package/namespace remains `com.sansedev.solwhere`; release bundle command remains `export:embed`; Updates remains disabled; calendar/location permissions and native dependency autolinking are present.

**Evidence GLM reports:** exact command exit statuses; test suite/test totals from command output; generated Android identity; concise Expo Doctor output only if it was run.

**Expo Doctor rule:** Run `rtk npm run doctor` only if one of above checks or EAS build identifies dependency/config issue. Classify a report as Android release blocker only when it affects Android prebuild, native module compatibility, SDK compatibility, asset bundling, or EAS build. Do not fix iOS-only warnings for this APK. Do not run `npm audit fix`, `npm audit fix --force`, package upgrades, or broad cleanup.

**Recovery:**

- Type/lint/test failure: fix only concrete release regression and rerun failing command plus affected gates.
- Prebuild failure: inspect failing plugin/module; preserve CNG model; do not use `--clean` unless failure proves stale native generation and identifies no unpreserved native customization.
- Android output differs from app config: stop, compare `app.json` plugins/config, and fix source config rather than ignored generated files.

### M3 — EAS standalone APK build

**Objective:** Produce one signed internal-distribution APK containing embedded bundle, static catalog/assets, and native wallet/calendar modules.

**Owner action required before GLM can proceed:** Authenticate with EAS account that owns or has access to project `340b53b9-af1a-4be4-b79f-b00a37a9bec3`. Complete browser or MFA prompts. Confirm signing credential reuse if EAS asks.

**Commands from repository root:**

```bash
npx eas-cli@latest whoami
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest build --platform android --profile preview
```

Run `login` only when first `whoami` shows no authenticated account or wrong account. Use exactly one build command. Do not queue a second build while first has queued/in-progress state.

**GLM executes after authenticated owner access:**

1. Reconfirm `app.json` project ID and `eas.json` preview profile before queueing.
2. Start one cloud build with command above.
3. Use EAS build URL/status to monitor same build. Record build ID, URL, profile, effective app version/version code, status, artifact URL, SHA-256, and source commit.
4. In EAS credential flow, select existing Android keystore/credentials for linked project. Never run project initialization, never create another project, and never expose credential material.
5. Inspect build logs for `expo prebuild`, dependency install, Metro export/embed, Android Gradle, signing, and APK artifact generation. Confirm uploaded source excludes ignored CNG folders but includes `assets/`, `src/data/events.json`, `package-lock.json`, app config, and package manifest.

**Depends on:** M1 and M2 passing; release source commit identified; authenticated EAS account.

**Acceptance:** successful Android `preview` build produces downloadable `.apk`, not `.aab`; EAS shows linked project and internal distribution; artifact is signed by intended EAS credential; build logs show a release/non-development-client artifact with embedded JS/assets.

**Evidence GLM reports:** build ID; build URL; final status; artifact URL; artifact filename/size; SHA-256; EAS-reported version/versionCode; source commit; credential reused/new decision without secret values.

**Recovery:**

- Authentication, ownership, quota, or queue failure: report exact EAS message, account identity from `whoami`, build ID if any, and whether any build was created. Do not retry blindly.
- Missing credentials or credential mismatch: owner selects/reuses existing EAS credential. Do not generate/revoke credentials without owner approval.
- Dependency, prebuild, Gradle, asset, or signing failure: inspect exact failing log section; repair only root cause; rerun M2; queue one replacement build only after change/credential decision is recorded.
- If cloud build cannot proceed, local release build is fallback only after checking installed Android SDK/JDK, Gradle/toolchain compatibility, and access to matching release keystore. Current generated local Gradle `release` configuration uses debug signing, so it is not a submission fallback by itself. Never claim a local APK is equivalent to EAS-signed submission APK without signer verification.

### M4 — Install and physical-device validation

**Objective:** Validate exact M3 APK as standalone binary, then validate user-critical flows on Seeker.

**Owner/phone interaction required:** Download/install APK, stop Metro, disconnect USB, operate Seeker/wallet/calendar prompts, and capture evidence. GLM may guide and record results but must not claim results without hardware evidence.

**Preparation:**

1. Record build ID, APK SHA-256, APK filename, device model, Android version, wallet app/version, date, and tester in `docs/release-validation.md`.
2. Confirm Metro is stopped. Disconnect USB and disable wireless debugging/ADB if enabled. Use downloaded M3 APK, not a development build.
3. Before uninstalling or clearing data, export/record anything needed. Clearing app data removes local favorites, preferences, and onboarding state. Uninstalling may also remove those local data.

**Installation compatibility triage:**

- `INSTALL_FAILED_UPDATE_INCOMPATIBLE` or installer says package conflicts: existing `com.sansedev.solwhere` has different signing certificate. Do not uninstall until user accepts local-data loss; alternatively install on clean device/profile.
- Version downgrade error: incoming APK has lower versionCode than installed app. Increase/resolve EAS remote version code, rebuild, and retest; do not force downgrade.
- Same package/version but installer refusal: capture exact error and compare APK signer fingerprint with installed package signer. Do not assume development build and EAS build use same key.

**Standalone checks for exact downloaded APK:**

1. Install on Seeker.
2. Launch from Solwhere app icon.
3. Confirm no QR scan, Expo development launcher, server picker, Metro connection, or connected computer is needed.
4. Force-close app; reopen from icon; repeat success.
5. Enable airplane mode; cold-launch and confirm bundled catalog/content appears.

**Functional checklist:**

- Fresh-data test: only after explicit data-loss approval or on a separate device/profile. Confirm first-run three-step onboarding, skip path, and restart/resume behavior.
- Returning-data test: retain existing data. Confirm direct tabs launch, stored preferences, and saved events.
- Discover: catalog renders; search, topic/format/attendance/location/this-week filters work; personalized sections appear only for matching preferences.
- Detail: event details, fallback artwork, Register/official-source links, Save, and Add to calendar work as applicable.
- Persistence: save/favorite and preferences survive force-close/relaunch.
- Calendar: grant permission at action; confirm selected writable primary calendar receives correct title/date/time/location/official URL. Test denial/no-calendar/error paths where practical.
- Wallet on Seeker: Seed Vault or compatible MWA wallet is installed, set up, and unlocked. Confirm connect sheet, approve, displayed public address, cancellation path, failure/no-wallet path, and disconnect. Wallet test needs connectivity if wallet/provider needs it.
- Android Back: details and secondary screens return correctly without unexpected exit.
- Offline: with airplane mode, confirm catalog, discovery, filters, details, artwork, favorites/preferences, and relaunch work. Record that official links, wallet/network operations, and remote calendar providers can need connectivity.
- Additional standard Android smoke test if available: install exact same APK and test cold launch, catalog, details, save/relaunch, external link, and calendar. MWA may be unavailable; record that as capability limitation, not test pass/fail.

**Depends on:** M3 success and exact artifact download.

**Acceptance:** required standalone checks pass on Seeker; all stated functional checks are recorded as pass/fail/not-applicable with evidence; APK SHA-256 matches M3 artifact; tested APK is submission APK.

**Evidence GLM/owner records:** update `docs/release-validation.md` with real results; build URL/ID; APK URL/SHA-256; device/wallet versions; screenshot/video paths; exact errors; distinction between executed and unexecuted tests.

**Recovery:** Reproduce on same downloaded APK first. Classify failure as install/signature/version, standalone launch/bundle, native wallet/calendar module, app behavior, or network dependency. Fix only confirmed cause, rerun affected M2 checks, make a new M3 artifact, and repeat M4 on that new exact APK.

### M5 — Submission artifact and handoff

**Objective:** Make tested APK directly downloadable by judges and provide reproducible release record.

**Verified repository hosting:** Git remote is GitHub (`SanseDev/solana-events`). No existing release-hosting configuration was found in repository. Public GitHub Release is suitable only after owner approves external publication and repository visibility/access is confirmed.

**GLM prepares; owner approves/publishes:**

1. Rename/copy only exact tested M3 artifact as `solwhere-1.0.0.apk` (or include confirmed EAS versionCode if needed for uniqueness).
2. Prepare GitHub Release tag `v1.0.0` and title `Solwhere 1.0.0 — CLOCK IN APK`.
3. Attach exact tested APK. Do not attach AAB or prior development APK.
4. Prepare release notes:

```text
Solwhere 1.0.0 — signed Android APK for Solana Mobile CLOCK IN.

Package: com.sansedev.solwhere
Source commit: <full release commit SHA>
EAS build: <build URL / ID>
APK SHA-256: <checksum>

Tested on: <device models and Android versions>
Validated: standalone launch, bundled catalog, search/filters, details, persistence, calendar, and Seeker MWA results recorded in docs/release-validation.md.

Limitations: organizer links, wallet/network operations, and remote calendar providers can require connectivity. No wallet signing, transactions, balances, or RPC reads occur.
```

5. After publication, use direct asset URL format:

```text
https://github.com/SanseDev/solana-events/releases/download/v1.0.0/solwhere-1.0.0.apk
```

6. Test download in incognito/private browser without GitHub login. Check HTTP download completes, filename/size is expected, and downloaded SHA-256 equals tested APK checksum.
7. Keep EAS artifact URL in internal evidence, but use GitHub release asset only after incognito test proves judge-accessible direct download.

**Depends on:** M4 pass on exact artifact; owner approval for public release; source commit pushed.

**Acceptance:** public direct APK asset download works in private window; checksum matches physical-tested APK; release includes source commit/version/build/test record; no development APK/AAB is submitted.

**Evidence GLM reports:** public direct URL; private-window test result; downloaded checksum; GitHub release URL/tag; artifact source commit; concise test matrix and remaining limitations.

**Recovery:** If GitHub Release cannot be made public or direct asset URL requires authentication, do not submit EAS dashboard URL as substitute until private-window test succeeds. Ask owner for approved public file host, upload exact checksum-verified artifact, and repeat incognito test. Do not publish any host or release during planning.

## 5. Command sequence

Run from repository root, in order. Commands that authenticate, build, upload, install, or publish require appropriate owner authority.

```bash
# Audit and minimal profile edit review
rtk git status --short
rtk git diff -- eas.json
rtk sed -n '1,220p' eas.json

# Automated gates
rtk npm run typecheck
rtk npm run lint:check
rtk npm run format:check
rtk npm test -- --runInBand
rtk npm run android:build

# EAS account and APK build
npx eas-cli@latest whoami
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest build --platform android --profile preview
```

Do not run `login` when `whoami` already identifies correct account. Do not run `expo prebuild --clean`, `npm audit fix --force`, `eas init`, `eas build:configure`, `eas submit`, or a local release build unless a concrete documented failure makes it necessary.

## 6. Definition of done

Release is done only when all conditions hold:

1. `preview` explicitly resolves to `developmentClient: false`, internal distribution, APK build type.
2. Required repository gates pass after release config change.
3. One EAS build for linked project succeeds and produces signed `.apk`.
4. APK embeds application bundle/catalog/assets and launches on Seeker with Metro stopped, USB disconnected, and no development launcher.
5. Exact APK hash, build ID/URL, EAS version/versionCode, signer/reuse decision, and source commit are recorded.
6. Seeker manual validation covers onboarding, returning data, Discover, details, filters/search, persistence, assets, external links, calendar, MWA connect/cancel/disconnect, Back navigation, and offline bundled content.
7. Same checksum-verified APK has direct public download URL tested in private browser.
8. Submission record clearly states tested devices/results and remaining network-dependent limitations.

## 7. Genuine blockers and unknowns

- EAS account authentication/access and current cloud signing credential state are unverified. Owner interaction is required if login/MFA/credential selection is needed.
- EAS remote versionCode is unverified because `appVersionSource` is remote. Confirm before queueing build; resolve downgrade risk before installing over existing app.
- Existing Seeker development build signer/version is unverified. Installation can fail due signature mismatch, downgrade, or package conflict; preserve user data before remediation.
- Physical devices, Seed Vault/compatible wallet readiness, calendar availability, and Android versions are unverified. No automated check substitutes for these.
- No existing public hosting path was verified. GitHub Release is proposed, not authorized or published. Private-window test is mandatory.
