# The Game of Being You — Cult Spec: from 43 to 75 in six weeks

**Started:** 2026-10-30 · **Author:** Evolver (Hark), for Sasha's review
**Status:** v1 spec. No `src/` changes, no issues opened yet.
**Targets:** cult score **43 → 60 by Fri 2026-11-13 → 75 by Fri 2026-12-11**, horizon **85 by Sat 2027-01-30**.
**Grounded in:** `docs/02-strategy/game_of_being_you.md` (§7 golden thread, §13.2, §14.1 principles, §14.11 Lunar colour, §14.12a share card, §15 game masters, §15.7a two loops, §19 live audit and §19.8 wave rules), `docs/specs/ai-familiar/ai-familiar_tracker.md` (§15 design principles, §16 our AI), the Whole Map v-next (five primitives Gift · Step · Trace · Your AI · Room; seven notes Mirror · Initiation · Practice · Circle · Market · Village · Federation), the product × needs overlay (Hark drafts, 2026-10-30), live guest/signed-in/390 playtests of 2026-10-30 (Hark workspace notes), code at main 2026-10-30.
**Source gap:** the cult strategy audit file (`cult_strategy.md`) was not found in the Hark workspace when this spec was written. Its total (43/100) and main gaps (sacred reveal, community myth, sharing, rhythm) are on record; the per-ingredient baseline in §2 is **re-derived from the 10-30 playtest evidence** to sum to 43. Re-score both on the §3 rubric at the first walk.

---

## 0. Decisions baked in (don't re-litigate)

1. **The reveal starts with OUR in-game AI** ("Your AI" / «Твой ИИ» / «Tu IA»), cheap model, model never named. The player is never sent to their own ChatGPT; their own AI's text may be pasted *inside* our dialogue as optional context (Sasha, 2026-10-30). Being built now by the separate `our-ai-default` task (`YourAiDialogue`, deployed `library-advisor` function, no new deploy). This spec builds on it and does not duplicate it.
2. **Reveal frameworks unchanged** (Zone of Genius prompt, Appleseed, Excalibur) (Sasha, 2026-10-29).
3. **One word per thing.** The player's gift in product UI is **"top talent"**. Not genius, zone of genius, uniqueness, essence, archetype as UI labels.
4. **The retired word "organ/organs" is never used**, in UI or in this doc's descendants.
5. **Product UI in English**; /es and /ru get their language as text on the page (§19.8 rule 5).
6. **Growth without guilt** (ai-familiar §15.4): no streaks, decay, penalties for absence, dying pets.
7. **Progress shows in the world, never in personal numbers** (§14.1.7). The level stays private. Village-level numbers (residents' income; see fork F1 for the window count) are the only public ones.
8. **Lovable credits only with Sasha's permission.** Every credit item is a row in the Hark Lovable batch, not run.
9. **Wave rules (§19.8):** one wave = one feeling, one number, ≤5 items; done = live walk (guest + signed-in, 390 + desktop, screenshots); re-score after every wave.

---

## 1. The thesis in one paragraph

Cult games give you **one moment you would tell a friend about**, make you **someone** in a **world that remembers you**, put that world on a **shared clock**, and let you **show your mark** to people who then come to make their own. Today the game has the world (title light, village, real moon, prophecy-like closed lines) but the flagship moment, the reveal, ends under an email form in a village that does not change, nobody else is visible, and the share artifact carries no link back. The fix is one signature moment, **Light a Window**, that every other ingredient hangs on: your window lights in a dark village, it has a number, others lit before you, it is stamped with tonight's moon, and the card you share carries all three plus a door back in.

Journey: the light at Reception becomes your light (Mirror → Initiation). Animal Crossing: the real moon. Wordle: a numbered, shareable, spoiler-free mark. Sky: you light candles, others' lights are around you. Pokémon GO: the world map fills with real people's marks.

---

## 2. Target per ingredient (now → 2 weeks → 6 weeks → 3 months)

Each ingredient is scored 0–10 on the rubric in §3; total = sum (max 100).

| # | Ingredient | Now | 2 wk (11-13) | 6 wk (12-11) | 3 mo (01-30) | What moves it |
|---|---|---|---|---|---|---|
| 1 | Sacred moment | 4 | **7** | 8 | 9 | Light a Window after the reveal (W3); email form moved after the moment (W5); Your AI dialogue makes the reveal felt, not a form (dependency) |
| 2 | Initiation | 5 | **7** | 8 | 9 | No SaaS fork / prompt exile at Reception (dependency + W1); window = becoming a resident; "I already live here" stays |
| 3 | Identity | 6 | **7** | 8 | 9 | One player name everywhere (W2); window number as a name, not a score; crystal on the card (W6) |
| 4 | Visible trace | 4 | **6** | 8 | 9 | Your window stays lit on the map, guest and signed-in (W8); lit-under-moon stamp; 6 wk: particles at your window |
| 5 | Ritual & rhythm | 5 | **6** | 8 | 9 | New Moon Circle on Nov 9 with the Mastermind (W9); 6 wk: Full Moon Harvest Nov 24, one ritual action per phase |
| 6 | Sharing & social proof | 3 | **6** | 7 | 8 | Crystal Card window variant with moon + number + ref link, image share on phone (W6); ref arrival line (W7) |
| 7 | Mystery & lore | 6 | 6 | 7 | 8 | Hold what works (closed lines, moon, skins); 6 wk: "How this village began" room, season names |
| 8 | Own words | 4 | **7** | 8 | 9 | Voice sweep of the first 10 minutes (W1): no prices, no "Genius Business", no "profile for matching", /ru and /es in their language (#239) |
| 9 | Community myth | 2 | **4** | 7 | 8 | Others' windows glow on the map (W8); "N−1 lit before you"; 6 wk: founder's window #1, particles readable at windows, The Originals in the village |
| 10 | Creator story | 4 | 4 | 6 | 7 | 6 wk: Sasha as first resident, Evolver's public diary as a place in the village; 3 mo: the residents' story told by residents |
| | **Total** | **43** | **60** | **75** | **85** | |

**Why the baseline numbers** (evidence, 10-30): (1) splash light is a real sacred beat, but the reveal was either instant and syntactic (guided path) or ~6 minutes away in another app (prompt path), and lands under a lead form; (2) title → Reception → "Welcome, guest" is an initiation, broken at "Which way? Let's create your profile for matching"; (3) top talent card + crystal + character, but the player is shown as nothing / "ALEKSANDR" / "Aleksandr Konstantinov" / "guest" across screens and the rail's music credit «Umza · Montoya» reads as a player name; (4) Lunar colour on done places exists for signed-in players, a guest's village does not change after the reveal; (5) the real-moon sky and line are live (`villageSky.ts`), with nothing to *do* by the moon; (6) talent card PNG without a tracked link, QoL share text-only, Instagram a stub, no other players visible; (7) closed lines read like prophecy, Aurum/Lapis, Fifth Element; (8) "$37 power-up" in the rail from minute 1, "Genius Business" logo in the assessment, English on /ru; (9) zero residents on the guest path; The Originals gallery and particles exist deep in; (10) the founder's story only leaks (his Day-67 prompt, his profile line at Reception without a label).

---

## 3. How we measure the cult score (re-scorable rubric)

**Who scores.** Two scorers per walk: Hark (playtest skill) + one human who has never played (a first-timer from Sasha's circle or a paid tester). Score each ingredient separately, then average the two; disagreements >2 points get one line of reasoning in the walk log. A score needs **evidence** (screenshot or verbatim copy) from the walk.

**What a walk is.** Fresh browser, guest, phone 390×844, from `findyourtoptalent.com/` through the reveal, the window, the share, a return visit the next day; then the same as a signed-in player on desktop 1920; then `/ru/` and `/es/` first 3 screens. Same path every time.

**Anchors** (score the highest anchor fully met; in between = interpolate):

| # | 0 | 3 | 5 | 7 | 10 |
|---|---|---|---|---|---|
| 1 Sacred moment | none | a nice screen | one beat that slows the player down | a beat with sound/light/stillness that the first-timer mentions unprompted afterwards | the first-timer retells it to someone else within a day |
| 2 Initiation | sign-up form first | a tutorial | a threshold the player crosses by an act | crossing changes the player's status in the world ("resident") and the world says so | players use the insider status words themselves |
| 3 Identity | anonymous | a result label | a named result the player recognises (rates ≥7/10 "sounds like me") | one consistent name + top talent + mark on every screen | players introduce themselves by it outside the game |
| 4 Visible trace | nothing persists | saved on account only | the world shows one change after the first act | every finished step leaves a mark in the world, guest included, visible on return | others can see and answer your marks |
| 5 Ritual & rhythm | none | a reminder email | a shared clock visible in the world (moon) | a shared clock with something to do at each phase, and one live event per cycle | players come back *for* the phase without being reminded |
| 6 Sharing & social proof | nothing to share | text share | an image card with identity | an image card with identity + a door back in (tracked), works on phone in 2 taps | measurable arrivals from cards (≥1 new player per 10 cards shared) |
| 7 Mystery & lore | flat | a name for the world | closed places with what's inside | lore that rewards a second look (lines change with phase or progress) | players theorise / ask about it |
| 8 Own words | SaaS copy | game nouns on SaaS copy | game voice on the main path, breaks after minute 5 | no spell-breaker (§5 list) on any screen of the walk, in all three languages | the vocabulary is used by players |
| 9 Community myth | alone | a testimonial | a count or sign of others | others' marks visible in the world + a shared origin (who came before) | residents tell each other the village's story |
| 10 Creator story | invisible | an About page | the creator's line inside the world, labelled | the creator is a resident with a visible window/trace and a story of why the village exists | the creator's story and the players' stories are one story |

**Corroborating behaviour** (does not change the score, tells us whether the judged score is real). Events listed in W10. Week-1 values set the baseline; targets below are hypotheses to adjust after week 1:
- Window lit / reveal finished ≥ 90% (the moment does not leak).
- Window kept (email) / window lit: baseline week 1, then +25% relative vs the current email-under-card rate.
- Card shared / window lit ≥ 15% by 6 weeks.
- Ref arrivals that reach their own window ≥ 1 per 10 shares by 6 weeks.
- Returned within the same moon phase / kept windows: baseline week 1.

**When.** Re-score Thu 11-12 (after wave 2), Thu 11-26 (after full moon), Thu 12-10 (6 weeks). Log each walk under §11 of this file.

---

## 4. The signature moment: Light a Window

**Feel:** "The village saw me. I am the Nth light. I want someone to see it."
**Where it sits:** right after the top talent reveal (any path: Your AI dialogue, guided assessment), before any email.
**Rule:** the window lights **for everyone**, guest included, before anything is asked. Email comes only after, to *keep* it lit.

### 4.1 Flow and timing

```
Reveal card ──(4 s, or tap)──► "Light my window" ──► S1 Ignite (≈6 s) ──► S2 Keep it lit ──► S3 Crystal Card
                                                                     └─ Not now ──► Village (window lit, on device)
```

| t | What happens | Reduced motion |
|---|---|---|
| reveal + 0 s | Top talent card as today (frameworks unchanged), **without** the email form underneath | same |
| reveal + 4 s | one line fades in under the card + the one button | appears at once |
| tap | S1: cross-fade (600 ms, `--motion-*` tokens) to the village at night, camera on the houses ring; every window dark except a few faint ones (others) | cut, no zoom |
| S1 + 0.8 s | the player's window ignites: warm core grows (900 ms ease-out), glow ring breathes once (1.2 s); colour = player's soul colour when known, else warm gold | window shown lit |
| S1 + 2.6 s | number fades in above the window | shown |
| S1 + 3.6 s | "before you" line | shown |
| S1 + 4.6 s | moon line | shown |
| S1 + 6.0 s | S2 panel slides up from the bottom (400 ms) | shown |
| any tap during S1 | jumps to the end state of S1 (never skips S1 entirely) | — |

No count-up animation on the number (calm, not a slot machine). No sound by default; if the playlist is playing, it ducks for 2 s during the ignite.

### 4.2 Screens and copy (English; es/ru keys in the same PR)

**S0 · under the reveal card**
- Line: *"Your top talent is known. One window in the village is waiting for it."*
- Button: **Light my window**

**S1 · Ignite** (full-bleed village night, no rail, no chat launcher)
- Number: **Window #{{n}}**
- Line 1: *"{{n−1}} windows were lit before yours."* (n = 1: *"Yours is the first light in the village."*)
- Line 2 (moon at the moment of lighting): *"Lit under a {{phaseWords}}."* where phaseWords ∈ `new moon` · `growing moon` · `full moon` · `waning moon` (from `getVillageSky().phase`; same buckets as the sky line)

**S2 · Keep it lit** (bottom panel)
- Title: **Keep your window lit**
- Body: *"Right now your light lives on this device. Leave your email and it stays lit wherever you open the game. We send two short emails, and stop if you don't answer."*
- Optional field: *"What should the village call you?"* placeholder `First name` (only if fork F2 = yes)
- Field: `your@email.com` · Button: **Keep it lit** (disabled until valid; hint under it while disabled: *"An email, so we can send you the link."*)
- Secondary link: *Not now, walk the village*
- Signed-in player: S2 is skipped (already kept); goes to S3.
- After **Keep it lit**: *"Your window is yours. A link is on its way to {{email}}."* → S3.

**S3 · Crystal Card** (after keep, or from the village later; never before S1)
- Title: **Show someone your light**
- The card (image, 1080×1350, also rendered on screen):
  - the player's crystal (Home's crystal image; fallback: the Lunar crystal glyph)
  - name (if any) · top talent in one line (the card's gift line per §14.12a: uniqueness phrase → tagline → top talent)
  - **Window #{{n}}** · moon glyph + *"lit under a {{phaseWords}}, {{Month YYYY}}"*
  - the question *"Do you see me this way too?"* (§14.12a)
  - link text `findyourtoptalent.com/w/{{n}}` + QR (both carry `ref`, see §4.5)
- Buttons: **Share** (system share sheet with the image file + text + link) · **Save image** · **Copy link**
- Share text: *"Window #{{n}} in the village is mine. My top talent: {{talent}}. Do you see me this way too? {{link}}"*
- Secondary: *Back to the village*

**Village after the moment**
- Your window stays lit on the map (all skins; in Lunar it carries your colour, §14.11).
- Next-move card: guest not kept → *"Keep your window lit"* (opens S2); kept → the next Journey step as today.

### 4.3 States

| State | Trigger | Shows |
|---|---|---|
| A · numbered | `light_window()` returns `{n, lit_at, phase}` | full S1 |
| B · unnumbered | RPC missing (migration not applied), offline, or 2 silent retries failed | S1 without number and without "before you": *"Your window is lit."* + moon line. Card without number. No error text. |
| C · returning guest | lit window token on device | title screen *"Welcome back. Your window is still lit."* + **Continue** (#240's returning-guest line, extended); village shows it lit |
| D · existing player | had a saved top talent before launch | backfilled number (by first saved snapshot date); on next village visit once: *"Your window was lit on {{date}}, under a {{phaseWords}}."* + **See my card** |
| E · retake / new reveal | player already has a window | no new number, ever; S0 button reads **Back to my window**; S1 replays the glow with the same number |
| F · second device, guest | no token | lights a new window (honest: a guest light is per device); merging on sign-in keeps the **lowest** number and releases the other |
| G · ref arrival | visitor opens `/w/{{n}}` or `?ref=` | §4.5 |
| H · /es, /ru | locale | all copy from keys; moon words translated as images (village.sky convention) |

### 4.4 Phone 390 px

- S1 is full-bleed (`100dvh`), village image `object-fit: cover`, the player's window placed at ~38% height, centred; text block anchored bottom with `env(safe-area-inset-bottom)` + 24 px.
- Text: number 32 px, lines 17 px, ≥4.5:1 contrast on the night image (scrim gradient bottom 40%).
- Buttons full width minus 2×24 px, height ≥ 48 px. Chat launcher and rail hidden on S0–S3 (fixes the Fitts finding).
- S2 panel max 60% height, keyboard-safe (panel scrolls, button stays visible above the keyboard).
- Share on iOS/Android: `navigator.canShare({files})` → share PNG; else download + copy text. No horizontal scroll at 320–430 px.
- Screenshots at 390 of S0, S1 (A and B), S2, S3, village-after, returning title are part of every DoD.

### 4.5 Window link and ref

- Each window gets a public link `findyourtoptalent.com/w/{{n}}` (numbers are public by design) plus `ref={{window_token}}` for attribution (token, not the number, so arrivals count once per sharer).
- `/w/{{n}}` (visitor): the night village, one lit window. *"Window #{{n}} is lit{{, by name}}. Top talent: {{talent}}."* · *"Do you see them this way too?"* (if the share-card reflections table exists, the three answers of §14.12a; else hidden) · **Light your own window** → the wordless first minute (`/`) with ref kept in session.
- Privacy: `/w/{{n}}` shows only name (if given) + top talent + moon stamp. Never level, QoL, email, talents list.

### 4.6 Data (proposed, not applied; needs Lovable)

```sql
-- Proposed. Applied only through a Lovable migration with Sasha's yes (credit row in the Lovable batch).
create table public.village_windows (
  n            bigint generated always as identity primary key,  -- the window number
  token        uuid not null default gen_random_uuid() unique,  -- ref + device claim
  user_id      uuid references auth.users(id),                  -- null for a guest light
  display_name text check (char_length(display_name) <= 40),
  top_talent   text check (char_length(top_talent) <= 120),
  lit_at       timestamptz not null default now(),
  moon_phase   text not null check (moon_phase in ('new','waxing','full','waning')),
  released     boolean not null default false
);
alter table public.village_windows enable row level security;  -- no direct access; functions only
-- light_window(p_top_talent text, p_phase text, p_token uuid default null) returns (n, token, lit_at, moon_phase)
--   security definer; idempotent per token and per user_id (state E); rate limit 3 lights / IP-hash / day.
-- claim_window(p_token uuid) -- on sign-in: attach, keep the lowest n, release others (state F).
-- lit_windows_count() returns bigint -- public, counts not released.
-- window_public(p_n bigint) returns (n, display_name, top_talent, lit_at, moon_phase) -- public projection for /w/n.
-- Backfill (state D): one row per user with a saved top talent, ordered by first zog snapshot date.
```

Until it is applied, the client runs in state B everywhere (no fake numbers, ever).

---

## 5. Voice rules of the game (what keeps and what breaks the spell)

**Keeps it.** Second person, quiet, ceremonial-plain: *"the talent that is yours"*, *"I already live here"*, *"Inside: …"*. Places, not features. One button named after what it gives. Light and glow on every opening (ai-familiar §15.1).

**Breaks it** (each is a test in W1 or W10; zero tolerance on the guest walk):

| # | Spell-breaker | Where today (10-30) | Rule |
|---|---|---|---|
| 1 | **Prices in the first 10 minutes for guests** | rail "✦ Find out how to monetize your top talent (power-up, $37)" from minute 1; Mastermind $222, $555 session | no price on any screen a guest sees before their window is lit; the Mastermind place may show its price only inside the place, after the window |
| 2 | **"Genius Business" logo** | `ZoneOfGeniusAssessmentLayout.tsx` (`ignite-logo.png`), `ExcaliburDisplay`, product-builder | not on any game route; the game frame (YOU — be original / village) instead |
| 3 | **"Profile for matching"** | `zogEntry` preamble *"Let's create your profile for matching. Good news: AI makes it real quick."* | gone; Reception speaks in the village voice |
| 4 | **Three names for the player** | nothing / "ALEKSANDR" / "Aleksandr Konstantinov" / "guest" after sign-in; music credit «Umza · Montoya» read as a name | one display-name function; guest = "you"; music credit labelled *Now playing* |
| 5 | **English on /ru (and /es)** | `/ru/` first screen, village, Your AI, Mastermind | Russian/Spanish text on the page (#239) |
| 6 | Sending the player to another AI | "Copy this prompt into your AI" | replaced by Your AI dialogue (dependency) |
| 7 | Internal words | "AI OS 5.2", "J8", "ACADEMY · STEP 10", "19 of 19 Workshop pieces" | none on game routes (§14.1.10) |
| 8 | Lock vocabulary | "locked", "unlock", "paywall", "coming soon" | the picture says it (§14.1.5); "Not open yet" stays |
| 9 | Guilt mechanics | — (keep it so) | no streaks, decay, "you missed", countdown pressure |
| 10 | Two words for one thing | top talent / genius / zone of genius / uniqueness | "top talent" only; "organ/organs" never |
| 11 | A personal number in public | — | level stays private; the window number is a name, not a rank |

---

## 6. Lunar rhythm

**Verified phases** (timeanddate.com, Mexico City, CST = UTC−6, no DST): https://www.timeanddate.com/moon/phases/mexico/mexico-city?year=2026

| Phase | Date and time (CST) | In the game |
|---|---|---|
| Third quarter | Sun Nov 1, 14:28 | waning: *"The moon wanes. Digest."* (live) |
| **New moon** | **Mon Nov 9, 01:02** | **New Moon Circle**: the Mastermind (Nov 9–10) is the village's fire; season 1 begins (fork F3) |
| First quarter | Tue Nov 17, 05:47 | growing: *"The moon is growing. Build."* |
| **Full moon** | **Tue Nov 24, 08:53** | **Full Moon Harvest** (6-wk scope); first live circle in San Pancho per §16.5 |
| Third quarter | Tue Dec 1, 00:08 | waning |
| New moon | Tue Dec 8, 18:51 | season 2 begins |
| Full moon | Wed Dec 23, 19:28 | harvest 2 (supermoon) |

The sky reads phase from `getVillageSky()` (one source: `getLunarState`); nothing here adds a second moon calculation. Phase buckets are the app's own (new / waxing / full / waning windows), so "new moon" in the game spans its whole window around Nov 9, not one instant.

**One thing to do per phase** (6-week scope, all optional, no streaks):
- New: Your AI asks one question, *"What do you let go of this moon?"*; the answer stays private in the trace.
- Growing: the Quest Board's next step is framed as *this moon's step*.
- Full: **Harvest**: the village shows every window lit this moon brighter; the player gets a one-line harvest from Your AI (what they did this moon) and may share it.
- Waning: **Digest**: Your AI reads the player's trace back in three lines.

**In 2 weeks** only the New Moon Circle (W9) and the lit-under-moon stamp (W3/W6) ship.

---

## 7. Two-week scope: work packages (ordered; one @claude issue / PR each)

Each WP: small diff, en/es/ru keys in the same PR, unit tests where logic, **DoD = live walk** (guest + signed-in, 390 + 1920, screenshots) and "what the player feels". Build/test locally before merge (§19.8 rule 4); commits touching docs only use `[skip ci]` until Nov 1.

**Dependencies already in flight (not duplicated):** `our-ai-default` (Your AI dialogue as the reveal door); #239 (es/ru text); #240 (returning guest + closed-place next step); #241 (one truth: level, next move, name); the P0 "Home and Workshop never load" regression found on 10-30 must be fixed first, since the window must show on Home.

### Wave 1 · Oct 31 – Nov 6 · feeling: "My light is seen." · target ≥ 52

| WP | Title | What (scope) | Files (likely) | Done when (+ live walk) | Lovable? |
|---|---|---|---|---|---|
| W1 | Voice sweep: the first ten minutes | hide the $37 power-up rail item for guests until a window is lit; replace the Genius Business logo on game routes with the game frame; replace the "profile for matching" preamble with a village line (*"Reception knows every light in the village. Yours is next."*); add a locale test that fails on spell-breaker strings (§5 #1–3, #7, #10) on game routes in en/es/ru | `SpacesRail.tsx`/rail data, `ZoneOfGeniusAssessmentLayout.tsx`, `ZoneOfGeniusEntry.tsx`, `src/locales/*/common.json`, new test | guest walk 390: no price, no Genius Business, no "profile for matching" before the window; test green | no |
| W2 | One player name | one `displayName()` (first name from profile → given window name → none); guest copy says "you", never a stranger's name; signed-in never "guest"; music credit labelled *Now playing*; Reception founder line labelled *left by the founder* | rail footer, Reception foyer, Home, `useCharacterSheet` | the same name on rail, Home, Reception, card in a signed-in walk; guest sees no name | no (fold into #241 if still open) |
| W3 | Windows data, proposed | the SQL of §4.6 as `docs/specs/cult/village_windows.proposed.sql` + a client adapter `src/lib/villageWindows.ts` (`lightWindow()`, `claimWindow()`, `windowCount()`, probe returning state B when the RPC is missing) + tests; nothing applied | new lib + doc | adapter tests cover A/B/E/F; app behaves in state B live | **migration later (batch row 2)** |
| W4 | Light a Window, the moment | S0 + S1 per §4.1–4.4: button under the reveal card, ignite scene, number/before/moon lines, reduced motion, tap-to-finish, 390 layout, chat launcher hidden; state B live today | reveal screen (`Step4GenerateSnapshot` / Your AI reveal), new `LightWindow.tsx`, `villageSky.ts` (read only), motion tokens | guest walk 390 + 1920: window lights within 1 s of tap, copy exact, screenshots A (staging) and B (live) | no |
| W5 | Keep it lit: the email after | move "Save your character" from under the card to S2 after the moment; same save flow, new copy; signed-in skips S2; next-move card "Keep your window lit" for unsaved guests | save panel component, `placeState.ts` next-move copy | no email field visible before S1; keep → link email arrives; village next move correct | no |

### Wave 2 · Nov 7 – Nov 13 · feeling: "The village breathes with the moon, and I can show my light." · target ≥ 60

| WP | Title | What (scope) | Files (likely) | Done when (+ live walk) | Lovable? |
|---|---|---|---|---|---|
| W6 | Crystal Card: the window variant | extend `buildShareCard()` with a window variant (crystal, number, moon stamp, question, `/w/n` link + ref QR); one builder, old surfaces untouched beyond the reveal; phone image share via `navigator.share({files})` | `src/lib/shareCard.ts`, `ShareCard.tsx`, `CardActions` | at 390 iOS + Android emulation: Share opens with the image; card shows number (A) or not (B); ref in link and QR | no |
| W7 | Window link and ref arrival | `/w/:n` public page per §4.5 (state B: route shows the village + **Light your own window**); `?ref=` kept through the first minute and recorded on the newcomer's lighting | `App.tsx` route (before `/:username`), new page, session ref | a ref visitor reaches their own window with ref recorded (event) | no (reads `window_public` once applied) |
| W8 | Lit windows on the map | the player's window lit on `/village` (all skins; Lunar colour); others' windows as faint ambient glows sized to `windowCount()` (no names, no number on the map); returning-guest title line (state C) | `Village.tsx/.css`, `GameTitle.tsx` | guest returns next day: title greets, own window lit; ≥ several faint others visible (B: own only) | no |
| W9 | New Moon Circle (Nov 9) | when `getVillageSky().phase === "new"`: Mastermind fire lit on the map and in the rail, line *"New moon. The circle gathers."* + the Mastermind door (price inside the place only); season stamp on windows lit this lunation | `villageSky.ts` (copy), `Village.tsx`, Mastermind place | on Nov 8–10 live: fire lit, line shows; after the window, back to normal; no date hardcoded | no |
| W10 | Measure: events + re-score walk | events `window_lit`, `window_kept`, `card_shared`(channel), `ref_arrival`, `ref_window_lit`, `returned_same_phase` through the app's existing event logging (WP confirms which); re-score walk Nov 12 on §3 rubric, logged in §11 | event helper, this doc §11 | events visible for one real walk; two scorers' sheets in §11; total ≥ 60 or the gap named | no |

**Order rule:** W1 → W2 → W3 → W4 → W5 (wave 1), then W6 → W7 → W8 → W9 → W10. W9 must be live by **Sun Nov 8 evening CST**. If a wave slips, the next one is cut, not stacked (≤5 open WPs).

---

## 8. Six-week scope (Nov 14 – Dec 11), to 75

1. **Full Moon Harvest, Nov 24** (rhythm, community): windows lit this moon glow brighter; Your AI one-line harvest; harvest card share; live circle in San Pancho the same night.
2. **Founder as first resident** (creator story, myth; fork F4): window #1 with Sasha's line, a short "How this village began" room told by Evolver (the public diary) and Sasha.
3. **Particles at windows** (trace, community): WP-17's particles readable at the window they were left at; visitors to `/w/n` can leave one (named, no anonymity).
4. **The Originals into the village**: the founders' gallery as lit windows with their glyphs, not a separate page.
5. **One ritual per phase** (§6) through Your AI; seasons named (fork F3).
6. **QoL share as an image with ref** (sharing): same builder, private numbers never on it (shows areas only if the player opts in).
7. Presence light (WP-21) as a soft glow when another resident is in the same place.

## 9. Three-month horizon (to 85)

Residents' income visible as the village's one public number; a second village (federation seed) shown as a far light; Your AI reads the line across moons; residents tell the origin story in their own words (myth by players, not by us).

---

## 10. Acceptance criteria (the spec is done when)

1. Guest on 390: `/` → reveal (Your AI path) → window lit, with **no price, no "Genius Business", no "profile for matching", no email field** before S1. Verified by the W1 locale test + walk screenshots.
2. The window lights ≤ 1 s after **Light my window**; S1 completes ≤ 7 s; reduced-motion users see the end state at once.
3. State B works live with no number shown and no error text; state A numbers equal `lit_windows_count()` at the moment of lighting (never a fake or padded number).
4. A retake never creates a new number (test).
5. The Crystal Card image carries number (A), moon stamp, question and a ref link; on phone the system share sheet opens with the image.
6. A ref visitor who lights their own window is attributed (event `ref_window_lit` with the sharer's token).
7. On Nov 8–10 CST the village shows the New Moon Circle without any hardcoded date.
8. es/ru: every string of S0–S3, `/w/n` and W9 in Spanish/Russian on the page.
9. Re-score walk Nov 12: **≥ 60** by two scorers, no ingredient below 4; walk log in §11.
10. No streak, decay or absence penalty anywhere (review checklist).

---

## 11. Walk log (append each re-score)

| Date | Scorers | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Total | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-30 | Hark (re-derived from playtests) | 4 | 5 | 6 | 4 | 5 | 3 | 6 | 4 | 2 | 4 | 43 | baseline; per-ingredient split re-derived, source audit file not found |

---

## 12. Credit items (Lovable, only with Sasha's yes)

| Item | Why only Lovable | Est. | Note |
|---|---|---|---|
| `village_windows` migration (§4.6: table, `light_window`, `claim_window`, `lit_windows_count`, `window_public`, backfill) | DB is Lovable Cloud; DDL only via Lovable agent migration | ~1 credit | can ride in the same Lovable prompt as the pending share-card `player_reflections` migration, so both land for ~1 credit |

Everything else in §7 is client code (`src/`) through @claude PRs and the free Lovable publish.

---

## 13. Open forks for Sasha (Hark's recommendation each)

1. **F1 · Public count "N−1 lit before you".** Rec: **yes**, honest count incl. backfill of everyone who saved a top talent; it is the village's number, like residents' income, never a personal rank. Amend §14.1.7 to "personal numbers private; village numbers public".
2. **F2 · Player name.** Rec: **first name**, asked once and optional at "Keep it lit" (*"What should the village call you?"*); guest without it = "you"; the character name is not a second name.
3. **F3 · Season = lunar month.** Rec: **yes**: season 1 starts at the new moon Mon Nov 9 01:02 CST with the Mastermind; seasons numbered ("the first moon of the village"), not borrowed US moon names.
4. **F4 · Sasha visible as first resident.** Rec: **yes**: window #1 is yours, with your line *"Nothing to add to what is."* labelled *left by the founder*; fixes today's unlabelled line at Reception and opens the creator story.
5. **F5 · The windows migration (~1 credit).** Rec: **yes, after wave 1 is live in state B**, in one Lovable prompt together with the share-card reflections SQL.
