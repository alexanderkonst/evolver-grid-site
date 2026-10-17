# Equilibrium Task Flow — Scope, Plan, Spec

> *© 2026 Alexander Konstantinov · [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)*
>
> Status: **spec v1.0, 2026-10-16.** Top priority, set by Sasha on 2026-10-16. Author: Hark. Source pin: `alexanderkonst/evolver-grid-site@36d0f19` (main, 2026-10-16).
> Companions: [`equilibrium_user_manual.md`](./equilibrium_user_manual.md) (how to fill the watch), [`equilibrium_task_engine_manual.md`](./equilibrium_task_engine_manual.md) (why the ACT side works this way), [`../05-specs/founder_cockpit_equilibrium_writeback_sow.md`](../05-specs/founder_cockpit_equilibrium_writeback_sow.md) (agent-write API contract).

---

## 0. Task, job, roadmap

- **Task:** add a Subtask level and an owner-split DO NOW (HUMAN = 1, AI = unlimited) to Equilibrium, cap Workstreams and Tasks at 3, and make Equilibrium the single source of truth behind the Hark panels EQUILIBRIUM and AI WORK IN PROGRESS.
- **Job it serves:** Sasha's words (2026-10-16, condensed): kill context-switching overload; one coherent picture; "reinventing Trello" integrated into the biological watch.
- **Roadmap status:** row **C0** in `docs/02-strategy/roadmap.md` → This Week's Scope (added with this spec). Related open issues: #46 (ACT caps 7×7 → 3×3, Gate 1 waiting for "go" since 2026-10-13), #66 (Parked section), #69 (Planning anchored to the new moon).

## 1. Sasha's model (his words, condensed; the terms below are his)

- **Hierarchy:** life strategy → yearly focus → monthly (Moon) Focus → Strategy → **Workstreams** (AI synthesizes so there are always 1–3, never more) → each workstream **max 3 Tasks** → each Task has **unlimited Subtasks** (new level).
- The Hark panel **AI WORK IN PROGRESS** (formerly Today's Requests) = the subtasks happening right now. It merges into Equilibrium as the single source of truth and keeps that panel's view.
- **DO NOW split by owner:** **HUMAN Do Now** = exactly ONE item at a time (a human can't multitask). **AI Do Now** = unlimited (AI clones itself into agents). Any task or subtask can be promoted to Do Now.
- He promotes to Do Now directly from the Hark panel (the panel = radically simplified interface of his products). Always visible: his one current task, what the AI is doing, where his input is needed, what waits on whom, status, mapped up to Moon Focus and beyond. Integrated with the lunar cycle watch (8 phases).

How this maps onto what exists today (`@36d0f19`):

| Sasha's level | Equilibrium today | After this spec |
|---|---|---|
| life strategy | Lifelong Dedication (`equilibrium_state.mission_override_text`) | unchanged (D7) |
| yearly focus | none (Solar year phase is read-only) | D7: deferred to Phase 4 |
| Moon Focus | `equilibrium_state.moon_focus_text` | unchanged |
| Strategy | `equilibrium_strategies` (1–3) | unchanged |
| Workstreams | `equilibrium_workstreams`, cap 7 | cap **3** |
| Tasks | `equilibrium_tasks`, cap 7 per workstream | cap **3** per workstream, + `owner` |
| Subtasks | — | **new** `equilibrium_subtasks`, unlimited |
| DO NOW | `equilibrium_focus`, 3 slots, tasks only, "1 recommended" | **new** `equilibrium_do_now`: HUMAN = 1 (DB-enforced), AI = unlimited, tasks and subtasks |

---

## 2. Definition of Done (whole effort)

Phases 1 and 2 are `@claude` issues; each issue carries its own 5–20 row DoD with gates. This table is the umbrella. Hark ticks it.

| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | Spec committed to main | this file at a commit SHA on main | ✅ |
| 2 | Roadmap row C0 links this spec | `docs/02-strategy/roadmap.md` This Week's Scope, row C0 | ✅ |
| 3 | Phase 1 issue open (`@claude`, Codex fallback) | issue URL in §10 | ⬜ |
| 4 | Phase 2 issue open (`@claude`, Codex fallback) | issue URL in §10 | ⬜ |
| 5 | Equilibrium task "Equilibrium Task Flow (spec + build)" exists in Founder OS | `read_state` shows it; task id in §10 | ⬜ |
| 6 | `equilibrium_subtasks` + `equilibrium_do_now` live, RLS owner-only | migration file merged; Lovable deploy report; `read_state` returns `subtasks` | ⬜ |
| 7 | HUMAN Do Now cap = 1 enforced in the DB | second human insert fails on the unique index (test output) | ⬜ |
| 8 | Workstream cap 3 and task cap 3 enforced in agent-write and UI | `create_workstream` / `create_task` at cap → 400 with cap message; UI add row hidden at 3 | ⬜ |
| 9 | Ops `add_subtask`, `update_subtask`, `promote_do_now`, `demote`, `complete` (+ `move_task`, `convert_task_to_subtask`, `delete_subtask`) live, audit-logged, `dry_run` + `idempotency_key` | curl transcripts against the live function | ⬜ |
| 10 | `read_state` v2 shape (§5.3) live; legacy `do_now` field still present | live `read_state` JSON | ⬜ |
| 11 | App shows subtasks, owner, status, HUMAN DO NOW (1) and AI DO NOW (n); promote/demote/complete on tasks and subtasks | screenshots of `/build/equilibrium` at 390px and 1280px | ⬜ |
| 12 | EQUILIBRIUM panel reads the v2 state (§6) | panel package + screenshot | ⬜ |
| 13 | AI WORK IN PROGRESS reads subtasks from Equilibrium, same view as today | panel refresh runbook names `read_state` as source; journal no longer the source of truth | ⬜ |
| 14 | Promote to HUMAN Do Now from a Hark panel in one tap | one tap → `promote_do_now` audit row → app shows the item in HUMAN DO NOW | ⬜ |
| 15 | Hark writes every new request as a subtask (PULSE + chat) | 3 consecutive requests appear as subtasks with owner/status | ⬜ |
| 16 | Workstreams 4 → 3 executed per Sasha's decision D1 | `read_state` shows ≤3 workstreams | ⬜ (needs Sasha) |
| 17 | Lunar integration (Phase 4) per §9 | Phase 4 issue DoD | ⬜ |
| 18 | Manuals updated: user manual + task engine manual say 3 × 3, subtasks, HUMAN/AI Do Now | diff on both files (Sasha's prose edited only after D6) | ⬜ |

---

## 3. Scope

**In**
- DB: new tables `equilibrium_subtasks`, `equilibrium_do_now`; new column `equilibrium_tasks.owner`. Additive migration only.
- Agent-write: 5 ops Sasha named + 3 support ops (§5.2); caps 3 × 3; `read_state` v2.
- App UI (`/build/equilibrium`): subtasks under tasks, owner, status, waiting-on, two DO NOW lists, promote from anywhere.
- Hark panels EQUILIBRIUM (`e396e82d`) and AI WORK IN PROGRESS (`2ab8efee`): read from Equilibrium, write through agent-write (Phase 3, Hark's lane).
- Lunar integration (Phase 4).

**Out**
- Dropping `equilibrium_focus` or any other table or column. It stays until Sasha approves removal (irreversible).
- Executing the 4 → 3 workstream migration (D1 is a decision for Sasha; nothing is moved by this spec).
- Parked section (#66) and the phase-anchor fix (#69): separate issues, referenced only.
- Multi-user sharing of subtasks, assignees other than human/ai, due dates, time tracking, recurring tasks.
- Telegram bot and Founder Cockpit surfaces (they keep reading the old shape; listed as follow-ups).
- Any change to locked texts (v2 spec §1.3–§1.5).

---

## 4. Data model

All new tables: owner-only RLS, same pattern as `equilibrium_workstreams` (`user_id = auth.uid()` for select/insert/update/delete). The agent-write function uses the service role and scopes every query to `EQUILIBRIUM_AGENT_WRITE_USER_ID`.

### 4.1 `equilibrium_tasks` — add owner

```sql
ALTER TABLE public.equilibrium_tasks
  ADD COLUMN owner TEXT NOT NULL DEFAULT 'human' CHECK (owner IN ('human','ai'));
```

Existing rows become `human`. No other column changes.

### 4.2 `equilibrium_subtasks` — new

```sql
CREATE TABLE public.equilibrium_subtasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id      UUID NOT NULL REFERENCES public.equilibrium_tasks(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL DEFAULT 0,
  text         TEXT NOT NULL CHECK (char_length(text) BETWEEN 1 AND 4000),
  owner        TEXT NOT NULL DEFAULT 'ai' CHECK (owner IN ('human','ai')),
  status       TEXT NOT NULL DEFAULT 'todo'
               CHECK (status IN ('todo','in_progress','waiting','done','dropped')),
  waiting_on   TEXT,          -- who it waits on: 'sasha', 'claude', 'codex', 'lovable', a person's name; null unless status = 'waiting'
  priority     SMALLINT CHECK (priority BETWEEN 1 AND 3),  -- P1..P3, the panel's ranking; null = unranked
  external_ref TEXT,          -- PR / issue / doc URL
  note         TEXT,          -- one-line state, e.g. "Codex PR, check 17:30"
  created_by   TEXT NOT NULL DEFAULT 'human',  -- 'human' or the agent_name
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  done_at      TIMESTAMPTZ
);
CREATE INDEX idx_eq_subtasks_task ON public.equilibrium_subtasks (task_id, status, position);
CREATE INDEX idx_eq_subtasks_user_status ON public.equilibrium_subtasks (user_id, status);
```

- No cap on subtasks (Sasha: unlimited).
- `done` and `dropped` are terminal; `done_at` is stamped for both. `dropped` = the panel's ❌ (declined / impossible).
- Panel mark mapping: `waiting` + `waiting_on = 'sasha'` → ❓; `todo`/`in_progress`/`waiting` (other) → ⏳; `dropped` → ❌; `done` → ✅.

### 4.3 `equilibrium_do_now` — new (replaces the 3-slot `equilibrium_focus` for reads and writes)

```sql
CREATE TABLE public.equilibrium_do_now (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner       TEXT NOT NULL CHECK (owner IN ('human','ai')),
  task_id     UUID REFERENCES public.equilibrium_tasks(id) ON DELETE CASCADE,
  subtask_id  UUID REFERENCES public.equilibrium_subtasks(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,          -- order inside AI Do Now; always 0 for human
  promoted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  promoted_by TEXT NOT NULL DEFAULT 'human',
  CHECK ((task_id IS NULL) <> (subtask_id IS NULL))  -- exactly one target
);
-- HUMAN Do Now = exactly one item at a time, enforced by the database.
CREATE UNIQUE INDEX uq_eq_do_now_one_human ON public.equilibrium_do_now (user_id) WHERE owner = 'human';
-- An item can be in Do Now once.
CREATE UNIQUE INDEX uq_eq_do_now_task    ON public.equilibrium_do_now (user_id, task_id)    WHERE task_id IS NOT NULL;
CREATE UNIQUE INDEX uq_eq_do_now_subtask ON public.equilibrium_do_now (user_id, subtask_id) WHERE subtask_id IS NOT NULL;
```

- **Backfill (in the same migration):** the `equilibrium_focus` row at position 1 (if any) becomes the HUMAN row. Rows at positions 2–3 are not carried over; their tasks stay active in their workstream. `equilibrium_focus` itself is left untouched (no drop). Live data on 2026-10-16: `do_now` is null, so the backfill moves nothing.
- Completing a task or subtask deletes its Do Now row (FK cascade covers deletes; `complete` removes it explicitly).
- Completing a task does **not** complete its open subtasks (D4).

### 4.4 Caps

| Level | Cap | Where enforced |
|---|---|---|
| Workstreams (active) | 3 | agent-write `MAX_WORKSTREAMS = 3`; UI `MAX_WORKSTREAMS = 3` (#46) |
| Tasks per workstream (active) | 3 | agent-write `MAX_TASKS = 3`; UI (#46) |
| Subtasks per task | none | — |
| HUMAN Do Now | 1 | DB unique index + agent-write + UI |
| AI Do Now | none | — |

Caps are not DB constraints (same call as #46: existing over-cap data must keep loading). Over-cap rows stay visible and read-only in the UI per #46. The AI's job at a cap is to synthesize (merge or convert to subtasks), not to fail silently: agent-write's cap error names `move_task` / `convert_task_to_subtask` as the way out.

---

## 5. Agent-write API (`supabase/functions/equilibrium-agent-write/index.ts`)

Same contract as today: `x-agent-token` gate, allowlist, single-user scoping, `dry_run`, `idempotency_key`, one audit row per write in `equilibrium_synthesis_log`, `MAX_BODY_BYTES` unchanged.

### 5.1 Item reference

Ops that act on "a task or a subtask" take `payload.item = { "type": "task" | "subtask", "id": "<uuid>" }`. Ownership is checked through the item's chain (subtask → task → workstream → `user_id`).

### 5.2 New ops

| Op | Payload | Behaviour |
|---|---|---|
| `add_subtask` | `task_id`, `text`, `owner?` (default `ai`), `status?` (default `todo`), `waiting_on?`, `priority?`, `external_ref?`, `note?` | Insert at the end of the task's subtasks. Dedupe: an active subtask with the same normalized text under the same task is reused (`created: false`), like `create_task`. `created_by` = `agent_name`. |
| `update_subtask` | `subtask_id` + any of `text`, `owner`, `status`, `waiting_on`, `priority`, `external_ref`, `note`, `position` | Partial update; stamps `updated_at`; `status → done/dropped` stamps `done_at` and removes any Do Now row; `status` other than `waiting` clears `waiting_on`. |
| `promote_do_now` | `item`, `owner?` | `owner` defaults to the item's owner. **human:** if a human row exists for a different item, it is replaced in one transaction; the response returns `replaced: {type, id, text}` so the panel can say what left. **ai:** appended at the end of AI Do Now; no cap. Idempotent if the item is already in Do Now with that owner. Promoting an item already in the other owner's list moves it. Done/dropped items → 400. Stamps `equilibrium_tasks.do_now_at` for tasks. |
| `demote` | `item` | Delete the item's Do Now row. The item stays active where it lives. No-op (200, `demoted: false`) if not in Do Now. |
| `complete` | `item` | Task: same writes as `complete_task` (status `done`, `done_at`, `workstream_title_snapshot`) + delete Do Now row. Subtask: status `done`, `done_at`, delete Do Now row. |
| `move_task` | `task_id`, `workstream_id` | Move a task (with its subtasks) to another workstream; refuses if the target is at the task cap. Used by the 4 → 3 synthesis. |
| `convert_task_to_subtask` | `task_id`, `parent_task_id`, `owner?` | Creates a subtask under `parent_task_id` carrying the task's text, status (`active` → `todo`, `done` → `done`) and `created_at`; re-parents the task's own subtasks under the parent; moves its Do Now row to the new subtask; then deletes the task. `dry_run` first is mandatory in Hark's runbook. |
| `delete_subtask` | `subtask_id` | Hard delete (Do Now row cascades). |

Kept for compatibility:
- `promote_task_to_focus` → alias of `promote_do_now` with `owner: "human"`; `position` is ignored. Writes `equilibrium_do_now`, not `equilibrium_focus`.
- `complete_task` → alias of `complete` with `item.type = "task"`.
- `create_task` gains optional `owner`.

### 5.3 `read_state` v2

Existing fields stay. Added fields:

```json
{
  "caps": { "workstreams": 3, "tasks_per_workstream": 3, "human_do_now": 1 },
  "workstreams": [
    {
      "id": "dbe0b90d-…", "title": "Founder OS", "position": 0, "over_cap": true,
      "tasks": [
        {
          "id": "…", "name": "Equilibrium Task Flow (spec + build)", "text": "…",
          "status": "active", "owner": "human", "is_focus": false, "do_now": null,
          "subtasks": [
            {
              "id": "…", "text": "Phase 1: backend + ops (#N)", "owner": "ai",
              "status": "waiting", "waiting_on": "claude", "priority": 1,
              "external_ref": "https://github.com/alexanderkonst/evolver-grid-site/issues/N",
              "note": "Gate 1 plan due", "do_now": "ai", "created_by": "hark",
              "created_at": "…", "updated_at": "…", "done_at": null
            }
          ]
        }
      ]
    }
  ],
  "do_now_v2": {
    "human": { "type": "subtask", "id": "…", "text": "…", "path": ["Founder OS", "Equilibrium Task Flow (spec + build)"], "promoted_at": "…" },
    "ai": [ { "type": "subtask", "id": "…", "text": "…", "path": ["…", "…"], "status": "in_progress", "waiting_on": null } ]
  },
  "waiting_on_human": [ { "type": "subtask", "id": "…", "text": "…", "path": ["…", "…"] } ],
  "subtask_counts": { "todo": 0, "in_progress": 0, "waiting": 0, "waiting_on_human": 0, "done_today": 0, "dropped_today": 0 }
}
```

- `subtasks` per task: all non-terminal subtasks + terminal ones with `done_at` in the last 48 h (the panel's ✅ list), newest done first.
- `do_now` (legacy field) = the HUMAN Do Now **task** if the human row points to a task; if it points to a subtask, `{ id: <parent task id>, name: <subtask text>, workstream_title }`, so Hark's current EQUILIBRIUM panel keeps working until Phase 3.
- `is_focus` = the task has any Do Now row.
- `done_today` uses the America/Mexico_City day (UTC-06:00), the same day boundary as the AI WORK IN PROGRESS panel.
- `phase_readiness.layers.doNow` reads `equilibrium_do_now` (human row).

---

## 6. Hark panel contract (Phase 3, Hark's lane, no GitHub issue)

Panels cannot call APIs. Every panel button is a prompt to Hark; Hark calls agent-write and refreshes the panel. "One tap" = one tap → Hark runs → panel updates (seconds, not instant).

### 6.1 EQUILIBRIUM (`e396e82d`)

Reads `read_state` v2. Shows, top to bottom:
1. Lunar phase, days left, the phase job line (as today).
2. Chain line: Moon Focus › Strategy 1 (tagline) — the map up to Moon Focus and beyond.
3. **HUMAN DO NOW**: the one item, its path (`Workstream › Task`), buttons **Done** and **Demote**. Empty state: "Nothing in HUMAN DO NOW. Promote one item."
4. **AI DO NOW**: count + top items with status.
5. **Waiting on you**: `waiting_on_human` items, each with **Do now** (promote to HUMAN).
6. Workstreams (≤3) with their tasks (≤3); each task a **Do now** button.

Writes (via Hark prompt): `promote_do_now`, `demote`, `complete`.

### 6.2 AI WORK IN PROGRESS (`2ab8efee`)

Keeps today's view exactly: Autopilot row first, lead sentence counts, items ordered ❓ → ⏳ (P1, P2, P3) → ❌ → ✅, each with a Comment action. What changes is the source:
- **Items = subtasks** (owner `ai`, plus owner `human` subtasks that wait on an AI) from `read_state`, not the conversation journal. Area = workstream title; the line shows `Workstream › Task`.
- Priority = `subtasks.priority`. Autopilot writes its ranking back with `update_subtask {priority}`.
- New action per item: **Do now** → `promote_do_now {item, owner: "human"}` (Sasha takes it himself) or, for AI items not yet running, `owner: "ai"`.
- The daily 00:30 America/Mexico_City refresh keeps writing `/workspace/work/requests-history/<date>.md` (history stays), then reads Equilibrium.
- The journal stays as a **feeder**, not the source: on every PULSE and every Hark turn that starts work, Hark writes the request as a subtask (`add_subtask`) under the right task, and updates status as it moves (`update_subtask`). A request that fits no task goes to a task named by Hark under the closest workstream only if the task cap allows; otherwise Hark asks Sasha in one line which task it belongs to.

### 6.3 Promote flow (one tap)

```
Sasha taps "Do now" on an item in a Hark panel
  → panel prompt: "Promote to HUMAN DO NOW: subtask <uuid> (<text>)"
  → Hark: promote_do_now {item, owner:"human"}, idempotency_key = "promote-<uuid>-<minute>"
  → response.replaced? → Hark says in one line what left HUMAN DO NOW
  → Hark refreshes EQUILIBRIUM and AI WORK IN PROGRESS
  → app /build/equilibrium shows the same item on next load
```

### 6.4 Migration of today's panel items

At Phase 3 start Hark converts the panel's open items into subtasks (one-time), using the mapping: area → workstream, request → subtask under the closest existing task. Done items stay in history files; they are not back-filled.

---

## 7. App UI (Phase 2)

Files: `src/modules/equilibrium/hooks/useEquilibriumV2.ts`, `components/SmartGoalsSection.tsx`, `components/DoNowSection.tsx`, `components/ActiveFocusBanner.tsx`, `types.ts`, `equilibriumCopy.ts`, plus one new `components/SubtaskList.tsx`. `EquilibriumMDLSPage.tsx` inherits through the shared components.

1. **Subtasks under each task.** Collapsed by default with a count chip ("4 subtasks · 1 waiting on you"). Expanded: one row per subtask with an owner icon (human / AI, SVG icons, no emoji), text (inline edit), status chip (To do · In progress · Waiting on <who> · Done), optional link icon for `external_ref`, and actions **Do now**, **Done**, overflow menu (Demote, Mark waiting, Delete). Add row at the end ("Add subtask"), owner toggle defaults to human in the app.
2. **DO NOW split.** The current single "DOING NOW" box becomes two stacked blocks:
   - **HUMAN DO NOW**: one slot. Shows the item, its path `Workstream › Task`, **Done** and **Demote**. Promoting a second human item replaces the first and shows a toast: "<old item> moved back to <task>".
   - **AI DO NOW**: list, unlimited, drag to reorder (`position`), each row with status.
   - Labels per D3.
3. **Promote anywhere.** Every task and subtask row has **Do now**; long-press / secondary menu offers "Give to AI" (promote with owner `ai`).
4. **Caps 3 × 3.** From #46 (read-only overflow for existing over-cap data). Phase 2 does not re-implement #46; it depends on it.
5. **Reads/writes.** The hook reads `equilibrium_subtasks` and `equilibrium_do_now` directly with the user's session (RLS), and stops reading `equilibrium_focus` for DO NOW. Writes go through the same Supabase client; the human cap relies on the unique index and the hook calls one RPC, `eq_promote_do_now(p_item_type, p_item_id, p_owner)` (SECURITY DEFINER, `auth.uid()`-scoped, added in Phase 1), which deletes the old human row and inserts the new one in one transaction. Agent-write runs as service role, so it performs the same delete-then-insert itself, scoped to `EQUILIBRIUM_AGENT_WRITE_USER_ID`.
6. **Completion cascade** (task engine manual "Why completion cascades"): a completed subtask animates into the task's done list; done subtasks feed the Harvest/Celebrating feed alongside done tasks.
7. Mobile first: verify at 390px and 1280px.

---

## 8. Workstreams 4 → 3 (decision for Sasha, not executed)

Live `read_state`, 2026-10-16 19:3x MST: **Founder OS** (5 active tasks; 6 after this spec's task), **a16z Speedrun** (0), **Mirror Funnel** (1), **Clients** (0). Moon Focus: "Two ongoing paying clients at a time". Strategy 1 runs the Mirror Funnel up to "paid".

| Option | Result | Cost |
|---|---|---|
| **A (recommended).** Merge **Clients** into **Mirror Funnel** (Clients has no tasks; delete it). Keep Founder OS and a16z Speedrun. | Founder OS · a16z Speedrun · Mirror Funnel | Delivery work for paying clients lives under Mirror Funnel's end stage until there is a second client. |
| B. Park **a16z Speedrun** (0 tasks) via #66 once Parked ships; revisit after the priority window closes Nov 1. | Founder OS · Mirror Funnel · Clients | Speedrun prep has no workstream during its live window. |
| C. Fold **Founder OS** into Mirror Funnel as one task. | a16z · Mirror Funnel · Clients | Six infrastructure tasks compete with sales tasks under one cap of 3. |

Founder OS task cap (6 → 3), recommended mapping once Phase 1 ships (`convert_task_to_subtask`):

| Task (keep) | Becomes its subtasks |
|---|---|
| Knowledge graph | "15 playbook imports (#131–#146)", "self-driving import queue (#156)" |
| Equilibrium Task Flow (spec + build) | "Parked section (#66)", "Requests panel reads from Equilibrium", "Requests panel: tap to comment, priority, history", Phase 1–4 issues, #69, #46 |
| (free slot) | — |

---

## 9. Phased plan

Each build phase follows the three-gate rule: Planning DoD comment → "go" from Hark → Implementation → Debugging DoD.

| Phase | Owner | What | Depends on | Tracking |
|---|---|---|---|---|
| **1. Backend + ops** | Claude Code (Codex fallback) | Migration (§4), `eq_promote_do_now` RPC, agent-write ops (§5.2), caps 3 × 3 in agent-write, `read_state` v2 (§5.3), op docs in the writeback SOW, tests. Hark deploys via Lovable after merge (pre-approved for `supabase/`). | — (coordinates with #46 on the cap constants) | issue in §10 |
| **2. App UI** | Claude Code (Codex fallback) | §7 | Phase 1 merged + deployed; #46 merged | issue in §10 |
| **3. Hark panels read/write** | Hark | §6: EQUILIBRIUM v2, AI WORK IN PROGRESS sourced from subtasks, Do now buttons, PULSE/turn feeder, one-time migration of open panel items | Phase 1 deployed (not Phase 2) | this spec, no issue |
| **4. Cycle integration** | Claude Code + Hark | (a) HUMAN DO NOW block shows the current lunar phase, days left and the phase job line; (b) at each of the 8 phase transitions Hark runs a synthesis pass: ≤3 workstreams, ≤3 tasks, proposes merges/conversions as a decision sheet for Sasha; (c) Planning: prompt for Moon Focus; Planting: strategies; Seeing: workstreams/tasks (user manual sequence); (d) Celebrating: list of subtasks and tasks done this cycle for the announce/thank step; (e) D7 yearly focus if approved. | #69 merged (Planning anchored to the new moon); Phases 1–3 | issue opened after Phase 2 merges |

Phase 3 can start as soon as Phase 1 is live, in parallel with Phase 2.

---

## 10. Tracking

| Item | Link / id |
|---|---|
| Phase 1 issue | _filled after issue creation_ |
| Phase 2 issue | _filled after issue creation_ |
| Equilibrium task | _filled after creation_ |

---

## 11. Open decisions (each with a recommended default)

- **D1. Workstreams 4 → 3.** Recommended: Option A, merge Clients into Mirror Funnel. Override?
- **D2. Human Do Now replace vs refuse.** Promoting a second human item: replace the current one (it returns to its list) or refuse until the current is done/demoted. Recommended: replace, and say what left. Override?
- **D3. Section labels.** Recommended: "HUMAN DO NOW" and "AI DO NOW" (Sasha's words, 2026-10-16), replacing the single "DOING NOW" header (renamed 2026-05-19). Override?
- **D4. Completing a task with open subtasks.** Recommended: allowed; open subtasks stay open and show a "parent done" note so nothing is silently closed. Alternative: block until subtasks are done/dropped. Override?
- **D5. Default owner of a new subtask.** Recommended: `ai` when written by an agent, `human` when added in the app. Override?
- **D6. Manual text.** The user manual and the task engine manual state 7 × 7 and "DO NOW up to 3, 1 recommended" in Sasha's prose ("Why seven, and not more"). Recommended: Hark drafts the 3 × 3 + HUMAN/AI Do Now wording as a diff for Sasha's yes before Phase 2 merges; locked v2 spec sections stay untouched (same as #46 Decision 3/4). Override?
- **D7. Yearly focus layer.** Sasha's hierarchy names "yearly focus"; Equilibrium has no such field. Recommended: add `equilibrium_state.yearly_focus_text` in Phase 4, set at the birthday "Fresh start" solar phase. Override?
- **D8. Strategy link per workstream.** Recommended: none for now (one strategy live); the path shows Moon Focus › Strategy 1. Add `workstreams.strategy_position` only when a second strategy is active. Override?
- **D9. `equilibrium_focus` retirement.** Recommended: keep the table, stop reading it after Phase 2, propose the drop to Sasha one cycle later. Override?
- **D10. #46 sequencing.** #46 (caps + manual 8-phase section) has waited at Gate 1 since 2026-10-13. Recommended: Hark posts "go" on #46 now; Phase 1 sets the agent-write caps only if #46 has not merged by then; Phase 2 waits for #46. Override?

---

## 12. Constraints for workers

- Smallest diff per phase; no refactors; no new dependencies.
- Additive migration only. No drop, no data rewrite except the Do Now backfill in §4.3.
- No edits to locked texts or to Sasha's manuals (D6 handles the manuals).
- English for code, docs, commits, UI. Conventional commits.
- PR body: `Closes #N`, changes, constraints honored, verification, "saw these too, NOT shipping".
- Merge: Hark, after checks pass and the DoD is ✅. Deploy of `supabase/` changes: Hark via Lovable.

---

*Exit line convention: "Done — Equilibrium Task Flow, phase N. [1–2 lines]" goes to `docs/09-logs/session_log.md`.*
