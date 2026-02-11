# Video Regeneration Script

Automated script to regenerate all 35 NotebookLM videos with 90-second duration constraint.

## Prerequisites

✅ Installed (already done):
- Node.js  
- Playwright

## Usage

### Run the script:

```bash
cd /Users/alexanderkonst/evolver-grid-site
node scripts/regenerate_videos.js
```

### What it does:

1. Opens Chrome browser (non-headless so you can monitor)
2. Navigates to NotebookLM
3. For each of 35 modules (F01E05-G01E06):
   - Opens the notebook
   - Clicks "Video Overview" → Customize
   - Selects "Custom" visual style
   - Fills in Bio-Light aesthetic prompt
   - Fills in module-specific focus instructions + 90s constraint
   - Clicks "Generate"
   - Returns to homepage immediately (parallel generation)
   - Updates tracker file
4. Reports progress every 10 modules
5. Generates final summary

### Timeline:

- **Setup:** ~60-90 minutes (all 35 triggers)
- **Generation:** ~15-20 minutes (parallel, after all triggered)
- **Total:** ~90-110 minutes from start to videos ready

### Monitoring:

- Watch the browser window to see progress
- Console shows detailed logging
- Progress updates every 10 modules
- Tracker file (`notebooklm_sources/VIDEO_REGENERATION_90S.md`) updates in real-time

### If something fails:

- Script continues to next module (doesn't stop)
- Failed modules marked in tracker with ❌
- Screenshots saved to `/tmp/[CODE]_error.png`
- Re-run script to retry failed modules

### After completion:

Videos will finish generating ~15-20 minutes after last trigger.  
Next step: Phase 2 (download videos) - separate script or manual process.

## Technical Details

- **Browser:** Uses installed Chrome via Playwright
- **Headless:** Set to `false` (visible browser) - change in script if needed
- **Selectors:** Text-based (robust to UI changes)
- **Error handling:** Continues on failure, logs errors
- **State:** Updates tracker file after each module

## Notes

- Make sure you're logged into NotebookLM (Google account) before running
- Script will pause and ask you to log in if not authenticated
- Keep browser window visible to monitor progress
- Don't close the browser manually while script is running

---

**Created:** 2026-02-11  
**Part of:** Video Regeneration Project (90s Constraint)
