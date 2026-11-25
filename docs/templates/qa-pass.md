# QA pass: a check any agent can run, and the code that runs it

*Draft v0, 2026-11-25. First application: the GoBY §25 navigation DoD (epic #453, issue #460). Built so deep QA no longer waits for a person or for Hark to browse a preview by hand at desktop width only.*

## Meta-description
- **Level / parent:** L2 · Ops & Agents · parent: [meta-template.md](./meta-template.md)
- **Lens(es):** Causal (spec row → assertion → evidence → verdict), with Ideal Forms for the one fixed shape of a finding
- **Shift carried:** Craft. It carries no shift in a person; it is the craft that proves the other templates reached the screen. (Nearest: PST 115, articulation as the mechanism of growth: a QA row is the spec articulated until a machine can check it.)
- **What emerges:** a pass/fail table on every PR, at three fixed widths, that any agent can read in one glance and re-run with one command
- **As a part of the whole:** the closing half of [spec-handoff.md](./spec-handoff.md): the spec says what done looks like; the QA pass is the part of "done" that runs by itself
- **Siblings:** [spec-handoff.md](./spec-handoff.md) (the DoD rows this checks), [module-form.md](./module-form.md) §9 (the module audit), [subtraction-loop.md](./subtraction-loop.md) (the 3-second test), `e2e/` (the code)
- **Status · applied in · last reviewed:** draft v0 · #460 (navigation, `/village`) · 2026-11-25

---

## 1. Essence
Anything a machine can assert, a machine asserts, on every PR, at every viewport. A person (or an agent with a browser) is spent only on what code cannot judge.

## 2. Fixed viewports
Every pass runs at all three, plus the desktop again with reduced motion. No pass is "done" at one width.

| Project | Size | Why |
|---|---|---|
| `desktop` | 1440 × 900 | the wide scene with the rooms pane beside it |
| `tablet` | 768 × 1024 | the pane at its narrowest side-by-side width; where text met the launcher first |
| `phone` | 390 × 844 | the pane as a bottom sheet behind one «Rooms» control |
| `reduced-motion` | 1440 × 900, `prefers-reduced-motion: reduce` | GoBY §25.11: motion respects the setting |

## 3. Scope: which spec this pass checks
The first lines of a pass name the spec and the DoD rows it covers: the issue or PR, the section (for example GoBY §25), and the rows. Every check below carries the number of its DoD row in its name, so the PR comment table reads as the DoD with a verdict beside each row. A row with no check is listed as **manual** with the reason (see §9).

Guest view only. No sign-in, no submit, no paid backend call: the suite refuses any request to an edge function or any write to the database and fails if one is attempted.

## 4. Per-check form
Each check is one line in the table and one assertion in code:

| # | Check | Viewport(s) | Evidence | Verdict |
|---|---|---|---|---|
| 1 | what is asserted, in the spec's own words | all | assertion · screenshot path | ✅ / ❌ |

**Evidence = an assertion that ran, or a screenshot saved by the run** (`artifacts/screenshots/<viewport>/<name>.png`). "Looked fine" is not evidence ([spec-handoff.md](./spec-handoff.md) §5).

## 5. Accessibility
axe-core on every guest screen of the spec, tags WCAG 2.0/2.1 A and AA. **Serious or critical violations fail the check**; moderate and minor go in the findings. Plus the structure assertions that axe cannot judge: a closed item is `aria-disabled` and not a link; an enabled control is not inside an `aria-disabled` group; a result line is tied to its control by `aria-describedby`.

## 6. `prefers-reduced-motion`
The `reduced-motion` project reruns the whole suite with the setting on, and adds the assertions that motion stopped: no looping animation on the next-move glow, no slide on the pane. A glow that holds still must still read as the next move (its word and mark stay).

## 7. Overlaps: no text under any control or floating launcher
Checked by geometry, not by eye:
1. Collect every **visible text line** inside the surface (a text node's client rects, clipped to its scroller; a line scrolled out of sight does not count).
2. **Scroll the scroller from top to bottom** in steps and repeat, so the line that arrives last is checked too.
3. No line may intersect a control in the same surface (for example the Hide toggle), nor the floating launcher («Chat with us») inflated by 8 px.
4. Where the surface and the launcher share a column, the surface's edge keeps at least 8 px above the launcher.
5. The result goes in as pixels: «`Afterwards, come back…` within 8px of the launcher at scroll 480».

## 8. Regressions
Every finding that was fixed becomes a check in the same PR, named by its issue. A bug that was seen once stays on the suite for good. The suite also lists what it saw and did not fix as `test.fixme` with the reason, so it shows in the table as skipped, not forgotten.

## 9. The rule: a browser pass by an agent is only for judgment calls the code cannot assert
Does the copy read as one line? Is the glow *noticeable* rather than merely present? Does the scene feel like one world? These are judgment calls: an agent (or Sasha, or five first-timers per [GoBY §25.12](../02-strategy/game_of_being_you.md#25-navigation-sasha-2026-11-24)) looks, and the finding goes in the same format as below.

Everything else belongs in `e2e/`. If an agent finds, by looking, something code could have caught, the first fix is the missing check, then the bug.

## 10. Findings format
One finding per line of the PR comment or the issue:

`[severity] <route> · <viewport> · <what you saw, with the numbers> · evidence: <test name or screenshot path> · fix: <file:line or "none yet">`

Severity: **blocker** (the 3-second test fails or a control is covered) · **major** (text clipped, axe serious) · **minor** (polish). A finding without a route, a viewport and evidence is not a finding.

## 11. How the run goes
1. A PR opens or updates. The workflow waits for the Vercel preview deployment of the PR's head commit to be `success`.
2. The suite runs against that URL in four projects. Screenshots upload as the `qa-pass-artifacts` workflow artifact.
3. One PR comment (edited in place on each push) shows the table: DoD row × viewport, ✅ / ❌ / skipped, and a link to the artifacts.
4. The job **reports; it does not block merge** until it has run green twice on real PRs. Then Sasha flips it to a required check.

Run it by hand: `cd e2e && npm ci && npx playwright install chromium && PREVIEW_URL=<url> npx playwright test`. See `e2e/README.md`.

## 12. Adding a spec
1. Take the spec's DoD table. For each row ask: can code assert it? If yes, one test named `DoD <n> · …`. If no, mark it manual (§9).
2. Prefer the accessible name, role and the existing `data-*` state hooks over class names; a class is allowed where the app has no other hook (the rooms pane).
3. Take at least one screenshot per test with `shot()`.
4. A new check is first run against the unfixed code and seen to fail, when it is covering a known bug.

## Genealogy
| Source | Date | What it contributed |
|---|---|---|
| Issue #460 (Sasha) | 2026-11-25 | the viewports, the rule in §9, the overlap check, "reports, does not block yet" |
| [GoBY §25.12](../02-strategy/game_of_being_you.md#25-navigation-sasha-2026-11-24) | 2026-11-24 | the 3-second test as the acceptance row of every screen |
| [spec-handoff.md](./spec-handoff.md) §5 | 2026-10-27 | evidence a third party can check |
