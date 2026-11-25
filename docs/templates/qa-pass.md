# QA pass: a check any agent can run, and the code that runs it

*Draft v1, 2026-11-25 (v0 plus Sasha's addenda A, B, C on #460: «commercial grade, Apple-caliber»). First application: the GoBY §25 navigation DoD (epic #453, issue #460). Built so deep QA no longer waits for a person or for Hark to browse a preview by hand at desktop width only.*

## Meta-description
- **Level / parent:** L2 · Ops & Agents · parent: [meta-template.md](./meta-template.md)
- **Lens(es):** Causal (spec row → assertion → evidence → verdict), with Ideal Forms for the one fixed shape of a finding
- **Shift carried:** Craft. It carries no shift in a person; it is the craft that proves the other templates reached the screen. (Nearest: PST 115, articulation as the mechanism of growth: a QA row is the spec articulated until a machine can check it.)
- **What emerges:** a pass/fail table on every PR, at three fixed widths, that any agent can read in one glance and re-run with one command
- **As a part of the whole:** the closing half of [spec-handoff.md](./spec-handoff.md): the spec says what done looks like; the QA pass is the part of "done" that runs by itself
- **Siblings:** [spec-handoff.md](./spec-handoff.md) (the DoD rows this checks), [module-form.md](./module-form.md) §9 (the module audit), [subtraction-loop.md](./subtraction-loop.md) (the 3-second test), `e2e/` (the code), `.claude/skills/` (the vendored verification, TDD, debugging, review and browser skills, §15)
- **Status · applied in · last reviewed:** draft v1 · #460 (navigation, `/village`) · 2026-11-25

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

## 13. The eleven rules (Sasha, addendum B on #460, 2026-11-25)
Where a rule is not yet in code, the right-hand column says so. It is a gap to close, not a rule to skip; the next QA PR closes the first ones on the list.

| # | Rule | In the suite today |
|---|---|---|
| 1 | **Evidence before claims.** Every PASS cites an assertion, a log line or a screenshot. The PR comment table is the evidence. | ✅ `shot()` per test; table from `pr-comment.mjs` |
| 2 | **Every bug becomes a regression test before its fix** (red, then green). The launcher clip is the first one. | ✅ DoD 7 (launcher clip), DoD 9 (language chip name, dial name) |
| 3 | **Test what the user sees.** Role and label locators, never CSS classes; isolated tests; guest data fixed. | 🟡 roles and labels where they exist; classes only on the rooms pane and the map card (no other hook yet, §12) |
| 4 | **Device presets:** iPhone 15, iPad, desktop 1440; plus `reducedMotion: 'reduce'`; plus en / es / ru, with ru as the long-text stress test. | 🟡 390 / 768 / 1440 and reduced motion on Chromium. **Next:** iPhone 15 on WebKit, iPad preset, es and ru runs |
| 5 | **State contract per screen:** default, hover, focus-visible, pressed, disabled / locked, loading, empty, error, long content, keyboard-only path. | 🟡 default and locked only. **Next:** one table per screen, a test per cell |
| 6 | **Visual regression.** Element-level `toHaveScreenshot`; deterministic (await `document.fonts.ready`, animations off, dynamic text masked); baselines generated in CI only; a baseline change is a reviewed design change. | ❌ not yet. Needs CI-generated baselines first |
| 7 | **a11y.** axe with `wcag2a, wcag2aa, wcag21a, wcag21aa`, zero serious or critical. axe is a regression gate, not a conformance verdict, so add a keyboard pass and a visible focus-ring check. | ✅ axe, four routes × four projects. ❌ keyboard pass and focus ring |
| 8 | **Apple-caliber checks.** Touch targets ≥ 44 × 44 px on phone; no text under any control (bounding boxes); contrast AA (AAA for body copy where we can); motion has a purpose and respects reduced motion; the 3-second test (where / next / home) on the first screen. | ✅ no text under a control, reduced motion, 3-second test. ❌ 44 px targets, AAA body contrast |
| 9 | **Severity scale: Blocker / Major / Minor / Polish.** Each finding: URL, viewport, element, expected, found. Accepted differences go to a design-debt list, not lost. | ✅ scale and format in §10. Design-debt list: `test.fixme` entries in `e2e/` (§8) |
| 10 | **Two passes.** The machine pass (this suite) blocks. The judgment pass (a fresh agent with the `scout-playtest-review` rubric, first-time-user eyes) reports Polish items and feeds [subtraction-loop.md](./subtraction-loop.md). | ✅ machine pass. The judgment pass is §9 and §14 |
| 11 | **Flaky policy.** Quarantine and fix the cause; never retry-to-green. | 🟡 CI retries once (network jitter). **Next:** drop the retry once the runs are stable; a spec that needs it is quarantined with `test.fixme` and a cause |

### Severity scale (rule 9)
Replaces the three-level scale in §10 (blocker / major / minor); «polish» is new.

| Severity | Meaning | Blocks merge |
|---|---|---|
| **Blocker** | the 3-second test fails, a control is covered, a flow cannot finish | yes |
| **Major** | text clipped, axe serious or critical, a console error, a touch target under 44 px on phone | yes, once the check is required |
| **Minor** | a state in the contract (rule 5) is missing or rough; contrast between AA and AAA | no; fix in the next PR |
| **Polish** | feels off to a first-time eye; a judgment call | no; goes to [subtraction-loop.md](./subtraction-loop.md) |

## 14. Exploratory browser pass (Sasha, addendum C on #460)
The loop: **explore with a browser → findings → freeze as Playwright specs → CI runs them with no model.** An agent in a real browser finds what nobody thought to assert; a spec keeps it fixed for good.

1. **Who and when.** The agent that built a UI phase, or a fresh one for the judgment pass (rule 10). Before it says a UI phase is done it opens **the PR's Vercel preview** at **iPhone 15 (WebKit, the closest thing to Safari), iPad and desktop 1440**, and attaches the screenshots to the PR. A local production build is the fallback only when the preview is behind protection the agent cannot pass; say so in the PR.
2. **Tools.**
   - **Playwright CLI** (`@playwright/cli`): token-light, device emulation, traces, and it echoes the Playwright code for what it did, so a finding becomes a spec directly. Setup in the job: `npm i -g @playwright/cli && playwright-cli install --skills`, plus `npx playwright install chromium webkit` in `e2e/`. The skills it installs go next to the vendored ones (§15).
   - **Chrome DevTools MCP** (Google, official): Lighthouse (performance, accessibility, best practices), console errors and network. **Run once per UI PR; a console error is a fail.**
3. **Charter, what to break:** every state in rule 5; ru long text; keyboard only; slow 3G; reduced motion; the title screen and the game on the same run.
4. **Time box.** 20 minutes per screen; stop at the box and report what was not reached.
5. **Findings** in the §10 format with the severity scale above, in the PR comment.
6. **The rule: each Major+ finding becomes a spec in `e2e/` in the same PR**, red before the fix, green after (rule 2). Minor and Polish go to the design-debt list.

Not now: paid QA vendors (QA.tech, QA Wolf, Spur, Momentic). Revisit after the suite runs green on real PRs.

**Wiring in `claude-code-action`: proposal.** The cleaner path is Playwright MCP through `mcp_config` plus an allow-list, not the CLI inside the job: the action already speaks MCP, the browser lifecycle is the server's job, and nothing has to be installed globally in the run. Chrome DevTools MCP wires the same way. The drafts are in `e2e/workflow/claude-code-action-browser.md` (outside `.github/`; Hark moves anything that belongs there). Until Sasha picks, the CLI route above stands.

## 15. Agent skills this pass leans on
Vendored under `.claude/skills/` (third-party, license and source line in each; index in `.claude/skills/README.md`), routed by one line in `CLAUDE.md`:

| Skill | Source · license | Used here for |
|---|---|---|
| `verification-before-completion` | obra/superpowers · MIT | rule 1: no «done» without fresh command output |
| `test-driven-development` | obra/superpowers · MIT | rule 2: red, green, refactor; a found bug is a failing spec first |
| `systematic-debugging` | obra/superpowers · MIT | root cause first; after 3 failed fixes, question the design |
| `requesting-code-review` | obra/superpowers · MIT | severity-ranked review; Critical blocks (matches §13 severity) |
| `webapp-testing` | anthropics/skills · Apache-2.0 | §14: the Playwright loop with screenshots, console logs and DOM |

## Genealogy
| Source | Date | What it contributed |
|---|---|---|
| Issue #460 (Sasha) | 2026-11-25 | the viewports, the rule in §9, the overlap check, "reports, does not block yet" |
| [GoBY §25.12](../02-strategy/game_of_being_you.md#25-navigation-sasha-2026-11-24) | 2026-11-24 | the 3-second test as the acceptance row of every screen |
| [spec-handoff.md](./spec-handoff.md) §5 | 2026-10-27 | evidence a third party can check |
| Issue #460 addendum A (Sasha) | 2026-11-25 | the vendored skills (§15) and the `CLAUDE.md` routing line |
| Issue #460 addendum B (Sasha) | 2026-11-25 | the eleven rules and the four-level severity scale (§13) |
| Issue #460 addendum C (Sasha) | 2026-11-25 | the exploratory browser pass and its loop (§14) |
