# Task: Mission Discovery UX Overhaul

**Assigned to:** Claude CLI  
**Priority:** High  
**Created:** 2026-01-10

---

## Context

The Mission Discovery flow needs major UX improvements. Currently:
- Back button goes to main game screen instead of mission list
- Wizard shows too much info that users can accidentally click
- All missions appear equal (no holonic hierarchy)
- Commit flow is cluttered on one screen

---

## What to Build

### 1. Fix Back Button Navigation

**File:** `src/modules/mission-discovery/MissionDiscoveryWizard.tsx`

Back button should go to the mission match list, not to `/game`.

### 2. Make Wizard Read-Only

When viewing mission details:
- Add gray overlay or `pointer-events-none` to prevent clicking
- Only two actionable buttons: "Commit" and "Back"
- Add subtle glow around these buttons

```tsx
<div className="relative">
  {/* Mission content with pointer-events-none */}
  <div className="pointer-events-none opacity-75">
    {/* existing mission details */}
  </div>
  
  {/* Action buttons with glow */}
  <div className="relative z-10">
    <Button className="ring-2 ring-green-400/50 ring-offset-2">
      Commit and Add to my profile
    </Button>
    <Button variant="outline">
      Back to mission list
    </Button>
  </div>
</div>
```

### 3. Two-Button Design on Match Results

For each matched mission, show two buttons:

1. **"Commit and Add to my profile"**
   - Green color
   - Subtle glow
   - Goes directly to commit flow

2. **"Learn more about this mission"**
   - No glow, outline style
   - Opens read-only wizard view

### 4. Holonic Mission Flow (Two Screens)

**Screen 1: Higher-Level Mission**
- Show 3 top-level mission matches
- Each has Commit + Learn More buttons
- When user commits, move to Screen 2

**Screen 2: Sub-Missions**
- Show missions that nest under chosen higher-level mission
- Same Commit + Learn More pattern
- Can select multiple sub-missions

### 5. Multi-Step Commit Flow

After clicking "Commit":

**Step 1: "You committed to this mission!"**
- Show mission title prominently
- Celebratory moment

**Step 2: "Would you like to connect with others on this same mission?"**
- Show checkboxes (existing ones)
- If any checked, show notification option

**Step 3: "Would you like to be notified when someone new commits to this mission?"**
- Notification opt-in checkbox

**Step 4: "Would you like to add sub-missions that contribute to this mission?"**
- Two buttons:
  - "Yes, add related sub-missions" → go to sub-mission selection
  - "Not now, thank you" → complete flow

---

## Files to Modify

- `src/modules/mission-discovery/MissionDiscoveryWizard.tsx`
- `src/modules/mission-discovery/MissionDiscoveryLanding.tsx`
- May need new components for multi-step commit flow

---

## Success Criteria

- [ ] Back button returns to mission list (not /game)
- [ ] Wizard content is read-only (can't click categories)
- [ ] Commit and Back buttons have glow effect
- [ ] Mission cards have two buttons: Commit + Learn More
- [ ] Higher-level mission selected first
- [ ] Commit flow is multi-step
- [ ] Sub-missions offered after main mission commit

---

## When Done

Rename this file to `DONE_mission_ux_overhaul.md`
