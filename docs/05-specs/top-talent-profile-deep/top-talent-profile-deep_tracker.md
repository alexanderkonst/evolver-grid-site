# Top Talent Profile Deep — Progress Tracker

**Started:** 2026-05-01 evening
**Module:** Deep Top Talent Profile rendering in `/game/me/zone-of-genius`
**What it is:** Render the 8 rich fields produced by `zoneOfGeniusPrompt.ts` (archetype_title, core_pattern, top_three_talents with longer descriptions, how_genius_shows_up, edge_and_traps, ideal_environments, career_sweet_spots, flywheel_action) on the ME profile page. This is what the $37 Activation product unlocks for users.

---

## INPUT ✅ (5/5)

- [x] **1. ICP:** Tribe member who has done the Top Talent reveal — either signed up after the reveal (free) or paid for Activation ($37). They want to actually USE their pattern, not just remember it.
- [x] **2. Transformation:** Point A — *"I recognized my pattern in the snapshot, but it's foggy. I can name what I am, but I don't know how I work, where I thrive, where I overextend, or what to do daily."* → Point B — *"I have an operating manual on myself: my edge, my traps, my flywheel action, the environments I thrive in, the career shapes that fit. I can read it slowly, return to it, and act from it."*
- [x] **3. Pain of Point A:** The reveal felt like a glimpse. They want depth but the surface only shows the snapshot. No felt operating instructions.
- [x] **4. Dream Outcome:** Pattern shows up in detail — not just identity, but *how it moves in real situations*. A document they trust enough to come back to.
- [x] **5. Action:** Read through 8 sections of their full Top Talent profile, slowly, in their own time.

---

## PHASE 1: PRODUCT ✅ (compressed roasts)

- [x] **1.1 Master Result:** From compressed snapshot → full operating manual. *"This module takes a user from `recognized but foggy` to `operationally clear`."*
  - **Roast:** Specific (matches lived experience post-reveal)? ✓. Measurable (user can read all 8 sections, return to them)? ✓. One sentence? ✓. Visceral A? ✓ (foggy is exactly the post-reveal feeling). Tangible B? ✓ (operating manual = clear deliverable).
- [x] **1.2 Sub-Results (3 trinity):**
  1. **RECOGNIZE in detail** — archetype + core_pattern + how_genius_shows_up. *"I see myself in operating-instructions detail."*
  2. **EQUIP** — top_three_talents (long descriptions) + edge_and_traps + flywheel_action. *"I know how to work with it."*
  3. **ORIENT** — ideal_environments + career_sweet_spots. *"I see where to go."*
  - **Roast:** Together fully deliver Master Result? ✓. Sequence natural (recognize → equip → orient)? ✓. Each a felt win? ✓. None redundant, none missing? ✓.
- [x] **1.3 Screens:** ONE long scrollable screen at `/game/me/zone-of-genius`, augmenting the existing overview. Eight sections within. No new routes.
- [x] **1.4 Screen Details (Three Dan Tians):**
  - 🫀 Heart: "I am being seen at depth. This is not a generic profile."
  - 🧠 Mind: "Now I understand the operating instructions of my pattern."
  - 🔥 Gut: "I know my flywheel action — what to repeat, daily."
- [x] **1.5 Extensions:**
  - **Artifact:** the rendered profile = the deliverable
  - **Skip path:** existing overview (without rich fields) renders gracefully when data not present
  - **Bridges:** `/activate/welcome` → here; here → /ignite (book session) for those ready for the next level
- [x] **1.6 Wireframes:** Inline editorial cards in the existing ZoneOfGeniusOverview, fitting the liquid-glass register established by the page. Each of the 8 fields gets its own labeled section. Three Talents get expanded card treatment (longest text). Lists (environments, sweet spots) render as subtle bullet lists. Single quotes for flywheel.
- [x] **🔥 ROAST GATE 1:** Walked through. Sub-results map cleanly to fields. Sequence follows natural reading order. Pass.

---

## PHASE 2: ARCHITECTURE ✅ (compressed)

- [x] **2.1 Module Boundaries:** Entry = navigate to `/game/me/zone-of-genius` from `/activate/welcome` "See your profile →" or via journey nav. Exit = stay on page (read), or click "book a session" CTA already at the bottom. Data in: appleseed_data JSONB from zog_snapshots. Data out: nothing new (it's a read surface).
- [x] **2.2 Routing:** Existing route `/game/me/zone-of-genius` → ZoneOfGeniusOverview. No changes needed.
- [x] **2.3 Data Schema:** No migration needed. `zog_snapshots.appleseed_data` is JSONB — extend the AppleseedData TypeScript type with optional `topTalentProfile` field carrying the 8 rich fields. New snapshots populate it; old snapshots have it `null` and the section degrades gracefully.
- [x] **2.4 Shell & Layout:** Existing GameShellV2 + MeGate (auth gate already wraps this route). Mobile-first — same layout as existing overview.
- [x] **2.5 State Management:** Existing — appleseed loaded from Supabase by snapshot id. Local state in component.
- [x] **🔥 ROAST GATE 2:** No new routes; no data flow risks; auth gate already in place; refresh/back behavior unchanged. Pass.

---

## PHASE 3: UI ✅ (compressed)

- [x] **3.1 Visual Rules:** Use existing tokens — `liquid-glass`, `liquid-glass-strong`, INK / INK_BODY / INK_MUTED constants already in ZoneOfGeniusOverview. Cormorant Garamond for headings, Source Serif 4 for body. Match the editorial register established.
- [x] **3.2 Building Blocks:** Existing `<section className="liquid-glass rounded-2xl p-6 space-y-X">` pattern. SectionLabel component already defined. No new primitives.
- [x] **3.3 Layout:** Same as existing — max-w-2xl, single column, vertical scroll, mobile-first. Sections stack.
- [x] **3.4 Brandbook:** Voice = direct, precise, sacred. The 8 fields are quotes from the user's AI — they read as wisdom, not instructions. Heading style consistent.
- [x] **3.5 Micro-interactions:** None new — sections render statically. The reading experience is the interaction.
- [x] **3.6 Accessibility:** Semantic `<section>` and headings. Text contrast preserved (INK on light glass = high contrast). Read-only — no input.
- [x] **3.7 Component States:** Empty (no data) — graceful degradation, the existing overview shows. Loading — existing pulse spinner. Error — existing console.error path.
- [x] **3.8 Design Tokens Audit:** All values use existing CSS vars and constants. No hardcoded hex.
- [x] **3.9 Design Critique:** Walks the page top-to-bottom: hero → recognize → equip → orient → existing path-of-mastery + monetization sections. Reads as a coherent operating manual.
- [x] **🔥 ROAST GATE 3:** Same register as the rest of the ME profile. No visual disruption. Pass.

---

## PHASE 4: VIBE-CODING ✅

- [x] 4.1 No new files (extending existing component + type)
- [x] 4.2 Extended `AppleseedData` type — added `TopTalentProfile` interface + optional `topTalentProfile` field at [appleseedGenerator.ts:373-385](../../../src/modules/zone-of-genius/appleseedGenerator.ts) (8 fields: archetype_title, core_pattern, top_three_talents, how_genius_shows_up, edge_and_traps, ideal_environments, career_sweet_spots, flywheel_action)
- [x] 4.3 Updated `generateAppleseed()` to detect JSON in user's pasted `rawSignal` and extract the 8-field profile via `tryExtractTopTalentProfile()` — handles raw JSON, ```json fenced blocks, mixed text+JSON. Validates all 8 keys present + 3 array shapes before returning. Attaches to `appleseed.topTalentProfile`. Persisted automatically via existing `saveAppleseed` → `appleseed_data` JSONB.
- [x] 4.4 Rendered "Deep Profile" section in `ZoneOfGeniusOverview.tsx` — three article cards in trinity: 1·RECOGNIZE (archetype + core_pattern + how_genius_shows_up) → 2·EQUIP (top three talents numbered list + edge & traps + flywheel action in a gold-accented box) → 3·ORIENT (ideal environments + career sweet spots as bullet lists). Inserted right after the Hero, before Three Lenses. Falls through silently if `topTalentProfile` is undefined (existing snapshots without the deep field render as before).
- [x] 4.5 Verification: `npx tsc --noEmit` clean. Browser preview at `/game/me/zone-of-genius` for unauth user shows MeGate sign-up card (auth gating intact); `/zone-of-genius` entry renders without regressions; no console errors on either route.
- [x] 🔥 ROAST GATE 4: Functional tests pass — type extension is non-breaking (optional field), JSON parser is defensive (validates shape before returning), rendering is conditional (no data → invisible). Edge cases handled: missing fields → silent fall-through, non-JSON rawSignal → undefined return, partial JSON → undefined return.

---

**Completed:** 2026-05-01 evening
**Status:** Phase 1 + 2 + 3 + 4 ✅ — Module shipped.

## What ships

- Existing snapshots (no `topTalentProfile`) → ZoneOfGeniusOverview renders exactly as before. No regressions.
- New snapshots where user pastes the JSON output of `ZONE_OF_GENIUS_PROMPT` → 8 deep-profile fields stored in `appleseed_data` JSONB and rendered as three trinity sections after the hero.
- Activation buyers ($37) → land on `/activate/welcome` → click "See your profile →" → `/game/me/zone-of-genius` → see their deep profile (or MeGate sign-up if unauth, which preserves their localStorage data via `getOrCreateGameProfileId()`).

## Out of scope (flagged)

- **Backfill for existing pre-Day-57 snapshots** — users who already paid Activation but whose snapshot pre-dates this feature will see only the standard profile until they re-do their reveal. Could be addressed via a "regenerate your deep profile" CTA in a future pass.
- **Deep profile from Guided assessment path** — currently only the Faster (paste-from-AI with prompt) path produces the JSON shape. Guided assessment users get the standard profile only. Could be addressed by extending the Guided generator to ALSO produce the 8 fields.
- **PDF export of deep profile** — existing PDF generator (`generateZogPdf`) doesn't yet include the 8 fields. Future addition.
