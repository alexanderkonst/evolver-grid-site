# QA and testing: find it cheap, find it once

*Canonical template, draft v0, synthesized 2026-11-27 by Evolver (Hark) from an integral synthesis of 36 exemplars in 6 clusters (engineering QA and chaos, game playtesting and betas, UX research, rehearsals in aviation, NASA, surgery and theatre, post-mortems, AI-era QA) plus Evolver's own QA runs on findyourtoptalent.com since 2026-10-13. Synthesis and sources: [research/qa](../02-strategy/research/qa/synthesis.md).*

## Meta-description
- **Level / parent:** L2 · Craft · parent: [meta-template.md](./meta-template.md)
- **Children:** [qa-pass.md](./qa-pass.md) (L1, one PR, machine pass + exploratory browser pass); [roasting.md](./roasting.md) (critique of any artifact)
- **Siblings:** [spec-handoff.md](./spec-handoff.md) (DoD), [subtraction-loop.md](./subtraction-loop.md) (Polish findings), [integral-synthesis.md](./integral-synthesis.md) (this template's method)
- **What emerges:** a feature that reaches players with no Blocker or Major left, and a system that never meets the same failure twice
- **Status:** draft v0 · applied in: the 2026-11-27 roast (§12) · review after the next 3 features

---

## 1. Essence
**Find each failure as early and as cheaply as possible, by someone who did not build the thing, and make sure it can never be found twice.**

Two forces. **Left:** a cheaper layer, an earlier moment, outsider eyes. **Closed:** every finding ends as a permanent artifact with an owner. Every famous QA disaster broke one of the two (Knight Capital: one layer, $460M in 45 min; Microsoft 2018: a bug reported, nobody owned the signal; Challenger: "it flew before" accepted as evidence; Replit 2025: a code freeze held only as an instruction to an agent).

## 2. The eight invariants (keep all; each answered once per level, §4)
1. **Layers, cheapest first.** Machine checks → builder self-check → our own accounts → Sasha → a few real first-timers → everyone.
2. **Watch real first-timers, silently, in small repeated rounds.** 3-5 people, never explain, fix, retest on the next person (RITE).
3. **An adversary breaks it on purpose.** Someone who is not the builder writes the failure cases (Apollo's simulation supervisor).
4. **A severity scale tied to a ship rule.** Blocker / Major / Minor / Polish ([qa-pass.md](./qa-pass.md) §13). Blocker or Major open = no ship.
5. **Debrief right after every run.** Written, blameless, with a timeline.
6. **Every finding gets an owner and a permanent artifact, tracked to closure.** A regression test, a checklist line, or a guardrail. "Lessons observed" without closure is the most common failure.
7. **Grade the outcome, never the claim.** Check the row in the database, the screen as rendered, the live bundle, never the agent's "done". A signal nobody owns is no signal: zero flaky tests, every alert has an owner.
8. **Hard limits live in infrastructure, not instructions.** Separate preview from production, block paid calls in tests, a tool that refuses the unsafe action.

## 3. The loop (one feature, start to end)
| Step | When | Who | Output | Gate |
|---|---|---|---|---|
| 1 Pre-mortem | before build | Evolver, 10 min | "It is a month later and this failed. Why?" 5-10 reasons, each → a test case or a spec line | the 3 worst reasons have a test case |
| 2 Machine pass | every PR | CI ([qa-pass.md](./qa-pass.md)) | Playwright + axe at iPhone 15 / iPad / 1440, reduced motion, en/es/ru | green, no flaky retry |
| 3 Adversary pass | before merge of a feature | a fresh agent, not the builder | charter: every state, ru long text, keyboard only, slow network, double taps, back button, reload mid-flow, signed-out vs signed-in | Major+ → spec in `e2e/`, red then green |
| 4 Roast walk | after merge, on live | 2 browser sessions in parallel: guest at 390 (harness), our account at desktop (§9) | scorecard + top 10 ranked (blocks > friction > trust > polish) | no Blocker on the first-use path |
| 5 First-timer test | before announcing | Sasha, 5 people, in person | 3-second test per screen (where am I / next move / way home); silent watch | 4 of 5 pass (threshold unconfirmed) |
| 6 Staged exposure | release | Evolver | preview → our account → Sasha → first-timers → all; feature flag where risky | watch 48 h: console errors, failed calls, drop-off step |
| 7 Debrief | after any Blocker that reached a player, or every release | Evolver | one page (§7) | every action item has owner + artifact |
| 8 Close the loop | same day | Evolver | regression test, checklist line in this template §10, skill pattern line | a re-run finds the failure caught by machine |

Small change? Run 2 and 8 only. Core flow (title, intro, top talent reveal, themes, game entry)? Steps 1-8 all, and nothing ships without Sasha's yes to that exact change.

## 4. Levels
| Level | Unit | What answers the invariants |
|---|---|---|
| L1 change | one PR | machine pass, regression test before fix, one reviewer |
| L2 feature | a spec | pre-mortem, adversary pass, roast walk, severity gate |
| L3 release | what players see | staged exposure, first-timer test, 48 h watch |
| L4 practice | the system | debrief → artifact → template and skill update; re-read old debriefs monthly |

## 5. Severity and the ship rule
Use [qa-pass.md](./qa-pass.md) §13: **Blocker** (first-use path cannot finish, 3-second test fails, a control is covered), **Major** (clipped text, axe serious, console error, target < 44 px), **Minor**, **Polish**. Impact order inside a level: blocks conversion > adds friction > reduces trust > polish. Ship rule: zero Blocker, zero Major on the touched screens. Minor and Polish go to the design-debt list.

## 6. Finding format (every finding, every agent)
`[Severity] screen URL · viewport · account (guest / Evolver / Sasha) · what I expected · what I saw (exact quoted text) · why it matters to a person · fix · evidence (screenshot, log line, test name) · observed@390 / observed@1440 / code`.
A finding without quoted text or evidence is thrown out.

## 7. Debrief (one page)
1. What happened, timeline (times with zone).
2. Impact: who saw it, how long.
3. Contributing factors, as a tree (not one root cause; "human error" and "agent error" are never a cause; ask what made the error easy).
4. Where we got lucky (near misses).
5. What worked.
6. Action items: each = owner, artifact (test / checklist line / guardrail), due, status. Closed only when the artifact exists.
Blameless: we fix the system, not the person or the agent.

## 8. Agent rules (what next agents must do)
1. **Look before judging.** Never review from code alone; mark `[from code only]` when you could not see it.
2. **Viewport trap:** the browser agent cannot resize; for 390 px use the harness (390×844 iframe page, presigned URL pasted whole, no params after the signature) or local Playwright with exact viewports.
3. **Guest and signed-in are different products.** Run both. Signed-in on the Evolver test account only (`alexanderkonst+evolver@gmail.com`); verify the "Evolver AI" identity first. Never Sasha's account unless he asks.
4. **Wait before calling a hang:** 30 s on any "Loading"; up to 5-7 min on the reveal, polling, no reload. Then a fresh sign-in session before filing.
5. **Agents' timing is unreliable** (sample every 5-10 s). Measure timing with local Playwright.
6. **Confirm text glitches in code** (missing spaces are often the DOM reader). Check by-design behaviour in code or canon before filing (e.g. the "Which way?" fork is the primary reveal path).
7. **Check live = main from the bundle:** fetch `/`, take `assets/index-*.js`, grep a string from the newest commit.
8. **Block paid calls in tests** (`**/functions/v1/generate-*`). A real reveal run spends Lovable AI credits: only with Sasha's yes.
9. **Never retry to green.** Quarantine a flaky test with its cause.
10. **Before filing:** list open issues and PRs (another agent may have fixed it); one issue per surface group; core-flow issues marked "no merge without Sasha's yes".
11. **Persist each slice at once** to a file; a crashed run loses everything.
12. **Proof hygiene:** a button exists ≠ the action works; a screenshot ≠ the screen reads well; green tests ≠ the new journey is covered; preview works ≠ live works.

## 9. Roast walk charter (copy into the browser task)
- **Guest, phone 390:** title → start → intro (time it, find Skip) → first result → village → 2 places → instrument → back. Per screen: expected, saw, seconds to first "aha", overlaps (Chat bubble, glyph), clipped text, targets < 44 px, jargon. Where would a newcomer quit?
- **Evolver, desktop:** every open place, one room each, back; Home, Quest Board, instrument faces, profile, es and ru on 2 screens; Nielsen's 10, 1-5, each with a concrete finding.
- Both: top 10 ranked, 3 worst screenshots, what works. No payments, messages, deletes, account creation.

## 10. Checklist of recurring failures (append one line per closed debrief)
- [ ] Floating launcher (Chat) or instrument glyph covers a primary control at 390 / 768 / 1440
- [ ] Fixed transparent header lets content slide under it on scroll
- [ ] Low-contrast primary CTA (PRESS START class) on dark art
- [ ] Warning and gate disagree (says "too short", button stays enabled)
- [ ] Wrong state on first paint before data loads
- [ ] Control with no accessible name or role (glyph, icon buttons)
- [ ] Same-looking control, different behaviour on different screens
- [ ] Language switch leaves hardcoded English; words run together across spans
- [ ] Unknown slugs fall into `/:username` instead of not-found
- [ ] Silent empty result on bad AI input; wait copy ("2-4 minutes") far from real time

## 11. Anti-patterns
One layer. The builder tests their own work only. A date beats the evidence. A finding with no owner. A checklist imposed without ownership (no effect, Ontario study). Retrying to green. Trusting the agent's "done". A limit written as an instruction. Statistics from 3 users. 5-whys to a single root cause.

## 12. Worked example: roast 2026-11-27
Two sessions in parallel: guest at 390 (harness) and Evolver AI at desktop. Findings: [roast-2026-11-27.md](../02-strategy/research/qa/roast-2026-11-27.md). Result: 4 Blockers (unclosable instrument tour; guest glyph dead and unnamed; MY AI pin not a link; matches dead end), 5 Majors (3 in core flows: PRESS START contrast, hidden Skip, reveal warning vs gate), Nielsen mean 2.4/5 signed in. Lessons folded back: §8 rule 8 (the guest run spent one paid reveal call), §10 checklist lines. Method lesson: two parallel sessions (guest 390 + test account desktop) found almost no overlapping issues, so both are required.

## Genealogy
Engineering: Google testing pyramid and flaky data, Netflix chaos, Amazon GameDays and COE, Meta canaries, Microsoft 2014-2018 (negative), Knight Capital (negative). Games: Valve, Nintendo, MS Game Studios RITE, Supercell, Blizzard, Cyberpunk 2077 and No Man's Sky (negatives). UX: NN/g, Krug, Apple, Basecamp Shape Up, first-click studies, Juicero (negative). Rehearsal: Apollo SimSup and Challenger, aviation and WHO checklists, Klein's pre-mortem, theatre tech, SpaceX, Army AAR. Post-mortems: Google SRE, Etsy, Toyota, NTSB and ASRS, game post-mortems, Cook's "How Complex Systems Fail". AI-era: Anthropic evals, Playwright, Chromatic/Percy, Hypothesis and OSS-Fuzz, King and EA bots, Replit 2025 (negative). Evolver's own runs: skill `scout-playtest-review` patterns log (2026-10-28 to 2026-11-27).
