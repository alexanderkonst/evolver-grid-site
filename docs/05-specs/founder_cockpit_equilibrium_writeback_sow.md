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

### Phase 2: Structured Mutations

The backend contract supports these future change types:

- `update_strategy`
- `update_workstream`
- `update_task`

They must only be used once the AI proposal includes real target IDs and the UI shows before/after text. Until then, direct mutation remains locked behind stricter validation.

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

## Composite Lovable Prompt Needed

Use one final Lovable prompt only after repo work is complete. It should deploy:

- `cockpit-ai-lens`
- `equilibrium-ai-context` if changed
- `apply-equilibrium-ai-changes`

Then test authenticated read, unauthenticated write rejection, and one accepted writeback.
