# How We Write Specs — Handover to Hark

*For Hark, who will assign work to Claude Code and Codex through GitHub issues and PRs, starting with parsing `docs/` (evolver-grid-site) into the Obsidian graph (repo `knowledgegraph`). Every rule names its source file. **[practice, not written]** marks how we actually work but haven't written down. Contradictions are collected in §7.*

Source abbreviations:
- `SP` = `.agent/session-protocol.md`
- `RULES` = `.agent/RULES.md`
- `AAS` = `.agent/anti-ai-style.md`
- `CL` = `.agent/canon-lock.md`
- `CM` = `CLAUDE.md`
- `KG` = `~/Documents/knowledgegraph` (vault)

---

## 1. Spec template

Write the sections in this order.

1. **Task:** one line naming the unit of work. *(SP: Job / Scope / Task triad)*
2. **Job it serves:** the larger purpose, such as a roadmap row or theme. *(SP)*
3. **Roadmap status:** cite the row in `docs/02-strategy/roadmap.md`, or write "net-new". *(SP: Entry checks 1–3)*
4. **Context:** the 2–5 files the worker must read first, and the reason for each. *(SP: session-open table; issue #39 does this inline)*
5. **Scope.** In: … Out: … Out-of-scope items are named explicitly. *(SP: "scope is named at entry")*
6. **Definition of Done:** a table with these columns. *(SP: "The DoD format"; RULES "Definition of Done")*

   | # | Item | Evidence | Status |
   |---|---|---|---|

   - 5–20 rows. More than 20 means split the task.
   - Every row must be observable. Evidence means a file:line, a command output, a URL or a screenshot. "I checked" doesn't count.
   - Status is ⬜ or ✅ only.
   - The DoD covers the **full** intent of the request. No silent "Phase 2".
7. **Files:** the exact paths to create or change. *(practice, not written; issue #39 names `supabase/functions/equilibrium-agent-write/index.ts`)*
8. **Constraints:** diff size, no refactors, no new deps, no UI changes, files not to touch. *(issue #39; SP anti-pattern "smallest possible diff per fix")*
9. **Verification:** the exact commands or checks, for example lint/build, preview, or re-reading the doc after editing. *(SP: Lifecycle step 3, "No verify, no ✅")*
10. **Decisions:** list any open questions that need Sasha's input, each with a recommendation, in the format "*Decision: X. Recommended: Y. Override?*" *(SP: Decision discipline)*
11. **Exit line:** the worker ends with "Done — [task]. [1–2 lines]". That line goes into `docs/09-logs/session_log.md`. *(SP: Exit)*

**Build tasks** add three gates in sequence: **Planning DoD → Implementation DoD → Debugging DoD**. Each needs a "go" before the next starts, and there's no code before the plan is signed off. For content or translation work, the third gate becomes **Coverage + Charge**: did every surface get caught, and did the meaning survive? *(SP: "three-DoD gate")*

### Real example: issue #39 → PR #40 (evolver-grid-site)

> **Goal:** let Hark read Alexander's Equilibrium state so it can be shown as a Hark Home panel (the site stays the source of truth; one Supabase DB, nothing duplicated).
> **Change `supabase/functions/equilibrium-agent-write/index.ts`** (same token gate `x-agent-token`, same allowlist pattern, same single-user scoping as existing ops):
> 1. New op `read_state` … Returns JSON: `moon_focus`, … `lunar` … Reuse the existing cycle logic in `equilibrium/src/cycles.ts` … if it can be imported; otherwise compute the same way.
> 2. New op `delete_task` {task_id} … with `dry_run` support and `idempotency_key` like the other writes.
> 3. Update the op list in `docs/05-specs/founder_cockpit_equilibrium_writeback_sow.md`.
> **Constraints:** keep token usage lean: small focused diff, no refactors, no new deps. Don't touch the UI. Run lint/build. Open a PR; Hark reviews and merges when checks pass.

PR #40 body: *"Closes #39. read_state … and delete_task … Same x-agent-token gate and allowlist; spec op list updated."*

**What worked:** it had a goal, exact files, an output shape, a fallback ("otherwise compute the same way"), constraints, and a verification step.
**What was missing:** an explicit DoD table and an Out-of-scope line. For the graph work, add both.

---

## 2. Rules for the corpus

| Rule | Source |
|---|---|
| **Quote, never paraphrase.** When asked for a principle, technology or teaching, quote it from the source. | CM ("Quote, don't paraphrase"); SP verbs table ("Quote, don't paraphrase") |
| **Don't rewrite locked master texts:** the Epicenter Broadcast, myth versions and value ladder versions. Quote only. | CM "What I do NOT do"; SP "What I never do without asking" |
| Canon-lock registry: hook-enforced exact-match paragraphs. **It's currently empty**, so in practice the list in CM is the only lock. | CL |
| **Don't invent names, codenames or principle names.** If something new appears, ask; then the corpus gets updated. | CM |
| **Decode first:** if a term is unfamiliar, read the corpus (`docs/docs_index.md`, then the file). Don't guess. | CM |
| **No parallel compressions:** don't restate `docs/` content elsewhere as a new source of truth. The graph is a *mirror*. Every note points back to its source. | CM; SP Mirror Map law 1 ("a mirror never carries a fact its owner lacks") |
| **Owner first:** the source doc is edited before any mirror. Dated and historical sections are frozen. | SP Mirror Map, laws 1–2 |
| **Licenses:** `.agent/skills/` = MIT (Anthropic-derived). `docs/` = CC BY-NC-SA 4.0 (Sasha's originals). Never mix them in one file. The vault inherits CC BY-NC-SA for anything taken from `docs/`. | CM "License boundary" |
| **Unit numbering is permanent.** Phase Shift Library Technology numbers are addresses: new ones get the next number in order, and old ones are never reused. The early 8–16 were renumbered to 146–154 and Testimony 19 to 155, and cross-refs were repointed. | commit "Phase Shift Library: numbers as permanent addresses…"; SP Mirror Map ("next Technology number, in order") |
| **Playbook versioning:** bump the version header and the changelog together. | SP Mirror Map |
| **AI text is labeled as AI.** In the vault, summaries carry "*Gist (AI summary, not Sasha's words)*"; Sasha's words go under `## Verbatim`. | KG `10 Notes/Gleb Calls/*` |
| **Typed links only where the source asserts them,** each with its § and a verbatim quote. | KG `20 Maps/Relation Types.md` |
| Style: the banned phrases and patterns in AAS apply to everything written, including PR text and notes' own prose (not quoted text). | AAS; SP "Writing discipline" |
| Language: code, docs and commits in English. | RULES "Language Rules" |

---

## 3. Splitting a big task into PRs

| Rule | Source |
|---|---|
| One PR = one DoD of 5–20 rows. More than 20 rows means split. | SP "The DoD format" |
| Split into **sister DoDs (waves)** when it's the same job, or a **carve-out** when it's a different job. Numbering continues across waves. | SP "Multi-wave threads" |
| **Smallest possible diff per fix.** Adjacent observations go on a "saw these too, NOT shipping" list in the PR body, not into the commit. | SP anti-patterns |
| Branches: `claude/issue-<N>-<timestamp>` (from the GitHub Action), `codex/<slug>`, or `<type>/<slug>`. | practice, not written (PR list #26–#43) |
| Commits use conventional prefixes: `feat:` `fix:` `chore:` `refactor:` `docs:`. Doc commits also use a `<Doc name>: <change>` form. | RULES §4; git log |
| PR body: `Closes #N`, what changed, the constraints honored, the verification run, and the merged SHA reported back. | RULES §4 ("complete summary + test plan… receipt"); PR #40 |
| **Stop and ask** before anything irreversible: migrations that drop data, auth/RLS/billing, force pushes, dependency-graph changes, locked texts, file deletion. | RULES §4 "What still requires explicit confirmation"; SP "never do without asking" |
| **Stop, don't defer.** If something feels unfinished, stop and confirm scope. Only Sasha decides what moves to "Phase 2". | SP practice 6 |
| Pre-mortem before any change touching more than 5 files: name what could break. | SP practice 4 |

---

## 4. What a worker needs to finish a task with no follow-up questions

Every issue must contain:

1. Exact input paths, plus a **commit SHA** for any source doc.
2. Exact output paths and naming pattern.
3. A filled output example: one finished note, or the JSON shape.
4. A DoD table with the Evidence column already defined.
5. Explicit **Out of scope**.
6. A fallback for the likely unknowns ("if X doesn't exist, do Y").
7. A verification command.
8. Who merges, and under what condition.

*(Derived from SP Lifecycle + issue #39; the list itself is practice, not written.)*

**Common mistakes in bad specs:**

| Mistake | What goes wrong | Source |
|---|---|---|
| Intent with no DoD | You get "most of the way there" and a check / change / check loop | SP Day 54 worked example |
| A DoD that covers only round 1 | A false "done" (8/8 delivered when the real task was 20) | SP worked example |
| No out-of-scope line | "While I'm here" fixes bundled in, so failures can't be traced to a cause | SP anti-patterns |
| Symptom named, surfaces not | The fix patches one surface and the symptom stays | SP "Trace-every-surface" |
| No source SHA | Parallel agents parse different versions of the source | practice, not written |
| Evidence = intent ("I changed the file") | Unverified state passes as done | SP anti-patterns |
| "Root cause found" before testing | Trust drops when the next layer of the bug shows up | SP anti-patterns |

---

## 5. PR review checklist (before merge)

- [ ] `Closes #N`, and the PR stays inside the issue's scope. No extra files. *(SP)*
- [ ] Every DoD row is ✅ with concrete evidence. *(SP sign-off)*
- [ ] Lint, build and typecheck pass, for code. *(issue #39; MEMORY: `tsc --noEmit` gated in the build)*
- [ ] No locked text was altered, and the canon-lock hook didn't fire. *(CM, CL)*
- [ ] Quoted text matches the source exactly at the stated `source_sha` and lines. *(CM; KG frontmatter)*
- [ ] No invented names, numbers or codenames. *(CM)*
- [ ] Licenses aren't mixed. *(CM)*
- [ ] Nothing in AAS's banned list appears in our own prose. *(AAS)*
- [ ] No Hark-owned file was written by a worker (CRM, Offer Ledger, pulse log, …). *(CM "Lane boundary with Hark")*
- [ ] Anything on the irreversible list is flagged, not auto-merged. *(RULES §4)*
- [ ] The merged SHA is reported back on the issue. *(RULES §4 step 6)*

---

## 6. Proposed format: parse one document into the graph

### Issue template

```
TO: claude-code | codex
Task: Parse <doc> §<range> into the graph.
Job: Mirror of docs/ in knowledgegraph; owner stays evolver-grid-site.
Input: alexanderkonst/evolver-grid-site @ <source_sha> · <path> · lines <a>-<b>
Output dir: knowledgegraph/10 Notes/<Collection>/  (+ one map in 20 Maps/<Collection>.md if new)
Claimed units: <explicit list, e.g. PST 146-155>   ← lock; nobody else touches these
Out of scope: notes outside claimed units; editing evolver-grid-site; renaming existing notes; Maps other than the one named.
DoD: (table below)
Verify: script/grep checks listed in DoD.
Merge: Hark, after checks pass.
```

### Output per unit: one atomic note

Filename: `<PREFIX> <number> <Title>.md` (`PST`, `UO §`, `FW`). This follows the existing vault.

```markdown
---
type: unit | framework | concept
source: alexanderkonst/evolver-grid-site · <path>
source_sha: <7-char sha>
source_lines: <a>-<b>
technology: '<n>'            # or section: '§x'
tags: [<collection-slug>]
# typed links — only where the source asserts them (Relation Types.md)
part_of: []
generates: []
refines: []
rhymes_with: []
shared_essence: []
distinct_from: []
tension_with: []
---
# <exact heading from source>

> Verbatim from <doc>. Map: [[<Map>]]. Source of truth: evolver-grid-site.

<verbatim body, byte-for-byte from source_lines>

## Relations
- `<type>` [[Target]] — §<x>: "<verbatim quote that asserts it>"
```

**Frameworks** (`type: framework`) also carry `shape:` (matrix · cycle · ladder · spiral · polarity · …), `parts:` (each part named verbatim), `scale:`, `source_unit:`, `instance_of:` and `contains:`. This follows the existing `FW` notes.

**Relation types:** only the 10 in `20 Maps/Relation Types.md`. No new types without Sasha.

### DoD for one parse PR

| # | Item | Evidence |
|---|---|---|
| 1 | One note per claimed unit, no more, no less | `ls` count = claimed count |
| 2 | Body is verbatim | a script diffs each body against `git show <sha>:<path>` at `source_lines` → 0 diffs |
| 3 | `source_sha` and `source_lines` present on every note | grep |
| 4 | Every typed link has a §-quote in Relations | grep: count(frontmatter links) = count(Relations lines) |
| 5 | Only allowed relation types used | grep against the 10 types |
| 6 | No duplicate unit numbers in the collection | `ls \| cut -d' ' -f1-2 \| sort \| uniq -d` → empty |
| 7 | Every link target exists, or is listed in the PR as "pending target" | script |
| 8 | No files outside the claimed units were touched | `git diff --stat` |
| 9 | Map updated, and only the named map | diff |

### Avoiding conflicts between two parallel agents

1. **Partition by unit ranges, never by "half the doc".** Each issue claims an explicit list of units (e.g. PST 146–155). An open issue holding a range is the lock.
2. **Pin one `source_sha` for the whole batch.** Both agents parse the same commit. If the source changes mid-batch, a separate re-sync issue handles it.
3. **One writer per file.** A worker only creates *its own* notes. Cross-links to the other agent's units go in its own frontmatter. It never edits their notes. Backlinks show up automatically in Obsidian.
4. **Maps and schema are single-writer: Hark.** Agents list the map entries to add in their PR body, and Hark applies them in a final merge. That removes the most common merge conflict.
5. **Deterministic filenames from the source heading,** so both agents produce the same name for the same target link.
6. **Merge in sequence:** rebase on `main` → run checks → merge. Run DoD #6 (the duplicate check) again after each merge.
7. **Exclude Obsidian's auto-commit during batch runs.** "Obsidian Git" commits `vault backup:` on its own, so pause it or keep agents on branches. *(KG git log shows `vault backup:` commits)*

---

## 7. Contradictions in our practice

1. **Who merges.** RULES §4 says Sasha doesn't review PRs and every batch auto-merges to `main`. SP says never push without asking. Issue #39 says Hark reviews and merges. → Proposal: Hark merges, as in #39, and RULES §4 gets updated.
2. **Codex lane.** RULES says the Codex lane and the `ai_tasks/` queue are deprecated (retired Day 103). Now Codex is a worker again (PRs #28–#34, `codex/*`). → RULES needs an update.
3. **`src/` without a go-ahead.** SP says never edit `src/` without Sasha's explicit go-ahead. Hark-issued tasks (#37, #39, #42) did exactly that. → Decide whether a Hark issue counts as the go-ahead.
4. **Chat language.** RULES and CM say Russian for chat. The user-level `~/.claude/CLAUDE.md` says English is the default for substantive replies. CM also says "Russian in / Russian out". → Docs and specs are English under every rule. Only chat is unclear.
5. **Locked texts.** CM forbids rewriting master texts, but the enforcement registry CL is empty, so nothing is locked mechanically.
6. **Vault template vs. reality.** `Templates/Note.md` (`tags/source/created`, a `## Суть` section) doesn't match the frontmatter actually in use (`source_sha`, `source_lines`, typed links). → Replace the template with the §6 format.
7. **Duplicate addresses in the vault.** There are two notes with the number `PST 10` ("Holding Paradox as Power…" and "The Business You're Already Standing On…"). That breaks the "numbers are permanent addresses" rule, probably a leftover from before the renumbering. Fix it before parallel work starts.
8. **Relation schema drift.** 313 notes carry `same_as` / `relation` / `origin` / `cluster` fields that aren't in `Relation Types.md`. → Either add them to the schema or migrate them.
