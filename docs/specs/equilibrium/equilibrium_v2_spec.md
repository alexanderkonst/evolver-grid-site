# "Equilibrium" Biologic Watch (v2)

> **THIS IS THE THIRD MAJOR CYCLE.** v1.1–v1.6 trained the body to *feel* time (mechanical-clock metaphor). v2 transcends the clock — Equilibrium becomes a **Biologic Watch**: a single page where mission, gifts, Solar System's rhythms, and current work converge on one chosen action.
>
> v1.6 was the apex of the clock. v2 is the watch becoming biological — alive, attuned to body + cosmos + work + chosen-now.
>
> Internal versioning: **v2**. Public/UX framing: **"Equilibrium" Biologic Watch**. File paths preserve v2.

**Started:** 2026-05-15
**Tracker:** [equilibrium_v2_tracker.md](./equilibrium_v2_tracker.md)
**Previous versions:** [v1.6](./equilibrium_v1.6_spec.md) · [v1.2](./equilibrium_v1.2_product_spec.md) · [v1.1](./equilibrium_v1.1_product_spec.md)
**Methodology:** [Integrated Product Building Workflow](../../03-playbooks/integrated_product_building_workflow.md) · [Glassmorphism Blueprint](../../03-playbooks/glassmorphism_blueprint.md)

---

## The Essence

_TBD — established in Phase 1.1 (Master Result). Working hypothesis below; will be roasted, refined, locked._

> Equilibrium v2 is a single-page personal operating surface. **Eleven** boxes, top-down:
>
> 1. **Synthesis Reading** _(emphasized, top)_ — one sentence pulled from everything below. Regenerates on press. Like "checking the time," but the time is the whole-self snapshot. Mechanics designed last (after boxes 2-11 lock).
> 2. **Mission** — the one sentence (synced from Mission Discovery)
> 3. **Role** — the one sentence (synced from ZoG / Top Talent)
> 4. **Solar Energy** — yearly cycle position (BD-driven, prev / current / next)
> 5. **Zodiac Energy** — 8 lunar-quarter divisions (prev / current / next)
> 6. **Moon Focus** — lunar cycle position + user 1-3 word focus subtitle
> 7. **Day-of-Week Energy** — weekly position with planetary-day energy (prev / current / next)
> 8. **3 Current Strategies** — user-input, clarity-gated
> 9. **Workstreams** — up to 7, drag-reorderable
> 10. **Intuitive S.M.A.R.T. Goals** — per workstream, up to 7 tasks, DO NOW button per task
> 11. **DO NOW** — active focus, ≤3 tasks (1 recommended), checkbox-complete cascades back to box 10's done-pile
>
> Box 1 is the *read*. Boxes 2-3 are *identity*. Boxes 4-7 are *cosmic position* (year / zodiac / lunar / weekly). Box 8 is *direction*. Box 9 is *organization*. Box 10 is *capture*. Box 11 is the *chosen action* that collapses everything above into now.

---

## Source Material — Mega-Prompt of 2026-05-15

> [!IMPORTANT]
> Sasha's foundational prompt embedded verbatim. All Phase 1 work refines and roasts against THIS source; nothing is invented around it. When Phase 1 questions arise, the answer is either *here* or *delegated to me per the prompt's explicit delegation*.

### Frame

- The new front end + matching backend for Equilibrium v2. A continuation but a category jump — that's why it's v2 and the prior versions retroactively become v1.1–v1.6.
- Methodology: [Integrated Product Building Workflow](../../03-playbooks/integrated_product_building_workflow.md), followed closely. Definitions of Done are the spine.
- One page, scrolled. Inside the platform shell. Liquid glass + neumorphism.
- Auth-required. BD-required (existing flow reused).
- Provisional placement: Build space → Equilibrium subpage (2nd pane). Each section a floating box (3rd pane).

### Source: nine boxes (in order)

1. **Mission.** ONE sentence. Synced from Mission Discovery module; auto-renders, editable, and resyncs on retake. If user has no data → redirect to Mission Discovery. *Sasha delegates the sync UX strategy.*
2. **Role.** ONE sentence. Synced from ZoG / Top Talent module (current unique-talent sentence); auto-renders, editable, resyncs. No data → redirect to Top Talent Discovery. *Sasha delegates the sync UX strategy.*
3. **Yearly Solar Energy.** Curved progress bar segmented into 8 (per lunar-quarter aesthetic in handdrawn mocks). Shows previous / current / next energy. Reuses existing BD-driven solar math from v1.x.
4. **Zodiac Energy.** Same visual as box 3. 8 segments. Prev / current / next. Reuses or extends existing math.
5. **Moon Focus.** Same visual as boxes 3 & 4, plus a user-input 1–3 word focus subtitle ("Focus: <user input>"). Info-icon on hover explains intent.
6. **3 Current Strategies.** User-input. Same input pattern as box 5. Info-icon copy: "Set when you have clarity."
7. **Workstreams.**
   - User-inputted, no info-icon.
   - Sub-boxes per workstream — see handdrawn layout: number + title.
   - Default 2 sub-boxes + "+" to add. Max 7. At 7, "+" replaced by: *"Group your workstreams to avoid very high context-switching costs."*
   - Drag-and-drop reorderable.
8. **Intuitive S.M.A.R.T. Goals.** Opens when a workstream is clicked.
   - Task list under that workstream. Horizontal-bar sub-boxes per task.
   - Empty state: one bar + "add" button.
   - After first task: faint "+" bar appears underneath inviting another.
   - Max 7 tasks. Same grouping prompt at the cap.
   - Drag-and-drop reorderable. Delete option per task.
   - Each task has a **DO NOW** button to the right of its checkbox.
9. **DO NOW (active focus).**
   - Opens when a task is promoted via DO NOW.
   - Max 3 tasks. Adding a 4th: gentle warning *"For optimal results, we recommend to have only ONE task in this section most of the time"* — task still gets added, up to 3.
   - Checkbox at right of task text. On check: animate, mark, strike-through the task text, and the row **cascades back to box 8** of its workstream — landing as the top of the done-list. Box 8 shows up to 7 done tasks per workstream; older ones drop out of view.

### Operating note

- "Mega-prompt — help me get this right." Visual assets (final UI design) come at the coding stage.

---

### Addendum — 2026-05-15 (post-mega-prompt)

After the holonic roast of the Planning DoD, Sasha added two boxes:

**New box 1 (TOP, emphasized) — Synthesis Reading.** One sentence pulled from all data below. Regenerates on press, like "checking the time" but the time is the whole-self snapshot. Mechanics + prompt designed AFTER boxes 2-11 are fully roasted (sequenced as Phase 1.7).

**New box 7 — Day-of-Week Energy.** Right after Moon Focus. Same prev/current/next visual aesthetic as the cosmic-position boxes. Reuses existing planetary-day-energy data (Sun/Moon/Mars/Mercury/Jupiter/Venus/Saturn) from v1.x `cycles.ts`. Honors both the planetary-day axis and Sasha's lived holonic mapping (Mon=Plan, Tue=Build, Wed=Communicate, Thu-Sun=Integrate).

Box count: 9 → **11**. Numbering throughout the spec uses the post-addendum sequence.

---

## Upstream Dependency Check — Verified 2026-05-15

| Dep | Status | Path / Field | Notes |
|---|---|---|---|
| Mission Discovery | ✅ | Route `/mission-discovery`; data: `mission_participants.mission_id` → `MISSIONS.find().statement` (static `src/modules/mission-discovery/data/missions.ts`) | Reuse `ProfileMissionSection.tsx` pattern. Flag: persist `statement` to DB as a future migration. |
| ZoG / Top Talent | ✅ | `zog_snapshots.appleseed_data.topTalentProfile.archetype_title` (latest snapshot via `game_profiles.last_zog_snapshot_id`) | Recommend new `useTopTalentProfile()` hook. |
| Solar / Weekly / Lunar / Day-of-Week math | ✅ | `equilibrium/src/cycles.ts` — `getYearState(birthday)`, `getWeekState`, `getMoonState`, `synthesizeCycles` | Plan: port these into a shared `src/lib/equilibrium-cycles/` during implementation (Sasha's "reuse moon energies, weekday energies" direction). |
| Zodiac math | ⚠️ NEW | Not in `cycles.ts` | Phase 2.3 decision: define 12-sign progression + 8-segment visual mapping, OR defer box 5 to a follow-up. |
| Build-space route | ✅ decided | New route `/build/equilibrium`, file `src/modules/equilibrium/`, wrapper `<MeGate><GameShellV2 hideLogo>` | Distinct from UBB. Confirmed/refined in Phase 2.2. |

---

## INPUT (5 elements)

_TBD — completed in Phase 1.1. Source above gives us 80% of the input; we name it precisely in Phase 1.1._

| # | Element | Value |
|---|---------|-------|
| 1 | **ICP** | _TBD_ |
| 2 | **Transformation (A → B)** | _TBD_ |
| 3 | **Pain of Point A** | _TBD_ |
| 4 | **Dream Outcome** | _TBD_ |
| 5 | **Action** | _TBD_ |

---

## PHASE 1: PRODUCT

### 1.1 Master Result — LOCKED 2026-05-15 (refined by Sasha)

> ## **"Equilibrium" Biologic Watch takes you from poorly aligned grind and overworking, to one daily action that holds your mission, your gifts, Solar System's rhythms, and your intuitive, aligned, and laser-focused work.**

**Point A.** Poorly aligned grind and busyness. The user has done Mission Discovery, has done ZoG, *knows* their mission and gifts — but day-to-day action happens on a different surface (Notion, inbox, a task list, their head). Time gets "managed" instead of being something they're inside of. Action is reactive. The body's on the grind; the soul's not on the page.

**Point B.** One daily action that holds four anchors:
- **mission** (Box 2)
- **gifts** (Box 3)
- **Solar System's rhythms** — solar / zodiac / lunar / day-of-week / moon-focus (Boxes 4–7)
- **intuitive, aligned, and laser-focused work** (Boxes 8–11; *intuitive* = right-brain knowing surfaced by Box 1's Synthesis Reading; *aligned* = mission/gifts visible at the moment of action; *laser-focused* = inherited 96-min deep-work sprint from v1.x)

The Synthesis Reading (Box 1) is the *interaction-proof* — one regeneratable sentence that proves all four anchors are present. DO NOW (Box 11) is the *behavioral proof*.

**Behavioral measure.** Synthesis-regenerate frequency · DO NOW promotion rate · checkbox-complete rate per day. If a daily user fills the DO NOW slot most days, Point B is real.

#### 🔥 Roast 1.1 — 11 checks (9 playbook + 2 supplementary)

All checks pass on the refined statement. Substantive notes:

| # | Check | Verdict | Note |
|---|---|---|---|
| 1.1a | Point A specific? "That's me" recognition | ✅ | "Poorly aligned grind and busyness" carries body-weight + diagnosis |
| 1.1b | Point B measurable? | ✅ | Behavioral: synthesis-regenerate / DO NOW / checkbox rates |
| 1.1c | One sentence? | ✅ | Single A→B arc, long but clean |
| 1.1d | Module ACTUALLY delivers? | ✅ conditional | The three qualifiers (intuitive / aligned / laser-focused) each hook a specific surface; deliverable if 1.7 (Synthesis) does its job |
| 1.1e | 12-year-old test | ✅ | "Solar System's rhythms" is poetic but accurate — kids know sun/moon/planets |
| 1.1f | User wants this? | ✅ | Alignment is the dominant felt-pain of the ICP segment |
| 1.1g | Reads aloud? Lands? | ✅ | Heavy but lands; rhythm matches the gravity of the claim |
| 1.1h | More visceral Point A? | ✅+ | "Grind and overworking" — "grind" carries body-weight; "overworking" loads volume + harm (refined from earlier "busyness") |
| 1.1i | More specific Point B? | ✅+ | "Solar System's rhythms" + three work-qualifiers concretize what "holds" means |
| **CS** | Category-shift check | ✅ | "Biologic Watch" *names* the category itself — clock → biologic watch is the shift |
| **1v2** | One vs. two Master Results | ✅ ONE | Synthesis is interaction-proof, not its own A→B |

Master Result locked. **Forward naming:** public/UX-facing framing is **"Equilibrium" Biologic Watch**. Internal v2 versioning preserved in file paths.

### 1.2 Sub-Results — LOCKED 2026-05-15

Five felt-wins, sequenced top-down (matches page scroll AND psychological cadence):

| # | Sub-Result | Felt as | Surfaces |
|---|---|---|---|
| 1 | **Centered** | *"I see who I am, and who I'm being right now."* | Synthesis (Box 1) · Mission (2) · Role (3) |
| 2 | **In Rhythm** | *"I feel where I am in Solar System's rhythms."* | Solar (4) · Zodiac (5) · Lunar (6) · Day-of-Week (7) · Moon Focus |
| 3 | **Directed** | *"I see what I'm playing for and building."* | 3 Strategies (8) · Workstreams (9) |
| 4 | **Chosen** | *"This is the one thing — under all of the above."* | SMART Goals (10) → DO NOW promotion (11) |
| 5 | **Executed** | *"Done. The body knows. Momentum."* | Checkbox complete → cascade to box-10 done-pile |

#### 🔥 Roast 1.2 — 9 playbook checks

All 9 pass. Two flags carried into Roast Gate 1:

- **1.2g flag:** *Directed* (frame) and *Chosen* (single) are adjacent. The mock keeps them visually distinct (boxes 8/9 vs 10/11). Confirmed distinct; revisit if hierarchy blurs during wireframes.
- **1.2h flag:** *In Rhythm* combines 5 cosmic boxes. Kept as one (felt holistically, not as 5 hits). Revisit if Phase 1.4 dan tians can't fit 5 surfaces under one sub-result.

Full check trace archived in tracker.

### 1.3 Screens — ONE SCROLLABLE PAGE, 11 sections — LOCKED 2026-05-15

> **Architectural note.** v2 is genuinely a single screen. The 11 boxes are sections within one scroll, not separate screens with routes. There is no navigation cost between sections — everything is one continuous surface. The playbook's "atomic screens" step collapses to "sections of the one screen."

| # | Section | Sub-Result Anchor | One-line Purpose |
|---|---|---|---|
| 1 | **Synthesis Reading** | Centered | Regeneratable one-sentence read of the whole self (tap to re-read) |
| 2 | **Mission** | Centered | Synced from Mission Discovery; editable inline; redirect if missing |
| 3 | **Role** | Centered | Synced from ZoG Top Talent; editable inline; redirect if missing |
| 4 | **Solar Energy** | In Rhythm | 8 orbs + rainbow arc + prev/current/next pills |
| 5 | **Zodiac Energy** | In Rhythm | 8 orbs + arc + pills |
| 6 | **Lunar Energy + Moon Focus** | In Rhythm | 8 moon-phase orbs + arc + pills + user 1-3 word focus subtitle |
| 7 | **Day-of-Week Energy** | In Rhythm | 8/7-orb adaptation + arc + planetary-day pills |
| 8 | **3 Current Strategies** | Directed | Three user-input strategies, clarity-gated (info-icon: "Set when you have clarity") |
| 9 | **Workstreams** | Directed | Up to 7, drag-reorderable, click to open Goals; max-cap message at 7 |
| 10 | **Intuitive SMART Goals** *(per workstream)* | Chosen | Tasks list per active workstream; up to 7; drag-reorder; delete; DO NOW per task |
| 11 | **DO NOW** | Chosen + Executed | ≤3 active tasks (1 recommended; warning at 4th); checkbox-complete → animate + cascade to box 10 done-pile |

🔥 Roast 1.3 — sections all distinct, no merge/split needed, sequence natural top-down. PASS.

### 1.4 Screen Details — Three Dan Tians per Section — LOCKED 2026-05-15

🫀 Heart (what they feel) · 🧠 Mind (what they understand) · 🔥 Gut (the CTA verb)

| # | Section | 🫀 Heart | 🧠 Mind | 🔥 Gut |
|---|---|---|---|---|
| 1 | Synthesis | "Ah — there I am." | Given who I am, where I am in cycles, and what I'm building — this is what this moment asks for | **REGENERATE** (tap) |
| 2 | Mission | "I remember why I'm here." | My mission is X (synced from Mission Discovery) | **EDIT** / **RESYNC** · empty → **OPEN MISSION DISCOVERY** |
| 3 | Role | "I know what I bring." | My current Top Talent is X (synced from ZoG) | **EDIT** / **RESYNC** · empty → **OPEN TOP TALENT** |
| 4 | Solar Energy | "The year is alive in me." | I'm in [season-phase], moving from X → Y → Z | *passive — tap orb for detail* |
| 5 | Zodiac Energy | "This sign's color is on me." | I'm in [sign], energy [quality], next [sign] | *passive* |
| 6 | Lunar + Moon Focus | "The moon is in my body." | Lunar phase [X]; this cycle's focus: [user 1-3 words] | **SET FOCUS** (inline input) · info-icon explains intent |
| 7 | Day-of-Week | "Today's element is on me." | Today is [Mercury/Wednesday]: [Clarity & Communication], holonic [Communicating] | *passive* |
| 8 | 3 Strategies | "I see what I'm playing for." | Three strategies for the current arc | **SET** each · info-icon: "Set when you have clarity" |
| 9 | Workstreams | "I see my paths." | Up to 7 streams, ordered by leverage | **+ ADD** · **drag to reorder** · **click to open Goals** |
| 10 | SMART Goals | "I see this stream's next moves." | Tasks under [workstream], intuitive sequence | **+ ADD TASK** · **drag** · **delete** · **DO NOW** per task |
| 11 | DO NOW | "This is the thing." | Active focus slot · ≤3 tasks (1 recommended) | **✓ COMPLETE** → animate + cascade to box 10 done-pile |

🔥 Roast 1.4 — no generic Hearts; each Mind teaches one thing; every CTA is a result verb; passive boxes correctly have no CTA. PASS.

#### 1.4 — SCREEN-LEVEL Dan Tians (the page as a whole)

> **Depth principle.** v2 is genuinely one screen, but the playbook's per-screen depth still applies. The page itself has a Heart, Mind, and Gut distinct from any single section. (Per [feedback_single_screen_full_depth.md](file:///Users/alexanderkonst/.claude/projects/-Users-alexanderkonst-evolver-grid-site/memory/feedback_single_screen_full_depth.md).)

🫀 **Heart of the screen:** *"I am held in the full holonic stack. Who I am, where I am in time, what I'm building, what I'm doing — all visible at once. I am not scattered; I am one, inside many concentric cycles."*

🧠 **Mind of the screen:** *"This is my Biologic Watch. The cosmos's cycles + my identity (mission + gifts) + my current work + my chosen NOW all converge on one continuous surface. Pressing the top regenerates a reading of this moment. Pressing DO NOW chooses the next action under all of this."*

🔥 **Gut of the screen** — the **read → act pulse**:

- **REGENERATE** (top, Synthesis) — the "check the watch" act
- ... context flows through Mission · Role · Cycles · Strategies · Workstreams ...
- **DO NOW** + **✓ Complete** (bottom) — the "make the next move" act

Distributed secondary CTAs (EDIT / SET / + ADD / drag / delete) are subordinate to the read/act pulse. The whole screen is **one consultation of the watch**.

This pulse is the governing structure for Phase 3 — every visual rule, building block, layout decision, and micro-interaction in Phase 3 serves read→act.

### 1.2 Sub-Results

_TBD with Deep Roast._

Likely sequence (to be roasted):

1. Identity grounded (Mission + Role visible)
2. Cosmic position felt (Solar + Zodiac + Moon)
3. Focus named (Moon Focus + 3 Strategies)
4. Workstreams ordered
5. Tasks captured per workstream
6. DO NOW chosen — one action under all of the above
7. Task completed — celebration + cascade to done

### 1.3 Screens — the 9 boxes

_TBD. Each box gets a screen ID and one-line purpose._

### 1.4 Screen Details — Three Dan Tians per box

_TBD. Per box: 🫀 Heart (what they feel) · 🧠 Mind (what they understand) · 🔥 Gut (the CTA verb — SET / SYNC / + / DO NOW / ✓ / ↕)._

### 1.5 Extensions — LOCKED 2026-05-15

**Artifacts (data v2 creates):**

| Table | Purpose | Key fields |
|---|---|---|
| `equilibrium_state` | One row per user | `user_id`, `mission_override_text?`, `role_override_text?`, `moon_focus_text?`, `last_synthesis_text?`, `last_synthesis_at?` |
| `equilibrium_strategies` | Up to 3 per user | `user_id`, `position` (1-3), `text`, `set_at` |
| `equilibrium_workstreams` | Up to 7 active per user | `id`, `user_id`, `position`, `title`, `created_at`, `archived_at?` |
| `equilibrium_tasks` | Tasks under workstream (7 active + 7 done visible) | `id`, `workstream_id`, `position`, `text`, `status`, `created_at`, `done_at?`, `do_now_at?` |
| `equilibrium_focus` | DO NOW slot, up to 3 | `user_id`, `task_id`, `position`, `promoted_at` |
| `equilibrium_synthesis_log` | Append-only | `user_id`, `reading_text`, `cycle_snapshot_json`, `generated_at` |

Migration drafted in Phase 2.3, not run during planning.

**Computed vs persisted per section:**

| Box | Persisted | Computed |
|---|---|---|
| 1 Synthesis | last reading + timestamp | regenerated on tap |
| 2 Mission | override (if user edited) | else fetch via `mission_participants → MISSIONS.find()` |
| 3 Role | override (if user edited) | else fetch via `zog_snapshots.appleseed_data.topTalentProfile.archetype_title` |
| 4 Solar | — | yearly + personal-year from `Date.now()` + BD |
| 5 Zodiac | — | NEW math required |
| 6 Lunar + Focus | `moon_focus_text` | lunar phase + holonic (cycles.ts exists) |
| 7 Day-of-Week | — | planetary day + holonic (cycles.ts exists) |
| 8 Strategies | 3 texts | — |
| 9 Workstreams | list | — |
| 10 Goals | tasks per workstream | — |
| 11 DO NOW | active focus task IDs | — |

**Bridges:**

- **Incoming:** Mission Discovery → Box 2 · ZoG → Box 3 · cycles.ts math → Boxes 4/6/7 · BD prompt (reused) → Boxes 4/5
- **Outgoing:** none in v2 scope
- **Internal:** Box 10 task DO NOW → Box 11 (promote) · Box 11 ✓ → Box 10 done-pile top (cascade, max 7 visible)

**Sync behavior (Mission + Role)** — Sasha's delegation locked:
- Auto-render on page load (no manual sync button)
- Inline edit (tap → input → save on blur/Enter)
- Conflict: if user has override AND upstream changes → small "upstream updated — accept new?" affordance (Phase 2.5 detail)

**Completion criteria:** Continuous tool. No "done" state. Success = daily use.

**Skip paths:**

| Missing | Behavior |
|---|---|
| Auth | MeGate → existing auth flow |
| BD | Existing v1.x BD-prompt overlay (reused per mega-prompt) |
| Mission Discovery data | Box 2 inline CTA *"Set your mission →"* → redirects to `/mission-discovery?returnTo=/build/equilibrium` |
| ZoG / Top Talent data | Box 3 inline CTA *"Discover your Top Talent →"* → redirects to ZoG entry with returnTo |

User is never forced to leave — boxes 4–11 stay functional with empty Mission/Role (synthesis quality drops without context, page still works).

**Empty state behaviors** (functional intent locked; **all user-facing copy TBD — Sasha to supply during copy pass before Implementation**):

| Section | Behavior | Copy |
|---|---|---|
| Box 2 Mission (no data) | Inline CTA → redirect to `/mission-discovery?returnTo=/build/equilibrium` | TBD |
| Box 3 Role (no data) | Inline CTA → redirect to ZoG entry with returnTo | TBD |
| Box 6 Moon Focus (no text set) | Inline input affordance | TBD |
| Box 9 Workstreams (zero) | Inline input affordance + welcoming context | TBD |
| Box 10 Goals (no workstream open) | Passive — indicates open-from-above | TBD |
| Box 10 Goals (workstream open, zero tasks) | Inline `+ add task` bar | TBD |
| Box 11 DO NOW (zero promoted) | Passive — explains promote-via-DO-NOW | TBD |
| Box 1 Synthesis (no BD) | Inline CTA → existing v1.x BD prompt overlay | TBD |

**Exact copy from mega-prompt** (canonical — do not paraphrase or invent):

| Surface | Copy | Mega-prompt § | Status |
|---|---|---|---|
| Box 9 at 7-cap | *"group your workstreams to avoid very high context switching costs"* | §14.5 | ✅ verbatim |
| Box 10 at 7-cap | *"group your tasks to avoid very high context switching costs"* (cosmetic substitution per mega-prompt's *"same"* — Sasha-approved 2026-05-15) | §15.6 | ✅ approved |
| Box 11 at 4th task | *"For optimal results, we recommend to have only ONE task in this section most of the time"* | §17.1 | ✅ verbatim |
| Box 8 info-icon | *"Set when you have clarity"* | §13 | ✅ verbatim |
| Box 6 info-icon | *"1–3 words for this moon cycle's intent."* (utility instruction — Sasha-approved 2026-05-15) | §12 | ✅ approved |

### 1.6 Wireframes — LOCKED 2026-05-15

**Full one-page scroll (11 sections, top-down):**

```
┌─────────────────────────────────────────────────────────────┐
│  "Equilibrium" Biologic Watch                  ⚙  ☽/☀     │  shell header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  ✨ "[Synthesis reading sentence here]"           │     │  BOX 1
│  │                                  [⟲ tap to read]  │     │  (emphasized, glow)
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  MISSION                                          │     │  BOX 2
│  │  "[mission statement]"                  [edit]    │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  ROLE                                             │     │  BOX 3
│  │  "[top talent archetype]"               [edit]    │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  SOLAR ENERGY             [8 orbs + rainbow arc]  │     │  BOX 4
│  │                           [prev / CURRENT / next] │     │  (canonical visual)
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  ZODIAC ENERGY            [same canonical visual] │     │  BOX 5
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  LUNAR ENERGY             [8 moon-phase orbs]     │     │  BOX 6
│  │  Focus: [user text]  ⓘ  [set]                     │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  DAY-OF-WEEK ENERGY       [7-orb adaptation]      │     │  BOX 7
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  3 CURRENT STRATEGIES                          ⓘ  │     │  BOX 8
│  │  1. [strategy text or "Set when you have clarity"]│     │
│  │  2. [...]                                         │     │
│  │  3. [...]                                         │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  WORKSTREAMS                                      │     │  BOX 9
│  │  ┌──────┐ ┌──────┐ ┌──────┐                       │     │
│  │  │ 1 ⋮⋮ │ │ 2 ⋮⋮ │ │ 3 ⋮⋮ │   drag handles        │     │
│  │  │ title│ │ title│ │ title│                       │     │
│  │  └──────┘ └──────┘ └──────┘                       │     │
│  │  ┌──────┐ ┌──────┐ ┌  +  ┐                        │     │
│  │  │  4   │ │  5   │ │ add │                        │     │
│  │  └──────┘ └──────┘ └─────┘                        │     │
│  │  (at 7: + replaced by group-warning text)         │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  INTUITIVE S.M.A.R.T. GOALS — [workstream 1]      │     │  BOX 10
│  │  ┌──────────────────────────────────┐ ☐ [DO NOW]  │     │  (visible when
│  │  │  task 1 text                  ⋮⋮ │ 🗑          │     │   workstream open)
│  │  └──────────────────────────────────┘             │     │
│  │  ┌──────────────────────────────────┐ ☐ [DO NOW]  │     │
│  │  │  task 2 text                  ⋮⋮ │ 🗑          │     │
│  │  └──────────────────────────────────┘             │     │
│  │  ┌  +  add task ────────────────────┐             │     │
│  │  └──────────────────────────────────┘             │     │
│  │  ──── completed ────                              │     │
│  │  ┌──────────────────────────────────┐             │     │
│  │  │  ✓ task 7 (done) ──crossed-out── │             │     │
│  │  └──────────────────────────────────┘             │     │
│  │  (max 7 done shown; older hidden)                 │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  DO NOW                                           │     │  BOX 11
│  │  ┌──────────────────────────────────┐ ☐          │     │
│  │  │  active task 1                    │            │     │
│  │  └──────────────────────────────────┘             │     │
│  │  (warning at 4th: "For optimal results...")       │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Mobile adaptation.** Single-column at all widths. Orb arcs in boxes 4-7 compress; pill stack tightens. Workstream chips wrap to fewer per row. Floating "jump to" pill (Synthesis · Mission · Rhythms · Strategies · Workstreams · DO NOW) — Phase 3.3 specifies behavior.

### 1.7 Synthesis Box (Box 1) — Mechanics + Prompt — LOCKED 2026-05-15

**Source re-anchor:** Mega-prompt addendum: *"one reading in just one sentence that combines all the info of the clock and gets regenerated when pressed."* Primary input = cycle stack (boxes 4–7). Identity layer (Mission, Role, Moon Focus) is *context*, not primary content.

**Input payload to edge function:**

```json
{
  "cycles": {
    "solar":      { "phase": "...", "personalYearProgress": 0.42, "energy": "..." },
    "zodiac":     { "sign":  "...", "progress": 0.62, "energy": "..." },
    "lunar":      { "phase": "...", "day": 18.2, "holonic": "...", "energy": "..." },
    "dayOfWeek":  { "name":  "...", "planet": "...", "energy": "...", "holonic": "..." }
  },
  "context": {
    "mission":   "..." | null,
    "role":      "..." | null,
    "moonFocus": "..." | null
  }
}
```

Context fields are optional; when null, synthesis falls back to a pure-clock read.

**System prompt** — ⚠️ **DRAFT TEXT BELOW IS PROVISIONAL.** Per mega-prompt addendum: *"we will produce the prompting and mechanics for it once we have all others done."* The structure (input/output shape, voice direction, edge function decision) is locked. The prompt body and examples below are a starting-point draft for Sasha's co-authoring during Implementation — **do not treat as canonical**.

```
[DRAFT — for Sasha's co-authoring, not locked]

You are a Biologic Watch reader. The user has opened their watch.

Given the cycle state and (when present) personal context, produce ONE sentence
(8–20 words) that names the current moment.

Voice: a reading. Not a coach. Not a pep talk. A weather report for the soul.

RULES:
- ONE sentence only. 8–20 words.
- Lead with what the cycles are doing right now. Use vivid but specific language.
- If context (mission / role / moonFocus) is present, weave it in subtly — the
  reading should feel personally relevant without being instructional.
- Never start with "Today is...", "It's...", "Now is...". Avoid clichés.
- Never motivate. Never encourage. Never use "you've got this," "trust the
  process," etc.
- Never mention planets, moon phases, astrology, or esoteric terms by name.
  Describe their energetic qualities instead.

EXAMPLES — placeholders awaiting Sasha's calibration set.
```

**Output:** `{ "reading": "...one sentence..." }`

**States:**

- **Empty (no BD set):** inline CTA → existing v1.x BD prompt overlay. Copy TBD.
- **Loading (first session load):** previous `last_synthesis_text` shown with subtle shimmer; auto-regenerates in background
- **Loading (manual tap):** current text fades to 60% opacity; new text fades in on response
- **Error:** deterministic fallback from cycle math (template: dominant-phase + day-of-week-energy + moon-phase-quality). Exact copy TBD.

**Edge function decision: Option B — new function `generate-equilibrium-v2-synthesis`**

Rationale: different input shape (richer context), different output shape (single string, not insight+activities), v1.6 Vite app keeps using v1.6 function during parallel-running, clean versioning hygiene.

**Auto-regeneration:** First visit per browser session → silent auto-call + cache. Manual tap → fresh call. Cycle-boundary crossings mid-session (new lunar phase, midnight, etc.) → silent re-fetch in background; box pulses to suggest tap. **Staleness handling:** if `last_synthesis_at` >24h old on load, show timestamp; auto-regenerate on any reload regardless.

### 🔥 Roast Gate 1 — PRODUCT — PASS 2026-05-15

Three-cycle roast completed. Findings carried as flags to Phase 2/3:

**Cycle 1 — Usability / Hierarchy / CTA clarity:**
- ⚠️ Box 9 "click to open Goals" needs visual affordance → Phase 3.5
- ⚠️ Synthesis tap-to-regenerate affordance (pulse / hover hint) → Phase 3.5

**Cycle 2 — Edge cases / Copy / Emotional flow:**
- ✅ Empty Mission/Role redirect patterns clean (functional)
- ⚠️ Empty state copy across all sections — TBD, Sasha copy pass before Implementation
- ✅ Sasha's exact-copy warnings preserved verbatim where given
- ⚠️ Box 10 cap-warning and Box 6 info-icon copy TBD (mega-prompt didn't specify exact wording)
- ✅ Emotional flow builds top-down

**Cycle 3 — What 1+2 missed:**
- ⚠️ Mobile scroll length — floating section-anchor pill → Phase 3.3
- ⚠️ Cross-device sync — realtime vs. visibility-poll decision → Phase 2.5
- ⚠️ Synthesis staleness >24h — handled (auto-regen on reload, show timestamp if old)
- ⚠️ Cascade animation on mobile — reduced-motion variant → Phase 3.5
- ⚠️ Light/dark theme parity for Synthesis shimmer → Phase 3.5

**Verdict: Phase 1 COMPLETE.** All findings captured as named flags. Ready for Phase 2 (Architecture).

---

---

## Depth Principle for Phase 2 & Phase 3

> v2 is one screen, but a **complex** one. Every playbook step that's framed "per screen" — Phase 3's 9 sub-steps especially — applies IN FULL to this one screen, not diluted because the count is one. Per [feedback_single_screen_full_depth.md](file:///Users/alexanderkonst/.claude/projects/-Users-alexanderkonst-evolver-grid-site/memory/feedback_single_screen_full_depth.md).

Concretely for Phase 2: module boundaries, routing, schema, shell, and state get full discipline despite a single-route surface. Concretely for Phase 3: visual rules, all 9 component states per component used, layout templates per breakpoint, accessibility audit (incl. keyboard drag-drop), tokens audit, and Nielsen critique scored 1–5 per heuristic — none compressed.

---

## PHASE 2: ARCHITECTURE

### 2.1 Module Boundaries — LOCKED 2026-05-15

| Direction | Detail |
|---|---|
| Entry route | `/build/equilibrium` (single route, no nested children) |
| Entry triggers | Spaces rail BUILD → SectionsPanel "Equilibrium" entry |
| Exit | Continuous tool — no exit flow |
| Data in | `auth.uid()` · `game_profiles.birthday` · `mission_participants → MISSIONS.find()` · `zog_snapshots.appleseed_data.topTalentProfile.archetype_title` · `Date.now()` |
| Data out | 6 new tables (see 2.3) + 1 new edge function `generate-equilibrium-v2-synthesis` |
| Side effects | None outside module's own tables + edge function. No writes to upstream sources. |

### 2.2 Routing — LOCKED 2026-05-15

- Route: `/build/equilibrium`
- Wrapper: `<MeGate><GameShellV2 hideLogo><EquilibriumV2Page /></GameShellV2></MeGate>`
- Guards:
  - **Auth → entry-gate only.** Platform-wide browsing stays unauthenticated; auth is triggered when an anonymous user clicks the BUILD-space "Equilibrium" entry. Implementation: route-level `<MeGate>` redirects to auth flow on access; after auth, user lands back at `/build/equilibrium`. Anonymous users still see the entry in the SectionsPanel — clicking it is what triggers auth, not a hidden link.
  - **No UBB gate.** Equilibrium does NOT inherit the existing BUILD-space / UBB gate. UBB's gate continues to govern UBB only. Equilibrium is accessible to any authenticated user.
  - BD → checked at mount; absent → existing v1.x BD prompt overlay (reused)
  - Mission / Role → NOT route-blocking; inline-redirect CTAs in boxes 2 & 3 (copy TBD)
- **Cut-over plan for legacy `/equilibrium`:**
  - During v2 build: `/equilibrium` keeps redirecting to v1.6 Vite app
  - At v2 ship: v2 lives at `/build/equilibrium`; `/equilibrium` continues pointing at v1.6 for one stable cycle
  - Post-stability decision (separate, requires Sasha sign-off): flip or sunset — reversible. Not in v2 scope.
- Section anchor deep-linking: `/build/equilibrium#workstreams` etc. supported

### 2.3 Data Schema — DRAFTED 2026-05-15

**Implementation deliverable:** a single natural-language **Lovable prompt** consolidating the schema, RLS, indexes, and RPC below. Sasha pastes the prompt into Lovable; Lovable generates the SQL migration. The SQL below is **reference** — the prompt is what gets handed off. Prompt drafted at Planning → Implementation handoff (row 18).

Six new tables. RLS-protected.

```sql
-- One row per user — overrides + last synthesis cache
CREATE TABLE equilibrium_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_override_text TEXT,
  role_override_text TEXT,
  moon_focus_text TEXT,
  last_synthesis_text TEXT,
  last_synthesis_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE equilibrium_strategies (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 3),
  text TEXT NOT NULL,
  set_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, position)
);

CREATE TABLE equilibrium_workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);
CREATE INDEX idx_eq_workstreams_user ON equilibrium_workstreams(user_id, position)
  WHERE archived_at IS NULL;

CREATE TABLE equilibrium_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workstream_id UUID NOT NULL REFERENCES equilibrium_workstreams(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  done_at TIMESTAMPTZ,
  do_now_at TIMESTAMPTZ
);
CREATE INDEX idx_eq_tasks_ws ON equilibrium_tasks(workstream_id, status, position);

CREATE TABLE equilibrium_focus (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 3),
  task_id UUID NOT NULL REFERENCES equilibrium_tasks(id) ON DELETE CASCADE,
  promoted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, position)
);

CREATE TABLE equilibrium_synthesis_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_text TEXT NOT NULL,
  cycle_snapshot_json JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_eq_synth_user_time ON equilibrium_synthesis_log(user_id, generated_at DESC);

-- RLS: own-row-only
ALTER TABLE equilibrium_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE equilibrium_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE equilibrium_workstreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE equilibrium_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE equilibrium_focus ENABLE ROW LEVEL SECURITY;
ALTER TABLE equilibrium_synthesis_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_state" ON equilibrium_state FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_strategies" ON equilibrium_strategies FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_workstreams" ON equilibrium_workstreams FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_tasks" ON equilibrium_tasks FOR ALL USING (
  workstream_id IN (SELECT id FROM equilibrium_workstreams WHERE user_id = auth.uid())
);
CREATE POLICY "own_focus" ON equilibrium_focus FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own_synth_log" ON equilibrium_synthesis_log FOR ALL USING (user_id = auth.uid());

-- Transactional cascade RPC for task completion (per Roast Gate 2 Cycle 3 finding)
CREATE OR REPLACE FUNCTION eq_complete_task(p_task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE equilibrium_tasks SET status='done', done_at=now() WHERE id=p_task_id;
  DELETE FROM equilibrium_focus WHERE task_id=p_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Flag for Implementation:** verify `game_profiles.birthday` is canonical BD field; if v1.x reads elsewhere, point there.

### 2.4 Shell & Layout — LOCKED 2026-05-15 (refined 2026-05-15 — BUILD-space visibility)

- Shell: `<GameShellV2 hideLogo>` (three-pane Discord layout)
- **BUILD chip in SpacesRail: ALWAYS visible** (no gate on the chip itself — clarified by Sasha 2026-05-15). Anyone sees BUILD in the rail; clicking opens the SectionsPanel for BUILD.
- **BUILD SectionsPanel entries:**
  - **Equilibrium** — always visible. Anyone sees this entry; clicking triggers auth flow if unauthenticated → lands on `/build/equilibrium` after auth.
  - **Business Builder (UBB)** — gated by existing UBB logic (appears only after the user passes that gate; gate behavior unchanged by v2).
- Pane 3 content: 11-section scroll page, single column at all widths
- Focus mode: NO — spaces rail always visible. Daily-companion surface, not a wizard.
- Mobile: GameShellV2's existing rail-collapse + SectionsPanel-toggle behaviors inherited

**Structural change to BUILD-space presentation:**

Today, BUILD chip + SectionsPanel sit behind the same MeGate that UBB uses. v2 decouples this:

- **Chip visibility:** unconditional (or weakened to a much lighter gate than UBB's). Phase 4 audits the current `SectionsPanel` / `SpacesRail` config for BUILD and exposes Equilibrium + the chip independent of UBB's gate.
- **Per-entry gating:** moves from chip-level to entry-level. Equilibrium = ungated entry, content auth-gated. UBB = existing gate (entry + content).
- **Implementation flag for Phase 4:** verify the current BUILD-space exposure logic, then refactor so Equilibrium and UBB carry independent gates rather than sharing one.

### 2.5 State Management — LOCKED 2026-05-15

| Aspect | Decision |
|---|---|
| Persistence | Boxes 2-11 → Supabase (6 tables); v1.x's localStorage approach explicitly broken from |
| Computed | Boxes 4-7 → `Date.now()` + BD via ported `cycles.ts` math |
| Initial load | Single `useEquilibriumV2()` hook fetches 6 tables + Mission + Role in parallel on mount |
| Resume | None needed — server-truth; visibilitychange → re-fetch |
| Cross-device / cross-tab sync | **Supabase Realtime** on the 6 tables; fallback to visibilitychange-poll if Realtime unavailable |
| Optimistic UI | Drag-reorder + checkbox toggle apply optimistically; rollback + toast on failure (toast copy TBD) |
| Synthesis caching | `equilibrium_state.last_synthesis_text` + `last_synthesis_at`; tap → edge function → write new `equilibrium_synthesis_log` row + update cache |
| DO NOW overflow | At 4th promote, app-layer warning (mega-prompt §17.1 verbatim); if user proceeds, replaces oldest-by-`promoted_at` |

### 🔥 Roast Gate 2 — ARCHITECTURE — PASS 2026-05-15

**Cycle 1 — Entry/exit · step counters:**
- ✅ Single entry route, clean wrapper, no exit flow
- ✅ Step counters N/A (single screen)
- ✅ Anchor-link deep-linking locked IN

**Cycle 2 — Data flow · auth guards · error states:**
- ✅ MeGate at route level
- ✅ BD overlay reused
- ✅ Mission/Role not route-blocking (preserves agency)
- ⚠️ Tasks RLS uses subquery to workstreams → perf check during Implementation
- ⚠️ Write-failure toast pattern → Phase 3.5 (copy TBD)

**Cycle 3 — What 1+2 missed:**
- ✅ Transactional task-complete cascade → `eq_complete_task` RPC added to schema
- ✅ DO NOW 4th-promote → replace-oldest-by-`promoted_at` locked
- ✅ Workstream delete → CASCADE chain confirmed (tasks deleted, focus references removed)
- ⚠️ Realtime quota scale concern at growth (>1000 users) — logged, not blocking

### Verdict: Phase 2 COMPLETE.

Findings carried to Phase 3.5 (toast for write failures) and Phase 4 (RLS perf check, BD field verification).

---

## PHASE 3: UI

### 3.1 Visual Rules — LOCKED 2026-05-15

| Element | Decision |
|---|---|
| Background | Light-surface base (per Sasha cycle-box visual). `bg-white/[0.18]` wash atop optional atmospheric image or subtle gradient. Backdrop pick in Phase 4. |
| Card surface | `.liquid-glass` (light variant) per [glassmorphism_blueprint.md](../../03-playbooks/glassmorphism_blueprint.md) |
| Emphasized surface (Box 1 Synthesis) | `.liquid-glass-strong` — deeper shadow, larger radius |
| Neumorphism | Cycle orbs (boxes 4-7): inner inset shadow + light-from-top highlight → 3D glass bubbles |
| Type | Cormorant Garamond (Synthesis hero); Source Serif 4 light (body/intentions); DM Sans (UI labels/CTAs) — per glass blueprint |
| Text color | Dark navy `#0a1628` on light glass; body `rgba(26,30,58,0.78)`; soft white halo for legibility |
| Section accents | v1.6 ring palette: Solar `#c9a84c` · Zodiac `#4080c0` · Lunar `#a080c0` · Day-of-Week `#60a060` (Mercury default) · Strategy/DO NOW Rose `#c06080`. Each cycle section uses its accent for orb glow + arc terminator |
| Rainbow gradient (cycle bars) | Neon spectrum red→violet, drop-shadow glow per glass blueprint's neon-highlight technique (lightness 25-32% to avoid pastel) |
| Spacing | 8px grid. 24px section gap (desktop) / 16px (mobile). 24px card padding (desktop) / 16px (mobile) |
| Radius | Cards 24-28px · Buttons 16px · Pills + arc terminator 9999px |
| Shadow | Glass-blueprint stack: inset top + near drop + far drop |
| Animation | Token durations (200ms hover / spring for promote+cascade); all gated by `prefers-reduced-motion` |
| Master Legibility Parameter | **Strong (1.5×)** per platform default |

**Locked visual references for boxes 4-7** (Sasha-supplied 2026-05-15):

**Lunar (Box 6)** — 8 moon-phase orbs:
- Mid-cycle state: rainbow arc fully spans, all 8 orbs visible with phase art, current orb accent-glowed, full-moon terminus orb perpetually lit golden as landmark
- Early-cycle state: arc red/orange tip only (cycle just started), first orb accent-glowed, middle orbs clear glass

**Week / Day-of-Week (Box 7)** — 7 planetary-day orbs, Mon→Sun left-to-right:
- Mon=Moon (silver/violet) · Tue=Mars (red) · Wed=Mercury (slate) · Thu=Jupiter (gold-banded) · Fri=Venus (peach) · Sat=Saturn (ringed blue-gray) · Sun=Sun (fiery gold)
- Full-state: rainbow arc spans all 7 orbs, all planets visible with photorealistic art
- Early-state: arc red/orange tip only, current orb (Monday) glows in lunar violet — **per-orb identity color, NOT arc-position color**

**Canonical behavior (locked across all cycle sections):**

1. **Rainbow arc** = uniform red→violet gradient. **Fill % = cycle progress %** (left-to-right). Independent of which orb is current.
2. **Orb glow** = the orb's own *identity color* when current. NOT derived from arc-gradient position. Each segment has its own accent (planet color / phase color / sign color / season color).
3. **Non-current orbs** = clear glass showing identity art (planet image, moon phase, etc.) with no glow.
4. **Terminus landmarks** (e.g., full moon orb, perhaps year-end sun orb) may stay subtly lit as visual anchors even when not current — per-cycle decision.
5. **Segment count varies per cycle:** Lunar = 8 · Week = 7 · Zodiac = 12 (or sampled to 8) · Solar = 8 (TBD). `<CycleEnergyBar>` is segment-count-flexible.

Solar mock incoming. Zodiac mock TBD.

### 3.2 Building Blocks — LOCKED 2026-05-15

**Reuse:** `PremiumCard` (glass + glass-strong variants) · `PremiumButton` · shadcn `<Input>` / `<Textarea>` / `<Dialog>` / `<Tooltip>` · Toast (sonner)

**New (Equilibrium-specific):**

| Component | Purpose |
|---|---|
| `<EquilibriumSectionBox>` | Wrapper for each section — consistent header/body/footer; props: title, accentColor, infoIconCopy?, children |
| `<CycleEnergyBar>` | Canonical cycle visual (8 orbs + rainbow arc + 3-pill stack); props: cycleType, segments, currentPosition, prevLabel, currentLabel, nextLabel, accentColor |
| `<SynthesisCard>` | Box 1 emphasized — regenerate-on-tap, shimmer loading, deterministic fallback |
| `<MissionOrRoleSection>` | Boxes 2 & 3 — synced text + inline edit + redirect when empty |
| `<MoonFocusInput>` | Inline input + info-icon for box 6 subtitle |
| `<DraggableList>` | Wraps `@dnd-kit` Sortable; keyboard drag-drop accessible |
| `<WorkstreamChip>` | Box 9 sub-box — number + title + drag handle; click → open Goals |
| `<TaskBar>` | Box 10 sub-box — text + drag handle + delete + DO NOW + checkbox |
| `<DoNowPill>` | DO NOW button per task |
| `<DoNowSlot>` | Box 11 — up to 3 task slots + 4th-promote warning (mega-prompt §17.1 verbatim) |
| `<CompletionCascade>` | ✓ → strike-through → slide-to-done-pile animation |
| `<SectionAnchorNav>` | Floating mobile jump-to pill |

### 3.3 Layout Templates — LOCKED 2026-05-15

| Breakpoint | Behavior |
|---|---|
| Mobile (<640px) | Single column, 16px padding, SpacesRail collapsed, SectionsPanel toggled, floating `<SectionAnchorNav>` visible, cycle orbs ~32px, touch targets ≥44×44 |
| Tablet (640–1023) | Single column `max-w-2xl` centered, SectionsPanel visible, cycle orbs ~40px |
| Desktop (1024–1279) | Same `max-w-2xl`, all three panes visible, cycle orbs ~48px, full rainbow arc |
| Wide (≥1280) | Content stays at `max-w-2xl` (no multi-column even on wide — preserves reading rhythm); whitespace flanks |

All content inside `<EquilibriumSectionBox>` cards (mega-prompt §7); nothing outside boxes.

### 3.4 Brandbook Integration — LOCKED 2026-05-15

| Element | Decision |
|---|---|
| Emotional mode | Calm + grounded (daily-companion, not celebration / not warm-onboarding) |
| Voice | **TBD by Sasha** — Biologic Watch voice; precision + ambient + reading-not-coaching. Synthesis "weather report for the soul" is the seed. Full voice pass during Implementation copy round. |
| Semantic colors | Success `#22c55e` (✓ cascade) · Warning `#f59e0b` (caps + DO NOW 4th) · Error `#ef4444` (write fail) · Info `#6894d0` (tooltip) |
| Imagery | Minimal. Cycle orbs ARE the imagery. No stock photos. |
| Gradients | Rainbow on cycle bars = dominant. Subtle background wash for ambient depth. No other decorative gradients. |
| Iconography | Lucide React (gear, info ⓘ, edit, drag ⋮⋮, trash, checkbox); semantic colors only |

### 3.5 Micro-Interactions — LOCKED 2026-05-15

| Interaction | Default | Reduced-motion |
|---|---|---|
| Card hover | `scale(1.02)` + brighter top edge | Border-color shift only |
| Button hover/active | `scale(1.05)` / `scale(0.98)` | Opacity shift only |
| Synthesis regenerate tap | Text fade 60% → shimmer → new text fade-in | Instant swap |
| Synthesis pulse-breath hint | 3-4s breath cycle, 1% scale, **only when last regen > 4 hours** | No pulse |
| Drag-reorder | dnd-kit Sortable: lift + shadow + insertion line + smooth landing | Lift only; instant landing |
| DO NOW promote | Task badge flies from box 10 to box 11 (path animation) + green-glow flash on landing | Badge appears instantly in box 11 |
| Checkbox complete | ✓ animate → strike-through → spring-slide up to done-pile top | Instant state change |
| Cascade glow | Brief `#22c55e` 30%→0% flash, 400ms | No flash |
| Inline edit appear | Input fade-in over text with focus ring | Instant |
| Toast (write failure) | Slide-up bottom-right, 4s auto-dismiss; copy TBD | Fade instead of slide |
| Section anchor nav tap | Smooth scroll | Instant scroll |

### 3.6 Accessibility (WCAG 2.2 AA) — LOCKED 2026-05-15

| Requirement | Decision |
|---|---|
| Color contrast | Text on light glass ~7:1 (clear pass). Pill labels on rainbow gradient need white-halo text-shadow → verify in Phase 4 |
| Keyboard navigation | Top-down tab order across 11 sections; visible focus ring; no traps. dnd-kit gives keyboard drag-drop out-of-box (arrow keys while focused on handle) |
| Screen reader | `aria-label` on icon-only buttons; `aria-live="polite"` for Synthesis re-read; orb `aria-label` ("Lunar: waning gibbous, day 18"); cascade announces "Task completed, moved to done list" |
| Semantic HTML | `<main>` Pane 3; each section `<section aria-labelledby>`; lists `<ol>/<ul>`; buttons `<button>` |
| Form labels | Every input has visible or `sr-only` label; placeholders never substitute |
| Touch targets | ≥44×44 (drag, delete, DO NOW, checkbox) |
| Motion safety | All animations gated by `prefers-reduced-motion: reduce` |
| Orientation | Portrait + landscape, no cut-off |

### 3.7 Component States — 9 per new component

Detailed for three highest-uncertainty new components below. (`<MoonFocusInput>`, `<WorkstreamChip>`, `<TaskBar>`, `<DoNowPill>`, `<DoNowSlot>`, `<CompletionCascade>`, `<SectionAnchorNav>` follow standard patterns + platform conventions; Phase 4 implements all 9 each.)

**`<SynthesisCard>`:** Default (text + subtle pulse) · Hover (scale + brighter edge) · Focus (regenerate target ring) · Active (scale-down flash) · Disabled (N/A) · Loading (60% + shimmer) · Error (deterministic fallback + ⚠ + retry) · Empty (no-BD inline CTA — copy TBD) · Skeleton (placeholder shimmer)

**`<CycleEnergyBar>`:** Default (orbs lit + arc + current-pill glow) · Hover orb (scale 1.1 + tooltip) · Focus (ring on orb/pill) · Active (tooltip / pill swap) · Disabled (N/A) · Loading (skeleton orbs + grayscale arc + shimmer pills) · Error (muted orbs + "—" pills + retry) · Empty (no-BD inline CTA — copy TBD) · Skeleton (per Loading)

**`<DraggableList>`:** Default (items in position order) · Hover (handle reveals + grab cursor) · Focus (ring on handle) · Active dragging (lift + shadow + drop indicator) · Disabled (handle hidden for archived) · Loading (skeleton bars) · Error (red border + retry) · Empty (TBD copy + inline `+`) · Skeleton (2-3 skeleton bars)

### 3.8 Tokens Audit — LOCKED 2026-05-15

| Category | Source | Audit rule |
|---|---|---|
| Colors | Platform token JSON + brandbook semantic + v1.6 ring palette | No inline hex |
| Type scale | UI Playbook Part VI (9 levels) | Synthesis = h2; section headers = h3; intentions = body; meta = caption |
| Spacing | 8px multiples | No random px; lint-enforced |
| Radius | sm/md/lg/xl/2xl/full | Cards = lg/xl; pills = full |
| Shadows | Glass blueprint stack + token set | No raw `box-shadow` |
| Duration | instant/fast/normal/slow/gentle | Hover = normal; spring = gentle; reduced-motion = instant |
| Easing | default / spring | Spring for promotes/cascades; default else |

### 3.9 Design Critique — Nielsen's 10 — LOCKED 2026-05-15

| # | Heuristic | Score | Notes |
|---|---|---|---|
| 1 | Visibility of system status | 5/5 | Synthesis loading + cascade + DO NOW counter + nav highlight |
| 2 | Match real world | 5/5 | Biologic Watch + orbs + Solar System's rhythms + DO NOW |
| 3 | User control + freedom | 4/5 | Drag/reorder/delete + inline edit; **undo-on-delete flag for Implementation** (4s toast-undo) |
| 4 | Consistency + standards | 5/5 | All sections use `<EquilibriumSectionBox>`; result-verb CTAs; token discipline |
| 5 | Error prevention | 5/5 | Workstream cap + DO NOW cap + clarity-gated strategies |
| 6 | Recognition over recall | 5/5 | Cycle orbs + arcs + persistent mission/role + anchor nav |
| 7 | Flexibility + efficiency | 4/5 | Keyboard drag + anchor links + inline edit; **keyboard shortcuts flag for Implementation polish** |
| 8 | Aesthetic + minimalist | 5/5 | Glass + neumorphism + rainbow; nothing extraneous |
| 9 | Recognize/diagnose/recover from errors | 3/5 | Toast pattern specified (copy TBD); deterministic synthesis fallback; **retry affordance detail thin → Implementation tightens** |
| 10 | Help + documentation | 4/5 | Info-icons on Moon Focus + Strategies; visual reference IS the documentation; no separate help page (acceptable for v2) |

**Total: 5/5 × 7, 4/5 × 2, 3/5 × 1.** Three implementation flags (undo-on-delete, keyboard shortcuts, error-recovery detail).

### 🔥 Roast Gate 3 — UI — PASS 2026-05-15

**Cycle 1 (color harmony / readability):** ✅ Light glass + dark navy ~7:1; ⚠️ pill labels on gradient need white-halo verify → Phase 4

**Cycle 2 (Linear/Notion/Stripe comparison):** ✅ Peer-product aesthetic — denser than v1.6 but calmer than Linear; Notion-adjacent drag-reorder; Stripe-aligned glass material

**Cycle 3 (what 1+2 missed):**
- Synthesis pulse-breath gated to >4h since last regen (locked above in 3.5)
- ✅ **Dark mode out of scope for v2** (Sasha 2026-05-15) — light-only locked; dark variant deferred to a future cycle if/when needed
- ⚠️ Long-scroll fatigue → section anchor nav addresses; verify in Implementation browser test
- ✅ Cycle orb consistency across 4-7 confirmed via `<CycleEnergyBar>` reuse
- ✅ Loading skeleton coverage: every component has skeleton state; full-page skeleton until `useEquilibriumV2()` resolves

### Verdict: Phase 3 COMPLETE.

Findings carried as Phase 4 implementation flags: undo-on-delete · keyboard shortcuts · error-recovery detail · pill-label contrast verify · mobile long-scroll browser test.

### 3.2 Building Blocks

_TBD._

Reuse inventory (confirm):

- `PremiumCard` (glass variant) for the 9 box containers
- `PremiumButton` for SET / SYNC / + / DO NOW CTAs
- shadcn `<Input>` / `<Textarea>` for user-input fields
- shadcn `<Dialog>` for any modal flows (drag-drop preview, delete confirm)
- New: 8-segment curved progress bar (Solar / Zodiac / Moon)
- New: drag-and-drop list component (workstreams, tasks) — likely `dnd-kit`
- New: DO NOW pill button + cascade animation
- New: prev/current/next energy reader

### 3.3 Layout Templates

_TBD — single-page scroll, mobile-first._

### 3.4 Brandbook Integration

_TBD._

### 3.5 Micro-interactions

_TBD — drag-drop reordering, DO NOW promote animation, checkbox complete + cascade-down animation, sync flash on auto-sync._

### 3.6 Accessibility

_TBD — WCAG 2.2 AA. Keyboard drag-drop required (use `dnd-kit`'s accessibility kit)._

### 3.7 Component States

_TBD — all 9 per component (default → hover → focus → active → disabled → loading → error → empty → skeleton)._

### 3.8 Design Tokens Audit

_TBD._

### 3.9 Design Critique (Nielsen's 10)

_TBD._

### 🔥 Roast Gate 3

_TBD._

---

## PHASE 4: CODE — Implementation DoD (draft, opens after Planning handoff sign-off)

Location: `src/modules/equilibrium/` per playbook convention.

| # | Deliverable | Evidence | Status |
|---|---|---|---|
| 1 | Lovable prompt executed → Supabase live | 6 tables + RLS + indexes + RPC visible in Supabase dashboard | ⬜ |
| 2 | Cycles math ported to `src/lib/equilibrium-cycles/` | v1.x Vite app still imports own `cycles.ts` unchanged | ⬜ |
| 3 | Zodiac math implemented (`getZodiacState`) | Returns sign + progress + energy + prev/current/next | ⬜ |
| 4 | Edge function `generate-equilibrium-v2-synthesis` deployed | POST returns `{ reading }` for valid payload | ⬜ |
| 5 | Module scaffold `src/modules/equilibrium/` | `EquilibriumV2Page.tsx` + 12 component files | ⬜ |
| 6 | 12 new components implemented with all 9 states | Storybook or test-page coverage | ⬜ |
| 7 | `useEquilibriumV2()` hook | Parallel fetch + Realtime subscriptions + optimistic UI | ⬜ |
| 8 | Route + auth wiring | `/build/equilibrium` in App.tsx; auth-on-entry; BD overlay reused; no UBB-gate inheritance | ⬜ |
| 9 | BUILD-space exposure refactor | BUILD chip unconditional; Equilibrium entry ungated; UBB entry retains gate; per-entry gating | ⬜ |
| 10 | Sasha-supplied copy applied | Empty states + brand voice + synthesis prompt + error-recovery + toast copy | ⬜ |
| 11 | 6 carryover flags addressed | undo-on-delete · keyboard shortcuts · error-recovery · pill contrast · dark mode · mobile scroll test | ⬜ |
| 12 | Build + type-check clean | `npm run build` + `tsc --noEmit` zero errors | ⬜ |
| 13 | Browser preview verified | 11 sections render; drag-reorder; DO NOW → ✓ → cascade; synthesis regenerate; mobile + desktop | ⬜ |
| 14 | 🔥 Roast Gate 4 | Functional tests · edge cases · recording captured | ⬜ |
| 15 | `module_taxonomy.md` updated | v2 status: platform-resident module | ⬜ |
| 16 | Cut-over decision | (deferred — Sasha sign-off post-stability) | (deferred) |

### Open Sasha copy items (group as single "v2 copy pass")

- Empty-state copy: boxes 1, 2, 3, 6, 9, 10, 11
- Synthesis edge-function system prompt body + calibration examples
- Write-failure toast copy
- Voice pass for any header / metadata that surfaces in UI

### Lovable prompt for Supabase deployment

See [equilibrium_v2_tracker.md](./equilibrium_v2_tracker.md) for the natural-language Lovable prompt that consolidates the schema, RLS, indexes, RPC, and edge function scaffold. Sasha pastes that prompt into Lovable; Lovable generates and runs the migration.

---

## Reference: Open Questions for Phase 1 / 2 Exploration

To be resolved during the relevant phase, not preconditions:

- **Mission Discovery module** — confirm existence, route, data shape, "one sentence" output location (DB column or join).
- **ZoG / Top Talent** — confirm "current unique talent sentence" data location. Memory says reveal is via deep-profile page; the *one sentence* exact path TBD.
- **Build space route conventions** — match existing pattern when defining `/build/equilibrium` (or equivalent).
- **Zodiac math** — does it exist in v1.x or is it new? Verify in Phase 2.1.
- **Animation library** — Framer Motion already in repo? Confirm before specifying micro-interactions.
- **Supabase Realtime** — already wired for other tables? Determines tab/device-sync approach.

---

*Spec scaffold ready. Phase 1.1 (Master Result + Deep Roast) is the next substantive work. Roasted output replaces TBD blocks inline.*
