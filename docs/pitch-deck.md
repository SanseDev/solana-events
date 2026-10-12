# Pitch Deck — Solwhere (7 slides)

> Source artifact. Export status: **not exported**. No PDF/slides file exists yet.
> One slide per section below; talking points under each.

## Slide 1 — Problem

- Solana events live scattered across X threads, Discord servers, and one-off pages.
- No mobile-first place to see what's happening, where, and when.
- Result: people miss hackathons, meetups, and conferences they would have attended.

## Slide 2 — Target user

- Builders and traders active in the Solana ecosystem.
- Mobile-first: checks phone, not a desktop aggregator.
- Often on Seeker / Saga hardware where wallet is first-class.

## Slide 3 — Product flow

- Discover → verified catalog, 6 events at P0, each cross-checked against its official source on a recorded date.
- Filter by topic, format, attendance mode; interest-aware ranking.
- Event detail → official registration link (https-only, guarded external opens).
- Save locally; restart persists — no account, no backend.

## Slide 4 — Mobile / Seeker value

- Native Android app, not a wrapped website.
- Seeker: Seed Vault connect via Mobile Wallet Adapter.
- Identity without gating: catalog fully usable with no wallet connected.

## Slide 5 — Security: authorization-only wallet

- Wallet connection uses MWA `connect()` — standard authorization only.
- No `signIn` payload, no message signing, no transactions, no balance reads, no RPC calls.
- Enforced by unit tests that fail the build if forbidden operations reappear.

## Slide 6 — Offline architecture

- Static verified catalog + AsyncStorage persistence.
- Every core flow (discover, filter, detail, save, restart) works in airplane mode.
- Zero backend: nothing to pay for, nothing to attack, nothing to go down.

## Slide 7 — Roadmap and judging fit

- P0 (done, code-complete): verified discovery, offline persistence, MWA connect.
- P1: calendar integration (explicitly out of this release).
- Future: NFT ticketing — stated as future work only; no mock claims.
- Fit: mobile track (native Android + Seeker), security posture (authorization-only), verifiable scope (every event URL test-verified).

## Export checklist

- Generate slides from this source; keep wording consistent with README and `docs/release-validation.md`.
- Embed only real screenshots from `docs/evidence/`.
- Export artifact to `docs/evidence/pitch-deck.pdf` — claim existence only once the file exists.
