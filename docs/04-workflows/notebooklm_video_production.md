> Synthesized into docs/templates/course-from-source.md (2026-10-27). This file is kept as a source.
> Exception, 2026-11-26: the **Runbook** section below is live and canonical for the click level. [course-update.md](../templates/course-update.md) step 5 and [course-from-source.md](../templates/course-from-source.md) → Production line link to it and never copy it.

# NotebookLM Video Production Workflow

> **Version:** 1.1  
> **Last Updated:** 2026-11-26 (Runbook section added; the rest is unchanged since 2026-02-05)  
> **Status:** Optimized

## Overview

Batch production of educational videos from micro-learning modules using NotebookLM's Video Overview feature.

---

## Runbook: 8 actions per module

*Sasha's own workflow, added 2026-11-26 (chat, 11:55 MST; issue #525). **Last verified: 2026-11-26** (Sasha's run). It is the click level under [course-update.md](../templates/course-update.md) step 5 and [course-from-source.md](../templates/course-from-source.md) → Production line, step 2. Those files say what and why. This section says which button.*

**Fallback.** If a label below is missing (NotebookLM changed its UI), follow the goal-level step above it: the first seven lines of Sasha's text (create notebook → upload module text → Video Overview, Customize → style box → focus box → download → upload). Then write the new label here with the date and move "Last verified" to that date.

### Sasha's text (verbatim)
```text
NotebookLM → create notebook → upload module text
Studio → Video Overview → Customize → Explainer + Custom
Visual style box: brief, "invert colors" + Bio-Light aesthetic
Focus box: what the AI hosts should focus on
Download video to Mac
YouTube → upload with numbering and version
Table with all links
OPTIMIZED: each module = 8 actions, ~60–90 s:
1 Click "Create new" 2 Click "Copied text" 3 Type source content (pre-loaded) 4 Click "Insert" 5 Cmd+A → type new name "F01E07 Mind Path v1.0" 6 Click "Customize Video Overview" (edit) 7 Click "Custom" → type style prompt → type focus prompt 8 Click "Generate" → IMMEDIATELY next module (don't wait!)
Key: don't wait between steps, no snapshot after each click.
```

### Relevance sort (our synthesis, 2026-11-26)
- **Take as is.**
  - The 8 actions, in this order.
  - **Pipelining:** after action 8, start the next module at once. Do not wait for the video. Harvest later, all modules together (Phase 2 below).
  - **Notebook name = episode code + title + course version:** `F01E07 Mind Path v1.0`, pattern `<episode code> <Title> v<course version>`. The version is the one the run ships under the versioning rule (`course-from-source.md` → Versioning, issue #522), so every video traces to one course version. The downloaded file and the YouTube title carry the same name.
  - **The two prompt boxes (style, focus) are named, reusable inputs.** They are stored next to the module text, in the course's content file under `docs/08-content/`: one style line for the whole course, one focus line per episode. The pattern is `docs/08-content/consciousness_meets_science_course.md` → Part 2 (Master prompt, Custom style, Focus lines). Action 7 pastes them and nobody composes them during the run.
  - **YouTube upload with numbering and version, default visibility Unlisted** (Sasha's correction, 2026-11-26 12:02 MST). Upload as Unlisted (or Private) needs no approval: upload right after download, title = the notebook name (Phase 3 below). Sasha reviews from the unlisted link (course-update step 5).
- **Adapt for an agent.**
  - "Download video to Mac" becomes **download into the agent's workspace**, file name `<notebook name>.mp4`. Videos are not committed to git.
  - "No snapshot after each click" becomes a **rule for browser agents**: act on the known UI through actions 1–8 with no screenshot or page snapshot between them. Verify once at the end of each module: the notebook exists under the right name and generation is running. Take a snapshot only when that check fails or a label is missing (then use the Fallback).
  - **"Table with all links"** is not a separate table. The link of each episode lives in the course data file, `youtubeId` on the episode in `src/data/courses/<file>.ts` (one source of truth; course-update step 6).
- **Needs Sasha's yes each time.**
  - **Switching a video to Public**, and announcing it (course-update step 9). Never upload straight to Public.
- **Fragility.** These UI paths break when NotebookLM changes. Hence the "Last verified" date and the Fallback above. An agent that finds a changed label fixes it here in the same run.

### Measure it
Sasha's hypothesis (2026-11-26, [meta-template.md](../templates/meta-template.md) §7) is that a click-level runbook makes the agent faster and cheaper. For each run, log **minutes per module and tool calls per module**, from action 1 to the end-of-module check, before the runbook (goal-level steps only) and with it. The log goes in the worked example of the template that ran it (course-update §5). Baseline from February: about 9 min per module serial with a snapshot after every action, about 90 s optimized (§Optimization history). Tool calls were not counted then.

---

## Prerequisites

- [ ] Source text files ready in `notebooklm_sources/` directory
- [ ] Logged into NotebookLM (Google account)
- [ ] Logged into YouTube Studio
- [ ] OpenClaw browser control active (Brave profile="openclaw")

---

## Phase 1: Batch Notebook Creation

*The February version of the same 8 actions. The Runbook above is current (2026-11-26); where they differ, the Runbook wins.*

### Per-Module Steps (~60-90 seconds each)

| Step | Action | Notes |
|------|--------|-------|
| 1 | Click **"Create new"** | From NotebookLM homepage |
| 2 | Click **"Copied text"** | In source dialog |
| 3 | Paste source content | Pre-loaded from file |
| 4 | Click **"Insert"** | Wait for processing |
| 5 | Rename notebook | `Cmd+A` on title → Type `F01E07 Mind Path v1.0` |
| 6 | Click **Video Overview → Edit** | Opens Customize dialog |
| 7 | Configure Video Overview | See settings below |
| 8 | Click **"Generate"** | **IMMEDIATELY proceed to next module** |

### Video Overview Settings

**⚠️ CRITICAL: 90-SECOND MAXIMUM DURATION**

When clicking "Generate" for Video Overview:
1. Click the **edit icon (⚙️)** next to the Generate button
2. Select **"Custom"** template option
3. Fill in the two instruction fields below

**Visual Style Prompt:**
```
Bio-luminescent, iridescent pastel gradients on dark background. Organic, alive, breathing aesthetic. Sacred geometry subtle accents.
```

**Focus/Instructions Prompt Template:**
```
Focus on the practical transformation message. [MODULE-SPECIFIC INSTRUCTION]. 

CRITICAL CONSTRAINT: Under no circumstances make this video longer than 90 seconds. Keep it concise, focused, and transformational. Educational but inspiring tone.
```

**Why 90 seconds matters:**
- Micro-learning engagement window
- Prevents verbose explanations that cause dropoff
- Forces clarity and focus
- This is NON-NEGOTIABLE for curriculum quality

### Critical Optimization Rules

1. ❌ **DO NOT** wait for page loads between steps
2. ❌ **DO NOT** take snapshots after every click
3. ✅ **DO** batch-load all source texts before starting
4. ✅ **DO** move to next module immediately after clicking Generate
5. ✅ **DO** only snapshot when something fails

---

## Phase 2: Harvest Videos

After ~15-20 minutes from first generation:

1. Navigate to NotebookLM homepage
2. Open each notebook with completed video
3. Click **Video Overview** → **Download**
4. Save with naming convention: `F01E04 — Five Paths of Growth — Planetary OS v1.0.mp4`

---

## Phase 3: YouTube Upload

For each video:

1. YouTube Studio → **Create** → **Upload video**
2. Select video file
3. Title: `F01E04 — Five Paths of Growth — Planetary OS v1.0`
4. Description: Module summary + course link
5. Playlist: Add to "Foundational Training" (create if needed)
6. Visibility: **Unlisted** (default; no approval needed, Private is also fine). Public only on Sasha's yes to that video (2026-11-26).

---

## Naming Convention

```
[SEASON][EPISODE] — [Title] — Planetary OS v[VERSION]
```

**Season Codes:**
| Code | Path |
|------|------|
| F01 | Foundational |
| S01 | Spirit |
| M01 | Mind |
| E01 | Emotions |
| B01 | Body |
| G01 | Genius |

**Examples:**
- `F01E04 — Five Paths of Growth — Planetary OS v1.0`
- `S01E03 — Character Development — Planetary OS v1.0`

---

## Optimization History

### v1.0 (Initial)
- Serial processing: ~9 min/module
- Snapshot after every action
- Wait for page loads

### v1.1 (Optimized)
- Target: ~60-90 sec/module
- No snapshots between steps
- Batch source loading
- Immediate proceed after Generate

### Runbook (2026-11-26)
- Sasha's 8 actions written down verbatim with the relevance sort (§Runbook above)
- Notebook name carries the course version
- Measure minutes and tool calls per module

### v1.2 (Proposed - Next Level)
See "Future Optimizations" section below.

---

## v1.2 Optimizations (Next Level)

### 1. Multi-Tab Parallel Processing

**Concept:** Open 3-4 NotebookLM tabs simultaneously, rotate through them.

**Implementation:**
```
Tab 1: Creating notebook → Tab 2: Inserting source → Tab 3: Configuring video → Tab 4: Generating
```

**Workflow:**
1. Open 4 new NotebookLM tabs at once
2. In Tab 1: Create notebook, paste source, rename
3. Switch to Tab 2: Same
4. Switch to Tab 3: Same  
5. Switch to Tab 4: Same
6. Return to Tab 1: Configure Video Overview, Generate
7. Cycle continues...

**Effect:** 4x speedup (while one generates, work on 3 others)

---

### 2. Clipboard Pipeline

**Concept:** Pre-format ALL source texts in one file with clear separators.

**File format (`clipboard_batch.txt`):**
```
===MODULE: F01E08 Genius Path Defined v1.0===
GENIUS is our path of showing up in life...
[full module text]
===END===

===MODULE: F01E09 Spirit Path Defined v1.0===
SPIRIT is most easily understood through...
[full module text]
===END===
```

**Workflow:**
1. Open `clipboard_batch.txt` in editor
2. Select text between `===MODULE:` and `===END===`
3. Copy → Paste into NotebookLM
4. Title = line after `===MODULE:`
5. Repeat

**Effect:** No file reads during execution, faster copy-paste

---

### 3. Prepared Prompt Templates

**Style Prompt (constant — copy once, reuse):**
```
Bio-luminescent, iridescent pastel gradients on dark background. Organic, alive, breathing aesthetic. Sacred geometry subtle accents.
```

**Focus Prompts (pre-written per module):**

| Module | Focus Prompt |
|--------|--------------|
| F01E04 | Focus on the five growth paths overview. Explain what each path develops. |
| F01E05 | Focus on what the Body path develops (energy, vitality). |
| F01E06 | Focus on what the Emotions path develops (emotional mastery). |
| F01E07 | Focus on what the Mind path develops (clarity of perception). |
| F01E08 | Focus on what the Genius path develops (authentic self-expression). |
| F01E09 | Focus on the three components of Spirit (awareness, sensitivity, character). |
| F01E10 | Focus on why balanced growth across all paths is optimal. |

**Effect:** No thinking during execution, just paste

---

### 4. Keyboard-First Navigation

**Shortcuts to use:**
- `Cmd+T` — New tab
- `Cmd+W` — Close tab  
- `Cmd+1-9` — Switch between tabs
- `Tab` — Move between fields in dialogs
- `Enter` — Confirm/Submit
- `Cmd+A` — Select all (for renaming title)
- `Cmd+V` — Paste

**Effect:** Fewer mouse movements = faster execution

---

### 5. Sub-Agent Delegation

**When to use:** For batch runs of 10+ modules

**Configuration:**
```
Model: Sonnet (cheaper, fast enough for UI automation)
Task: "Create NotebookLM notebooks and trigger video generation for modules F01E08-F01E10. Follow workflow in docs/04-workflows/notebooklm_video_production.md"
```

**Effect:** Main session free, lower token cost, parallel work possible

---

### 6. Batch Harvest + Upload

**Concept:** Don't harvest one-by-one. Wait for ALL videos to complete, then batch download.

**Workflow:**
1. Generate all 10 videos (Phase 1)
2. Wait 20-25 minutes
3. Open first notebook → Download → Don't close tab
4. Open second notebook in new tab → Download
5. Continue until all downloaded
6. YouTube: Upload multiple files at once (YouTube allows multi-select)

**Effect:** Less context switching, faster total time

---

## Metrics

| Metric | v1.0 | v1.1 Target | v1.2 Target |
|--------|------|-------------|-------------|
| Time per module | ~9 min | ~90 sec | ~30 sec |
| Modules per hour | ~7 | ~40 | ~120 |
| Token cost | High | Medium | Low |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tab disconnected | `browser:tabs` → get new targetId |
| Source not inserted | Re-paste, ensure dialog is open |
| Video generation stuck | Refresh notebook, retry |
| Wrong visual style | Re-open customize, select Custom again |

---

## Related Documents

- [VIDEO_PRODUCTION_PLAN.md](../08-content/VIDEO_PRODUCTION_PLAN.md) — Master checklist
- [brandbook.md](../05-reference/brandbook.md) — Bio-Light aesthetic reference
- [micro_module_curriculum.md](../08-content/micro_module_curriculum.md) — Source content
