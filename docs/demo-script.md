# Demo Video Script — 60–90 seconds

> Recording status: **not recorded**. No video artifact exists yet.
> Target: 60–90s, single continuous device capture (physical device, release APK), voiceover or on-screen captions.
> Capture checklist screenshots in `docs/release-validation.md` map to the beats below.

| Time      | Beat                           | On-screen action                                                                                      | Narration                                                                                                                                                                                                                                               |
| --------- | ------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:10 | Problem                        | Hold on Discover list before scrolling                                                                | "Solana events are scattered across X, Discord, and event pages. Miss one, miss the ecosystem."                                                                                                                                                         |
| 0:10–0:30 | Discover + filter              | Scroll Discover; open filters; apply one filter (e.g. topic or attendance mode); show narrowed list   | "Solwhere bundles a hand-verified catalog — every event cross-checked against its official source. Filter by topic, format, or attendance mode."                                                                                                        |
| 0:30–0:45 | Detail + official registration | Tap event → detail screen → tap official link → external page opens                                   | "Each detail page links straight to official registration. We never re-host sign-ups."                                                                                                                                                                  |
| 0:45–0:55 | Save + persistence             | Tap save on two events; kill app; relaunch; open Saved tab, both events present                       | "Save what matters. Fully offline — storage is local, so your list survives restarts without any account."                                                                                                                                              |
| 0:55–1:15 | Seeker wallet connect          | On Seeker device: Profile → Connect → Seed Vault MWA sheet → approve → address shown; then Disconnect | "On Seeker, connect your Seed Vault wallet with one tap. Authorization-only: the app requests no signatures, no transactions, no balance reads."                                                                                                        |
| 1:15–1:30 | Honest limitation + close      | Show connected state, then Saved list                                                                 | "What we don't do yet: no NFT reads, detection, ticketing, claims, or mockups exist. Future work: opt-in collection-based community suggestions using verified collection IDs. This is P0: verified discovery, offline-first, wallet-native. Solwhere." |

## Recording notes

- Record two segments if needed (standard Android for beats 1–4, Seeker for beat 5) and cut together.
- Use release APK from the build recorded in `docs/release-validation.md`; state build version on an end card.
- Keep app in English; dark theme default.
- Export artifact to `docs/evidence/demo.mp4` — only claim existence once the file exists.
