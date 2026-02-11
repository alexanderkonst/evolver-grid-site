# Video Regeneration Project Plan (90s Constraint)

**Created:** 2026-02-11  
**Objective:** Regenerate all 36 NotebookLM videos with 90-second maximum duration constraint, download, and upload to YouTube.

---

## Task Breakdown (Atomic Level)

### Phase 1: Video Regeneration (NotebookLM)
**Location:** https://notebooklm.google.com/  
**Dependencies:** None (can start immediately)  
**Parallelization:** HIGH (all 36 can generate simultaneously)

**Per-Module Tasks (36x):**
1. Navigate to NotebookLM homepage
2. Click on notebook `[CODE]E[NUM] — [Title] — Planetary OS v1.0`
3. Click "Video Overview" edit button (⚙️)
4. Select "Custom" visual style (if not already selected)
5. Click "Describe a custom visual style" textbox
6. Paste visual style prompt (see templates below)
7. Click "What should the AI hosts focus on?" textbox
8. Paste focus instructions with 90s constraint (module-specific)
9. Click "Generate" button
10. **IMMEDIATELY** navigate back to homepage (DO NOT WAIT)
11. Log completion in tracker
12. Proceed to next module

**Time Estimate:** 60-90 seconds per module  
**Total Setup Time:** 54-90 minutes for all 36  
**Video Generation Time:** 15-20 minutes (parallel, starts after trigger)

---

### Phase 2: Video Download & Verification
**Location:** https://notebooklm.google.com/ + ~/Downloads/  
**Dependencies:** Videos must finish generating (wait 15-20 min after last trigger)  
**Parallelization:** MEDIUM (can download in batches while others generate)

**Per-Video Tasks (36x):**
1. Navigate to NotebookLM homepage
2. Click on notebook
3. Verify video is complete (look for video player, not "generating")
4. **CHECK DURATION:** Must be ≤90 seconds (max 2 minutes acceptable)
5. If too long → mark for re-regeneration, skip to next
6. Click on video in Studio panel
7. Click "More" (⋮) → "Download"
8. Wait for download to complete (~5-10 seconds)
9. Navigate to ~/Downloads/
10. Rename file from UUID to: `[CODE]E[NUM] — [Title] — Planetary OS v1.0.mp4`
11. Move to organized folder (e.g., `~/Downloads/planetary_os_videos/`)
12. Log completion in tracker
13. Proceed to next video

**Time Estimate:** 30-60 seconds per video  
**Total Time:** 18-36 minutes for all 36

**ROLLING START:** Can begin downloading first batch (e.g., F01E04-F01E10) ~20 minutes after they were triggered, while continuing to trigger later batches.

---

### Phase 3: YouTube Upload
**Location:** https://studio.youtube.com/  
**Dependencies:** Videos must be downloaded and renamed  
**Parallelization:** MEDIUM (can upload while others download)

**Per-Video Tasks (36x):**
1. Navigate to YouTube Studio: https://studio.youtube.com/
2. Click "Create" → "Upload videos"
3. Click "Select files" or drag-drop
4. Select video file: `[CODE]E[NUM] — [Title] — Planetary OS v1.0.mp4`
5. Wait for upload progress (varies by file size, ~30-60 sec)
6. **Title field:** `[CODE]E[NUM] — [Title] — Planetary OS v1.0`
7. **Description field:** [Module summary + course link - see template below]
8. **Playlist:** Select/create appropriate playlist:
   - "Foundational Training" (F01)
   - "Spirit Path" (S01)
   - "Mind Path" (M01)
   - "Emotions Path" (E01)
   - "Body Path" (B01)
   - "Genius Path" (G01)
9. **Visibility:** Select "Unlisted"
10. Click "Next" (3x through Details → Video elements → Checks → Visibility)
11. Click "Publish"
12. Copy YouTube URL
13. Log URL in VIDEO_URLS.md tracker
14. Proceed to next video

**Time Estimate:** 2-3 minutes per video  
**Total Time:** 72-108 minutes for all 36

**ROLLING START:** Can begin uploading first batch as soon as they're downloaded (~25-30 min after project start).

---

## Dependency Map

```
Phase 1: Regenerate All (parallel)
  ├─ F01E04 → generating (15-20 min) ──┐
  ├─ F01E05 → generating (15-20 min) ──┤
  ├─ ... (34 more)                     │
  └─ G01E06 → generating (15-20 min) ──┘
                                        │
                                        ↓
Phase 2: Download & Verify (rolling batches)
  ├─ Batch 1 (F01) → download → rename ──┐
  ├─ Batch 2 (S01) → download → rename ──┤
  ├─ ... (4 more batches)                │
  └─ Batch 6 (G01) → download → rename ──┘
                                          │
                                          ↓
Phase 3: Upload to YouTube (rolling batches)
  ├─ Batch 1 (F01) → upload → log URL ──┐
  ├─ Batch 2 (S01) → upload → log URL ──┤
  ├─ ... (4 more batches)                │
  └─ Batch 6 (G01) → upload → log URL ──┘
```

**Critical Path:** Phase 1 must complete setup before Phase 2 can start downloading. But within phases, tasks can overlap significantly.

**Optimal Execution:**
- **T+0 min:** Start Phase 1 (trigger all 36 regenerations)
- **T+20 min:** First batch ready → Start Phase 2 (download first 7)
- **T+25 min:** First videos downloaded → Start Phase 3 (upload first batch)
- **T+54-90 min:** Phase 1 complete (all triggered)
- **T+110-160 min:** All phases complete

---

## Sub-Agent Allocation Strategy

### Option A: Sequential (Simple but Slower)
**1 sub-agent does all 3 phases sequentially**
- Pro: Simple coordination
- Con: No parallelization, longest total time
- Token cost: High (one long session)

### Option B: Parallel Phases (Better)
**Main session: Phase 1**
**Sub-agent 1: Phase 2 (downloads)**
**Sub-agent 2: Phase 3 (uploads)**
- Pro: True parallelization, faster completion
- Con: Requires coordination between agents
- Token cost: Medium (distributed across 3 sessions)

### Option C: Batched Hybrid (Optimal)
**Main session: Phase 1 (all 36 triggers) + orchestration**
**Sub-agent (Sonnet): Phases 2+3 for batches as they're ready**
- Pro: Best balance of speed + token efficiency
- Con: Main session must monitor + spawn sub-agents for each batch
- Token cost: Low (main session quick, sub-agents use cheaper Sonnet)

### **RECOMMENDED: Option C (Batched Hybrid)**

**Execution Plan:**
1. **Main session (you):** Execute Phase 1 (trigger all 36 regenerations)
2. **Spawn Sub-Agent 1 (Sonnet):** 
   - Task: "Download and rename videos from Batch 1 (F01E04-F01E10) when ready, then upload to YouTube. See VIDEO_REGENERATION_90S.md for details."
   - Trigger: After 20 minutes (when first batch is ready)
3. **Spawn Sub-Agent 2 (Sonnet):**
   - Task: "Download and rename videos from Batch 2 (S01E01-S01E10) when ready, then upload to YouTube."
   - Trigger: After 30 minutes
4. Continue pattern for remaining batches (M01, E01, B01, G01)

**Token Optimization:**
- Main session: ~60-90 min of UI automation (Phase 1 only)
- Each sub-agent: ~30-45 min (download 1 batch + upload)
- Total: 1 main + 6 sub-agents (or fewer if we batch larger)

---

## Templates

### Visual Style Prompt (constant for all 36)
```
Bio-luminescent, iridescent pastel gradients on dark background. Organic, alive, breathing aesthetic. Sacred geometry subtle accents.
```

### Focus Instructions Template
```
Focus on the practical transformation message. [MODULE_SPECIFIC_INSTRUCTION]

CRITICAL CONSTRAINT: Under no circumstances make this video longer than 90 seconds. Keep it concise, focused, and transformational. Educational but inspiring tone.
```

### Module-Specific Instructions
See `VIDEO_REGENERATION_90S.md` for complete list (36 entries).

### YouTube Description Template
```
[Module summary in 2-3 sentences]

This is part of the Planetary Operating System micro-learning curriculum.

Learn more: https://evolver.world/learn

#PlanetaryOS #HumanDevelopment #TransformationalLearning
```

---

## Execution Checklist

### Pre-Flight
- [ ] Verify logged into NotebookLM (Google account)
- [ ] Verify logged into YouTube Studio
- [ ] Confirm browser profile: `openclaw`
- [ ] Create download destination folder: `~/Downloads/planetary_os_videos/`
- [ ] Review VIDEO_REGENERATION_90S.md (module list + instructions)

### Phase 1 Execution (Main Session)
- [ ] Open NotebookLM homepage
- [ ] For each of 36 modules:
  - [ ] Open notebook
  - [ ] Click Video Overview edit
  - [ ] Select Custom visual style
  - [ ] Paste visual style prompt
  - [ ] Paste focus instructions (module-specific)
  - [ ] Click Generate
  - [ ] Navigate back to homepage immediately
  - [ ] Mark in tracker: "⏳ Regenerating"
- [ ] All 36 triggered → Phase 1 COMPLETE
- [ ] Wait 20 minutes for first batch to generate

### Phase 2 Execution (Sub-Agents or Main)
- [ ] For each batch when ready:
  - [ ] Verify videos are complete (not "generating")
  - [ ] Check duration ≤90 seconds (flag if >2 min)
  - [ ] Download videos
  - [ ] Rename to convention
  - [ ] Move to organized folder
  - [ ] Mark in tracker: "📥 Downloaded"

### Phase 3 Execution (Sub-Agents or Main)
- [ ] For each downloaded video:
  - [ ] Upload to YouTube Studio
  - [ ] Fill title, description, playlist
  - [ ] Set visibility: Unlisted
  - [ ] Publish
  - [ ] Copy YouTube URL
  - [ ] Log in VIDEO_URLS.md
  - [ ] Mark in tracker: "✅ Uploaded"

### Post-Flight
- [ ] Verify all 36 videos uploaded
- [ ] Check VIDEO_URLS.md has all 36 URLs
- [ ] Verify playlists organized correctly
- [ ] Update MEMORY.md with completion
- [ ] Clean up ~/Downloads/ (move/archive videos)

---

## Risk Mitigation

**Risk 1:** Video still too long (>90s)
- **Mitigation:** Check duration before download. If >2 min, mark for re-regeneration with even stricter instructions.

**Risk 2:** Download fails (browser issue)
- **Mitigation:** Use regular Chrome browser if openclaw profile has issues (per 2026-02-07 notes).

**Risk 3:** YouTube upload slow/fails
- **Mitigation:** Upload in smaller batches, verify each before proceeding.

**Risk 4:** Sub-agent loses context
- **Mitigation:** Each sub-agent task is self-contained with reference to VIDEO_REGENERATION_90S.md.

**Risk 5:** Token budget exceeded
- **Mitigation:** Use Sonnet for sub-agents (cheaper), keep tasks focused.

---

## Success Metrics

- **Completion:** All 36 videos regenerated, downloaded, uploaded
- **Duration:** All videos ≤90 seconds (max 2 min acceptable)
- **Quality:** Bio-Light aesthetic maintained, clear focus
- **Organization:** Proper naming, playlists, unlisted visibility
- **Documentation:** All URLs logged, tracker updated

---

## Next Steps

1. **Review this plan** with Aleksandr
2. **Get approval** before execution
3. **Execute Phase 1** (main session triggers all 36)
4. **Spawn sub-agents** for Phases 2+3 (batched)
5. **Monitor progress** and adjust as needed
6. **Complete documentation** when finished
