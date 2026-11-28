# Roast of qa-testing.md v0 (2026-11-27)
Template: roasting v2 · mode: Full iteration cycle · object: docs/templates/qa-testing.md v0 (L2 template)

## Round 1: roast (perspectives 1–13)
- **I · Essence: does it feel true from inside?** No. It reads like a good Silicon Valley QA handbook. Nothing in it would make Sasha say «это наше». The word it never uses is the one the system is now built on: эталон. It measures bugs, not whether anything got closer to its own measure.
- **It · Essence: does it work?** Mostly. The 8-step loop is sound but heavy for two people and a few agents; there is no Wizard, so a fresh agent has to read 11 KB to start. The severity scale is copied from qa-pass instead of linked (two sources of truth). "4 of 5 pass" is an unconfirmed threshold stated as a gate.
- **We · Essence: shared meaning?** Weak. First-timers are "test subjects". In the Game of Being You the village is the tribe; a playtest in San Pancho could be a village ritual, not a lab session.
- **Its · Essence: fits the system?** Overlaps qa-pass (L1) and roasting (critique) with blurred borders. §10 checklist will grow without a pruning rule.
- **It · Significance: is the evidence real?** "36 exemplars" and "8 invariants" sound stronger than the grades: most game and post-mortem claims are B/C, several from search excerpts.
- **Consequences:** no Wizard step names who runs which step when; no tie to the driver tasks that actually run it; no Shift check for the template itself.
- **13th (the whole):** it is a correct answer to the wrong question. It answers "how do we find defects", while the system asks "how does everything return to its etalon".

## Round 2: another round (14–25, leading with I and We, Essence)
Round 1 over-served It (mechanics) and Consequences. Led from I and We:
- **What QA *is* here.** Not defect removal. Every artifact has an etalon above it: the build is measured against its spec, the spec against the canon (GoBY), the canon against Sasha's transmission, and the whole against the person's own etalon (did the player come closer to themselves?). A test is a comparison with an etalon. A bug is a deviation from one.
- **"True but wrong".** Today's roast proved it: the four Blockers (unclosable tour, dead glyph, dead MY AI pin, autoplay intro) all *work as coded*. They deviate from canon lines ("the player is in control", "nothing internal on the surface"). A defect list cannot see these; an etalon line can.
- **The tribe.** The 5-person test is the one moment where real people meet the work. It deserves the weight of a ritual, and it is Sasha's.
- **The instrument.** The template never asks whether the tests, agents and roasts themselves are true. Today an agent's timing was wrong by a factor of three, and a guest run spent a paid call: the measuring instruments drift too.

## Round 3: meta-roast (26th)
- The critique risks swapping rigour for a beautiful word: «эталон» can become decoration. The fix is not to drop it but to give it the rigour of metrology: traceability to the etalon, uncertainty of each measurement, calibration of the instrument itself.
- The critique also over-valued novelty: most of v0 stays true (layers, adversary, close every finding). It needs a new spine, not a new body.
- **Changed question:** from «how do we find bugs before players do?» to «how does every thing, at every level, stay traceable to its etalon, and how do we know our measuring instruments are true?»

## Round 4: the 27th (crystallization)
🔮 **Rebuild the template as `calibration.md`, where every check and every finding names its etalon line, and run the first Wizard on #562.**
Why: one required field turns QA from bug-hunting into return-to-etalon, and it is testable today.

## Crash-test of v0 (12 failure modes · stress signal)
1. Too heavy, nobody runs it · steps 1, 3, 7 skipped on the next 3 features.
2. Two sources of truth · severity in qa-testing and qa-pass differ.
3. Checklist bloat · §10 > 25 lines, none removed.
4. Agent claims "done" · a merged fix fails on the live bundle.
5. Paid calls in tests · Lovable credit drop after a QA run.
6. Core flow touched silently · a diff in title/intro/reveal without a yes line.
7. Flaky gate ignored · CI retry count > 0 on main for a week.
8. Live test never happens · no first-timer record in 30 days.
9. Debrief without closure · an action item open > 14 days.
10. Etalon missing · a finding with no canon or spec line it violates.
11. Instrument drift · two roasts of the same screen disagree on a Blocker.
12. Ritual becomes a lab · first-timers asked to "find bugs" instead of being watched in silence.

## Survived the ashes
Layers cheapest first; an outsider breaks it; severity gate; every finding closed into a test; grade outcomes, not claims; hard limits in infrastructure.

Template change: roasting v2 (Wizard + Iteration Suite) was used here for the first time; no further change.
