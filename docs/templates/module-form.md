# Module form: Intro → one button → result → Outro

*Canonical template, synthesized 2026-10-27 by Evolver from the game blueprint's module rules and the older module checklists (Genealogy at the end). The game blueprint (`docs/02-strategy/game_of_being_you.md`, Sasha's decisions of 2026-10-26/27) is the newest Sasha-confirmed telling and wins; the checklists stay as the build layer underneath. The blueprint keeps its sections; this file is the one form every place, room and module takes.*

## Meta-description
- **Level / parent:** L2 · The Game & the Village (proposed L1) · parent: the game blueprint (the Blueprint lens, [meta-template.md](./meta-template.md) §2a)
- **Lens(es):** Ideal Forms (one breath per place: one result, one button), with Causal for the ritual and the build gates
- **Technology (shift it carries):** PST 81 The Specificity Loop — the moment after a step spent on thanking us (a toast) → spent on a recognition the player keeps · also PST 115 (articulation is the mechanism of growth: each Outro makes a real result legible to the player), PST 52 (ritual conversion) · shift check: on the Outro the player sees their own result in their own words, rates it, and the village visibly changes
- **What emerges:** a place a player can enter, do one real thing in, see what is now true about their life, and leave with the village brighter
- **As a part of the whole:** each place as one breath of the whole: the game never adds anything artificial; it makes a real step legible, beautiful and playable
- **Siblings / repeats:** [spec-handoff.md](./spec-handoff.md) (the before/after screen pair and the build gates); [session-script.md](./session-script.md) (the same arc live: promise → work → recognition); [testimonial-clips.md](./testimonial-clips.md) (voices in Outro notes); the stall auto-assembly (blueprint §14.12)
- **Status · applied in · last reviewed:** in use · Journey modules J1–J12 (blueprint §14.5, WP-5, WP-19, WP-20) · 2026-10-27

---

## 1. Essence
"Every product and module has one transformational result and one button. Intro explains the result and shows the button; Outro says what just happened and congratulates." (Sasha, 2026-10-27 14:44)

## 2. The fidelity test (before anything else)
"The game articulates life itself." Any mechanic, any screen: *does it show something true about the player's life, or does it add something artificial?* Only the first passes (blueprint §10a). Consequences: no points, no public levels or leaderboards, level = the real QoL score (private), loot = real outcomes, bosses = real thresholds (no combat vocabulary: threshold guardians), "cult game, not a generic game" (§13.2).

## 3. The form
| Part | What it is | Rules |
|---|---|---|
| **Intro** (`ModuleIntro`, the before-screen) | the promise | place scene; eyebrow + headline that state the result (= the module's Master Result); 1–2 line silhouette of what will happen; **one button whose label is the result as a verb** («Find my mission →», never «Continue»). Shown faded when the place is `closed`, with its line |
| **Passage** | the module as it is | unchanged inside; the form wraps, it doesn't rebuild |
| **Result** | the artifact | the real thing the player now holds, in their own words |
| **Outro** (`ModuleOutro`, the after-screen) | the confirmation, **a stable surface, never a toast** | celebration eyebrow («Done · Your mission is saved») · **the result itself, prominently** · where it lives (Your House) · **what it unlocks** (which place opened or brightened) · congratulations · **the rating** (§4) · **one real life choice** (§5) · the victory recorded · **one forward button: Back to the village**, where the next hint waits |
| **Village hint** | the next Intro's promise | «Your House · Discover your mission — you'll know what is yours to do in the world.» |

"A toast is not a transformative-result delivery. The after-screen IS the deliverable." (Transformative-Result Pattern, Sasha, 2026-05-22)

**DoD per module:** Intro headline = Master Result · button label = result verb · Outro shows the artifact + what it unlocked + one button back · rating asked · choice asked and stored · victory recorded.

## 4. The victories ritual (on every completed step)
1. **Congratulate** (a moment of recognition, never a generic toast).
2. **Ask:** «How much did this resonate, from 1 to 10?»
3. **Answer the rating with a recognition, not a thank-you** (PST 81, same form at every tier): *"What if [what they just saw] IS [the bigger truth they've been seeking]?"* 8–10: declarative (name what landed as already true); 5–7: curious (the precision gap is the work); 1–4: honest (the friction is a clean signal). *(Composition: PST 81 was written for the funnel's reveals; joining it to the Outro is this synthesis. Sasha to confirm.)*
4. **Record** the victory and the rating in the save file (Character Sheet), a growing collection that proves «I can» and shows the next goal.

**The victory sequence v1** (blueprint §13.4): passed the uniqueness test (Gate) → each character quest (Your House) → uniqueness in one phrase, first time → the tagline of my unique business, first time (Workshop) → came to the webinar (Academy) → came to the Mastermind (Fire Circle) → completed the 21-day practice → **named my price to a client, first time** (Market) → **sold my first product** (the Ball, the Slipper finale). Optional: Oracle Reading, its Scroll to the inventory. The ritual is fixed; the order may be refined.

## 5. The real choice at the end
"A game is a series of interesting decisions" (Sid Meier, blueprint §15.5): every Outro ends with **a real life choice, not a test** («What do you stop doing this week?»). The badge records the decision, not the viewing (WP-19).

## 6. The lock rule (places, rooms, modules, every theme)
| State | Look (tokens per theme) | Behaviour | Line |
|---|---|---|---|
| `open` | full colour, alive | ENTER works | the place's line («Craft your offer.») |
| `closed` | `--lock-filter`, `--lock-dim`, no motion | no ENTER; click shows the faded scene + one line | «Opens when <real event>. Inside: <transformational result>.» |
| `new` | the colour arrives once | ENTER + the Outro of the step that opened it | «Open now.» |
| `live` | open + `--live-accent` | ENTER goes to the live thing | «Live now: Webinar, Wed Nov 4.» |

- One function, `placeState(place, save)`, reads **real events** from the save file (never points); map, rail, place screens and rooms all use it.
- Unlock order v0: Reception, Academy, Fire Circle always · Your House, Quest Board, Oracle at J1 (Top Talent saved) · Workshop, Café at J2 (Mission saved) · Market, Co-working at J7 (offer / tagline saved) · Town Hall at J12 (first sale). *Oracle and Co-working thresholds inferred, to confirm.*
- Guests: Reception, Academy, Fire Circle open; the rest faded with its line. Accessibility: `aria-disabled` + the line as text, never colour-only.
- *Dated note:* the "colour is earned through the prism" / all-black-and-white world was **not taken** (Sasha, 2026-10-27): the world is in colour; closed is simply dim. In Lunar, colour is the player's own arriving in places they've lived through (§14.11).

## 7. Before designing a new place: the Koster facet check
One line each; any «no» or «same as …» means redesign before building.
1. **New facet:** which facet of the self does this reveal that no earlier place did?
2. **New verb:** what does the player *do* here that they did not before?
3. **Real result:** what true thing about their life is now visible (§2)?
4. **Not a recolor:** the closest earlier place, and what differs beyond colour, copy and art?
5. **Where it lands:** what goes to the shelf (badge) and the stall?
6. **Real choice at the end:** what life decision does its Outro ask (§5)?
7. **World answers:** how does the village visibly change after it?

## 8. Building the module (the layer underneath)
When a module is built or rebuilt, run the four playbooks with a **roast gate after each** (walk through first, no fixing; three cycles, the third a meta-cycle; then fix):
- **Product:** Point A, Point B, one-sentence Master Result → sub-results (sequenced, start and end screen each) → atomic screens (name, one-sentence purpose) → per screen heart / mind / gut (what they feel, understand, do) → extensions (artifacts, emotional states, completion criteria, skip paths, bridges) → mobile-first wireframes. *Gate:* redundant or missing screens? one obvious action per screen? edge cases, copy, emotional flow?
- **Architecture:** entry and exit points, data in and out → routes, hierarchy, guards, redirects → schema (reuse first) → shell rules (nav vs focus mode) → state (what persists where, resume, sync). *Gate:* "the #1 source of integration bugs is untested transitions": Back, refresh, deep link, expired session, API failure, step counters unified.
- **UI:** tokens only (colour, type, spacing, radius, shadow) → standard building blocks → layout templates → brand voice and emotional mode → micro-interactions. *Gate:* screenshot the set: same app? "wow" or "meh"? breathing room? compare with best-in-class.
- **Verification:** build, types, console → **AI self-test before human** (recorded walkthrough as proof) → functional tests → edge cases → founder walkthrough.

## 9. Polishing an existing module
1. **Spec fidelity audit first:** list every element on screen, compare with the spec: in code but not in spec → flag for removal; in spec but not in code → flag for addition (a Spec Drift Report).
2. **Quick roast:** does the flow deliver the Master Result? unnecessary screens? text repeated? buttons say what I **get**, not what I do? one next action per screen? the most important thing most visible? dead props?
3. Fix list with file:line → build check.
4. **Spot-check three moments only:** entry, the result moment (is the WOW delivered?), exit transition.
5. Report with the **UX score:** Fast · Clear · Easy · Useful · WOW.

## 10. Open edges
- Joining PST 81's recognition form to the Outro rating (§4.3) is a composition; Sasha to confirm.
- Koster table for J1–J12 to be filled when WP-5 lands (WP-20).
- *Dated, superseded:* the universal module landing page (hero, for whom, pain, solution, outcomes, structure, origin, CTA; `docs/05-reference/module_landing_page_infrastructure.md`, 2026-02) was the door to a module before the village; the Intro now carries that job inside the game. Its customer-forces block (push, pull, anxiety, habit) stays useful for Market stalls and public pages.

---

## Genealogy
| Source | Date | Provenance | What it contributed |
|---|---|---|---|
| `docs/04-workflows/module_polish.md` = `.agent/workflows/polish.md` (near-duplicates) | 2026-02-05 | AI-written workflow from a real polish of Onboarding | quick roast checklist; three-moment spot-check; UX score; the `.agent` copy alone carries the **spec fidelity audit / drift report** |
| `docs/05-reference/module_implementation_checklist.md` v3.0 + applied copy `docs/05-specs/onboarding/onboarding_implementation_checklist.md` | undated (early 2026) | AI-written universal checklist; the onboarding file is one instance | the four playbooks with roast gates; heart / mind / gut per screen; transitions as the main bug source; AI self-test before human |
| `docs/05-reference/module_landing_page_infrastructure.md` (+ `docs/04-workflows/module_landing_page_workflow.md`) | 2026-02-10 | AI-written; superseded by the module form | the pre-game door of a module; customer forces (kept as a note) |
| `docs/03-playbooks/integrated_product_building_workflow.md` §Transformative-Result Pattern | 2026-05-22 | Sasha's principle (Day 80), AI-written around it | before-screen and after-screen; "the after-screen IS the deliverable"; result label on the CTA |
| Game blueprint §10a *Fidelity principle* | 2026-10-26 | Sasha | the fidelity test; stage-7 mechanics that pass |
| Game blueprint §13.2, §13.4 *Design decisions*, *Victories* | 2026-10-27 | Sasha («Все записываем!!!»; «Нутром чую…») | no points, private level, threshold guardians; the congratulate → 1–10 → record ritual; the victory sequence v1 |
| Game blueprint §14.3 *Lock rule*, §14.4 *Module form* | 2026-10-27 | Sasha (14:44, 15:08), written with Evolver | the four states and `placeState()`; unlock order; Intro → one button → result → Outro with its DoD |
| Game blueprint §15.5, §15.8 *Real choice*, *Koster facet check* | 2026-10-27 | Evolver, from game-design lineages, accepted into the blueprint | the real life choice at every Outro; the seven-question check before any new place |
| PST 81 *The Specificity Loop* | 2026-04-25 | Sasha's funnel discovery, AI-codified | the recognition form after a rating (joined to the Outro in this synthesis) |
