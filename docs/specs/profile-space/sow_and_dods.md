# Profile Space — SOW & DoDs (Planning · Implementation · Testing)

> *Day 119 (2026-07-09), Sasha's brief, verbatim intent: create a Profile space in ME holding mission discovery, assets discovered, top talent, quality of life, and collaboration requests sent — with retake/edit for any test, QoL assessment access, progression view ("short summary of what changed" + history), a LinkedIn upload, and one-click full-profile PDF export building on the existing Settings download. Built from scratch — no legacy pages reused.*

**Why this matters (roadmap frame):** the profile is the atomic unit of the coordination system — Signal Legibility as Provision (Domain 92) made into a surface. It is also the exact module set being sold to community nodes (onboarding = profile creation · ZoG detection · matchmaking), so this build doubles as white-label product hardening.

---

## Ground truth from the codebase (planning inputs, verified 2026-07-09)

| Fact | Consequence |
|---|---|
| ME pane = `SPACE_SECTIONS.grow` in `SectionsPanel.tsx`; current items: Top Talent, Mission, QoL, Assets; overview page = `ProfileOverview.tsx` at `/game/me/overview` | Profile Space replaces the overview as the ME landing; pane gets a "Profile" entry at top |
| `qol_snapshots` **append per retake** (history works today); `zog_snapshots` **overwrites in place** (`getOrCreateSnapshot` → `.update()`); `missions` ≈ 1 canonical row; `user_assets` = append/sync | ZoG save flow must switch to insert-new-row on retake to enable history. Mission history = keep prior rows on re-extract |
| Collaboration requests sent = `match_interests` where `from_user_id = me` (mutual = `match_intros`) | Profile shows sent requests + status (`consent_response`) — read-only list |
| `generateProfilePdf()` already bundles TT + Mission + Assets + QoL; button in Settings → export tab | Reuse the module; add profile-page button; extend content (LinkedIn note, change history page) |
| `LinkedInUpload.tsx` + `linkedin-profiles` bucket + `game_profiles.linkedin_pdf_url` exist but are **orphaned** (only mounted by unrouted `CharacterHub.tsx`) | Rebuild the UI fresh on the new page; reuse bucket + columns (no schema change needed) |
| Legacy: `Profile.tsx` (retired), `CharacterHub.tsx` (orphaned), `ProfileOverview.tsx` (current) | Per Sasha: **no legacy composition reused.** New components under `src/modules/profile-space/`. Legacy files untouched in this pass (removal = cleanup wave) |
| ME rule (memory, locked): ME items are **populated or empty, never fog-of-war locked** | Empty states invite ("Take the assessment"), never lock |
| i18n en/ru/es via `common.json`; skins via `--skin-*` tokens; ME gate = `MeGate` | All new UI ships trilingual, skin-aware, MeGate-gated |
| Lovable constraint: 2 prompts/day, no dashboard | ALL Supabase-side needs (migration + any edge fn) batch into ONE numbered prompt at implementation end |

---

## Locked decisions (planning phase output — Sasha signs off)

1. **D1 — ZoG history:** retakes append a new `zog_snapshots` row; `last_zog_snapshot_id` tracks latest. No migration needed (schema already allows many rows) — only the save-flow change in `saveToDatabase.ts`.
2. **D2 — Change summary:** the "what changed" line per history event is computed **client-side, deterministic** (v1): diff of talents list / QoL stage deltas / mission text change / assets added. An AI-written narrative summary is wave 2 (new edge fn) — not in this build.
3. **D3 — LinkedIn v1 = upload + store + display** (filename, date, download/replace/delete). AI extraction of the PDF into profile fields = wave 2, parked.
4. **D4 (revised at sign-off, 2026-07-09) — Route:** Profile Space lives at **`/game/me/profile`** as a NEW ME pane item ("Profile", top of the list). `/game/me` and `/game/me/overview` stay exactly as they are — nothing existing moves, nothing breaks in production. Sasha: "I want the ME space to have a 'profile' 2nd-pane item where we will show this profile."
5. **D5 — PDF:** reuse `generateProfilePdf` as the engine; add a "Change history" page section to the PDF; button on the profile page mirrors Settings (single source function, two entry points).
6. **D6 — New DB surface:** none required. History derives from existing snapshot rows + `user_assets.created_at` + `match_interests.created_at`. Zero Lovable prompts if D2 stays deterministic; the only Supabase touch is *no-op*. (If QoL/ZoG RLS blocks reading older rows, one migration adds select policies — checked in Phase T.)

---

## Phase P — Planning SOW

**Scope:** produce this document; verify ground truth in code (done above); lock decisions D1–D6; define screens and DoDs below. **Out of scope:** any code.

### Planning DoD

| # | Item | Evidence | Status |
|---|---|---|---|
| P1 | Codebase ground-truth map (nav, data models, retake flows, PDF, LinkedIn, history capability) | table above, verified against files | ✅ |
| P2 | Decisions D1–D6 stated, each with rationale | section above | ✅ |
| P3 | Screen inventory + section-by-section content contract | below | ✅ |
| P4 | Implementation & Testing SOW/DoDs written | below | ✅ |
| P5 | Sasha sign-off on D1–D6 and scope | chat confirmation 2026-07-09 ("Green Light", D4 revised to pane item) | ✅ |

### Screen inventory (content contract)

**`/game/me` — Profile Space Home** (new, `src/modules/profile-space/ProfileSpaceHome.tsx`):
1. **Identity header** — name, avatar, archetype title (from latest ZoG), member-since.
2. **Top Talent card** — archetype + top-3 talents + one-line core pattern; actions: *View full* (→ `/game/me/zone-of-genius`) · *Retake* (→ `/zone-of-genius/assessment`). Empty state: invitation.
3. **Mission card** — statement + categories; *View* · *Rediscover* (→ `/mission-discovery`). Empty state: invitation.
4. **Assets card** — count + latest 3 titles by type; *View all* (→ `/game/me/assets`) · *Add more* (→ `/asset-mapping/wizard?return=/game/me`).
5. **Quality of Life card** — 8-dimension mini-read (current stages) + overall; *View map* · *Retake* (→ `/quality-of-life-map/assessment`).
6. **Collaboration requests card** — sent `match_interests` list: who, when, status (pending / accepted / declined); link to `/game/connections` equivalents. Read-only.
7. **Progression & history** — reverse-chronological timeline of profile events (ZoG snapshots, QoL snapshots, mission updates, asset additions, requests sent), each with the deterministic "what changed" line (D2). Collapsed to last 5 + "show all".
8. **LinkedIn upload block** — D3 contract.
9. **Export block** — "Download complete profile (PDF)" via `generateProfilePdf`.

All sections: populated-or-empty (never locked), skin tokens, trilingual.

---

## Phase I — Implementation SOW

**Scope:** build the screens per contract; ZoG append-mode save; PDF history section; wire ME pane + routes; i18n ×3. **Out of scope:** AI change-narratives, LinkedIn extraction, public-profile changes, legacy file deletion, visibility/privacy redesign.

### Implementation DoD

| # | Item | Evidence | Status |
|---|---|---|---|
| I1 | `src/modules/profile-space/` created; `ProfileSpaceHome` + section components, **zero imports from legacy** `Profile.tsx`/`CharacterHub.tsx`/`ProfileOverview.tsx` | grep clean | ✅ |
| I2 | Route `/game/me/profile` renders ProfileSpaceHome under `MeGate`; ME pane item "Profile" at top; existing routes untouched | App.tsx + SectionsPanel diff | ✅ |
| I3 | Identity header + 5 data cards live with real data + empty states | screenshots populated & empty | ☐ |
| I4 | Retake/edit entries from every card reach the correct flow and **return to `/game/me`** after completion | click-through | ☐ |
| I5 | D1: ZoG retake inserts new snapshot row (old rows preserved), pointer updated | code shipped; DB evidence pending T3 | ✅ |
| I6 | History timeline renders merged events + deterministic change lines (D2) | screenshot w/ ≥2 snapshot generations | ☐ |
| I7 | LinkedIn block: upload/replace/download/delete against existing bucket + columns | round-trip test | ☐ |
| I8 | PDF button on page; PDF gains history section; Settings button still works (shared engine) | generated PDF attached | ☐ |
| I9 | i18n keys en/ru/es for every visible string; skin tokens; mobile layout sound | locale diff (+100 lines ×3); mobile pending T7 | ✅ |
| I10 | `tsc` + production build clean | both clean 2026-07-09 | ✅ |

---

## Phase T — Testing & Debugging SOW

**Scope:** prove the DoD evidence column end-to-end in preview against real auth'd data; regression-check surfaces that share code. **Out of scope:** load testing, cross-browser beyond Chrome.

### Testing DoD

| # | Item | Evidence | Status |
|---|---|---|---|
| T1 | Fresh account walk: empty profile → each empty state invites, nothing locked (ME rule) | preview walkthrough | ☐ |
| T2 | Populated account: all cards show correct live data matching DB rows | side-by-side check | ☐ |
| T3 | Retake loop each assessment once: history grows, change lines correct, pointers heal | timeline screenshot | ☐ |
| T4 | RLS: older own-snapshots readable; another user's rows NOT readable | query as two users | ☐ |
| T5 | PDF: populated + empty-section profiles both render; RU/ES text does not break layout | 3 PDFs | ☐ |
| T6 | Regressions: `/game/me/zone-of-genius/*`, QoL results, assets page, Settings export, PublicProfile all unaffected | click-through + console clean | ☐ |
| T7 | Mobile (375px) + dark/light skins pass visual sanity | screenshots | ☐ |
| T8 | Session log + roadmap closure entries; corpus mirror re-synced | dated entries | ☐ |

**Bug protocol:** anything found in T goes root-cause-first; fixes land as atomic commits referencing the T-item.

---

*Deploy note: if T4 reveals missing select-policies, the fix migration + any redeploys batch into ONE Lovable prompt.*
