# Course-from-Source Template

> How *Activate Your Dormant Potential* was built; the reusable way to turn any body of Sasha's work (workshops, an article, infographics) into a mini-course.
> *Moved here 2026-10-27 from [VIDEO_PRODUCTION_PLAN.md](../08-content/VIDEO_PRODUCTION_PLAN.md). Video settings (90–120 s Video Overview, style prompt): that file → Video Configuration Prompts.*

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

### Rules of thumb
- One episode = one idea, 90–120 s (about 220–300 spoken words).
- Module = a theme of the structure; course = a short, self-paced experience with Intro, Outro and one badge (Game of Being You rules).
- Keep the source of each episode traceable (which workshop/paragraph) so the course can be improved live.
- Mark claims honestly: established vs. hypothesis (esp. for science).

### Applications
- 1. **Activate Your Dormant Potential** (6 modules, 38 episodes): [activate_your_dormant_potential_transcripts.md](../08-content/activate_your_dormant_potential_transcripts.md).
- 2. **Consciousness Meets Science** (Mystery School intro, draft): plan in [VIDEO_PRODUCTION_PLAN.md](../08-content/VIDEO_PRODUCTION_PLAN.md) → Application 2; episode texts in [consciousness_meets_science_course.md](../08-content/consciousness_meets_science_course.md).
