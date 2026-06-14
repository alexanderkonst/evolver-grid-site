# SOW — Ship MDLS matte-polymer parity as the default Equilibrium surface

> *v1 created 2026-06-13. v2 rewritten 2026-06-14 after a self-roast. v3 rewritten 2026-06-14 after a 3-auditor adversarial pass on v2 (it found a blocking false-green gate, 12 soft/unfalsifiable DoD rows, and 2 stale citations) AND after Commit 1 was browser-verified against a now-stable tree. Companion: `equilibrium_mdls_style_guide.md`, `equilibrium_mdls_tracker.md`.*

---

## 0 · What this actually is

Make the **matte-polymer reskin** of `/build/equilibrium` the production default. This is MDLS-v0.7: `MattePolymerCard` + `EmberBreath` + `SealMedallion` + `ToggleGlassDual` over the existing data. It does **not** ship the signature luminous elements (`AuroraGlassOrb` centerpiece, `SoulOrbGoal` markers, `SculptedSilk` workstreams) — those are **Phase 2** (§6), each with its own resource gate (aurora-drift is a continuous animation). "Apply MDLS design" oversells it; we are promoting a faithful-but-partial recompile and reaching V2 parity first so no feature is lost in the swap.

---

## 1 · Threat model (corrected, and updated for what landed)

v1 ranked resource as the top risk. Wrong. The real risks, ranked:

1. **Concurrent writers / no staging.** Lovable auto-sync + parallel agent sessions write `main` with no staging. On 2026-06-14 a parallel shell/i18n refactor transiently broke `App.tsx` and misrouted `/preview/equilibrium-v2` → `/playbook`, blocking verification for an afternoon. **Update: that refactor has since LANDED** (commit `354701b6` "hoist GameShellV2 to a single persistent layout route"); `shellRoutes.ts` now lists `/build/equilibrium` + `/preview/equilibrium-v2` in both `SHELL_EXACT` and `HIDE_LOGO_EXACT`, and the tree is green again. So this is now a *monitored* risk, not an active blocker — but the operational disciplines in §5 stay, because the next wave can land any time.
2. **CSS-scope leak** (visual). Real and confirmed by data; resolution in §4. Lower severity than feared (see §4).
3. **Persistent-shell flag behavior.** `useMdlsFlag` reads `?mdls` once via a `useState` initializer; under the now-persistent `SmartShellLayout` shell, SPA navigation may not re-read the param. The opt-out must be tested on real nav paths, not just cold load (§5 Commit 3, DoD F5).
4. **Parity gaps** — closed on disk and **browser-verified** (§2).
5. **Resource** — a non-issue by inspection *and* by runtime check (0 canvas/WebGL contexts, §2). One real fix (stale cycle hook) already done.

---

## 2 · Status (2026-06-14)

**Commit 1 (parity): code-complete, tsc-clean (0 errors), and BROWSER-VERIFIED** on `/preview/equilibrium-v2?mdls=1` against the now-green tree. Verified with live DOM probes:

- ATTUNE order = Synthesis · Lunar · Day-of-Week · Solar · Zodiac ✓
- ACT order = Mission · Role · Focus · Strategy · Workstreams · Tasks · DOING NOW · Harvest ✓ (`#harvest` present)
- `UpcomingTransitions` renders inside `#lunar` ✓
- Titles centered except the medallion row (`justifyContent: center`; `#mission` intentionally `normal`) ✓
- `document.querySelectorAll('canvas').length === 0` in both modes — **zero WebGL at runtime, not just "by inspection"** ✓
- No console errors on load, both modes ✓
- Subtitle = "Biologic Watch and Action Compass" ✓

Five files, cleanly separated (today) from the shell/i18n session's files:

| File | State |
|---|---|
| `hooks/useCycles.ts` (new) | Shared optimized tick (5-min, hidden-tab pause, de-dupe, `nowMs`). The one real resource fix. |
| `equilibriumCopy.ts` (new) | Canonical info-copy, single-sourced (grep-confirmed: zero inline info strings remain in either page). |
| `EquilibriumV2Page.tsx` (mod) | Imports shared hook + copy. No intended visual change. |
| `EquilibriumMDLSPage.tsx` (mod) | Shared hook; +4 features (UpcomingTransitions, PhaseTransitionEyebrow, Harvest, ActiveFocusBanner — all imported AND rendered, audit-confirmed); ATTUNE reorder; centered titles; cross-fade; subtitle; full info-copy; score-button placement; `.mdls-eq-page` scope hook. |

**Finalized 2026-06-14:** halo = **Leave** (Sasha; benign on cream). `ActiveFocusBanner` got a `variant="matte"` (MDLS) + `data-testid="active-focus-banner"`; `SectionAnchorNav` glass = leave (mobile nav chrome). Stale lunar-rotation comment aligned to V2. A 3-reviewer adversarial bug-hunt over the full changeset returned **0 confirmed bugs** (18 findings, all verified-clean: byte-identical hook + copy strings with the en-dash preserved, prop-identical components, valid matte classes, no hook-order issues, empty-states safe). Commit 1 is code-final; the matte banner's live look is the only thing unverified (preview lacks auth/data to focus a task).

---

## 3 · Resources — honest, now with a runtime check

- **Cheaper than today's default, confirmed two ways.** By inspection: translucent blur 18px (`index.css:6563`) vs the `.eq-v2-page`-scoped liquid-glass 32px / -strong 40px (and the unscoped bases 24/30px) — lighter than all. By runtime: **0 canvas elements, 0 WebGL contexts** on the live page, both modes.
- **Barrel correction:** the mdls barrel (`index.ts`) *does* export `AuroraGlassOrb`/`SoulOrbGoal`/`SculptedSilkSection`. The load-bearing fact is not "not in the barrel" — it is that **`EquilibriumMDLSPage` imports none of them** (grep-confirmed) and the page mounts zero GL contexts.
- **The one fix that mattered is done:** the MDLS page shipped a stale 60s `useCycles` (no hidden-tab pause, no de-dupe) — a real fan-spin regression. Replaced with the shared optimized hook.
- **Add one guard (Commit 2, does not exist yet):** an eslint `no-restricted-imports` ban on `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` from `src/modules/equilibrium/**`. Cheap insurance a future edit can't drag the WebGL bundle into the now-default page. (`eslint.config.js` has zero such rules today.)
- Everything else from v1's "budget" (blur caps, shared grain, `contain: paint`, pause-offscreen) is optional polish, gated on the M2 profile, not on faith.

---

## 4 · CSS-scope leak — resolved with data, then one taste call

**Confirmed by live probe:** every `.eq-text-halo` inside `.mdls-eq-page` computes `text-shadow: rgba(255,255,255,0.85) 0 0 28px` (not `none`), and 2 `.liquid-glass` elements leak in (likely InfoPopover / SectionAnchorNav).

**But the screenshot shows the headers render crisp, not fuzzy** — a 0.85-alpha white 28px glow on dark serif over cream is near-imperceptible. So the blunt rule "override IFF `textShadow !== none`" *over-triggers*: it would strip a halo that looks fine and is intended on the MDLS hero. The honest gate is not a single computed-value threshold; it is one bounded taste call:

- **Option K (kill):** add `.mdls-eq-page :where(.eq-text-halo) { text-shadow: none }` scoped to exclude the hero — matches what `.eq-v2-page` does, leans into pure-matte calm now that the video (the halo's original reason) is gone.
- **Option L (leave):** keep the subtle lift; it reads clean on cream per the screenshot. Write no override.

This is genuinely Sasha's eye, not an engineer's threshold. The two `.liquid-glass` leaks are a separate, smaller item: identify the 2 elements, and if they read as frosted-white pills clashing with matte, retune them under `.mdls-eq-page`; if they read clean, record "none added." **DoD C1.10 records the decision + which elements, not a vibe.**

---

## 5 · Plan — three commits, hard ordering, operational disciplines

### Operational disciplines (every commit)

- **Green gate is a RENDER assertion, not a transform 200.** A `curl /src/App.tsx → 200` only proves the file compiles — it co-existed with the `/playbook` misroute. So 200 is a *fast-fail pre-check only*. The binding gate: load the page via `preview_eval` and assert (a) `.mdls-eq-page` (or `.eq-v2-page`) is present AND (b) `window.location` did not redirect to `/playbook` or `/`.
- **"Routing wave is settled" has a concrete test,** not the vibe-word "mid-flight": `git log` shows `354701b6` landed AND `grep` confirms `shellRoutes.ts` lists `/build/equilibrium` in both `SHELL_EXACT` and `HIDE_LOGO_EXACT` (true today) AND the render assertion passes.
- **Path-scoped commit is a checked precondition, not a hope.** Before committing: `git diff HEAD -- <the 5 files>` shows only our intended change, and `git log -1 --format=%an` on each is the expected author. Never `git add -A`. **Acknowledge we cannot stop Lovable from auto-committing our files** — the post-deploy live check (below) is the backstop, not our local discipline.
- **Rebase, not merge, if the base moved — and if the rebase conflicts, ABORT and re-verify green.** The flip commit touches only `useMdlsFlag.ts` + 2 comment lines; a conflict *there* means something unexpected edited those exact lines, which is itself a stop-signal.
- **Post-deploy live check.** After any deploy that includes our work, re-run the render assertion against the LIVE url (not localhost). A red live base at deploy time is NOT ours to fix but IS ours to not-ship-on-top-of; rollback = `git revert` the isolated flip commit.

### Commit 1 — PARITY (behind `?mdls=1`)
Code-complete + browser-verified (§2). Remaining: the §4 halo decision, the `ActiveFocusBanner` testid, and the focus-promote check (C1.7). Zero blast radius on the live default.

### Commit 2 — RESOURCE GUARD + ONE REAL PROFILE
- Add the eslint rule (§3).
- Run one scripted scroll profile (M2) under pinned conditions; act only on a bad number.

### Commit 3 — FLIP (isolated commit; only after C1+C2 green and the routing test passes)
- `useMdlsFlag.ts`: default `true`; `false` only on `?mdls=0`.
- Fix the two stale comments claiming `localStorage` is a live trigger — actual locations are **`EquilibriumV2Page.tsx:74`** and **`EquilibriumMDLSPage.tsx:58`** (v2 cited wrong lines). `useMdlsFlag.ts` auto-removes the key on read; the claim is false.
- Decide the dev footer's fate in prod.
- **Test opt-out on real nav, not just cold load** (DoD F5) — the `useState`-initializer-once concern under the persistent shell.

---

## 6 · Phase 2 (separate SOW)

`AuroraGlassOrb` Synthesis centerpiece (**22s continuous aurora-drift — needs a resource gate**), `SoulOrbGoal` per-task markers, `SculptedSilk` workstreams. Until then, the default MDLS surface is matte-polymer-only: real and shippable, just not the full §11 paradigm.

---

## 7 · Definition of Done — falsifiable, runnable in THIS environment, split by commit

Each row names the exact probe. `[✓]` = already browser-verified 2026-06-14. Rows that previously needed a 5-min wait or DevTools Profiler (unavailable here) were rewritten to run via `preview_eval`.

### Commit 1 — Parity (`?mdls=1`)

| # | Item | Probe | State |
|---|---|---|---|
| C1.1 | Shared `useCycles`, single interval | `grep`: both pages import `./hooks/useCycles`, zero `setInterval` in either page; **+ runtime:** exactly one interval registered (wrap `setInterval` spy on load) | grep ✓ |
| C1.2 | Hidden tab does not tick | `preview_eval`: stub `document.hidden=true`, advance the tick path, assert the refresh callback early-returns (no setState). No 5-min wait, no Profiler. | ☐ |
| C1.3 | ATTUNE order (in ATTUNE mode) | DOM: the 5 ids sorted by `getBoundingClientRect().top` = Synthesis, Lunar, Day-of-Week, Solar, Zodiac | ✓ |
| C1.4 | `UpcomingTransitions` in Lunar | node present in `#lunar` subtree | ✓ |
| C1.5 | `PhaseTransitionEyebrow` in Lunar | component present in `#lunar` subtree | ☐ |
| C1.6 | `HarvestSection` in ACT | `#harvest` present with the HarvestSection node | ✓ |
| C1.7 | `ActiveFocusBanner` above mission when focus>0 | give it `data-testid="active-focus-banner"`; after promoting a task in ACT: `testid.top < #mission.top` | ☐ (needs testid) |
| C1.8 | Info-copy single-sourced | grep: no inline `infoIconCopy="..."` literal in either page; **+ runtime:** rendered popover text === `EQ_INFO_COPY[key]` | grep ✓ |
| C1.9 | Titles centered except medallion | `getComputedStyle(wrap).justifyContent==="center"` for every `.mdls-eq-page h2.eq-text-halo` wrapper EXCEPT the one inside `#mission` | ✓ |
| C1.10 | §4 decision recorded | tracker records: halo Option K or L (+ rationale), and for each of the 2 `.liquid-glass` leaks the element + "retuned" or "clean, none added". Computed values logged. | ☐ (decision pending) |
| C1.11 | No console errors/warnings, both modes | `preview_console_logs level=error` empty 2s after each mode's load; **also** `level=warn` clear of React key/act warnings | error ✓ / warn ☐ |
| C1.12 | Zero WebGL at runtime | `document.querySelectorAll('canvas').length===0` both modes | ✓ |

### Commit 2 — Resource

| # | Item | Probe | State |
|---|---|---|---|
| M1 | eslint bans the full WebGL set | `npm run lint` exits non-zero on a planted import of EACH of `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` in `src/modules/equilibrium/` (not just `three`). No dead `Mdls*3D` file clause (no such files exist). | ☐ |
| M2 | Scripted scroll profile, recorded | `preview_eval` with `PerformanceObserver({type:'longtask'})` (or `event` timing) during a scripted `scrollTo` over N steps, fixed viewport, CPU throttle noted; **record worst long-task ms in the tracker.** Investigate if > 50ms. No hand-driven DevTools trace. | ☐ |

### Commit 3 — Flip (only after C1, C2 green + routing test passes)

| # | Item | Probe | State |
|---|---|---|---|
| F1 | Render-gate green (not just 200) | `.mdls-eq-page` present on `/build/equilibrium` with no param AND no redirect to `/playbook`/`/`. `curl 200` is fast-fail only. | ☐ |
| F2 | Default + opt-out, by scope class | no param → `main.mdls-eq-page` present; `?mdls=0` → `main.eq-v2-page` present. Probe the scope class, NOT the footer string (which lives on the MDLS side). | ☐ |
| F3 | Flip is its own commit | `git show --stat` of the flip touches only `useMdlsFlag.ts` (+ the 2 comment fixes) | ☐ |
| F4 | Stale localStorage comments fixed | grep finds no claim that `localStorage equilibrium_mdls` is a live trigger; targets are `EquilibriumV2Page.tsx:74`, `EquilibriumMDLSPage.tsx:58` | ☐ |
| F5 | Opt-out survives real nav | `?mdls=0` honored on (a) a locale-prefixed path if one is live and (b) in-app SPA nav INTO `/build/equilibrium` from another in-shell page — not just cold load (the `useState`-initializer-once concern under the persistent shell). | ☐ |
| F6 | Post-deploy live render check | render assertion passes against the LIVE url after deploy; rollback = revert the flip commit | ☐ |

---

## 8 · Out of scope

- Deleting V2 / `EquilibriumSectionCard` / `.eq-v2-page` CSS — they are the `?mdls=0` valve and the clean revert. Only weeks after MDLS soaks.
- Phase 2 signature elements (§6).
- Fixing the concurrent shell/i18n session's work. Flag, don't touch.

---

*SOW v3.0 · 2026-06-14. Hardened against a 3-auditor roast of v2: render-assertion green gate (not transform-200), full WebGL-specifier ban, runtime canvas check, fast deterministic hidden-tab probe, scope-class flip check, SPA-nav opt-out row, corrected line citations and barrel facts, and the CSS-scope halo reframed from a false binary into one bounded taste call. Commit 1 is browser-verified.*
