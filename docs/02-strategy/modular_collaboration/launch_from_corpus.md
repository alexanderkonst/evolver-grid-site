# Module 2 · What the corpus already decides for the launch

v1 · 2026-11-21 · Hark. Read of the whole corpus on matchmaking, modules, assembly and collaboration, set against Sasha's launch (one message to many people at once, partners and players together, self-serve connection). Full reads: [research/matchmaking.md](./research/matchmaking.md), [research/modules.md](./research/modules.md), [research/assembly.md](./research/assembly.md). Nothing built, sent or published.

## Summary for decision

- **Answer:** most of what the launch needs is already decided in the corpus: the terms, the tone, the acceptance model, the matching engine, the proposal email. What is missing is mostly plumbing: one module registry, partner records, outbound attribution, and a place a guest can see.
- **Needed from Sasha:**
  1. Terms line for the message: «10% of what each client who comes from the game pays you; no clients, nothing to pay» (his own, 2026-11-02). Hark's pick, likely.
  2. Where partners appear for a guest: Market and Academy are closed to guests today. Hark's pick: one public page with two doors (Play / Bring your module) plus a partner room visible without sign-up. Likely.
  3. Un-park the «project» entity in matchmaking (§7 of matchmaking_strategy parks project profiles). Partner modules are exactly that. Hark's pick: yes, almost certainly needed.
- **Against:** the Three Terms say terms are «a closer, not an opener». A mass message that leads with terms reads as sales. Answer: lead with the invitation to play and to connect; terms stay one line or a link.

## 1. Already decided (reuse as is)

| Need | Canon answer | Source |
|---|---|---|
| Terms, partner sells on own site | Commission-only, 10% per game-sourced client, «no clients, nothing to pay»; «ЭТО НАША СТРАТЕГИЯ» | briefs/matchmaker_brief_v5.1.md, «Build in the village», Sasha 2026-11-02 |
| Terms, sold through our checkout | Author 66.6% / platform 33.3% when the game brought the buyer; 90/10 when the author did | monetization_strategies.md §6, 2026-10-30 |
| Spirit of terms | «The gift is free. The system is paid. The name is permanent.» No equity, no pooled funds; rev share «bounded in time and project» | 05-reference/the_three_terms.md, 2026-09-16 |
| Self-serve acceptance | «Nothing to sign on day one — the act of going commercial is the act of accepting»; trust by default, audit by exception; Stripe Connect auto-split | Distributor Agreement v0.6 (see research/assembly.md) |
| Why connection, not more pieces | «We're building the connection, not another piece»; «attribution and licensing per module» | planetary_os_assembly.md Step 12; insight 2026-04-06 |
| Shared vs own | «Layer 2 (modules) should be shared. Layer 3 (branding) should be distinct.» Mission: «Create the module protocol» | 06-architecture/integration_layer_manifesto.md, 2026-04-06 |
| Module standard | «one transformational result and one button»; Intro → Passage → Outro; «a module without an assigned artifact is not finished» | templates/module-form.md, 2026-10-27 / 11-03 |
| Partner place | «a building of their own» in the village, not a card inside ours | matchmaker_brief_v5.1 |
| Tone of the mass message | «Inform and inspire only», no scarcity, urgency or closing; everyone keeps «their own way out»; live-session invitations only from Sasha | matchmaker_brief_v5.1 |
| Matching | Matching is «the optimization function the entire platform converges on»; tiebreaker «more real collaborations… or fewer?» | matchmaking_strategy.md §0, v3 2026-05-22 |
| Built and reusable | Double opt-in, Active Intro (one-tap Yes / Not now), weekly Proactive Matchmaker email, magic-link consent page, bulk email tool (200 per send, opt-out), inbound referral `?ref=` → `game_profiles.invited_by` | code; research/matchmaking.md, research/modules.md |

## 2. What blocks a self-serve launch (gaps)

1. **Guests can't see partners.** Market opens only after a player saves their offer; Academy is locked to «two courses, one path» (core-flow rule, Sasha's yes needed).
2. **Five module lists in code** (modules.ts, HolonicModulesPage, villagePlaces.ts, hardcoded Academy courses, courseSales.ts). One registry first; the 2026-02-10 audit already asked for it.
3. **No partner record:** contact, terms accepted with timestamp, payout, owner. No public intake form.
4. **No outbound attribution:** only players coming in are tracked; clicks out to a partner are not (the April `?src=` item was never built). Partner-reported sales need a migration (Sasha's yes).
5. **Quality bar** for self-serve listings: automatic check, manual review at stage 1.
6. **Privacy:** cards read from a partner's unreleased work must not land in the public repo.
7. **Module form exception:** a partner module's passage happens on their site, so the card is Intro only until level 1 brings the Outro back.

## 3. Corrections to our drafts (done or to do)

- connector.md §5: the A–D menu replaced with the canon terms (done 2026-11-21).
- 180° wording in the canon updated to «let's connect our systems, my players will come to you» (done 2026-11-21).
- Wrong citation for «founder+AI ↔ founder+AI» fixed (done).
- our_rack.md: Café belongs to «Meet» («no separate chat, feed or forum») and Co-working holds the person matcher; partners go to their own buildings instead. The Module type already takes any URL (hero_CTA_link, app_links); truly missing: owner, payee, referral rule, integration level, source. Academy is a place, LEARN is the space. To fix in our_rack v2.
- landing.md: «wait for the first partner» withdrawn per Sasha 2026-11-21; the page is one page with two doors.
- Level 4 (shared profile) must pass the «data moat» test (matchmaking_strategy §0.5) and the §8 privacy boundary.

## 4. Launch shape (proposal, for Sasha)

One message → one page with two doors:
- **Play:** enter the game as now.
- **Bring your module:** paste a link to your project → our AI drafts your module cards → you confirm → your building appears in the village with your link and referral id. Terms in one line: 10% of what clients from the game pay you.
Stage 1: cards drafted by AI, reviewed by hand before they go live; partner sales reported by the partner. Later: automatic check, payment split (level 2).

## 5. Stale or unclear in the corpus (flag only)

- roadmap.md L305 still shows Proactive Matchmaker as «spec ready»; code says shipped.
- matchmaking_strategy §9–10 contradicts its own v3 §4; ai_matchmaker_brief body stops at v4.31.
- first_ten_ritual_gate.md checklist is entirely unchecked.
- Equity remnants to retire: cooperative v1 «Venture Equity», collaboration taxonomy «equity split», playbook «PARTNERSHIP · equity».
- Planetir: skin live since 2026-05-25, no direct contact; coOwn: notes only. First prospect list: the 8 «elephant builders» plus partners/ docs (Planetir, Priroda, coOwn).
