# Course-from-Source Template

> How *Activate Your Dormant Potential* was built; the reusable way to turn any body of Sasha's work (workshops, an article, infographics) into a mini-course.
> *Moved here 2026-10-27 from [VIDEO_PRODUCTION_PLAN.md](../08-content/VIDEO_PRODUCTION_PLAN.md). Video settings (90–120 s Video Overview, style prompt): that file → Video Configuration Prompts.*

## Meta-description
- Level / parent: L2 · Content & Transmission (proposed L1, awaiting Sasha's confirmation, Meta-Template T3) · parent: [meta-template.md](./meta-template.md)
- Lens(es): **Causal** (the six steps, structure first and content hanging on it) · **Ideal Forms** (one episode = one idea, 90–120 s; the course look: one metaphor, three colours, one "never")
- Shift carried: PST 57 Campfire Networking (broadcast into the group, let the 1:1 form itself) · **before:** Sasha goes looking for the right people one by one and explains himself to each · **after:** he speaks once into a group through the course, and the people it resonates with come to him already interested · **check:** someone who watched the episodes writes or books on their own, with no outreach first, and names the idea that pulled them in · *(pilot pair, 2026-10-27; the fit is medium: 57 was found at a live event, and a course is the same move on another surface, 57d and 57i)* · also PST 96 (signal-preserving propagation: a stranger watches one episode and repeats its one idea in their own words, not average ones), 82 (simple, not simplistic), 145 (the average fills the silence), 8 (one acorn, every magnification)
- What emerges: a body of Sasha's work (workshops, an article, infographics) becomes a path other people can walk on their own: modules, episodes, one badge.
- As a part of the whole: the Meta-Template sees this as emergence of a transmission into a learnable form: what arrived through Sasha is given a spine and a rhythm so it can be received, repeated and grown in another person without loss.
- Siblings / repeats: testimonial-clips (the same transmission returning as others' words); the NotebookLM video production cluster (synthesized in below, 2026-10-27: Production line, Genealogy) and the micro-module format (still to merge, see README inventory); Hark specialty `course-from-source` is a mirror of this file.
- Status · applied in · last reviewed: in use · Activate Your Dormant Potential; Consciousness Meets Science (draft) · 2026-10-27

> **Added:** 2026-10-27, in Sasha's words, as the reusable way to turn any body of his work (workshops, an article, infographics) into a mini-course. A living course: it keeps improving after release.

### The 6 steps
1. **Structure first.** Sasha sets the course structure himself. For ADP it is the six-path map (Foundational, Spirit, Mind, Emotions, Body, Genius) that has evolved over ~6 years. The structure is the spine; content hangs on it, never the other way round.
2. **Harvest insights from the source.** Give AI the source material on the relevant themes (for ADP: recordings/transcripts of Sasha's workshops). Extract the most powerful, biggest insights.
3. **Distribute by theme.** Sort the insights into the structure's themes. Result: dense material per theme.
4. **Episodes and modules in NotebookLM.** Put the material into NotebookLM with clear instructions to break it into modules and episodes (text per episode).
5. **Video Overview per episode.** For each episode, give NotebookLM that episode's text and ask for a Video Overview of **90–120 seconds** (see [VIDEO_PRODUCTION_PLAN.md](../08-content/VIDEO_PRODUCTION_PLAN.md) → Video Configuration Prompts).
6. **Authorship check.** The Foundational module is written by Sasha himself, almost word for word. The other modules are mostly AI-written, but Sasha signs under practically every word. Nothing ships that he would not sign.

### Look & feel (NotebookLM Video Overview)
- Format: **Explainer (16:9)**, never Short 9:16 (too simplified). Add to the end of Custom topic: "Total video length must stay under 2 minutes."
- Visual style: pick **Custom** if offered (else Watercolor) and describe the look in the prompt's last "Visual style" line.
- Two layers in that line:
  1. **Course look** (same for every episode, gives the series one identity): one metaphor arc, 3 colours max, one texture, one motion rule, one "never" (e.g. "night sky turning to dawn; indigo, soft gold, silver line-work; candlelight glow; slow, calm; never flashy").
  2. **Episode scene** (unique per episode, mirrors its one idea): one central image, a palette shift within the course family, one motion. E.g. fractals → zoom loops in emerald and gold; torus → breathing loops in ultramarine and cyan.
- Science labels as clean on-screen tags ("established" / "hypothesis") when the episode has them.
- No likenesses of real public figures, no stock-photo faces, no text clutter, no instructions shown for psychedelics.
- Close each module on warmer light than it opened with; the last episode ends in the fullest light (dawn / fire circle).
- Example set: Consciousness Meets Science, 15 episode lines kept with the episode prompts.

### Production line (batch, from the February runs)
*Synthesized 2026-10-27 from five production files (Genealogy below). Where they differ from the 6 steps above, the October rules win.*
1. **Prepare all sources first.** One text per episode, in one batch file with clear separators (`===MODULE: <code> <title>===` … `===END===`), and the per-episode focus line pre-written in a table. No thinking during execution, only pasting.
2. **Trigger, don't wait.** Per episode: new notebook → paste source → rename to the episode code → Video Overview → Customize → style line + focus line → Generate → **move to the next episode at once** (~60–90 s each). Several tabs in rotation, or the Playwright script `scripts/regenerate_videos.js` (`scripts/README_REGENERATION.md`), which continues on failure, marks ❌ and saves a screenshot.
3. **Harvest after ~15–20 min**, in rolling batches. **Duration gate before download:** within target, else mark and regenerate with a stricter focus line.
4. **Name and file:** `<module code><episode> — <Title>` (codes: F Foundational, S Spirit, M Mind, E Emotions, B Body, G Genius, C Consciousness; "seasons are called modules").
5. **Upload unlisted**, one playlist per module; description = one-sentence summary + the course link + 3–4 tags; log each URL in the tracker.
6. **Tracker per course:** episode × (sourced, triggered, downloaded, uploaded, URL). Delegate batches of 10+ to a cheaper sub-agent with a self-contained task.

> *Dated notes.* **Length:** February runs held a hard "90 seconds maximum… NON-NEGOTIABLE", yet accepted "max 2 min" at the download check; October (Sasha, 2026-10-27) sets **90–120 s, under 2 minutes**. The invariant across both: one idea, under two minutes. **Look:** February used one constant Bio-Light style for every video ("Bio-luminescent, iridescent pastel gradients on dark background…"); October replaces it with a course look + episode scene (above); Bio-Light stays a valid course look. **Format:** the first guide (RU, early 2026) made Audio Overviews (MP3); the line has been Video Overviews since February. **Names:** "Planetary OS v1.0" in titles and descriptions belongs to the old curriculum name; the course is *Activate Your Dormant Potential* since 2026-10-26.

### Rules of thumb
- One episode = one idea, 90–120 s (about 220–300 spoken words).
- Module = a theme of the structure; course = a short, self-paced experience with Intro, Outro and one badge (Game of Being You rules).
- Keep the source of each episode traceable (which workshop/paragraph) so the course can be improved live.
- Mark claims honestly: established vs. hypothesis (esp. for science).

### Applications
- 1. **Activate Your Dormant Potential** (6 modules, 38 episodes): [activate_your_dormant_potential_transcripts.md](../08-content/activate_your_dormant_potential_transcripts.md).
- 2. **Consciousness Meets Science** (Mystery School intro, draft): plan in [VIDEO_PRODUCTION_PLAN.md](../08-content/VIDEO_PRODUCTION_PLAN.md) → Application 2; episode texts in [consciousness_meets_science_course.md](../08-content/consciousness_meets_science_course.md).
- 3. **Activation of Inner Vision** (advanced micro-course from the /27 paper, unlocks after Integral Mystery School; 3 modules, 9 episodes, draft): [activation_of_inner_vision_course.md](../08-content/activation_of_inner_vision_course.md).

---

## Genealogy
| Source | Date | Provenance | What it contributed |
|---|---|---|---|
| `docs/03-playbooks/notebooklm_workflow.md` (RU) | early 2026 | Sasha's own working note, AI-assisted | the first per-module loop (notebook → source → overview → YouTube → URL in a table); episode list; parallel tabs |
| `docs/08-content/VIDEO_PRODUCTION_PLAN.md` | v2.0 2026-02-05; renamed course 2026-10-26; Application 2 2026-10-27 | AI-run plan and tracker; October notes in Sasha's words | the 8-step per-episode loop; naming as TV series; YouTube metadata template; the master tracker; the 6 steps moved from here into this file (2026-10-27); stays the live tracker and holds Application 2 |
| `docs/04-workflows/notebooklm_video_production.md` | v1.1 2026-02-05 | AI-written, from the automated runs | trigger-don't-wait; batch clipboard file; pre-written focus prompts; harvest; optimization history (≈9 min → ≈90 s per episode); troubleshooting |
| `docs/04-workflows/video_regeneration_project_plan.md` | 2026-02-11 | AI-written plan, reviewed with Sasha before execution | the duration gate before download; rolling batches; sub-agent allocation; description template; risk list |
| `scripts/README_REGENERATION.md` | 2026-02-11 | AI-written, documents `scripts/regenerate_videos.js` | the line as a Playwright script: continue on failure, ❌ in tracker, screenshot per error |
| this file's 6 steps and Look & feel | 2026-10-27 | Sasha's words (6 steps, authorship check, 90–120 s) | the canonical method; course look + episode scene |
