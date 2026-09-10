# Corpus Sync — Scope of Work

> *v0.1 · September 10, 2026 (Day 180). Plan only. Nothing in this spec has been executed.*
> *Goal: bring the corpus back to one coherent, current body, where every fact has one owner and every other surface points to it.*

---

## 1. Why this exists

The corpus has grown faster than it has been stitched. Documenting has been done in bursts, so the surfaces now disagree with each other. The worst case: the declared source of truth for revenue (the CRM Offer Ledger) is **behind** the mirrors that quote it.

This is Technology 16 (The Mirror Must Not Lag) failing on the corpus itself. The fix is not more documents. The fix is a clear owner for each fact, a fixed update order, and a check that can be run.

---

## 2. Laws for this work (non-negotiable)

1. **Nothing is deleted.** Superseded content is labelled and kept. Newest on top, genealogy below.
2. **Historical sections are frozen.** Only *live* sections get edited: dashboards, status tables, Current Status, "we are here" markers, indexes. A dated session record from April stays as written, including its old names and numbers.
3. **Highest-Rated Version Rule.** No scored artifact is re-summarized. Quote it, point to it.
4. **No parallel compressions, no doc creep.** Extend the owner document. A new file only when no owner exists.
5. **Locked texts are quoted verbatim.** Myth, tuning forks, value ladder versions, public lines.
6. **Other founders' canvases are held.** No edits without Sasha, per `.agent/auto-execute-policy.md` §3.
7. **One work package per commit.** Each commit reviewable on its own diff.
8. **Sasha decides doctrine.** Anything that changes a principle, a law, or a sequence waits for his call (§5).

---

## 3. Source-of-truth map (who owns which fact)

Every fact below has exactly one owner. All other surfaces quote it with a date, or point to it.

| Fact | Owner | Mirrors that must point to it |
|---|---|---|
| Revenue, offers, payments | `02-strategy/strategic_crm_outreach_tracker.md` → Offer Ledger | roadmap Current Status · canvas Dashboard · holomap addenda · cohort/million briefs |
| Current state, focus, weekly scope | `02-strategy/roadmap.md` → Current Status + This Week's Scope | canvas Dashboard · `MEMORY.md` holomap line |
| Business artifacts (uniqueness → ladder) | `02-strategy/unique-businesses/alexanders_unique_business.md` | Artifact Status table (same file) · Public Lines · playbook examples |
| The method (principles, sequence) | `03-playbooks/unique_business_playbook.md` | canvas template · UBB prompts · CLAUDE.md |
| Laws and discoveries | `01-vision/phase_shift_technology_library.md` | playbook principles · index |
| What happened, when | `09-logs/session_log.md` | holomap addenda · roadmap Completed |
| Why a decision was made | `09-logs/decision_log.md` | session log entries |
| Structural state of the venture | `02-strategy/morphogenetic_holomap.md` (history) + `MEMORY.md` (live line) | roadmap Current Status |
| Where everything lives | `docs_index.md` | CLAUDE.md corpus map |

---

## 4. Audit findings (evidence gathered Day 180)

| # | Finding | Evidence | Severity |
|---|---|---|---|
| F1 | **Revenue owner is behind its mirrors.** Offer Ledger says strict received $2,428 (Day 134). Roadmap, canvas Dashboard and briefs say $3,428 (Gleb $1,000, Day 166). | `strategic_crm_outreach_tracker.md` L909–911 vs `roadmap.md` L214 | 🔴 |
| F2 | **Session log stops at Day 166.** Days 167–180 exist only in commits: Technologies 137–143, Principles 18–20, matchmaker briefs v3.1→v4.2, outreach strategy v4.0 + ops v2.0, Commercial OS bugfix, first cold conversations (Danil, Day 177), Gleb sessions. | `git log --since=2026-08-25 -- docs` (35 commits) | 🔴 |
| F3 | **Canvas Artifact Status table frozen at ~Day 112.** Tribe "v3.2 pending score", Value Ladder "v2.0 $27 → $555 → $5K+", while the Dashboard on the same file says Tribe v5.0/v6.0 and ladder Direction Call → $555 → BUILT → Node, plus the Sovereign Founder Collective ladder. | `alexanders_unique_business.md` L1266–1284 vs L55–62 | 🔴 |
| F4 | **Roadmap Current Status mixed dates.** Delta paragraph is Day 166; table rows (Phase, Cycle, Holomap center, Focus) still read Day 138. This Week's Scope is Aug 25–31, expired. | `roadmap.md` L200–216, L81 | 🟠 |
| F5 | **Index is behind.** Dated Aug 25. Zero mentions of Technologies 137–143 or Principles 18–20. 17 dead links (`04-specs/*` now lives in `05-specs/`; `oyis_`/`sergeys_` canvases moved to `unique-businesses/`). ~216 of ~338 live `.md` files unindexed. Folders `00-intro kit`, `00-master`, `06-modules`, `10-workshops`, `holomaps`, `specs` missing from the tree; `04-exports` is empty. | link check script, §8 | 🟠 |
| F6 | **Playbook internal breaks.** Two different "Principle 13"s (Highest-Rated Version Rule, Grind Addiction Diagnosis). Header says v4.6, changelog ends at v4.2. P20 contradicts itself on which triangle action and cash flow sit on. P20 contains the line "One turn is a business. Repeated turns are a practice." (flagged by Sasha as unclear, §5 D3). | `unique_business_playbook.md` L484, L655, L1081–1117, L4963 | 🟠 |
| F7 | **Three competing artifact sequences.** Playbook/canvas: 7 steps + Shadow 1.5. Principle 17: a 21-artifact chain. UBB runtime: 18/19 artifacts. No doc says which is canonical for which use. | playbook L1990, L977; canvas L1288; UBB | 🟠 |
| F8 | **Decision log stops May 7.** Since then: match funnel as default, "Ignition" retired for "Productize Yourself", Domains → Technologies, Tribe as position not population, Sovereign Founder Collective, The Crossing pricing. These live only inside session log and roadmap prose. | `decision_log.md` L271 | 🟡 |
| F9 | **Holomap last addendum Day 166.** `MEMORY.md` live line also Day 166. | `morphogenetic_holomap.md` L3438 | 🟡 |
| F10 | **Stale "WE ARE HERE."** Planetary OS Assembly marks Step 2 (word of mouth, 8/10). Reality is past Step 3 (charging) with Step 6 (others facilitating: Karime) live. | `planetary_os_assembly.md` L89 | 🟡 |
| F11 | **Retired names in live sections.** "Ignition Session" appears in 26 non-archive files. Only live/current sections should change (law 2.2). | grep | 🟡 |
| F12 | **CLAUDE.md drift.** Says playbook v4.1, "~160 documents" (actual ~356), and a 2-input holomap update protocol while the holomap itself defines 6 inputs. | `CLAUDE.md` | 🟡 |
| F13 | **Technology library out of order.** 137 sits after 139. | library L7802–7936 | ⚪ |
| F14 | **Duplicates and forks (flag only).** Two Karime canvases that differ (1,351 lines in `02-strategy/`, 287 in `unique-businesses/`, held). `ai_matchmaker_brief.md` + `ai_matchmaker_briefing.md` + `briefs/`. Six outreach docs (`outreach_*_2026-07` ×4, `outreach_ops`, `outreach_strategy`). `cohort_clarity_brief` + `_5k`. | `ls 02-strategy` | ⚪ |
| F15 | **Canvas template frozen at v5.0 (Apr 22).** The live method has since added Shadow two dials, Public Lines, Timestamp Requirement, Ripeness, Stream 0. | `unique_business_canvas_template.md` | ⚪ |

---

## 5. Decisions waiting on Sasha (blocks WP3)

| # | Question | Options | Recommendation |
|---|---|---|---|
| D1 | Hexagram order. Sasha: strategy begets fit. | **A** uniqueness → clarity → strategy → fit → action → cash flow. **B** uniqueness → clarity → strategy → action → fit → cash flow. | See §5.1. |
| D2 | Loop doctrine: "learn and run the loop once, as fast as possible; then run it again and again." Where does it live? | Amend P18 · a line in the playbook's executive summary · both | Both: one line in the summary, the full form in P18 |
| D3 | The "practice" line in P20. | Cut · rewrite when clear | Cut now, leave a placeholder note |
| D4 | Which artifact sequence is canonical for what. | One table naming the 7-step (session), 21-chain (four-scale projection), UBB 18 (software) | One table in the playbook, pointed to from canvas + UBB |
| D5 | Duplicates in F14. | Merge · label one as superseded · leave | Label, don't merge, in this pass |
| D6 | Backfill depth for Days 167–180. | Full narrative from git + Fathom + LinkedIn · short summary per day | Short summary, one entry for the window, like Days 147–166 |

### 5.1 Note on D1

"Fit" is used two ways in the corpus.

- **Seen fit** — options that become visible once you are clear (Day 112 myth; the Accelerator cycle). This comes *before* strategy. It is what current P20 describes.
- **Proven fit** — specific people recognize themselves needing exactly you (Technology 143). This comes *after* strategy, because strategy is the aim.

Sasha's correction uses proven fit, which is the stronger and more market-true meaning. The open question is whether proven fit needs action first. Technology 143 says fit is a reading of exposure. Danil recognized himself only after a DM went out. That points to **B**.

Either way, P20's "artifact, capacity, artifact, capacity" alternation has to be re-derived. It already contradicts itself about action and cash flow.

---

## 6. Work packages (load order)

Order matters: owners first, then logs, then method, then derived surfaces, then index and contract last, because they read everything above them.

### WP0 — Decisions
Sasha answers D1–D6. **DoD:** answers recorded in `decision_log.md` with dates.

### WP1 — Fact owners (revenue, state, artifacts)
- Offer Ledger: add Gleb $1,000 and any payments since. Recompute totals with the math shown.
- Roadmap Current Status: bring every table row to one date. Close the expired weekly scope and open a new one.
- Canvas: Artifact Status table rebuilt from the newest version of each artifact already in the file (quote version names, no re-scoring). Dashboard revenue points to the Ledger.

**DoD:** one revenue number across all surfaces, each dated. Status table matches Dashboard. Script check §8.1 passes.

### WP2 — Logs backfill
- `session_log.md`: one entry for Days 167–180 (per D6), sourced from commits, Fathom and LinkedIn threads.
- `decision_log.md`: backfill entries for the F8 decisions, each with date and link to its session log entry.

**DoD:** every commit since Aug 25 that changed doctrine has a session log line. Every F8 decision has an ID.

### WP3 — Method (blocked on WP0)
- Playbook: renumber the duplicate Principle 13 (keep both texts; the second gets a new number and a redirect note). Version header and changelog brought to one version. P20 rewritten per D1 and D3. D2 line added. D4 table added.
- Technology library: re-sequence 137 into order (move the block, change nothing inside it).

**DoD:** no duplicate principle numbers. Version header equals the latest changelog entry. P20 consistent with Technology 143.

### WP4 — Derived surfaces
- Planetary OS Assembly: move the marker, add dated status lines on Steps 3, 6, 9.
- Canvas template v5.0 → v6.0 from the method as practiced (F15).
- Live-section renames of "Ignition Session" (F11), with a list of every file touched.
- F14 duplicates labelled per D5. Karime canvases: flag to Sasha only.

**DoD:** marker matches roadmap. Template carries every law added since April. Rename list attached to commit.

### WP5 — Holomap
- Dated addendum for Days 167–180. Rewrite the `MEMORY.md` live line.

**DoD:** addendum date equals the session log's latest day. `MEMORY.md` line carries no figure that the Ledger doesn't hold.

### WP6 — Index and contract (last)
- `docs_index.md`: fix the 17 dead links, add missing folders, add Technologies 137–143 and Principles 18–20, index unindexed live files by folder (grouping allowed, one line per file not required for `specs/` subfolders).
- `CLAUDE.md`: playbook version, doc count, holomap protocol inputs point to the holomap's own list instead of restating it.

**DoD:** dead links = 0. Every Technology and Principle number appears in the index. CLAUDE.md contains no number that another file owns.

---

## 7. What stops this from happening again

A short **Mirror Map** section added to `.agent/session-protocol.md`: when X changes, update Y, in this order. It is the table in §3 turned into a checklist. It runs at "log this session" time, not as a separate ritual.

---

## 8. Verification (runnable)

1. **Revenue consistency:** `grep -rn --include='*.md' -E '\$[0-9],[0-9]{3}' docs/02-strategy docs/09-logs` → every live-section figure equals the Ledger.
2. **Dead links:** extract `(./…md)` from `docs_index.md`, test each path exists → 0 missing.
3. **Coverage:** every `## Technology N` and `## Principle N` heading has a matching index mention.
4. **Uniqueness of numbers:** `grep '^## Principle' | sort | uniq -d` → empty.
5. **Freshness:** latest day in session log = latest holomap addendum = `MEMORY.md` live line = roadmap Current Status date.

---

## 9. Out of scope

- Rewriting any locked text or historical record.
- Merging or deleting files (flag only, per D5).
- Code or `/ubb` runtime changes (P17's compiler consequence stays a separate build task).
- Other founders' canvases.

---

## 10. Estimated size

WP1–WP2: one focused session. WP3–WP4: one session after decisions. WP5–WP6: half a session. Mechanical parts (link fixing, renames, index coverage) can go to a Sonnet subagent under this spec; doctrine edits stay with Sasha and Fable.
