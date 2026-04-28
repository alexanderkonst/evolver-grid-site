# Session Protocol & Working Agreement — Cowork Agent Operating Mode

*How I open a session, how we ship work together, and what verbs I respond to. Lightweight. One source of truth. Designed so Sasha never has to repeat context he already wrote down.*

---

## Session-open protocol (adaptive)

I decide what to read based on Sasha's first message:

| First-message shape | What I read |
|---|---|
| Quick question / typo / one-liner | `CLAUDE.md` only |
| "What should I focus on?" / "What's on my plate?" / planning | `CLAUDE.md` + `docs/02-strategy/roadmap.md` (This Week + Current Status) |
| "Update the roadmap" / "capture this idea" / "bump X" | `CLAUDE.md` + `docs/02-strategy/roadmap.md` (full) |
| "Update the holomap" | `CLAUDE.md` + `docs/02-strategy/morphogenetic_holomap.md` + `docs/09-logs/session_log.md` (latest entries) + `docs/02-strategy/roadmap.md` |
| Landing page / copy / artifact work | `CLAUDE.md` + `docs/02-strategy/unique-businesses/alexanders_unique_business.md` + whatever surface / file is being edited |
| New concept / term I don't recognize | `CLAUDE.md` + `docs/docs_index.md` → then the specific file |
| Ceremony / moon cycle / download context | Receive first. Don't read — listen. Read after the pour. |

I don't preemptively read everything. Reading is an act; I do it when the work calls for it.

---

## Working agreement — how we ship work

*Sharpened after Day 54 (April 28, 2026) — Sasha named the pattern out loud: "I need to know when we're done, otherwise we enter into a sequence of me checking, you changing, again and again. See how inefficient that is."*

### The one rule

> **Definition of Done lives in chat BEFORE the work, not in the post-mortem.**

Every non-trivial task gets a DoD table in chat before any file is touched. Sasha confirms or adjusts. Then I work the table. When I declare done, both of us already agreed on what done means. No more "is it done? let me check / you change / I check again" loop.

### The DoD format

A numbered table, four columns:

| # | Item | Evidence | Status |
|---|---|---|---|

- **5–20 rows.** More = the task is too big and should be split. Fewer = underspecifying.
- **Every row is observable.** "Looks good" is not observable. "Pane 2 shows 4 sections: Install · Suites · Benchmark · Pricing" is.
- **Evidence is concrete.** A URL, a grep match, a screenshot, a command output, a file:line. Not "I checked."
- **The DoD covers the FULL intent of the request** — not what I think is reasonable to ship in one round. If the work breaks naturally into rounds, all rounds are in the table.
- **Status is binary.** ⬜ pending or ✅ done. No "mostly done", no 🟡, no "should be fine."

### Lifecycle

1. **Scope (before any code/edit).** I produce the DoD table in chat. Sasha confirms or adjusts; "go" is confirmation. **No work starts until the DoD is set.**
2. **Execute.** One in-progress task at a time (TodoWrite WIP-limit = 1). Mark ✅ as I land each row, not in batches. If a row blocks, I name the blocker in chat and pause — I do not silently re-scope or defer.
3. **Verify (the gate, not the afterthought).** UI/code → preview MCP against the real change. Docs → re-read after editing. Multi-file refactors → smoke-test every entry point. **No verify, no ✅.**
4. **Sign off.** I report DONE only when every row is ✅ with evidence column populated. The sign-off message includes the full table — Sasha sees the receipt, not just a "done." If something is genuinely "Phase 2", **Sasha decides** — not me. I name it as a question, not a decision: *"Add to DoD or carve out as separate task?"*

### The six radically-simple practices (in order of leverage)

1. **Definition of Done before the work.** ☝ The one rule above.
2. **WIP-1.** One task in_progress at a time. Finish what you start.
3. **Verify-as-gate.** Verification is the gate, not the afterthought. No verify, no ✅.
4. **Pre-mortem on big moves.** Before any change touching >5 files or any commit to main: name what could fail. 30 seconds of "what would break this" catches more bugs than 30 minutes of post-hoc debugging.
5. **Sign off with evidence.** Each ✅ row has a concrete artifact attached. URL, screenshot, file:line, command output.
6. **Stop, don't defer.** When something feels mid, the move is to STOP and reconfirm scope with Sasha — not to push through and label it "Phase 2." Only Sasha decides what's deferred.

### Anti-patterns (we debugged these on Day 54)

| Pattern | What it hides | Replace with |
|---|---|---|
| "Most of the way there" | Ambiguity about which rows are actually done | Explicit ⬜ per unfinished row |
| "Phase 2 candidates" mentioned mid-stream | Decision being made without Sasha | Question: "add to DoD or separate task?" |
| "Should be fine, didn't test it" | Unverified state passing as done | ⬜ + "unverified" until tested |
| "Done with my slice" | Slice ≠ task | Re-read original request, expand DoD |
| Restating intent as evidence | "I changed the file" instead of "the file at line 42 now reads X" | Concrete artifact in evidence column |
| Verifying after declaring done | Sequence reversal — "done" is the conclusion of verification, not its precursor | Verify first, declare second |

### When NOT to use a DoD table

Some tasks don't need one:
- One-line typo fixes
- "Read this file and tell me what's there"
- Conversation / strategy discussion
- Ceremony / download / pour

**Heuristic:** if the task touches >1 file OR takes >2 tool calls OR has any "did I get all of it?" risk, write the DoD.

### Worked example — the AI OS Space restructure (Day 54)

Round 1 shipped 8/8 items. Looked done. I offered "Phase 2 candidates: per-suite custom heroes, slimmer /ai-os, anchor deep links."

Sasha pushed back: *"I need to know when we're done, otherwise we enter into a sequence of me checking, you changing, again and again."*

The fix was to restate the **full Definition of Done** — 20 items, not 8. The "Phase 2" items I had carved out were actually part of the original intent (e.g., *"It can just be one short landing page"* — Sasha's exact words from the original message). The 8/8 declaration was Round 1 of 20. That was the trap.

After laying out 20/20 with status column, every item got knocked out in continuous pass. Final acceptance test: 8 routes verified live via preview MCP, console clean, screenshots taken. Sign-off message included the full table with evidence column.

The lesson: **Definition of Done = the full intent of the request. Not what I think is reasonable to ship in this round.** If Sasha didn't say "Phase 2 is OK" — Phase 2 is not OK.

---

## Verbs Sasha uses with me (slash commands, informal)

These are phrases Sasha already uses. I act on them immediately without asking for clarification.

| Verb | What I do | Touches |
|---|---|---|
| **"scope this"** / **"DoD this"** | Before any work on the current task: produce a Definition of Done table in chat (`#` · `Item` · `Evidence` · `Status` columns; ⬜/✅ status; full intent of the request, not one round). Wait for "go" or adjustments before touching files. See *Working agreement* section above. | Chat output only — no file writes |
| **"sign off"** / **"are we done?"** | Re-evaluate the current task against its DoD table. Report status row-by-row with evidence column populated (URL / screenshot / file:line / command output). Done = every row ✅ with evidence. Anything else = list what's still ⬜ and why. | Chat output (lifecycle defined in *Working agreement* section above) |
| **"add to scope"** | Add new rows to the active DoD table; they become part of "done" for the current task. | Chat output |
| **"carve this out"** | Explicitly defer the named item to a new task with its own DoD. The current task's DoD shrinks accordingly. | Chat output |
| **"update the roadmap"** | Edit `docs/02-strategy/roadmap.md` in place. Preserve structure, tone, conventions (🔴/🟡/⏸️/✅, table formats, week-scope section). Move items between This Week / Backlog / Completed as appropriate. | `docs/02-strategy/roadmap.md` |
| **"update the holomap"** | Run the holomap's own auto-update protocol. Read `docs/09-logs/session_log.md` (entries since last holomap update date) + `docs/02-strategy/roadmap.md` (current status + weekly scope). Then edit `docs/02-strategy/morphogenetic_holomap.md` in place: advance `►` markers, update stage completions (`✓`), refresh timing overlays, update assessment scores and commentary. Bump version + date in header. | `docs/02-strategy/morphogenetic_holomap.md` |
| **"capture this idea"** | Add a seed to `docs/02-strategy/roadmap.md` — Active Backlog or Parked/Future depending on leverage. Preserve Sasha's phrasing verbatim where possible. | `docs/02-strategy/roadmap.md` |
| **"what should I focus on"** | Read This Week's Scope + Current Status + Active Backlog in `roadmap.md`. Reflect back the top 3 leverage items in Sasha's language. Don't reformat. Don't invent priority. | Read-only on roadmap |
| **"bump [X] up"** | Move item X higher in the Active Backlog, or promote from Backlog → This Week. Preserve row format. | `docs/02-strategy/roadmap.md` |
| **"park [X]"** | Move item X to Parked / Future. Preserve row format. | `docs/02-strategy/roadmap.md` |
| **"log this session"** | Append an entry to `docs/09-logs/session_log.md` with date, key moves, domains added, artifact changes. Follows the existing session-log format. | `docs/09-logs/session_log.md` |
| **"what's the [principle name]"** | Read the principle from `docs/03-playbooks/unique_business_playbook.md` or `alexanders_unique_business.md`. Quote, don't paraphrase. | Read-only |
| **"roadmap pulse"** | Run the `roadmap-pulse` scheduled task manually here in the chat. Reads `.agent/auto-execute-policy.md`, triages the roadmap, executes items tagged `[auto]` inside the policy whitelist, prepares `[auto-brief]` briefs for Claude Code, and appends a new entry to `docs/09-logs/roadmap_pulse_log.md`. | Policy-bound |

If a verb is ambiguous, I use AskUserQuestion (multi-select when possible) rather than asking a plain question.

---

## How I use AskUserQuestion (harry's "let Claude prompt you" pattern)

**When:** Any time I'd otherwise ask an open-ended question and the answer space is bounded.

**How:**
- 1–4 questions per ask.
- Multi-select when choices aren't mutually exclusive.
- Put the recommended option first, labeled "(Recommended)".
- Never use this to ask "is the plan ready?" — use ExitPlanMode for that.

**When NOT:**
- Ceremony / download / moment of pour — I listen, don't survey.
- Simple back-and-forth conversation.
- Sasha already gave clear requirements.

---

## What I do automatically (no asking)

- Run `Bash` / `Read` / `Grep` / `Glob` on the repo to orient myself.
- Run safe terminal commands per `.agent/RULES.md` (build, status, diff, grep).
- Edit `docs/02-strategy/roadmap.md`, `morphogenetic_holomap.md`, `session_log.md` when invoked by their verbs.
- Write new artifacts into `docs/` when Sasha asks for content (e.g. "draft the new tribe section").

## What I never do without asking

- Delete files (requires `mcp__cowork__allow_cowork_file_delete` flow).
- Edit locked master texts (Epicenter Broadcast, myth versions, value ladder versions). Quote only.
- Edit `src/` application code — that's Codex's lane via `ai_tasks/PENDING_*.md`.
- Create parallel compressions of `docs/` content (the corpus is the source of truth).
- Push, force-push, amend commits, or skip hooks.

---

## Writing discipline (brand signal)

- Apply `.agent/anti-ai-style.md` to everything I write.
- Russian for chat, English for code/docs unless asked.
- Precision over decoration. One signal per paragraph.
- Silence is a tool — stop when the point is made.

---

*This file is my operating manual. Sits under `.agent/` alongside `RULES.md` and `anti-ai-style.md`. Update when a new verb or pattern emerges.*
