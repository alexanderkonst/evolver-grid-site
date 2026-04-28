# Working Agreement — How We Ship

*The contract for HOW we work on tasks. Lives next to RULES.md (autonomy) and session-protocol.md (verbs). Read this before any non-trivial task. Sharpened after Day 54 (April 28, 2026) — Sasha named the pattern out loud.*

---

## The one rule

> **Definition of Done lives in chat BEFORE the work, not in the post-mortem.**

Every non-trivial task gets a DoD table in the chat before any file is touched. Sasha confirms or adjusts. Then I work the table.

Result: when I declare done, both of us already agreed on what done means. No more "is it done? let me check / you change / I check again" loop.

---

## The DoD format (what to produce in chat)

A numbered table, four columns:

| # | Item | Evidence | Status |
|---|---|---|---|

- **5–20 rows.** More = the task is too big and should be split. Fewer = you're underspecifying.
- **Every row is observable.** "Looks good" is not observable. "Pane 2 shows 4 sections: Install · Suites · Benchmark · Pricing" is.
- **Evidence column is concrete.** A URL, a grep match, a screenshot, a command output, a file:line. Not "I checked."
- **The DoD covers the FULL intent of the request.** If the work naturally breaks into rounds, all rounds are in the table — not "Round 1 here, Round 2 deferred."
- **Status is binary.** ⬜ pending or ✅ done. No "mostly done", no 🟡, no "should be fine."

---

## Lifecycle

### 1. Scope (before any code/edit)
I produce the DoD table in chat. Sasha confirms or adjusts. **No work starts until the DoD is set.** If Sasha says "go", that's confirmation.

### 2. Execute
- One in-progress task at a time (TodoWrite WIP-limit = 1).
- Mark ✅ as I land each row, not in batches.
- If a row is blocked, I name the blocker in chat and pause. **I do not silently re-scope or defer.**

### 3. Verify (the gate, not the afterthought)
- For UI/code: preview MCP against the real change. Click, screenshot, eval. Not "should work."
- For docs: re-read the file after editing, confirm the words match the intent.
- For multi-file refactors: smoke-test every entry point, not just the first.
- **If I haven't verified, the row is still ⬜ — I do not mark ✅ on hope.**

### 4. Sign off
- I report DONE only when every row is ✅ with evidence column populated.
- I include the DoD table in the sign-off message so we both see the receipt.
- If something is genuinely "Phase 2", **Sasha decides** — not me. I name it as a question, not a decision: *"Want me to add this to the DoD or carve it out as a separate task?"*

---

## The radically simple practices (six, in order of leverage)

1. **Definition of Done before the work.** ☝ The one above.
2. **WIP-1.** One task in_progress at a time. Finish what you start.
3. **Verify-as-gate.** Verification is the gate, not the afterthought. No verify, no ✅.
4. **Pre-mortem on big moves.** Before any change touching >5 files or any commit to main: name what could fail. 30 seconds of "what would break this" catches more bugs than 30 minutes of post-hoc debugging.
5. **Sign off with evidence.** Each ✅ row has a concrete artifact attached. URL, screenshot, file:line, command output.
6. **Stop, don't defer.** When something feels mid, the move is to STOP and reconfirm scope with Sasha — not to push through and label it "Phase 2." Only Sasha decides what's deferred.

That's it. Six things. They compound.

---

## Anti-patterns (we just debugged these on Day 54)

| Pattern | What it hides | Replace with |
|---|---|---|
| "Most of the way there" | Ambiguity about which rows are actually done | Explicit ⬜ per unfinished row |
| "Phase 2 candidates" mentioned mid-stream | Decision being made without Sasha | Question: "add to DoD or separate task?" |
| "Should be fine, didn't test it" | Unverified state passing as done | ⬜ + "unverified" until tested |
| "Done with my slice" | Slice ≠ task | Re-read original request, expand DoD |
| Restating intent as evidence | "I changed the file" instead of "the file at line 42 now reads X" | Concrete artifact in evidence column |
| Verifying after declaring done | Sequence reversal — "done" is the conclusion of verification, not its precursor | Verify first, declare second |

---

## When NOT to use a DoD table

Some tasks don't need one:
- One-line typo fixes
- "Read this file and tell me what's there"
- Conversation / strategy discussion
- Ceremony / download / pour

Heuristic: **if the task touches >1 file OR takes >2 tool calls OR has any "did I get all of it?" risk, write the DoD.**

---

## Worked example — the AI OS Space restructure (Day 54)

Round 1 shipped 8/8 items. Looked done. I offered "Phase 2 candidates: per-suite custom heroes, slimmer /ai-os, anchor deep links."

Sasha pushed back: *"I need to know when we're done, otherwise we enter into a sequence of me checking, you changing, again and again. See how inefficient that is."*

The fix was to restate the **full Definition of Done** — 20 items, not 8. The "Phase 2" items I had carved out were actually part of the original intent (e.g., *"It can just be one short landing page"* — Sasha's exact words from the original message). The 8/8 declaration was Round 1 of 20. That was the trap.

After laying out 20/20 with status column, every item got knocked out in continuous pass. Final acceptance test: 8 routes verified live via preview MCP, console clean, screenshots taken. Sign-off message included the full table with evidence column.

The lesson: **Definition of Done = the full intent of the request. Not what I think is reasonable to ship in this round.** If Sasha didn't say "Phase 2 is OK" — Phase 2 is not OK.

---

## Trigger phrases (Sasha can use these)

- *"DoD this"* / *"scope this"* — produce the DoD table before working
- *"sign off"* — report status with the full DoD table + evidence column
- *"are we done?"* — check actual state against the DoD, give a yes/no with evidence
- *"add to scope"* — add new rows to the DoD mid-task (they become part of "done")
- *"carve this out"* — explicitly defer something to a new task with its own DoD

---

*This file is the contract. If something here conflicts with how I'm actually working in a session, the file wins — Sasha's intent at the moment of writing this beats my drift in the moment.*
