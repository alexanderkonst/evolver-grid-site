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

---

# v1 (2026-11-27 13:50 MST): the etalon of QA in the Etalon system

**Why v1.** Sasha: «найти эталон того, как мы можем в нашем контексте делать тестирование и QA. Наш контекст: СИСТЕМА ЭТАЛОН с всеми её вложенными эталонами.» The roast of v0 ([roast-of-qa-testing-v0.md](./roast-of-qa-testing-v0.md)) found v0 answers the wrong question («how to find bugs»). Frame re-set: the system's invariant is *return to the etalon of selfhood of anything* (Sasha, 2026-11-27 13:18); QA is that invariant applied to our own work.

**Corpus added:** cluster 7, metrology (the science of etalons): the kilogram and the 2019 redefinition, the traceability chain (VIM), calibration intervals (ILAC-G24), ISO/IEC 17025 proficiency testing, gage R&R (MSA), Hubble 1990 (negative). Dossier: [exemplars/metrology.md](./exemplars/metrology.md).

## The whole in one sentence (v1)
Every check compares a thing with its etalon; every etalon is traceable to the one above it, up to the person's own; every measuring instrument is itself checked; every deviation becomes a permanent correction.

## Organizing principle (v1): traceable return
v0's «find it cheap, find it once» survives as the *how*. The *what* is new: **a test is a comparison with an etalon, a bug is a deviation from one.** Metrology supplies the rigour the word needs:
1. **Nesting with growing uncertainty.** Trust flows down the chain, error accumulates (VIM). Our chain: E0 the person's own etalon → E1 Sasha's transmission and the canon (GoBY, core-flow rules) → E2 the spec and its DoD, the templates (etalons of work) → E3 the tests (working standards) → E4 the live build. A green test is only as true as its spec line; a spec only as true as the canon. So machines measure low in the chain, people measure high.
2. **An etalon is checked only against a peer or a different method, never itself** (kilogram drift was invisible against its own copies). Our agents grading our agents share drift: the 5 first-timers and Sasha are the independent method.
3. **The instrument is suspect first, and a disagreeing check is never dismissed** (gage R&R; Hubble's two ignored checks). A roast that disagrees with green CI is resolved, not overruled.
4. **A failed reference recalls what it passed** (ISO 17025). A wrong spec line or test re-opens everything it approved.
5. **Etalons change in versions, on evidence, damped** (2019 redefinition; 2026 consensus held to −5 µg). Canon changes only through Sasha; templates through the trace line.
6. **Intervals adapt** (ILAC-G24): a surface that failed is checked more often; a stable one less.

## Invariants v0 → v1 (all kept, each now names its etalon)
| v0 invariant | v1 reading |
|---|---|
| I1 layers, cheapest first | the chain E4→E0: measure low with machines, high with people |
| I2 watch first-timers | the only direct measure at E0 (independent method) |
| I3 adversary | an outsider instrument, not the builder's own |
| I4 severity → ship rule | severity = distance from the etalon × level (a deviation from E1 canon outranks a pixel) |
| I5 debrief | written comparison: etalon, deviation, why the instrument did or did not catch it |
| I6 every finding → artifact | correction at the right level: a test (E3), a spec line (E2), a canon question to Sasha (E1) |
| I7 grade outcome, not claim | measure E4 itself, never the agent's report of it |
| I8 limits in infrastructure | the instrument cannot take the unsafe reading (paid calls blocked, core flows gated) |
| **I9 new: traceability** | every test and finding names its etalon line; no line = a missing etalon or a taste call |
| **I10 new: instrument check** | tests, agents, roasts and the first-timer test are themselves calibrated (flaky rate, two-roast agreement, agent timing vs Playwright) |

## Evidence this works here (2026-11-27 roast)
All four Blockers «work as coded» and violate canon lines (GoBY §25: the same gesture closes the instrument and the player is where they were; architecture: Esc closes, focus returns). A bug list saw them as UI issues; the etalon line shows they are one deviation: the instrument acting without the player.

## What we cut (v1)
A separate qa-testing template (now [calibration.md](../../../templates/calibration.md)); dedicated QA staff; statistical gates on 5 users; any check without an etalon line.

## Decisions for Sasha
1. Name: `calibration.md` / «Сверка с эталоном». Recommendation: yes; English «calibration» carries «etalon» where «etalon» does not live in English.
2. E0 measure: what counts as «the player came closer to their etalon»? Recommendation: the player's own words after the reveal, one line, plus the 3-second test. His call.
3. Live test threshold 4 of 5: still unconfirmed.
