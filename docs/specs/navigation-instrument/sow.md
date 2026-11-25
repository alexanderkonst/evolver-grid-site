# Navigation instrument: scope of work and delegation plan

Status: draft v1, 2026-11-25 (Hark). Architecture: [architecture.md](./architecture.md). Canon: GoBY §25. Template: [spec-handoff](../../templates/spec-handoff.md). Epic: #453.

## TLDR
Eight work packages (WP) in four waves. Each WP = one @claude issue = one job = one branch = one PR, opened and merged by Hark when checks are green and every DoD row has evidence. WP7 (first reveal) is built only on Sasha's explicit yes. The Your AI instrument (PR #458) becomes the base of WP1.

## Delegation mechanics (how the agents work, learned 2026-11-24/25)
1. **One mention = one job.** Every comment that mentions @claude starts a job. Hark pings once per WP, never while a job runs on the same branch. Clarifications go in comments without the mention.
2. **One branch, one PR, one DoD.** Claude pushes a branch and cannot open PRs; Hark opens the PR through the API with `Closes #N` and "Template: spec-handoff".
3. **One writer per file per wave.** The file map below is the lock. A WP that needs a file owned by another WP in the same wave waits for the next wave. Shared registries (`faces.ts`, locales) are append-only: each WP adds its own keys, never edits others'.
4. **Start from main, rebase before review.** If a WP merges first, the others rebase; Hark checks for conflicts before merging in sequence.
5. **Workflows are Hark's.** Claude's token cannot write `.github/workflows/`; it stages files under `e2e/workflow/` and Hark moves them.
6. **Evidence, not intent.** Each DoD row names an artifact: a unit test name starting `DoD <n> ·`, a Playwright spec, or a screenshot from the QA-pass suite (iPhone 15 WebKit, iPad, 1440, reduced motion). "Not seen rendered" means ⬜, never ✅.
7. **QA as code first.** #461 must be green before wave 2; after two green runs it becomes a required check. Hark does browser passes only for what the suite cannot see (motion feel, sound).
8. **Failure rule.** If a job fails twice on infrastructure (GitHub 500s), Hark re-pings once with a short body, then reports to Sasha instead of looping.
9. **Hark's review list:** spec-handoff §7 plus: no change to title, intro, reveal, game entry or themes unless the WP says so; reduced motion honoured; 390 px clean; en/es/ru present; no 3D library or new dependency.
10. **Report in meaning.** After each wave Hark sends Sasha one short brief: what a player now sees, with a screenshot link, and the template used.

## Waves and work packages

### Wave 0: clear the pipeline (Hark, no new build)
- #461 QA as code: green, merge. #465 phase 4 lock lines and #466 five quarters: review DoD, merge in sequence. Phase 5 intro audit (job started 12:01): review when it lands.

### Wave 1: the instrument core (one job; touches the shell)
**WP1 · Instrument core.** Base: PR #458 branch (octahedron). Needs Sasha's yes to merge #458 into this path.
- In: `src/lib/instrument/state.ts` (states hidden/closed/open/face, `litSeen` in the save), `src/lib/instrument/faces.ts` (empty face slots per element), `InstrumentGlyph` (octahedron ×2 in a water ring with today's moon phase, faint inner bodies from `litQuarters`), opening gesture §5.1 (click, Enter, `I`, swipe up; 600 ms; reduced motion 150 ms crossfade), open state (world at about 0.9 brightness and live, bodies in an arc with labels, outlines "Opens on your path"), dialog semantics and focus return.
- Out: face contents, ritual, sound, first reveal (glyph shows for anyone with a profile, as #458 does today).
- DoD: state machine unit tests; Playwright: open/close by click, keyboard and Esc returns focus; glyph never overlaps next-move card or chat pill at 390 px; ≤30 fps and paused when hidden (test on the frame loop); axe zero serious; en/es/ru.

### Wave 2: ritual and faces (three jobs in parallel)
**WP2 · Body-lit ritual and sound.** Files: `src/lib/instrument/ritual.ts`, `src/lib/instrument/sound.ts`, `InstrumentRitual.tsx`, settings mute toggle.
- Ritual §5.2 (queue, calm moment, five steps, skippable, once per body via `litSeen`); WebAudio tones §5.4 (five pentatonic tones + breath, after a gesture only, quiet, mute remembered).
- DoD: unit test "ritual plays once per body"; "never inside a module form"; Playwright with a seeded save that just opened Academy shows the fire ritual line; reduced motion variant; no audio before a gesture.

**WP3 · Water face (time).** Files: `faces/WaterFace.tsx`, reads `fmfSession.ts` and lunar state.
- Moon phase, day of the lunar cycle, next FMF and Café gathering, "this cycle" changes (reads phase 6 data when it exists, otherwise hidden). Buttons hand back to Café or FMF.
- DoD: unit tests on cycle math against fixed dates; at most three items; links go to the right routes.

**WP4 · Fire and earth faces (lenses).** Files: `faces/FireFace.tsx`, `faces/EarthFace.tsx`.
- At most three items each from `placeState`; each item opens its place in the village. No new page, no list of all places.
- DoD: unit tests that a face never shows a closed place's content; Playwright: item → place.

### Wave 3: path and memory (two jobs)
**WP5 · Ether face and the ink line (phase 3).** Files: `faces/EtherFace.tsx`, `InkLine.tsx`.
- The one next move; choosing it closes the instrument and draws one ink line to the glowing place, then fades; also offered on clear signs of being lost (3 non-advancing entries or 60 s idle: Hark's defaults, unconfirmed). Constellation slot left empty until path v1 review (phase 8).
- DoD: line never shows by default; static dotted under reduced motion; Playwright on the trigger.

**WP6 · Glint and Your House "since you were here" (phase 6, #451).** Files: `src/lib/instrument/glint.ts`, Your House list component.
- Changes are written in Your House; the instrument shows a glint only on the body whose face changed; opening that face clears it.
- DoD: unit tests on glint set/clear; no feed inside the instrument.

### Wave 4: first reveal and polish
**WP7 · First reveal (gated: Sasha's explicit yes to architecture §5.3).** Files: `InstrumentReveal.tsx`, the profile-created hook.
- Sequence §5.3 with the §25.10 micro-onboarding; one "Continue"; plays once.
- DoD: plays once after profile creation; never before the top talent result; reduced motion variant; 3-second test screenshots.

**WP8 · Polish and test.** Hark-led: browser pass for motion feel and sound; subtraction loop on each screen; live 3-second test in San Pancho (5 people, 4 of 5); polish issues back to Claude as small WPs. Report to Sasha with before/after.

## File ownership map
| File / area | Owner |
|---|---|
| `GameShellV2.tsx`, `src/lib/instrument/state.ts`, `faces.ts`, `InstrumentGlyph` | WP1 |
| `ritual.ts`, `sound.ts`, `InstrumentRitual.tsx`, settings mute | WP2 |
| `faces/WaterFace.tsx` | WP3 |
| `faces/FireFace.tsx`, `faces/EarthFace.tsx` | WP4 |
| `faces/EtherFace.tsx`, `InkLine.tsx` | WP5 |
| `glint.ts`, Your House list | WP6 |
| `InstrumentReveal.tsx`, profile hook | WP7 |
| locales en/es/ru | append-only, each WP its own keys |
| `.github/workflows/` | Hark |

## Out of scope for every WP
Title screen, game intro, top talent reveal, themes (Lunar #452 has its own gate), the content of Your AI apps and pricing (Your AI SoW), and the constellation until path v1 review.
