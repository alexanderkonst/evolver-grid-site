# Founder Cockpit -> Equilibrium Writeback SOW

Created: 2026-07-06

## Goal

Turn Founder Cockpit from a read-only intelligence surface into a controlled operating-system loop:

`read Equilibrium -> AI proposes refinements -> Sasha reviews/selects -> approved changes write back -> next read improves`.

## Scope

### Phase 1: Safe Writeback

- Add `apply-equilibrium-ai-changes` Supabase Edge Function.
- Require logged-in Sasha/admin session.
- Reject anonymous, non-admin, and token-only writes.
- Accept up to three explicitly selected changes from Founder Cockpit.
- Write accepted refinements to `equilibrium_synthesis_log`.
- Update `equilibrium_state.last_synthesis_text` and `last_synthesis_at`.
- Refresh the cockpit read after success.

This phase deliberately avoids silent AI rewrites of strategies, workstreams, or tasks.

### Phase 2: Direct Agent ACT Mutations

Status: implemented in repo; requires Lovable deploy + secrets.

Add a separate `equilibrium-agent-write` Supabase Edge Function for external AI tools such as Claude/Codex-style agents. This is not a general database bridge and not a service-role escape hatch. It is a narrow writer for ACT entries only:

- Lifelong Dedication (`equilibrium_state.mission_override_text`)
- Role (`equilibrium_state.role_override_text`)
- Moon focus (`equilibrium_state.moon_focus_text`)
- Current Strategy slots 1-3 (`equilibrium_strategies`)
- Workstreams (`equilibrium_workstreams`)
- Tasks / Intuitive SMART Goals (`equilibrium_tasks`)
- Subtasks (`equilibrium_subtasks`) and the owner-split DO NOW (`equilibrium_do_now`: HUMAN = 1, AI = unlimited) — Task Flow, issue #71
- Legacy DO NOW focus slots (`equilibrium_focus`, no longer written by agent-write; kept, not dropped)
- Synthesis/audit notes (`equilibrium_synthesis_log`)

External-agent approval happens in the agent surface. Example: Claude drafts a task, Sasha approves the tool call in Claude, and Claude calls `equilibrium-agent-write`. The cockpit UI remains useful for reviewing project state, but it is no longer the only approval surface.

The endpoint supports only allowlisted operations:

- `read_state` (read-only — returns the full Equilibrium snapshot; no payload, ignores `dry_run`, not audit-logged)
- `set_lifelong_dedication`
- `set_role`
- `set_moon_focus`
- `upsert_strategy`
- `create_workstream`
- `rename_workstream`
- `delete_workstream` (hard delete; refuses with 409 if the workstream still has tasks unless `payload.force = true`, which cascades its tasks first)
- `create_task` (optional `owner`: `human` default, or `ai`; 400 at the 3-task cap)
- `rename_task`
- `complete_task` (alias of `complete` with `item = {type: "task", id: task_id}`)
- `delete_task` (hard delete — `equilibrium_tasks` has no `archived_at`; Do Now and subtask rows cascade)
- `promote_task_to_focus` (alias of `promote_do_now` with `owner: "human"`; `position` is ignored; writes `equilibrium_do_now`, not `equilibrium_focus`)
- `append_synthesis_log`
- `add_subtask` `{task_id, text, owner?, status?, waiting_on?, priority?, external_ref?, note?, effort?, kind?}` (`effort` is free text up to 40 chars, e.g. `15m` or `1 credit`; `kind` is `research`|`build`|`outreach`|`ops`; both optional, null when omitted; `owner` defaults to `ai`, `status` to `todo`; `waiting_on` is kept only while `status = waiting`; inserted at the end of the task's subtasks; an active subtask with the same normalized text under the same task is reused, `created: false`; `created_by` = `agent_name`)
- `update_subtask` `{subtask_id, text?, owner?, status?, waiting_on?, priority?, external_ref?, note?, effort?, kind?, position?}` (partial; `null` clears `waiting_on`, `priority`, `external_ref`, `note`, `effort`, `kind`; `done`/`dropped` stamp `done_at` and remove the Do Now row; a status other than `waiting` clears `waiting_on`)
- `delete_subtask` `{subtask_id}` (hard delete; its Do Now row cascades)
- `promote_do_now` `{item: {type: "task"|"subtask", id}, owner?}` (`owner` defaults to the item's owner. `human`: replaces the current human item, if different, and returns `replaced: {type, id, text}`; `ai`: appended at the end, no cap. Re-promoting to the same owner is a no-op (`unchanged: true`); an item in the other owner's list moves. `done`/`dropped` items → 400)
- `demote` `{item}` (removes the Do Now row; the item stays where it lives; `demoted: false`, 200, if it was not in Do Now)
- `complete` `{item}` (task: `status = done`, `done_at`, `workstream_title_snapshot`, Do Now row removed; its open subtasks stay open. Subtask: `status = done`, `done_at`, Do Now row removed)
- `move_task` `{task_id, workstream_id}` (moves the task, with its subtasks, to the end of another workstream; 400 if the target already has 3 active tasks)
- `convert_task_to_subtask` `{task_id, parent_task_id, owner?}` (creates a subtask under `parent_task_id` carrying the task's text, status — `active` → `todo`, `done` → `done` — and `created_at`; re-parents the task's own subtasks; moves its Do Now row to the new subtask; then deletes the task. Run with `dry_run` first: it returns the plan and writes nothing)
- `park_strategy` `{position}` (copies the strategy's text, alignment score and position into `equilibrium_parked` as kind `strategy`, then deletes it from `equilibrium_strategies`; 400 if the slot is empty)
- `park_item` `{kind, title, body?}` (inserts a parked row; `kind` is `strategy`, `workstream`, `task` or `idea`)
- `unpark_strategy` `{parked_id, position?}` (restores a parked strategy into `equilibrium_strategies`, upserting at `position` — overwriting any strategy already there, same as `upsert_strategy` — or at its `source_position` if omitted, then removes it from parked)

The eight Task Flow operations (`add_subtask`, `update_subtask`, `delete_subtask`, `promote_do_now`, `demote`, `complete`, `move_task`, `convert_task_to_subtask`) and the two aliases honor `dry_run`, `idempotency_key` and the audit log like every other write; the audit row keeps the operation name that was called. Caps: 3 active workstreams, 3 active tasks per workstream (create and `move_task`; existing over-cap data still loads); subtasks have no cap. The cap errors name `move_task` / `convert_task_to_subtask` as the way out. They need `supabase/migrations/20261017000000_equilibrium_task_flow.sql` and, for `effort` / `kind` (issue #91), `supabase/migrations/20261020000000_equilibrium_subtask_effort_kind.sql`: **apply the migration before deploying the function**, because `read_state` reads the new tables and `equilibrium_tasks.owner`. Spec: `docs/04-products/equilibrium_task_flow_spec.md` §4–§5.

The three Parked operations honor `dry_run`, `idempotency_key` and the audit log like every other write. They need the `equilibrium_parked` table from `supabase/migrations/20260829000000_equilibrium_parked.sql`. Parked items are shown as the last block of the ACT section in the cockpit (5 at a time, newest first).

`read_state` powers Hark's Equilibrium Home panel (issue #39): the site stays
the single source of truth and nothing is duplicated — Hark reads live. The
response includes `moon_focus`, `lifelong_dedication`, `role`; `strategies`
(`position`, `text`, `alignment_score`); `workstreams` (each with active
`tasks`: `id`, `name`, `text`, `status`, `owner`, `is_focus`, `do_now`,
`created_at`, `subtasks`; each workstream also has `over_cap`); `do_now`
(legacy: the HUMAN Do Now `{id, name, workstream_title}` or null — for a
subtask, `id` is the parent task id and `name` the subtask text); and
`lunar` (current `phase` name, `job`, `phase_end` ISO, `days_left`) computed
with the same elongation math as `src/lib/equilibrium-cycles/getLunarState`.
`parked` lists set-aside items (`id`, `kind`, `title`, `body`, `parked_at`),
newest first, at most 50; it is `[]` until the `equilibrium_parked` migration
is applied.

`read_state` v2 (Task Flow, issue #71) adds, with the legacy fields unchanged
in shape:

- `caps`: `{workstreams: 3, tasks_per_workstream: 3, human_do_now: 1}`.
- `workstreams[].over_cap`: true when the workstream sits at position 3+ or has more than 3 active tasks.
- `workstreams[].tasks[]`: `owner` (`human`|`ai`), `is_focus` (the task has any Do Now row), `do_now` (`human`|`ai`|null) and `subtasks[]` — every non-terminal subtask plus those closed in the last 48 h, open ones by position, then closed ones newest first. A subtask has `id`, `text`, `owner`, `status` (`todo`|`in_progress`|`waiting`|`done`|`dropped`), `waiting_on`, `priority` (1-3 or null), `external_ref`, `note`, `effort` (text or null), `kind` (`research`|`build`|`outreach`|`ops` or null), `do_now` (`human`|`ai`|null), `created_by`, `created_at`, `updated_at`, `done_at`.
- `do_now_v2`: `human` (`{type, id, text, path, promoted_at}` or null) and `ai` (list of `{type, id, text, path, status, waiting_on}` by position). `path` is `[workstream, task name]` for a subtask, `[workstream]` for a task.
- `waiting_on_human`: subtasks with `status = waiting` and `waiting_on = sasha` (`{type, id, text, path}`), priority first.
- `subtask_counts`: `todo`, `in_progress`, `waiting`, `waiting_on_human`, `done_today`, `dropped_today`. "Today" is the America/Mexico_City day (UTC-06:00).
- `phase_readiness.layers.doNow` reads the HUMAN Do Now row. `equilibrium_focus` is no longer read.

Until the app UI moves to `equilibrium_do_now` (Phase 2), a task promoted in the app (still `equilibrium_focus`) does not show in `do_now` / `is_focus`, and an agent promote does not show in the app.

Security contract:

- `verify_jwt = false` at the Supabase gateway because external agents do not have Sasha's browser JWT.
- The function validates `x-agent-token` against `EQUILIBRIUM_AGENT_WRITE_TOKEN`.
- The function writes only to `EQUILIBRIUM_AGENT_WRITE_USER_ID`.
- No arbitrary SQL, table name, RPC name, or free-form mutation payload is accepted.
- All writes are audit-logged in `equilibrium_synthesis_log`.
- `dry_run: true` returns the planned write without mutating the database.
- `idempotency_key` prevents duplicate mutations when an agent retries.

### Phase 3: Structured Cockpit Mutations

Future versions may support these change types:

- `update_strategy`
- `update_workstream`
- `update_task`

They must only be implemented once the AI proposal includes real target IDs and the UI shows before/after text. Until then, direct mutation is intentionally not deployed.

## Product Spec

### User Flow

1. Sasha opens `/build/cockpit/dashboard`.
2. Sasha clicks `Refine My Operating System`.
3. AI reads live Equilibrium context plus cockpit context.
4. AI returns exactly three proposed refinements.
5. Sasha selects which proposed refinements to save.
6. Sasha clicks `Accept selected changes`.
7. App calls `apply-equilibrium-ai-changes`.
8. Function writes only selected text into Equilibrium synthesis history.
9. Cockpit refreshes live Equilibrium context.

### Non-Writing Actions

- `Copy as markdown` never writes.
- `Apply later` never writes.
- `Skip` never writes.
- Running a lens never writes.

### Security Contract

- `verify_jwt = true`.
- Function verifies the Supabase user through `auth.getUser`.
- Only admin emails are allowed:
  - `alexanderkonst@gmail.com`
  - `konst@alum.mit.edu`
  - `me@sloan.mit.edu`
- No `x-agent-token` write access.
- No AI call happens inside the write function.
- The write function only persists content already approved by the user.

## Definition of Done

- `Refine My Operating System` reads live Equilibrium context.
- Review screen shows selectable proposed changes.
- Accepting one selected change writes exactly one synthesis log row.
- Accepting three selected changes writes exactly three synthesis log rows.
- `equilibrium_state.last_synthesis_text` updates to the most recently accepted refinement.
- Unauthorized users cannot write.
- Running/copying/skipping does not write.
- Lovable deploy report names the function URL, changed files, tables written, and test results.

## Direct Agent Mutation Definition of Done

- `equilibrium-agent-write` is deployed with `verify_jwt = false`.
- Missing live table `equilibrium_strategy_completions` is created from `supabase/migrations/20260529000000_strategy_completions.sql`.
- `EQUILIBRIUM_AGENT_WRITE_TOKEN` and `EQUILIBRIUM_AGENT_WRITE_USER_ID` are set in Lovable Cloud.
- No token and wrong token both return 401.
- `dry_run: true` for a task write returns the planned workstream/task without changing row counts.
- Real `create_task` creates or reuses the named workstream, creates the task once, and writes one audit log.
- Repeating the same `idempotency_key` does not create a duplicate task.
- `equilibrium-ai-context` no longer warns that `equilibrium_strategy_completions` is missing.
- Lovable reports endpoint URL, token handling, table changes, test results, and IDs for any created test rows.

## Composite Lovable Prompt Needed

Use one final Lovable prompt only after repo work is complete. It should deploy and verify:

- `cockpit-ai-lens`
- `equilibrium-ai-context` if changed
- `apply-equilibrium-ai-changes`
- `equilibrium-agent-write`

Then test authenticated read, unauthenticated write rejection, agent-token write rejection/acceptance, idempotency, and one accepted direct ACT mutation.
