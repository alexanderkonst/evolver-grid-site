# Matchmaking in the corpus → what it means for Module 2
Read-only pass, 2026-11-21, snapshot /workspace/work/egs2. Paths relative to docs/.

## 1. What the corpus defines

**Status in the canon.** Matching is "the optimization function the entire platform converges on". Its goal is **collaboration** (02-strategy/matchmaking_strategy.md, Core Insight; v3, 2026-05-22). It is named in Sasha's mission: "…unique talent monetization, **precision match-making for collaboration**, self-knowledge sourced venture-building and systemic stewardship" (unique-businesses/alexanders_unique_business.md L72; brief v5.1 opening). Tiebreaker for every trade-off: "*does this produce more real collaborations between consciously developed people, or fewer?*" (§0).

**Data moat (§0.5).** The code can be copied; the depth profiles can't. "Any future strategic decision (open API, partnership, acquisition offer) should be evaluated against whether it preserves or dilutes this data moat."

**Engine v3 (§3–5).** `resonance = 100 × ⁴√(topTalent × mission × assets × qol)`: talent complementarity, mission similarity, asset LEGO fit, QoL similarity; missing data = 0.5; match types are labels, not generators.

**Holarchy (§7).** There are three layers: person, project, ecosystem. That gives six pairings (person↔project, project↔ecosystem…). "Project profiles will exist… not reducible to the leader-person's profile". The project layer is "parked until person-to-person matching is producing real collaborations."

**Interaction ethic.**
- §8 double opt-in: "Both sides choose. AI provides the *why*." The why "describes the MATCH, not the PERSON".
- §8.6 Active Intro: heads-up email with one-tap Yes/Not now, then a two-sided intro.
- §8.8: "3 matches per session". §8.9: free for individuals always; **community sponsorship** (operators pay) is the main revenue line.
- Trojan Horse (§1): "Matchmaking → Profile (auto-built) → Connection → Recognition → Session". Matchmaking as a separate entry door goes back to the 2026-03-31 download (UB L8959).

**Collaboration Gift Taxonomy** (holomaps/collaboration_gift_taxonomy_holomap.md, Day 120, 2026-07-10): Mirror · Compass · **Door** ("they gave you access"; Vouching…) · Co-Creation · Motivation. This is now the engine's native vocabulary (roadmap MM3 ✅ Day 121).

**Multiplayer "Meet"** (02-strategy/game_multiplayer.md, 2026-10-28, concept, not built): "One verb runs through every kind of social contact: to meet". One button, one space, one building, and "we build no separate chat, feed or forum". "We never push people at each other."  

**Matchmaker Brief v5.1** (briefs/matchmaker_brief_v5.1.md, 2026-11-17; changes v3.0→v5.1 in ai_matchmaker_brief.md). The brief is for external AI matchmakers such as Boardy, not the in-game engine. Arc: v3.0 (08-27) streams and deficit lines; v4.3 (09-21) founders serving founders, invitation; v4.31 paid-delivery hypothesis; v5.0 (11-03) the game and **"Build in the village"**; v5.1 self-naming. Lines that bear directly on Module 2:
- "**Build in the village:** practitioners and partners can build their own building… The world is open: anyone can fork and change any component. One form exists today… a shop in the game, **commission-only (10% of what each client who arrives through the game pays them; no clients, nothing to pay)**. Flag the fit; do not make this offer for me." Source: Sasha 2026-11-02, «ЭТО НАША СТРАТЕГИЯ».
- "an overlapping method can be a neighbouring building in the same village rather than a competitor."
- Partner lessons (Sasha 2026-10-24): "a partner uses the work themselves… a split follows actual contribution… who sells is settled on day one."
- Tone: "Inform and inspire only, with truth: no benefit bullets, scarcity, urgency or closing language." Grace = "precision, beauty and freedom"; the shadow is "capture, dependency". "Does this leave the person freer, with their own way out?"
- "Do not invite anyone to my live sessions or group programs; I send those invitations myself." Warm contacts are Sasha's alone.

**Other canon.**
- Strategy spine: "**collab = lead-gen = pilot**; lead with community-ecosystem precision matchmaking; warm relational door before any ask" (UB L1640).
- Vacant category: "Circle / Skool / Mighty hold the container half… None has coordination intelligence — who should meet whom" (UB L11240). The matchmaker becomes "installable node infrastructure (Oyi shape)".
- Recognition Round: "everyone receives proposed collaborations as a gift" (UB L1149; playbook L5344).
- Golden-age canon Face 2 links the 180° shift and "founder+AI ↔ founder+AI" matching to the brief and the proactive-matchmaker spec (golden_age_canon.md L69, L127).

**Genealogy.** 07-technology/matchmaking_engine.md (Jan 8): entity spine (Identity, Intent, Capacity, Need…); "Humans, missions, projects, and communities are **structurally comparable**". 06-architecture (Day 8): Offer↔Need match, parked.

## 2. What is built (code in the snapshot)

- **Live in code:**
  - Double opt-in. Migration `20260516214500_match_mechanic.sql`: `match_interests` and `match_intros`. Legacy `connections` dropped. Tracker DoD 10/10.
  - Active Intro (`20260519130000_active_intro.sql`): edge functions `send-match-headsup-email`, `match-consent` with an HMAC token and 6 confirmation pages, a 15-day decline view, a funnel view and an opt-out. DoD 14/14 plus 6 hardening fixes.
  - Engine v3 `suggest-asset-matches` (Vitest 24/24).
  - **Proactive Matchmaker** `proactive-match-proposal` (904 lines): a weekly email with one proposal naming the gift, Wednesdays 14:00 UTC.
- Proactive revisions (SoW addenda, 2026-07-11): 3-month decline cool-off, no silence pause, completeness gate dropped.
- **Inbound player referral** exists: `?ref=<game_profile uuid>` → localStorage → `game_profiles.invited_by` (src/lib/gameProfile.ts; migration 20260115). There is no outbound or partner attribution.
- `src/data/modules.ts` has a B2B "GENIUS-LAYER MATCHING" pilot module.
- **Not built:** project/ecosystem profiles, wants/needs (MM1), per-gift scoring (MM4, deferred), match-outcome capture, Meet/Café/chat (concept only), community filtering (§10).
- **Unverified:** whether Sasha ran the first-ten ritual gate. specs/match-mechanic/first_ten_ritual_gate.md is all unchecked; the tracker says "Completed: ____".
- **Stale or contradictory docs:**
  - roadmap.md L305 still shows MM2 as "🔴 [spec ready]", but the SoW addenda and the code say it shipped.
  - matchmaking_strategy §9/§10 still list Assets and QoL as "not yet used" and "QoL multiplier" as future, which contradicts v3 §4 ("wired… Day 80").
  - The body of ai_matchmaker_brief.md stops at v4.31, though its header points to v5.1.

## 3. Implications for Module 2 and the launch

**Reuse (don't respec):**
1. **Terms already exist in canon.** "Commission-only, 10% of what each game-sourced client pays, no clients nothing to pay" (Sasha 2026-11-02). Fits Maven's 90/10 (landing.md) and his no-equity rule. connector §5/README still ask for "the %": propose 10% for Sasha to confirm instead.
2. **Module cards = the parked "project layer" of §7.** Showing a partner module to a player is **person↔project matching**. The engine's inputs fit it: the player's Top Talent/mission against a card's "for whom / result". L0 places a card; later it is ranked per player.
3. **Gift vocabulary.** A partner module is a **Door** gift (access). Card copy and proposal emails can use the gift grammar.
4. **Proactive email rails.** The weekly cron, the 3-line grammar and the opt-out could later carry "one module worth a look". Mind §8.8: few items, never a list.
5. **Self-serve with no Sasha in the loop.** The HMAC magic-link and consent-page pattern (`match-consent`) is a ready no-login confirm for partner self-onboarding: submit link → AI drafts cards → partner confirms by magic link → card goes live. The first-ten ritual discipline should gate it the same way.
6. **Attribution.** Extend the existing `?ref=` / `invited_by` pattern outward: a partner link carries a player or partner id. Don't invent a second scheme.
7. **Revenue.** §8.9 community sponsorship and white-label are the ecosystem twin of L3.

**Where our drafts contradict or duplicate canon:**
- connector §5 treats terms as undecided. Canon already says 10% commission-only and «ЭТО НАША СТРАТЕГИЯ».
- connector "Related" cites ai_matchmaker_brief.md for "founder+AI ↔ founder+AI". The brief contains no such mechanic; only golden_age_canon L127 claims it.
- our_rack slots "Café → partner communities, events" and "Co-working → partner collaboration tools". Canon makes the Café a Meet-family mechanic with "no separate chat, feed or forum". Co-working hosts the person↔person matcher (/game/collaborate/matches); partner tools there would duplicate it. Keep partner slots in Academy and Market as drafted, plus "a building of their own" (v5.1 "Build in the village"). The brief frames that as a **building**, not a card in our building.
- landing headline "Players… come to your world to buy" sits close to "benefit bullets". It needs the "door outward / freer" tone check.
- connector L4 (shared profile) must pass the §0.5 data-moat test and the §8 privacy boundary: raw QoL, DoB and draft UBB never leave without explicit player consent. The drafts mention consent but not the moat.

**Launch (one mass message):**
- Canon tone rules apply: inform and inspire, no urgency or scarcity, every person keeps their own way out.
- §8 logic suggests the player side should be a door ("find your top talent → meet who fits"), not a pitch.
- Keep the partner side as simple as canon already is: "bring your practice/course; 10% only on clients the game sends; nothing otherwise."

**Gaps to close:**
- (a) Outbound attribution and sales reporting (none in code).
- (b) Module registry fields: owner, external URL, referral rule, level (our_rack §5).
- (c) A partner/project entity table. None exists, and §7 parks it, so Module 2 is the moment to un-park it, which needs Sasha's yes.
- (d) Player→module recommendation logic (not specced).
- (e) Will the matcher's thin pool support partner value? connector §7 already names "traction comes first". The proactive matcher dropped its completeness gate because the pool was 1 (SoW wave 4).
- (f) Run the ritual gate before strangers arrive.
