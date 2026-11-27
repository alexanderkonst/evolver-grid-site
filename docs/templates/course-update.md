# Course Update: a new source → signed insights → new micro-modules → a new version

*Version: v2.0.2 · last changed: 2026-11-27 · last verified: not yet (first run in flight, §5) · change log: §8. Status: canonical. Lens: Causal.*

## Meta-description
- Level / parent: L2 · Content & Transmission (proposed L1, Meta-Template T3) · parent: [meta-template.md](./meta-template.md); the update half of [course-from-source.md](./course-from-source.md) (its step 11, "a living course: it keeps improving after release", turned into a runnable loop)
- Lens(es): **Causal** (source → candidates → signature → infographic → micro-module → code → version → surfaces → announce → retro, then the next source) · **Ideal Forms** (one signed insight = one micro-module: one idea, 90 s, one card, one Ask-AI button)
- Shift carried: **PST 40 The Recursive Proof (The Living Methodology)** (proposed, for Sasha to confirm) · **before:** a published mini-training sits on the shelf like a recipe and goes out of date; a good new source either never reaches it, or reaches it unsigned and uncredited · **after:** any source Sasha drops can become a signed, credited micro-module in the live mini-training under a new version, and Sasha's only acts in the run are the link, one signature message and the yes to publish and announce · **check:** for any version, its changelog line names the source and the originator; the source card shows Sasha's да / нет / правка on every insight the version carries; the run log shows no other request to Sasha. Learner side (not instrumented yet): a person who took an earlier version opens the new episode from the announcement link · also PST 117 The Learning Ledger and the Meta-Game (the source stream, as in [source-integration.md](./source-integration.md)), PST 187 The Packaged Shift (the mini-training stays one app while it grows, [course-as-app.md](./course-as-app.md)), PST 154 The Mirror Must Not Lag (every surface reads the version from one data file, none keeps its own copy)
- What emerges: a mini-training that grows with each source the way the knowledge graph does, each addition traceable to its source, its originator and Sasha's signature.
- As a part of the whole: the Meta-Template sees this as [source-integration.md](./source-integration.md) pointed at one live product. What the organism takes in becomes tissue of a mini-training that is already shipped, and nothing joins it unsigned.
- Siblings / repeats: [source-integration.md](./source-integration.md) (steps 1–2: card, authorship, Use Map target 6), [infographic.md](./infographic.md) + kit (step 4), [course-from-source.md](./course-from-source.md) (episode format, Ask-AI button, signature, Versioning), [docs/04-workflows/notebooklm_video_production.md](../04-workflows/notebooklm_video_production.md) → [Runbook: 8 actions per module](../04-workflows/notebooklm_video_production.md#runbook-8-actions-per-module) (step 5, click level), [course-as-app.md](./course-as-app.md) (the app tile, step 8), [spec-handoff.md](./spec-handoff.md) (the step 6 issue), [improvement-loop.md](./improvement-loop.md) (report and retro, step 10). `course-landing.md` (issue #523) joins as a sibling when it lands.
- Version · last changed · last verified · applied in: v2.0 · 2026-11-26 · not yet (no run has finished) · ADP Body update, 2026-11-26 (in flight). Change log: §8. Versioning of this file and of its runbooks: step 10.

**Why it exists.** A mini-training is never finished (course-from-source, Words: a wizard that leads to one result, kept alive). Without one loop, each update is improvised: an episode goes in without Sasha's signature, a version string is typed into one page and not the other, the originator of an idea is lost between the transcript and the video. This file holds only the order, who acts, Sasha's gates and the exact places. Every *how* stays in the linked template (single source of truth).

**The rule.** Nothing unsigned enters the mini-training. Sasha signs every insight (step 3) before any card, video or code is made for it. Agents prepare, Sasha gates.

**The principle (hypothesis, Sasha, 2026-11-26 11:59 MST).** «чем лучше описан how-to, тем быстрее, проще и дешевле ИИ агенту выполнить его» (the better the how-to is written, the faster, simpler and cheaper it is for an AI agent to run it). This template zooms in on three levels:
- **Goal** (why, what): the Meta-description, Why it exists, The rule.
- **Steps** (input → output · who · gate): §1.
- **Runbook** (click-level actions, for stable UIs only): step 5, the one step that runs on the same UI for every insight, uses [the NotebookLM runbook](../04-workflows/notebooklm_video_production.md#runbook-8-actions-per-module). If another step starts to run on a UI again and again, give it a runbook too, in the file that owns that step's how, with a "last verified" date, a fallback to the step above it, and the UI drift loop of step 10.
- **Check:** minutes and tool calls per micro-module, before the runbook and with it, logged in §5 (step 5 row and run log). Until that log shows a difference, this stays a hypothesis. The general form lives in [meta-template.md](./meta-template.md) §7.

---

## 0. How to run it (one line)

Sasha drops a link and names the mini-training (or Hark infers it from his words). Hark writes the intake line and runs the loop; Sasha answers only at the gates.

```
Run docs/templates/course-update.md (evolver-grid-site) on: <course slug> ← <source URL or path>[, <source 2>].
Module: <module id in the course data file, e.g. body>. Why now: <one line, optional>.
```

Course slugs and data files today (`src/data/courses/`): `activate-your-dormant-potential` → `activateYourDormantPotential.ts` · `consciousness-meets-science` → `consciousnessMeetsScience.ts` · `activation-of-inner-vision` → `activationOfInnerVision.ts`. Check the folder for new ones; the slug is the `slug` field of the exported `CourseConfig`.

---

## 1. The steps

Each step: **input → output · who acts · Sasha's gate**, then exactly what to do. Doubts become `[?]` and go into the step 3 sheet, never into a separate question.

### Step 1 · Source in
- **Input:** Sasha's link (any kind: video, essay, paper, post). **Output:** one source card in `knowledgegraph/30 Sources/<Author> - <Title>.md` with the course as a Use Map target 6 row. **Who:** Hark, or any agent running source-integration (Mode B / C). **Gate:** none; Sasha dropping the link is the intake.
- Run [source-integration.md](./source-integration.md) end to end, depth B by default. Search `30 Sources/` by URL and title first (§0a): a repeat source is a dated delta on its card, not a second card.
- Verbatim transcript at `knowledgegraph/10 Sources/<kind>/<author-slug>/<YYYY-MM-DD or undated>-<slug>.md` (§3).
- In the card's `## Use Map` (§6a), add one row with **Target 6 (Academy / course)** and `Action: candidate micro-modules for <course slug> · <module id>`. Steps 2–3 fill it.

### Step 2 · Insights → candidate list
- **Input:** the card's `## Extraction`. **Output:** a candidate list on the card, one line per insight. **Who:** Hark (strongest model for this step; §Cost). **Gate:** none yet; the list goes to Sasha in step 3.
- Under the card's `## Use Map`, one row per candidate, Target 6, `Needs Sasha's yes? = yes`, `State = waiting`. The Item cell holds:
  `<the insight in one plain line> — originator: <Name> · carrier: <Name> · <locator> · <flag>`
- **Originator / carrier** by [source-integration.md](./source-integration.md) §1a rule 1: credit the originator as far as the source says, cite the carrier; an unclear origin is `origin: [?]`, never a guess.
- **Flag** `[beyond us]` on any claim that goes past what the project holds (a channelled source, a health or science claim, a metaphysical claim stated as fact). It is shown to Sasha, never smoothed. A science claim carries its evidence word (§4, Paper mode). Course-side the line later gets the on-screen tag *established* / *hypothesis* (course-from-source, Look & feel).
- Match each candidate against the episodes already in the module (titles in the data file, texts in `docs/08-content/<course>_transcripts.md`): `NEW` → candidate episode; `EXTENDS <code>` → candidate patch to that episode (§Rules); `SAME-AS <code>` → no episode, source link only.
- Keep the module inside the 40-minute ceiling (course-from-source step 6, about 12 micro-modules for a whole mini-training). If the update would pass it, the sheet proposes which episode steps out or whether this is a second mini-training.

### Step 3 · Sasha signs each insight
- **Input:** the candidate rows. **Output:** every row answered да / нет / правка, recorded on the card. **Who:** Sasha signs; Hark sends and records. **Gate: this is the gate.** Nothing after this step starts for an unsigned row.
- Hark sends one message (Hark Brief, channel word РЕШЕНИЕ), in Russian, numbered: each candidate in one line with its originator and flag, plus one clickable link to the card. Sasha answers by number: **да**, **нет**, or **правка: <his line>**.
- Hark writes the answer into each row: `State = да (2026-MM-DD)` · `нет (date): <his reason, if given>` · `правка (date): <his line verbatim>`. A правка replaces the insight line; the originator stays as it was unless Sasha changes it.
- Only да and правка rows continue. A нет row stays on the card (true and parked is still graph knowledge).

### Step 4 · One card per signed key insight
- **Input:** the signed rows. **Output:** card spec + script + PNG per insight, and one contact sheet sent to Sasha. **Who:** Claude Code through an @claude issue opened by Hark (first line `Template: infographic.`); Hark writes the spec. **Gate:** Sasha sees the sheet before any card is used; his words on the sheet are edited in place and re-rendered.
- **Rule first: Title = the shift** ([infographic.md → Title = the shift](./infographic.md#title--the-shift-first-principle-sasha-2026-11-27-1625-mst)). The card title is the signed insight as one complete thought, the state after the shift, in the largest type; the source or series goes to the eyebrow; one signed insight = one card (two insights in one line → two cards). The caption is how / why and does not repeat the title. Hark writes the title in the spec by this rule.
- Card format and taxonomy: [infographic.md](./infographic.md). Drawing rules, spec fields, lint and sheet commands: [`docs/assets/infographics/kit/README.md`](../assets/infographics/kit/README.md).
- Files: `docs/assets/infographics/book/<course folder>/<ID>.card.yaml` + `<ID>.py` + `<ID>.png` (ADP folder: `book/adp/`, series A01–A10; Body cards B01, B02). The caption is the signed line, verbatim, ≤ 25 words; labels come from the card's own line; one NEON accent; the attribution footer names the originator ("After <Name>").
- Not published: the issue says **do not add to `book/book.yaml`**, the reader or course data until Sasha's yes (as in #521).
- Checks in the issue's DoD: `python3 docs/assets/infographics/kit/lint.py <spec>` all PASS; `python3 docs/assets/infographics/kit/book_build.py --check` green; a sheet `book/<course folder>/<module>-sheet.png` (`python3 docs/assets/infographics/kit/sheet.py`, kit README §Contact sheet).

### Step 5 · NotebookLM micro-module per signed insight
- **Input:** signed line + its card + the source excerpt with locators. **Output:** per insight: an episode text (about 220 spoken words), a style line and a focus line, a 90 s video downloaded into the workspace, its YouTube id (uploaded unlisted), and one Ask-AI prompt. **Who:** Hark or an agent with the NotebookLM and YouTube browser session; the agent writes the text, the two prompt lines and the Ask-AI prompt. **Gate:** Sasha watches each video (from its unlisted link) and reads its text and prompt (course-from-source step 8: his signature under every word); only signed episodes go to step 6. **Upload visibility: unlisted by default, no approval needed** (unlisted or private needs no yes; Sasha, 2026-11-26 12:02 MST). **Switching a video to public, or announcing it, needs his yes** (step 9).
- Episode format, length and the Ask-AI button (its job, its form, video first then the button): [course-from-source.md](./course-from-source.md) steps 6–7 and Look & feel (course look + episode scene).
- Episode code: next free code in the module, in the module's own pattern (ADP Body has `B00`, `B01E01`–`B01E03`, so new ones are `B01E04`, `B01E05`).
- **Before the browser opens,** write the inputs next to the module text, in the course's content file under `docs/08-content/` (ADP: `activate_your_dormant_potential_transcripts.md`): the episode text under its module heading, one focus line per episode, and the course's one style line if it has none yet. Pattern: `docs/08-content/consciousness_meets_science_course.md` → Part 2 (Custom style, Focus lines). The style line is brief: Sasha's "invert colors" + Bio-Light, inside the course look of course-from-source → Look & feel.
- **In NotebookLM, run the [8 actions per module](../04-workflows/notebooklm_video_production.md#runbook-8-actions-per-module)** (last verified 2026-11-26), one module after another without waiting. Notebook name: `<episode code> <Title> v<course version>`, the version this run ships under step 7 (e.g. `B01E04 The Bashar Formula v1.1`). Browser agents: no snapshot between actions; one check at the end of each module (right name, generation running). If a label is missing or moved, or an extra dialog appears, finish the module by the runbook's goal-level fallback, then run the UI drift loop (step 10): fix the label in the runbook in the same job.
- Log the time for each module from action 1 to the end-of-module check, and the tool calls, for the §5 step 5 row (the principle's check).
- Harvest after all modules are triggered (runbook, Phase 2). Duration gate before download: over 90 s → regenerate once with a stricter focus line; twice over → stop and put it in the sheet (§Cost). Download into the workspace as `<notebook name>.mp4`; videos are not committed.
- Upload each video to YouTube as **unlisted** right after download, with no approval: title = the notebook name; playlist and description as in the runbook file, Phase 3. Keep the YouTube id for step 6. The course data file is the table of links; no separate table.
- Send Sasha the unlisted links, texts and Ask-AI prompts in one message (§Cost). His yes per video signs it into the course; a нет or правка is a re-cut, and the old unlisted video is deleted or left private.
- The text names the originator in the voice, as the card's footer does ("Bashar, as channelled by Darryl Anka, puts it as five steps…"), and keeps the `[beyond us]` line as a hypothesis, never as fact.

### Step 6 · Code: new episodes into the course data, through an @claude issue
- **Input:** per episode: code, title, YouTube id, card PNG, promise line, Ask-AI prompt, episode text. **Output:** one PR. **Who:** Claude Code; Hark opens the issue in [spec-handoff.md](./spec-handoff.md) §3 order, first line `Template: course-update.` **Gate:** the issue is opened only after steps 3–5 are signed; the PR merges after review, never a direct push.
- Files the issue names:
  - `src/data/courses/<file>.ts`: append to the module whose `id` is the step 0 module, one object per episode: `{ code, title, youtubeId, infographic, promiseKey }` (shape: `CourseEpisode` in `src/data/courses/types.ts`). Order in the array = order on the page.
  - `infographic`: an image path served from `public/`. Default until the first run fixes it: copy `book/<course folder>/<ID>.png` to `public/infographics/courses/<slug>/<ID>.png` and set `infographic: "/infographics/courses/<slug>/<ID>.png"`. If Sasha has published the card in `book/book.yaml`, use its `public/infographics/book/…` copy instead.
  - `promiseKey`: the course's i18n namespace (`courseCms.promise.<code>` for Consciousness Meets Science; ADP has none yet, so the first ADP run adds `course.promise.<code>` under `"course"`) in `src/locales/en/common.json`, `ru/common.json`, `es/common.json`.
  - **Ask-AI prompt:** `CourseEpisode.askPrompt` (English string with tokens `{birthday} {today} {weekday} {timeOfDay} {phase} {location} {mission}`; filled by `src/lib/courseAskAi.ts`, a token the platform lacks becomes the "ask me" wording). `src/pages/CoursePage.tsx` renders it after the video with `src/components/course/CourseAskAiCard.tsx` (wraps `PromptButtonCard`; Send is held back until the AI call is approved, Copy works). First built in the Nature PR (#551); later runs only fill the string.
  - **Empty video:** a `youtubeId` of `""` lists the episode and shows the "Video coming soon" state; `TBD…` still hides it. The last episode's door is `CourseConfig.outro` (default: Zone of Genius).
  - `docs/08-content/<course>_transcripts.md`: one block per episode under its module heading, `### <code> — <Title> (m:ss)` then the text; update the module line and the front-matter `version` / episode count.
- Verification in the issue: `npm run typecheck` · `npm run lint` · `npm test` · `node scripts/i18n-key-check.mjs --prefix course.` (or the course's namespace) · the page `/grow/<slug>?ep=<new code>` opens the new episode (Playwright or a screenshot in the PR).
- The version bump (step 7) goes in the same PR. One PR per run.

### Step 7 · Version bump, changelog line, `updatedAt`
- **Input:** what the PR adds. **Output:** three fields changed in the course's `CourseConfig`. **Who:** Claude Code, same PR as step 6. **Gate:** none beyond the PR.
- Rule (single source): [course-from-source.md](./course-from-source.md) → Versioning, and the comment on `CourseConfig` in `src/data/courses/types.ts`. Both land with issue #522 (branch `claude/issue-522-20261126-1845`, not merged on 2026-11-26). Until it merges, the first run's PR depends on it.
- Fields: `version` (semver string, e.g. `"1.1"`), `updatedAt` (ISO `YYYY-MM-DD`), `changelog` (array of `{ version, date, summary }`, oldest first; append one entry, `version` equals the last entry). New episode or module → minor (`1.0` → `1.1`); fix → patch (`1.1` → `1.1.1`); a change to the result or structure → major, Sasha's call.
- The changelog `summary` names what was added and whose idea it is, so the version answers the shift check: `"Body: two new episodes, B01E04 The Bashar Formula (after Bashar) and B01E05 Energy Is Received (after Michio Kushi)."`

### Step 8 · Every surface reads the new version from data
- **Input:** the merged data file. **Output:** the course page, the sales page, the registry tile and the app-store tile all show the new version and episodes, none edited by hand. **Who:** Claude Code checks in the step 6 PR. **Gate:** none.
- Surfaces and where they read from:
  - `/grow/<slug>`: `src/pages/CoursePage.tsx` (episodes from `modules`; version line and "What's new" from `CourseVersionInfo`, issue #522).
  - `/academy/<slug>`: `src/components/CourseSalesPage.tsx` with `src/data/courseSales.ts` (module and episode list from the same course object; version line from #522). Section order and landing law: `course-landing.md` once issue #523 lands; until then [module-form.md](./module-form.md) §12.
  - Registry tile: the course entry in `src/data/modules.ts` (`id: "course-<slug>"`), whose `version` is shown by `src/components/ModuleTile.tsx` and `src/pages/ModuleDetail.tsx`. It must be set as `version: <COURSE_CONST>.version`, never a typed string.
  - App-store tile (third panel, issue #524): name, tagline, icon from [course-as-app.md](./course-as-app.md) step 2 and `docs/assets/infographics/apps/<id>.*`; level, category and version from the course object.
- Check: `grep -rnE 'version: "[0-9]' src/data/modules.ts src/data/courseSales.ts src/components` returns no course line.

### Step 9 · Announce, only with Sasha's yes
- **Input:** the live page. **Output:** one announcement where Sasha says. **Who:** Hark drafts; Sasha (or Hark on his «Да») sends. **Gate:** Sasha's explicit yes to the exact text. No announcement goes out unasked.
- Draft: what is new in one line, whose idea it is, and one deep link `https://findyourtoptalent.com/grow/<slug>?ep=<new code>`. Public posts follow [source-integration.md](./source-integration.md) §6a target 11 and Sasha's approval lines. The originator is named in the post as on the card.
- Any video of the run that should be public (not just embedded unlisted on the course page) is switched to public only with the same yes.
- Hark marks the source card's Target 6 rows `State = done (version <x.y>, date)` with the PR link.

### Step 10 · Report, trace line, template change
- **Input:** the finished run, and every place where the template or a runbook did not match reality. **Output:** one report to Sasha with the trace line, one dated line in §5 run log, one `Template change:` line, and (when there is a change) the edited template or runbook with a new version and a §8 row. **Who:** whoever ran the job, in the same job. **Gate:** none; a major change (below) is named first in the report so Sasha sees it.
- **Report** in meaning with one clickable link to the live page ([improvement-loop.md](./improvement-loop.md) loop step 3): the signed insights, the new version, what the learner now sees.
- **Trace line** ([meta-template.md](./meta-template.md) → Core v3, The trace line) in the report and in the step 6 PR description:
  `Template: course-update v<the version at the top of this file> · Version: v<course version after step 7> · Shift check: yes / no / unknown`
  e.g. `Template: course-update v2.0 · Version: v1.1 · Shift check: unknown`.
  Shift check = the check in the Meta-description: the changelog line names source and originator, the source card shows Sasha's signature on every insight the version carries, and the run log shows no other request to Sasha. `unknown` until step 9 is closed.
- **Run log:** add to §5: date, course, sources, signed / parked counts, version, links, minutes and tool calls per micro-module, one line of what the run taught.
- **Template change line.** Every job under this template ends with exactly one line, as the last line of the report and of the step 6 PR description: `Template change: <what changed, where, old → new>` or `Template change: none`. If there is a change, edit the step it belongs to now, bump the version (below) and add a §8 row. A change is never left for "later".
- **UI drift loop** (Sasha, 2026-11-26 12:02 MST: «интерфейсы постоянно меняются, это должна быть часть изменения шаблонов, петля обратной связи обратно в шаблон, с изменением версии»). Whenever an agent finds a click-level step that no longer matches the UI (a label renamed, a button moved, an extra dialog), it:
  1. finishes the module through the goal-level fallback written above the runbook (never stops the run for a label);
  2. writes `Template change: runbook step N, old → new` (e.g. `Template change: NotebookLM runbook action 6, "Customize Video Overview" → "Customize"`);
  3. in the same job, edits the runbook's **current labels** table (for NotebookLM: [notebooklm_video_production.md → The 8 actions, current labels](../04-workflows/notebooklm_video_production.md#the-8-actions-current-labels)), bumps the runbook's version as a patch, and adds a row to that runbook's changelog naming this run. Sasha's verbatim text stays as it is; only the labels table moves.
- **Version rule** (for this file and for every runbook it uses; each keeps its own version):
  - **patch** (v2.0 → v2.0.1): a runbook or UI-path fix, a renamed file path or field, a wording fix;
  - **minor** (v2.0 → v2.1): a changed step order, or a gate added or removed;
  - **major** (v2.0 → v3.0): a new phase (a new step), or a changed Definition of Done.
  The course's own version (step 7) is a separate chain; the trace line carries both.
- **Last verified.** On every successful run, even with no change, set `last verified: YYYY-MM-DD` in the version line at the top of this file and in each runbook the run used (for NotebookLM: the Runbook header). A date that stops moving tells the next agent the click level may be stale.

---

## 2. Definition of Done (one run; Hark checks lines 1–9 before step 9, lines 10–12 at the close)

| # | Check | Pass when |
|---|---|---|
| 1 | Source | one card per source in `knowledgegraph/30 Sources/` (a repeat is a dated delta); verbatim transcript saved; Use Map row with Target 6 |
| 2 | Authorship | every candidate row has originator, carrier and locator; unclear origin is `[?]` |
| 3 | Flags | every claim past our position carries `[beyond us]` on the card, and is a hypothesis in the episode text |
| 4 | Signature | every candidate row has да / нет / правка with a date; no card, video or episode exists for an unsigned or нет row |
| 5 | Cards | one card per signed key insight; lint PASS; `book_build.py --check` green; sheet sent and answered |
| 6 | Micro-modules | per signed insight: focus line stored in the content file; notebook named `<code> <Title> v<version>`; video ≤ 90 s; text, prompt and video seen by Sasha; uploaded unlisted (never public without his yes); minutes and tool calls per module logged in §5 |
| 7 | Code | episodes in `src/data/courses/<file>.ts` and in the transcripts doc; i18n keys in en, ru, es; typecheck, lint, tests and i18n check green |
| 8 | Version | `version`, `updatedAt` and one new `changelog` entry; the bump matches the rule; the summary names source and originator |
| 9 | Surfaces | `/grow/<slug>`, `/academy/<slug>`, registry tile and app tile show the new version from data; the grep in step 8 is empty |
| 10 | Announce | sent only after Sasha's yes to the exact text, or not sent and noted |
| 11 | Close | card rows `done` with the PR link; report sent with a live link and the trace line; run log line added in §5 |
| 12 | Template change | the job ends with `Template change: …` or `none`; every UI drift met is fixed in its runbook in the same job, with a patch bump and a changelog row; `last verified` moved to today here and in each runbook used |

---

## 3. Cost discipline

- **Sasha's attention is the scarcest input.** He gets three things per run: the step 3 sheet (all candidates in one message), the step 4 contact sheet, and the step 5 + 9 review (videos, texts, prompts and the announcement in one message). Never one message per insight.
- Cheapest capable model for acquisition and extraction (step 1); strongest for the candidate list, authorship and flags (step 2) and the episode texts (step 5), as in [source-integration.md](./source-integration.md) §9.
- One @claude issue for cards, one for code; the code issue carries all episodes of the run and the version bump together.
- Read the data file and transcript by module (`grep -n` the module id or code), never whole.
- NotebookLM: run the [runbook](../04-workflows/notebooklm_video_production.md#runbook-8-actions-per-module) and trigger all episodes before harvesting; no snapshot between clicks; at most one regeneration per episode. Blocked twice on the same step: stop, write what exists on the card, put `[?]` in the next sheet.
- Run steps 1–3 for several sources before any media: batching the signature saves Sasha time, and media is the expensive part.

---

## 4. Rules of thumb

- One source can give many insights; only signed ones become micro-modules, and each micro-module holds one idea.
- A source that only sharpens or weakens what an episode already says is a **patch** (a corrected line, a re-cut video) plus a flag in the sheet, not a new episode.
- Keep each episode traceable: the changelog line and the card's Use Map row point at each other through the PR link.
- The Ask-AI prompt works in any AI and cannot refute the video, whatever the answer (course-from-source step 6).
- Steps 1–3 need no media and no code; steps 4–9 never start before step 3 is answered.

---

## 5. Worked example: ADP Body, 2026-11-26 (Bashar + Michio Kushi → Body)

**Course:** Activate Your Dormant Potential (title on the site: *Your Unfolding Potential*), slug `activate-your-dormant-potential`, module `body` (before the run: `B00`, `B01E01`–`B01E03`, 6:29).

| Step | What happened | Where |
|---|---|---|
| 1 | Two sources integrated: Bashar, five-step formula (transcript `10 Sources/youtube/bashar/undated-five-step-formula.md`) and Michio Kushi, why most people never access full energy (`10 Sources/youtube/michio-kushi/undated-why-most-people-never-access-full-energy.md`) | knowledgegraph#320 |
| 2 | Two key insights. **Bashar:** "Act on your highest excitement, as far as it goes, with no insistence on outcome, positive whatever comes, and drop beliefs that aren't yours." Originator: Bashar; carrier: Darryl Anka (channel). A channelled source, so its origin claims are the `[beyond us]` kind. **Kushi:** "Your body is a river, not a battery. Tiredness is blockage: clear food, mind, emotion. Heaven and earth meet in the hara." Originator as the source gives it: Michio Kushi. "Tiredness is blockage" is a health claim, the `[beyond us]` kind | source cards, knowledgegraph#320 |
| 3 | Signature record lives on the source cards (private repo, not readable from here) | knowledgegraph#320 |
| 4 | Cards `book/adp/B01` *The Bashar Formula* (footer "After Bashar (channeled by Darryl Anka)") and `B02` *Energy Is Received* (footer "After Michio Kushi"); not in `book.yaml`; sheet `book/adp/body-sheet.png` | #521 (open) |
| 5 | Micro-modules `B01E04`, `B01E05` (proposed codes): pending. Runbook check to log here: minutes and tool calls per module, before the runbook (goal-level steps only) and with it. Baseline from February, time only: ~9 min serial, ~90 s optimized | not yet issued |
| 6–7 | Versioning fields first (ADP `1.0`, 2026-11-25); the Body episodes then bump `1.0` → `1.1` | #522 (branch pushed, not merged) |
| 8 | Course landing template and ADP landing; educational app store on the third panel | #523, #524 (open) |
| 9 | Announcement: waits for Sasha's yes | — |

*Run log (step 10, one dated line per run):*
- 2026-11-26: template written while the first run is in flight. Lessons so far: (1) the run needed the versioning fields before any episode could bump a version, so #522 came first; later runs only fill them. (2) `CourseEpisode` has no Ask-AI field and the course page no button: the first code issue adds them (step 6). (3) No served path existed for course cards outside the Book: the default in step 6 stands until the first PR fixes it. (4) Card and episode codes are two namespaces (`B01` card vs `B01E04` episode); keep both on the Use Map row.
- 2026-11-26 (v1.1): Sasha gave his NotebookLM workflow; it now sits as the runbook under step 5, and the YouTube upload moved behind his yes per video. Time and tool calls per module: not measured yet (first micro-modules pending).
- 2026-11-26 (v2.0): two rules from Sasha before the first micro-module: YouTube upload is unlisted by default and needs no yes (12:02 MST), and a UI drift found in a run goes back into the runbook in the same job with a version bump (12:02 MST). Step 10 now carries the trace line, the `Template change:` line, the UI drift loop and the version rule.

---

## 6. Open

- Sasha to confirm the shift: PST 40 (the living methodology) as the main one, or PST 117 as in source-integration.
- Where the learner sees the changelog: the "What's new" disclosure of #522 is the working answer.
- Whether people who already took the mini-training are told by the platform or only by Sasha's announcement (step 9).
- The served path for course cards (`public/infographics/courses/<slug>/`) is settled: Nature (PR #551) serves its 12 cards from `public/infographics/courses/nature/<ID>.png`, copied from `docs/assets/infographics/book/nature/` (the Ask-AI field is settled too: `askPrompt`).
- Library candidate (meta-template §7.8): Sasha's how-to hypothesis (the principle above), once the step 5 measurement shows the runbook makes a module faster or cheaper.

## 7. Genealogy

| Version | Date | Source | What it contributed |
|---|---|---|---|
| seed | 2026-10-27 | [course-from-source.md](./course-from-source.md), Sasha's words: "A living course: it keeps improving after release" | the idea that a mini-training keeps changing |
| seed | 2026-11-21 | [source-integration.md](./source-integration.md) v2.0 (Sasha: put sources on stream, credit authorship) | the source card, authorship rule, Use Map target 6 |
| seed | 2026-11-22 | course-from-source v2, step 8 (signature) and step 11 (update the template) | nothing ships unsigned; the template learns after each run |
| seed | 2026-11-25 | [course-as-app.md](./course-as-app.md), PST 187 | the mini-training as one app with a tile that has to stay current |

The versions of this file are in §8 Changelog.

## 8. Changelog

*One row per version, newest last. Version rule: step 10. A row names the run (or the transmission) that found the change, so every version traces to what happened.*

| Date | Version | What changed | Found by |
|---|---|---|---|
| 2026-11-26 | v0.1 | the ten steps as one table (step, who acts, Sasha's gate, reuse link), rules of thumb, run log | Sasha's transmission, issue #525; first run ADP Body (Bashar, Kushi) with #521–#524 |
| 2026-11-26 | v1.0 | full meta-template structure: meta-description with shift and check, how-to-run line, steps as input → output · who · gate with exact paths, field names and commands, DoD, cost discipline, worked example, genealogy | Sasha, #525 comment 11:48 MST («очень важны шаблоны, сделай их качественно») |
| 2026-11-26 | v1.1 | step 5 runs on the NotebookLM runbook (8 actions, pipelining, versioned notebook name, stored style and focus lines); the how-to principle with three zoom levels and its check | Sasha, #525 comments 11:55 and 11:59 MST |
| 2026-11-26 | v2.0 | **major** (DoD changed: row 12 added, row 11 widened). Step 5: YouTube upload unlisted by default with no approval; only public or announced needs Sasha's yes (gate moved, step 9). Step 10: trace line (Meta-Template v3), `Template change:` line at the end of every job, UI drift loop, version rule, `last verified` on every run. Version line at the top in the v3 form; versions moved out of §7 into this table | Sasha, #525 comments 12:02 MST (two: unlisted needs no yes; «интерфейсы постоянно меняются…»); Meta-Template v3 core, 2026-11-26 12:01 MST |
| 2026-11-27 | v2.0.1 | **patch** (step 6 field names): Ask-AI field is `askPrompt` (a string with tokens), not `askPromptKey`; empty `youtubeId` state; `CourseConfig.outro` | Nature PR, issue #551 |
| 2026-11-27 | v2.0.2 | **patch** (wording, step 4): link to the infographic rule "Title = the shift" (one signed insight = one card, title is the shift) | Sasha, 2026-11-27 16:25 MST; issue #568 |

---
Template: course-update v2.0.2 · Version: docs patch · Shift check: the title names the shift
Template change: course-update v2.0.1 → v2.0.2: step 4 links the infographic rule "Title = the shift" (issue #568)
