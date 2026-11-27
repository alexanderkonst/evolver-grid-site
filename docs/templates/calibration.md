# Calibration: return every thing to its etalon («Сверка с эталоном»)

*Name confirmed by Sasha 2026-11-27 14:09 MST («да отлично»). Canonical template v1, 2026-11-27, Evolver (Hark). Replaces [qa-testing.md](./qa-testing.md) v0 (same day). Built by the [meta-template](./meta-template.md) §9 (Wizard + Template), roasted by [roasting.md](./roasting.md) v2 ([roast of v0](../02-strategy/research/qa/roast-of-qa-testing-v0.md)), found by [integral-synthesis.md](./integral-synthesis.md) across 42 exemplars in 7 clusters ([synthesis v1](../02-strategy/research/qa/synthesis.md)). The system's invariant (Sasha, 2026-11-27 13:18 MST): «возвращение к эталону самости чего бы то ни было». This template is that invariant applied to our own work: testing and QA.*

## Meta-description
- **Level / parent:** L2 · Craft · parent: [meta-template.md](./meta-template.md)
- **Children:** [qa-pass.md](./qa-pass.md) (E3 machine measure, one PR); [roasting.md](./roasting.md) (outsider measure, any artifact)
- **Lens(es):** Causal (comparison with a measure), Blueprint (the chain of etalons)
- **Shift carried:** Craft (nearest PST 115) · check: a fresh agent runs the Wizard on a feature and every finding names its etalon line
- **What emerges:** work that reaches players true to every etalon above it, and instruments we can trust
- **As a part of the whole:** the Etalon system's invariant turned on itself: before anything asks a person to return to their etalon, it has returned to its own
- **Version:** v1 · last changed 2026-11-27 · change log: v1 = etalon chain, traceability, instrument check, Wizard; v0 (qa-testing) = 8 invariants, loop, formats
- **Status · applied in:** draft v1 · first run: issue #562 (roast fixes)

---

## 0. Wizard
| Step | Ask / do | Input | Output | Gate |
|---|---|---|---|---|
| **W1 Object** | What is calibrated, at which level: change (one PR) · feature (a spec) · release (what players see) · practice (a template, a process) | the thing (PR, spec, URL, file) | one line: object + level | the object is in front of you, not remembered |
| **W2 Etalon chain** | Name the etalon lines it must match, top down: E1 canon § (GoBY, core-flow rules), E2 spec DoD / template §, E3 the tests that encode them. Touches title, intro, reveal, themes or game entry? | repo docs, approvals | a short chain list; core-flow flag | every line found or marked «missing etalon»; core flow → Sasha's yes to the exact change is on record |
| **W3 Pre-mortem** | «A month later this failed. Why?» Run [roasting](./roasting.md) Crash-test: 12 failure modes, each with its stress signal | W1, W2 | 12 rows → the 3 worst become test cases | the 3 worst have a test case or a spec line |
| **W4 Machine measure (E3)** | Run [qa-pass](./qa-pass.md) on the preview: iPhone 15 390, iPad, 1440, reduced motion, en/es/ru, axe | the PR | QA table | green, no retry-to-green; paid calls blocked |
| **W5 Outsider measure (E4)** | Two sessions in parallel: guest at 390 (harness) + Evolver test account at desktop (§6), plus an adversary charter. Every finding in the §4 format | live or preview URL | ranked findings with etalon lines | no Blocker; every finding has its etalon line or is marked taste |
| **W6 Person measure (E0)** | Sasha's in-person round with 5 first-timers: the 3-second navigation test (GoBY §25.12: screen shown 3 s, hidden, three questions) + E0 felt layer; the lagging layer is read later from behaviour | Sasha's yes, 5 people | pass count + words | §25.12: a screen passes when 4 of 5 answer all three (confirmed by Sasha 2026-11-27) |
| **W7 Close and recalibrate** | Each deviation → a correction at its level (§5). Instrument check (§7). Debrief if it reached a player (§8). Adjust the interval (§9). Trace line | W3–W6 | tests, spec lines, canon questions, checklist lines | every action item has an owner and an artifact |

Branches: **change** = W1 → W2 → W4 → W7. **Feature** = W1–W5, W7. **Release touching a core flow** = all seven, nothing ships without Sasha's yes to that exact change. **Practice** (a template) = W1, W2, W3, W7.
Short form for a button: «сверить с эталоном» = W1 → W2 → W4 → W5 → W7.

## 1. Essence
**Every check compares a thing with its etalon. Every etalon is traceable to the one above it, up to the person's own. Every measuring instrument is itself checked. Every deviation becomes a permanent correction.**
A test is a comparison with an etalon; a bug is a deviation from one. «Find it cheap, find it once» (v0) is the how: measure as low and early as possible, by someone who did not build it, and never find the same deviation twice.

## 2. The etalon chain (our nested etalons)
| Level | Etalon | Who measures | Instrument |
|---|---|---|---|
| **E0** | the person's own etalon: did the player come closer to themselves? | first-timers, Sasha | two layers (Sasha 2026-11-27): **felt** = the subtle feeling at the moment of reading the phrase and the shadow, «very close to his essence», a before/after line (capture it, do not only rate it); **evolutionary, lagging** = movement on the uniqueness scale ([uniqueness holomap](../holomaps/uniqueness_holomap.md) 7 stages; /quiz Q2 categories), read from behaviour over weeks. One phrase = recognition, never progress |
| **E1** | Sasha's transmission and the canon: GoBY (§14 principles, §25 navigation), core-flow rules, approvals | Sasha decides; Evolver checks against it | canon lines, the core-flow gate |
| **E2** | the spec and its DoD; templates (etalons of work) | Evolver | spec-handoff DoD, review of the diff |
| **E3** | working standards: Playwright specs, axe, overlap checks | CI | qa-pass |
| **E4** | the live build: what a person actually sees | outsiders | roast walk, adversary, bundle check |

Rules of the chain (metrology):
1. **Trust flows down, error accumulates.** A green test is only as true as its spec line; a spec only as true as the canon. Machines measure low; people measure high.
2. **Never calibrate an etalon against itself.** Our agents grading our agents share drift. The independent methods are a fresh agent that did not build it, the guest session, and at the top Sasha and the first-timers.
3. **Etalons change in versions, on evidence, damped.** E1 only through Sasha. E2 through the trace line and a version bump. A test changes only with the spec line it encodes.
4. **A failed etalon recalls what it passed.** A wrong spec line or test re-opens every merge it approved.

## 3. Severity = distance from the etalon × its level
Scale from [qa-pass.md](./qa-pass.md) §13 (one source): **Blocker** (first-use path cannot finish; a deviation from an E1 canon line on a core flow; a control covered) · **Major** · **Minor** · **Polish** (taste, no etalon line). A deviation from E1 outranks one from E3 of the same size. Ship rule: zero Blocker, zero Major on touched screens.

## 4. Finding format (every finding, every agent)
`[Severity] · etalon line (E-level + file §, or «missing etalon», or «taste») · screen URL · viewport · account (guest / Evolver / Sasha) · expected · saw (exact quoted text) · why it matters to a person · fix · evidence (screenshot, log, test) · observed@390 / @1440 / code`
No quoted text or evidence: thrown out. «Missing etalon» on something that matters: a question to Sasha (E1) or a new spec line (E2), not a silent fix.

## 5. Correction at the right level
| Deviation from | Correction |
|---|---|
| E4 vs E3 (the test missed it) | a new spec in `e2e/`, red before the fix, green after |
| E3 vs E2 (the test encodes the spec wrongly) | fix the test; recall what it passed |
| E2 vs E1 (the spec drifted from canon) | fix the spec line; re-check the builds on it |
| E1 missing or unclear | one question to Sasha with a recommendation; nothing ships on a guess in a core flow |
| E0 (works, true to canon, people still don't come closer) | the canon itself is the question: bring it to Sasha with the first-timers' words |

## 6. Outsider measure charter (copy into browser tasks)
- **Guest, phone 390** (harness page, presigned URL pasted whole, no params after the signature): title → start → intro (time it, find Skip) → first result → village → 2 places → instrument → back. Stop at the paste screen of the reveal unless Sasha said yes (a reveal is a paid AI call).
- **Evolver test account, desktop** (`alexanderkonst+evolver@gmail.com`; verify «Evolver AI» first; never Sasha's account unless he asks): every open place, one room each, back; Home, Quest Board, instrument faces, profile, es and ru on 2 screens; Nielsen's 10, 1–5.
- Both: top 10 ranked (blocks > friction > trust > polish), 3 worst screenshots, what works. No payments, messages, deletes, account creation. Read-only.
The two sessions find different deviations (2026-11-27: almost no overlap). Always both.

## 7. Instrument check (who checks the checkers)
| Instrument | Its etalon | Check | Fail signal |
|---|---|---|---|
| CI tests (E3) | the spec line they encode | zero flaky; each spec names its DoD line | a retry on main; a test with no DoD line |
| Browser agents | the screen itself | quoted text confirmed in code before filing; timing only from local Playwright | agent timing off by >2× (seen: 44 s intro reported as 16 s) |
| Roasts | each other | two independent sessions on a core screen agree on its Blockers | a Blocker one sees and the other misses: resolve, never dismiss (Hubble) |
| The first-timer test | Sasha's canon | same script, silent, the player's words kept verbatim | a helper explains the screen |
| This template | the Shift check | the next 3 features: every finding had an etalon line | findings without one |
When an alarm fires, suspect the instrument first, then the thing. A disagreeing check is resolved, never overruled.

## 8. Debrief (one page, after a deviation reached a player)
1. Timeline (times with zone). 2. Impact. 3. Which etalon was violated, and why each instrument in the chain did or did not catch it. 4. Contributing factors as a tree (never «human error» or «agent error»). 5. Near misses. 6. What worked. 7. Corrections (§5), each with owner, artifact, status. Blameless.

## 9. Intervals (how often each surface is re-measured)
- Core flows (title, intro, reveal, entry): every release, both sessions.
- A surface that had a Blocker: next 3 releases, then back to normal.
- Stable surfaces: E3 on every PR; outsider walk monthly.
- Practice: re-read old debriefs monthly; prune §11 lines whose test has stayed green for 3 months.

## 10. Agent rules
1. Look before judging; mark `[from code only]` otherwise.
2. The browser agent cannot resize: 390 = harness or local Playwright.
3. Guest and signed-in are different products: run both.
4. 30 s on any «Loading» before calling a hang; up to 5–7 min on the reveal, no reload; then a fresh sign-in before filing.
5. Check live = main from the bundle (`assets/index-*.js`, grep a string from the newest commit).
6. Block `**/functions/v1/generate-*` in tests; a real reveal needs Sasha's yes.
7. Never retry to green; quarantine with a cause.
8. Before filing: list open issues and PRs; one issue per surface group; core-flow issues marked «no merge without Sasha's yes».
9. Persist each slice to a file at once.
10. Proof hygiene: a button exists ≠ it works; a screenshot ≠ it reads well; green ≠ the new journey is covered; preview ≠ live; the agent's «done» ≠ the screen.

## 11. Recurring deviations (append one line per closed debrief; prune per §9)
- [ ] Floating launcher (Chat) or instrument glyph covers a primary control at 390 / 768 / 1440
- [ ] Content slides under a fixed transparent header on scroll
- [ ] Primary CTA low contrast on dark art (PRESS START class)
- [ ] A warning and its gate disagree
- [ ] Wrong state painted before data loads
- [ ] A control with no accessible name or role
- [ ] Same-looking control, different behaviour on different screens
- [ ] A tour, modal or autoplay the player cannot close (E1: GoBY §25, the same gesture closes)
- [ ] Hardcoded English after a language switch; words run together across spans
- [ ] Unknown slugs fall into `/:username`
- [ ] Wait copy far from real time

## 12. Anti-patterns
A check with no etalon. Calibrating the agent with the agent. Dismissing a disagreeing check. One layer. The builder measures only their own work. A date beats the evidence. A finding with no owner. Retrying to green. Trusting «done». A limit written as an instruction. Statistics from 5 people. A single root cause. «Etalon» as decoration without a line it points to.

## 13. Worked example: 2026-11-27
Roast of the live game, two sessions ([roast-2026-11-27.md](../02-strategy/research/qa/roast-2026-11-27.md)). With etalon lines the four Blockers read as one deviation: the instrument acting without the player (E1/E2: GoBY §25 «the same gesture closes it and the player is exactly where they were»; instrument architecture «Same gesture closes; Esc closes; focus returns»). Corrections: issue #562 (four core-flow items on Sasha's yes, 2026-11-27 12:55 MST). Instrument lessons: a guest run spent one paid reveal call → rule 6; browser-agent timing unreliable → §7.

## Genealogy
| Source | Date | Contributed |
|---|---|---|
| [qa-testing.md](./qa-testing.md) v0 | 2026-11-27 | 8 invariants, loop, finding and debrief formats, agent rules, checklist |
| [roast of v0](../02-strategy/research/qa/roast-of-qa-testing-v0.md) | 2026-11-27 | the changed question; «true but wrong»; the 27th: name the etalon line |
| [synthesis v1](../02-strategy/research/qa/synthesis.md), 7 clusters / 42 exemplars | 2026-11-27 | etalon chain, traceability, instrument check, damped etalon change, recall, adaptive intervals (metrology); layers, adversary, close the loop (6 other clusters) |
| Sasha, «инвариант всей системы» | 2026-11-27 13:18 MST | the frame: return to the etalon of selfhood of anything |
| skill `scout-playtest-review` patterns log | 2026-10-28 → 2026-11-27 | agent rules, recurring deviations |
