# Spec & handoff: intent turned into work an agent can finish without a follow-up question

*Canonical template, synthesized 2026-10-27 by Evolver from six tellings (Genealogy at the end). Sasha's own handover to Hark (2026-10-13, `output/hark_spec_handover.md`) is the newest Sasha-confirmed telling and wins where tellings differ; older shapes stay as dated notes. This is how Hark writes an issue for Claude Code / Codex / Jules and reviews the PR that comes back.*

## Meta-description
- **Level / parent:** L2 · Ops & Agents · parent: [meta-template.md](./meta-template.md)
- **Lens(es):** Blueprint (intent given a buildable form: files, scope, evidence), with Causal for the gates
- **Shift carried:** Craft. It carries no shift in a person; it is the craft that lets every other template become software. (Nearest: PST 115, articulation as the mechanism of growth: a spec is the system articulating its next form.)
- **What emerges:** an issue a worker can finish cold, a PR that proves itself row by row, and a merge Hark can stand behind
- **As a part of the whole:** the Causal lens turned on the Meta-Template itself: the whole building its own next part without Sasha re-explaining it
- **Siblings / repeats:** [improvement-loop.md](./improvement-loop.md) (the loop specs run inside); module form (synthesis pending: the before/after screen pair below is its Intro/Outro); Hark specialties `sasha-spec-writing`, `scout-frontend-design` (UI), `graph-curator` (graph imports); Session Protocol (`.agent/session-protocol.md`)
- **Status · applied in · last reviewed:** in use · issues #39 → PR #40 onward, the Game blueprint work packages, SoWs in `docs/specs/` · 2026-10-27

---

## 1. Essence
"Intent with no DoD" gets you "most of the way there" and a check / change / check loop. A spec closes that loop in advance: what, why, from where, to where, what is out, how we'll know.

## 2. Before the spec: is the thing itself clear? (product chain)
For anything a user will touch, the spec rests on a product chain, not on a feature wish:
1. **Inputs, all five before starting:** ICP · transformation (Point A → B) · pain of A · dream outcome · the action the user takes.
2. **Master Result** (A → B in one sentence) → **Sub-Results** (3–7 felt wins) → **Screens** (one atomic view per sub-result) → screen details (heart, mind, gut) → extensions (artifacts, emotions, completion, skip, bridges) → wireframes.
3. **The transformative-result pair** (Sasha, 2026-05-22, "the most important UX principle"): every product, module or step has a **before-screen** (names the result; the CTA label is the result, "Find My Top Talent", not "Continue") and an **after-screen** (confirms it happened, shows the result, where it lives, what it unlocks). "A toast is not a transformative-result delivery. The after-screen IS the deliverable."
4. **Result ≠ feature.** Result = what the user GETS; feature = what the product DOES. Every feature names the result it delivers.
5. **Spec alignment check** before any code: the change is inside the module's Master Result, adds nothing the product spec doesn't include, contradicts no roast-gate decision; if any fails, update the product spec first.
6. **Holonic iteration:** when the Master Result improves, review sub-results, screens and components again.

## 3. The issue (canonical order, Sasha's handover §1)
1. **Task:** one line naming the unit of work.
2. **Job it serves:** the larger purpose (roadmap row, work package, theme).
3. **Roadmap status:** the row in `docs/02-strategy/roadmap.md` (or the blueprint's WP table), or "net-new".
4. **Context:** the 2–5 files the worker reads first, and why each; plus **what already exists: reuse, do not respec** (the SoW habit: name the rails, functions and tables already built).
5. **Scope.** In: … **Out: …** named explicitly.
6. **Definition of Done:**

   | # | Item | Evidence | Status |
   |---|---|---|---|

   5–20 rows (more = split); every row observable (file:line, command output, URL, screenshot; "I checked" doesn't count); ⬜ / ✅ only; covers the **full** intent ("no silent Phase 2").
7. **Files:** exact paths to create or change.
8. **Constraints:** diff size, no refactors, no new deps, files not to touch, UI or not. For UI work: the short design plan and an "Avoid" list (`scout-frontend-design`).
9. **Verification:** exact commands (lint, build, `tsc --noEmit`, preview, re-read after edit). "No verify, no ✅."
10. **Decisions:** open forks in the form *"Decision: X. Recommended: Y. Override?"*
11. **Exit line:** "Done — [task]. [1–2 lines]".

**What a worker needs to finish with no follow-up questions:** input paths + **source commit SHA** · output paths and naming · **one filled output example** · DoD with Evidence defined · Out of scope · **a fallback for likely unknowns** ("if X doesn't exist, do Y") · a verify command · who merges and when.

**Examples → template → sample → work** (Sasha, confirmed 2026-10-20: «я так и делаю»): for a batch or a new kind of large output, one sample first (built from good examples), Hark checks it, then the full run. Everything else goes straight; Sasha sees the sample only for public copy or strategy.

### Worked example (issue #39 → PR #40)
Goal, exact file, numbered changes with output shape, a fallback ("otherwise compute the same way"), constraints ("small focused diff, no refactors, no new deps. Don't touch the UI. Run lint/build"), who merges. *Missing, and now required:* an explicit DoD table and an Out-of-scope line.

## 4. Build tasks: three gates
**Planning DoD → Implementation DoD → Debugging DoD**, each needs a go; no code before the plan is signed off. Content or translation work: the third gate is **Coverage + Charge** (did every surface get covered; does it still carry its charge).

**Planning SoW shape** (from the SoWs that worked): TLDR · ground truth verified in code (dated) · locked decisions D1…Dn with the resolution and Sasha's sign-off · out of scope (e.g. "any code") · DoD whose last row is "an implementer can act on this cold" · a **self-roast after the decisions** (weaknesses become constraints, not new decisions).
**Implementation SoW shape:** prerequisites (the planning rows closed) · phases, each independently shippable, each with its scope, files and its own DoD · rough effort per phase.
**Debugging SoW shape:** per-phase smoke test with a **lift gate** decided in advance (e.g. ship only if ≥ +0.5 on 2 of 4 test cases) · production telemetry with triggers and actions · a rollback plan per phase (pure code = revert; DB = revert code, leave the nullable column) · **user-felt validation** (Sasha runs it himself and names where the lift was most and least felt).

## 5. Evidence that counts
- **Evidence = an artifact a third party can check**, never intent ("I changed the file"). Snapshot what the change produced (e.g. a `phaseN_sample.txt`) rather than "manual eyeball".
- **Self-reported scores are not evidence alone:** when a model rates its own output, regenerate 3× and average, plus a human read on at least two cases.
- Trace every surface a symptom shows on; don't patch one and call it fixed.
- Don't say "root cause found" before the fix is tested.

## 6. Splitting and PRs
- One PR = one DoD of 5–20 rows. Same job → **sister DoDs (waves)**, numbering continues; different job → **carve-out**.
- **Smallest possible diff.** Adjacent findings go in the PR body under "saw these too, NOT shipping".
- Conventional commits (`feat:` `fix:` `chore:` `refactor:` `docs:`; doc commits may use `<Doc name>: <change>`).
- PR body: `Closes #N`, what changed, constraints honoured, verification run; the merged SHA reported back on the issue.
- **Stop and ask** before the irreversible: data-dropping migrations, auth / RLS / billing, force push, dependency graph, locked texts, file deletion. **Stop, don't defer:** only Sasha moves things to "Phase 2". Pre-mortem when > 5 files.
- Parallel workers on the corpus or graph: partition by explicit unit ranges (an open issue is the lock); one pinned source SHA per batch; one writer per file; maps and schema single-writer (Hark); deterministic filenames; merge in sequence, re-run the duplicate check.

## 7. Review before merge (Hark)
- [ ] `Closes #N`; nothing outside the issue's scope · [ ] every DoD row ✅ with real evidence · [ ] lint, build, typecheck pass · [ ] no locked text altered · [ ] quotes match the source at the stated SHA and lines · [ ] no invented names, numbers or codenames · [ ] licences not mixed (`docs/` CC BY-NC-SA, `.agent/skills/` MIT) · [ ] our prose free of the anti-AI-style list · [ ] no Hark-owned file written by a worker (CRM, Offer Ledger, pulse log) · [ ] irreversible items flagged, not auto-merged · [ ] merged SHA reported back.
- For product surfaces, the quick roast too: does the flow deliver the Master Result? unnecessary screens? text repeated across screens? buttons say what I get, not what I do? one next action per screen? Fast, Clear, Easy, Useful, WOW?

## 8. Standing context (as of 2026-10-27)
- **Who merges:** Hark, once checks pass and the DoD is ✅, for work Sasha and Hark agreed on; a Hark-opened issue counts as the go-ahead for `src/` only for such work (Sasha, 2026-10-13). Sasha does not read PRs; report in meaning.
- **Lovable** chat prompts and deploys cost credits: never without Sasha (2026-10-17). Publishing through Lovable is free.
- **GitHub Actions** minutes: bypassed until 2026-11-01; verify locally, merge locally with `[skip ci]` where the graph rules say so.
- *Dated:* the Feature Requirement Document (FReD) in `ai_tasks/features/` belongs to the retired Codex task workflow (archived June 2026); its useful parts (result it delivers, user story, data requirements, user flow, edge cases, alignment check) live on in §2–§3. "Human enters at the start and end of each cycle, not in the middle" (product workflow, 2026-05) still holds, with Hark now holding the gates Sasha used to hold.

## 9. Open edges (from Sasha's handover §7, status)
Codex lane vs RULES (retired, then back); canon-lock registry empty (only CLAUDE.md's list locks texts); vault template vs real frontmatter; duplicate PST 10 in the vault; 313 notes with off-schema relation fields; chat language (docs and specs are English under every rule).

---

## Genealogy
| Source | Date | Provenance | What it contributed |
|---|---|---|---|
| `docs/03-playbooks/ux_playbook.md` (*The Vibe-Coding Playbook*) §Feature Spec Template | undated (early 2026) | AI-written playbook from Sasha's practice | result vs feature; user story; functional and data requirements; user flow; acceptance criteria; edge cases |
| `.agent/workflows/feature.md` (FReD) | undated (early 2026; `ai_tasks/` era) | agent workflow, AI-written | the same template as a workflow; the **spec alignment check** before code; a worked example |
| `docs/03-playbooks/integrated_product_building_workflow.md` v1.2 | 2026-03 → 2026-05-22 | AI-written manual; the transformative-result pattern is Sasha's (Day 80) | five inputs; Master Result → sub-results → screens chain; before/after screen pair; holonic iteration; human-outside-loop; roast gates; quick roast checklist; supervisory tracker |
| `docs/specs/ubb-deep-context/` planning / implementation / debugging SoWs | 2026-05-21 | "Sasha + AI lane", decisions signed off by Sasha | the three-gate triad in practice; locked decisions; roast amendments; lift-gated smoke tests; telemetry; rollback; user-felt validation; "self-reported scores are not evidence" |
| SoW + DoD files: `docs/specs/{commercial-os,proactive-matchmaker,i18n,corpus-sync,products-page}/scope_of_work.md`, `{layout-route-refactor,profile-space}/sow_and_dods.md` | 2026-06-13 → 2026-09-10 | AI-written specs with Sasha's decisions | header shape (module, built on, surface owner); "what already exists: reuse, do not respec"; ground truth verified in code; honest effort after an adversarial roast; waves |
| `output/hark_spec_handover.md` (= Hark reference `how-we-write-specs.md`) + Hark specialty `sasha-spec-writing` (+ `spec-ui-taste`) | 2026-10-13; sample rule 2026-10-20 | Sasha's own handover to Hark (canonical); specialty is Hark's digest | the canonical issue order; DoD rules; what a worker needs; mistakes table; splitting and PR rules; review checklist; parallel-worker rules; open contradictions; examples → sample → work |
