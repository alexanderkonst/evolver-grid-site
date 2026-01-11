# Task: Privacy Toggles in Profile

**Assigned to:** Claude CLI / Lovable  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Users need control over their profile visibility. Add privacy settings directly in Profile page.

---

## What to Build

### 1. Database Fields

```sql
ALTER TABLE game_profiles ADD COLUMN visibility TEXT DEFAULT 'full';
-- Options: 'hidden', 'minimal', 'medium', 'full'

ALTER TABLE game_profiles ADD COLUMN show_location BOOLEAN DEFAULT true;
ALTER TABLE game_profiles ADD COLUMN show_mission BOOLEAN DEFAULT true;
ALTER TABLE game_profiles ADD COLUMN show_offer BOOLEAN DEFAULT true;
```

### 2. Privacy Box in Profile

Add a "Privacy & Visibility" section in CharacterHub:

```
┌─────────────────────────────────────────┐
│  🔒 Privacy & Visibility                │
│                                         │
│  Profile Visibility:                    │
│  ◉ Hidden (only I can see)              │
│  ○ Minimal (name + archetype only)      │
│  ○ Medium (+ mission, no offer)         │
│  ○ Full (show everything)               │
│                                         │
│  ─────────────────────────────────      │
│                                         │
│  Show my location: [Toggle ✓]           │
│  Show my mission:  [Toggle ✓]           │
│  Show my offer:    [Toggle ✓]           │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Visibility Levels

| Level | What's Shown |
|-------|--------------|
| **hidden** | Nothing. User doesn't appear in any lists or matches. |
| **minimal** | Name + Archetype tagline only |
| **medium** | + Mission, Location (if enabled), QoL summary |
| **full** | + Excalibur offer, all details |

### 4. Matchmaking Impact

- `hidden`: Never shown in match suggestions
- `minimal+`: Can appear in matches

### 5. Real-time Updates

Changes should save immediately (optimistic UI or debounced save).

---

## Success Criteria

- [ ] Privacy box in Profile page
- [ ] Radio buttons for visibility level work
- [ ] Toggle switches for location/mission/offer work
- [ ] Changes persist to database
- [ ] Public profile respects these settings
- [ ] Matchmaking respects visibility

---

## When Done

Rename to `DONE_privacy_toggles.md`
