# Task: Genius Growth Path UI

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

The Genius Growth Path shows the journey:
1. Zone of Genius (Appleseed) ✓
2. Unique Genius Offering (Excalibur) ✓
3. Genius Business (future)
4. Genius Ecosystem (future)

Need a visual representation of this progression.

---

## What to Build

### 1. GeniusGrowthPath component

**File:** `src/modules/genius-path/GeniusGrowthPath.tsx`

Visual progression showing:
- Current stage (highlighted)
- Completed stages (checkmarks)
- Future stages (locked/grayed)

### 2. Integration with profile data

Check if user has:
- appleseed_data → Stage 1 complete
- excalibur_data → Stage 2 complete

### 3. Add to CharacterHub or Profile

Show the path in the profile section.

---

## UI Mockup

```
═══════════════════════════════════════════
  Genius Growth Path
═══════════════════════════════════════════

  ✓ Zone of Genius          [VIEW]
    "Architect of Integration Codes"
    ─────────────────
           │
           ▼
  ◯ Unique Genius Offering  [CREATE]
    Craft your Excalibur
    ─────────────────
           │
           ▼
  🔒 Genius Business
    Coming soon...
    ─────────────────
           │
           ▼
  🔒 Genius Ecosystem
    Build your world
```

---

## Success Criteria

- [ ] Shows current progress visually
- [ ] Links to Appleseed/Excalibur view
- [ ] Locks future stages
- [ ] Mobile responsive

---

## When Done

Rename to `DONE_genius_growth_path.md`
