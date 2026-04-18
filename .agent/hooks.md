# Hooks — Enforcement Layer (Anti-Dogma)

*Hooks are walls. Walls are useful when they catch real recurring failure and costly when they freeze a living codebase. This file is the contract: what a hook in this repo is allowed to be, and — equally important — when it must be removed.*

---

## The one invariant that overrides everything else

**Nothing in `.claude/hooks/` or `.agent/canon-lock.md` is dogma.** The codebase is living. It evolves. A hook that used to catch a real failure and now mostly blocks growth **must be removed, not preserved out of loyalty.** Removing a hook is a normal act, not a retreat.

If a rule in this file starts to feel sacred — delete it. If a locked paragraph in `canon-lock.md` starts to fossilize a thought that has since deepened — unlock it. Walls serve the build. The build does not serve the walls.

---

## Three tests every hook must pass

Before adding a hook, all three must be true:

1. **Real recurring failure.** Not hypothetical, not "it could happen." Something has actually gone wrong in a way a wall would have caught.
2. **Light override.** There is a clear, one-flag, zero-ceremony way for Sasha (or an AI acting with reason) to bypass it. Walls without doors become cages.
3. **Honors development, does not replace it.** If the hook is substituting for live discernment — if compliance with it would *prevent* the meaning-making that should happen — it is the wrong wall in the wrong place. Kill it.

A hook that fails test 3 is the most dangerous kind. It *looks* like safety and *acts* like ossification. Watch for it.

---

## Three species of hook in this repo

Different walls serve different purposes. Do not conflate them.

### 1. Irreversibility pauses

**What they do:** block actions that cannot be undone by running `deploy` again — force-push over main, `DROP TABLE`, `DELETE FROM` without WHERE, `rm -rf` on a real path, skipping git hooks.

**Why they earn a wall:** the cost of the mistake is unbounded, and the cost of the pause is one flag. Asymmetric.

**Override:** `SASHA_OVERRIDE=1` in env.

**When to remove:** when the action stops being performed (the rule is obsolete), OR when the override is being used so often it means the rule is wrong.

### 2. Canon preservation

**What they do:** guard specific, explicitly-registered paragraphs in `docs/` from silent paraphrase. Crystallizations Sasha has already thought through at depth — myth statement, value-ladder locked copy, named principles. The registry is `.agent/canon-lock.md`, and **it starts empty**. A paragraph is locked only when Sasha opts it in.

**Why they earn a wall:** these aren't arbitrary snippets — they're Logos artifacts. An AI paraphrasing "Epicenter Broadcast" into a more conventional phrasing is a loss Sasha will not notice in the diff but will feel in the field. Small silent edits compound.

**Override:** `SASHA_CANON_UPDATE=1` in env, OR unlock the paragraph in `canon-lock.md` (remove it or edit the locked text to match the new canon).

**When to remove:** when canon deepens — update `canon-lock.md` so the new crystallization is the new guard. The file is living.

### 3. Nudges (non-blocking)

**What they do:** print an observation to stderr after a session. They never block. They never deny. They just say "hey, noticed this."

**Why the wall is soft:** because the thing they're nudging toward — e.g. writing a session log — is a **meaning-making act**, and meaning-making dies under compliance walls. A nudge respects agency. A block would turn a living practice into bureaucracy.

**Override:** ignore it. Walk past. The nudge is not a gate.

**When to remove:** when the nudge is ignored so consistently it's become noise. Noise has a cost.

---

## When to add a hook

Only after all three tests pass. If in doubt, **don't add it.** The repo is better off missing a wall that would have caught a small problem than carrying a wall that silently blocks a big thing.

When adding, document in this file (append below): what the hook catches, the real failure that earned it, the override, and the conditions under which it would be removed.

---

## When to remove a hook

Remove when any of these become true:

- The failure the hook catches has not happened for months *and* the wall is friction.
- The override flag is being reached for more than a few times — that's a signal the wall is mispriced.
- The hook is substituting for discernment that should live in Sasha's or an AI's active judgment.
- A clearer, lighter signal (a nudge, a diff, a comment in review) would do the same work without the cost.

Removal is not defeat. Removal is the system staying alive.

---

## Current hooks in this repo

*(Updated whenever hooks change. If this drifts from reality, reality wins — update the list.)*

### PreToolUse

- **`block-irreversible.py`** (Bash) — blocks force-push to main/master, `git commit --no-verify`, `DROP TABLE/DATABASE/COLUMN`, `TRUNCATE`, `DELETE FROM` without WHERE, `rm -rf` on `/`, `/Users`, `/home`, `~`, parent paths, project root. Override: `SASHA_OVERRIDE=1`.
- **`block-deploy-commit.py`** (Bash) — blocks AI from committing with message literally `"deploy"`. The one-word `deploy` is what Sasha's terminal one-liner writes when sweeping uncommitted dirty-tree edits (batch snapshot). Autonomous Claude Code commits are discrete units of work — they should carry descriptive messages so `git log` stays readable. Override: `SASHA_OVERRIDE=1`.
- **`canon-lock.py`** (Edit|Write|MultiEdit) — if the file being edited has locked paragraphs registered in `.agent/canon-lock.md`, verifies every locked paragraph still appears verbatim in the projected new file contents. Override: `SASHA_CANON_UPDATE=1`.

### Stop

- **`session-log-nudge.py`** — if `src/` or `docs/` changed this session and `docs/09-logs/session_log.md` does not contain today's date, prints a soft stderr nudge suggesting a session log entry. **Never blocks.** Never denies. Silent if no changes, or if today's log already exists.

---

## The anti-dogma review

Re-read this file whenever a hook fires in a way that felt wrong. If a hook has been living for months without firing, ask: is it still earning its keep? If a hook has been firing and the override is being reached for, ask: is the rule right? If the rule is right but the boundary is wrong, move the boundary. If the rule is wrong, kill the hook.

Walls that don't move are not safety. They are the opposite.
