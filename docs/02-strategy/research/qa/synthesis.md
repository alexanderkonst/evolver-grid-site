# QA and testing for a tiny agent-run team: integral holonic synthesis (v0, 2026-11-27)

Method: [integral-synthesis.md](../../../templates/integral-synthesis.md), phases 1-12 in one pass. Frame: `frame.md`. Schema: `SCHEMA.md`. Dossiers: `exemplars/{engineering,games,ux,rehearsal,postmortem,agents}.md` (36 exemplars, 6 clusters, 9 negatives, out-of-domain controls: NASA, aviation, surgery, theatre, Army, Toyota).

## The whole in one sentence
Find each failure as early and as cheaply as possible, by someone who did not build the thing, and make sure it can never be found twice.

## 1. Organizing principle
**Find it cheap, find it once.** Every kept practice derives from two forces: (a) move discovery left (cheaper layer, earlier moment, outsider eyes), (b) close the loop (every finding ends as a permanent artifact with an owner). All 9 negatives broke (a) or (b): Knight Capital (one layer), Cyberpunk (date beat evidence), Microsoft 2018 (signal with no owner), Challenger (gate decayed by "it flew before"), Replit (limit held only as an instruction), Juicero (never compared with the baseline).

## 2. Core invariants (present in >= 5 of 6 clusters)
| # | Invariant | Strongest evidence |
|---|---|---|
| I1 | **Layers, cheapest first**: machine checks → builder/dogfood → small real exposure → full release | Knight lost $460M in 45 min with one layer (B); Anthropic "Swiss cheese" (B) |
| I2 | **Watch real first-timers, silently, small samples, repeated** | RITE fixed 30/31 issues (B); Faulkner: 5 users catch 55-99% per round, so more rounds (A) |
| I3 | **An adversary breaks it on purpose**, chosen from outside the builders | OSS-Fuzz 36k bugs (A); Netflix 0 downtime on 218 forced reboots (B); Apollo SimSup (C) |
| I4 | **Severity scale tied to a ship rule** (go/no-go at fixed points) | NN/g 0-4 with 4 blocking (B); WHO checklist deaths 1.5→0.8% (A) |
| I5 | **Debrief right after every run, written, blameless, with a timeline** | AAR meta-analysis (A−); Google 80-85% of drill issues closed (B) |
| I6 | **Every finding → owner + permanent artifact, tracked to closure** (regression test, checklist line, guardrail) | NTSB 77-80% recommendations closed (B); all negatives are closure failures |
| I7 | **Grade the outcome, never the claim; every signal has an owner** | Google: 84% of pass→fail flips were flaky (A); Knight: 97 unread error emails (B); Replit agent misreported tests (B) |
| I8 | **Hard limits in infrastructure, not instructions** | Replit code freeze ignored (B); AWS S3 2017 tool now refuses unsafe removals (B); Toyota jidoka (B) |

Conditional (need volume we lack): canaries at 2%, heatmaps, soft-launch retention. Supercell: even 100k-player betas mispredicted (B).

## 3. Holonic levels
| Level | Unit | Answer per invariant |
|---|---|---|
| L1 change | one PR | machine pass (qa-pass), red→green regression test, one reviewer (I1, I6, I7) |
| L2 feature | a spec/WP | pre-mortem before build, adversary pass + first-timer walk before ship, go/no-go on severity (I3, I2, I4) |
| L3 release | what players see | staged exposure (preview → Evolver account → Sasha → 5 first-timers → all), watch for 48 h (I1) |
| L4 practice | the system | debrief → artifact → template/skill update; re-read old cases monthly (I5, I6) |

## 4. What we cut
Dedicated QA staff, chaos in production, canary percentages, biometric playtests, paid QA vendors, 5-whys single root cause (replaced by a contributing-factors tree: Cook, Etsy).

## 5. What changes for FYTT
- New template [qa-testing.md](../../../templates/qa-testing.md) sits above `qa-pass.md` (L1) and `roasting.md` (critique).
- Every bug from today's roast becomes a spec in `e2e/` before its fix.
- Pre-mortem line added to spec-handoff DoD (proposal).
- One-page debrief after every failed release or broken first-use path.

## 6. Acceptance test
A fresh agent, given only qa-testing.md, takes a feature from spec to live and to debrief, catches a broken first-use path before any player, and leaves one regression test + one checklist line per failure.

## 7. Evidence and gaps
Strong (A): OSS-Fuzz, property-based testing, WHO checklist, Faulkner, Google flaky data, AAR meta-analysis. Most game and post-mortem claims B/C. Caution (B): checklists imposed without ownership showed no effect (Ontario). Several sources read from search excerpts only; marked in dossiers.
