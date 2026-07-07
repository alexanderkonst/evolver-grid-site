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
- DO NOW focus slots (`equilibrium_focus`)
- Synthesis/audit notes (`equilibrium_synthesis_log`)

External-agent approval happens in the agent surface. Example: Claude drafts a task, Sasha approves the tool call in Claude, and Claude calls `equilibrium-agent-write`. The cockpit UI remains useful for reviewing project state, but it is no longer the only approval surface.

The endpoint supports only allowlisted operations:

- `set_lifelong_dedication`
- `set_role`
- `set_moon_focus`
- `upsert_strategy`
- `create_workstream`
- `rename_workstream`
- `create_task`
- `rename_task`
- `complete_task`
- `promote_task_to_focus`
- `append_synthesis_log`

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
