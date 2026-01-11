# Task: Mission Selection Flow

**Assigned to:** Codex  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Users need to declare their Mission. This is core to:
- Matchmaking (find people on same mission)
- Directory filtering
- Identity clarity

---

## What to Build

### 1. Mission Selection Modal/Page

**Route:** `/game/mission` or modal in Profile

**Flow:**
```
Step 1: Choose Mission Pillar (6 options)
  → Regenerative Earth
  → Conscious Culture
  → Thriving Economy
  → Holistic Wellbeing
  → Evolutionary Governance
  → Unified Humanity

Step 2: Choose Focus Area (varies by pillar)
  → e.g., "Regenerative Food" under Regenerative Earth

Step 3: (Optional) Describe your specific mission
  → Free text: "I'm building..."

Step 4: Save
```

### 2. Mission Display in Profile

Show in CharacterHub:
```
┌─────────────────────────────────────────┐
│  🎯 My Mission                          │
│                                         │
│  Pillar: Regenerative Earth             │
│  Focus: Regenerative Food               │
│                                         │
│  "Building local food sovereignty       │
│   through community gardens"            │
│                                         │
│  [Edit]                                 │
└─────────────────────────────────────────┘
```

### 3. Database

Check if mission fields exist (likely in game_profiles):
```sql
mission_pillar_id UUID
mission_focus_area_id UUID
mission_description TEXT
```

### 4. Data Source

Reference tables exist:
- `mission_pillars`
- `mission_focus_areas`

---

## Success Criteria

- [ ] User can select Mission Pillar
- [ ] User can select Focus Area
- [ ] Optional description saved
- [ ] Mission shows in Profile
- [ ] Used in matchmaking filters

---

## When Done

Rename to `DONE_mission_selection.md`
