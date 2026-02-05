# My Next Move — Architecture Spec

> **Module:** My Next Move  
> **Route:** `/game/next-move`

---

## 2.1 MODULE BOUNDARIES

### Entry Points

| Entry | From | Context |
|-------|------|---------|
| `/game/next-move` | SpacesRail, Navigation | Main entry — default home |
| `/game` | Direct URL | Redirects to `/game/next-move` |
| Post-onboarding | OnboardingPage | After completing onboarding flow |
| Post-module completion | Any module | Returns here after completing action |

### Exit Points

| Exit | To | Trigger |
|------|-----|---------|
| Start Action | Recommended module (ZoG, QoL, etc.) | User taps "Start Now" |
| Explore | SpacesRail expanded | User taps "Explore" |
| Settings | `/game/settings` | User taps settings icon |
| Profile details | `/game/grow` | User taps avatar/profile section |

### Data In

| Data | Source | Required? |
|------|--------|-----------|
| `game_profile` | Supabase | ✅ Yes |
| `zog_snapshots` | Supabase | Optional (may not exist) |
| `qol_scores` | Supabase | Optional (may not exist) |
| `user_assets` | Supabase | Optional (may not exist) |
| `mission_statement` | Supabase | Optional (may not exist) |
| `completed_actions` | Supabase | Optional (may be empty) |
| `xp_events` | Supabase | For XP calculation |

### Data Out

| Data | Destination | Trigger |
|------|-------------|---------|
| `recommendation_shown` | Analytics/Supabase | When recommendation displayed |
| `recommendation_clicked` | Analytics/Supabase | When user starts action |
| `completed_action` | Supabase | When module completed |
| `xp_awarded` | Supabase | On action completion |

---

## 2.2 ROUTING

### Route Map

| Route | Component | Purpose |
|-------|-----------|---------|
| `/game/next-move` | `CoreLoopHome` | Main hub screen |
| `/game` | Redirect → `/game/next-move` | Legacy/shortcut |

### Route Hierarchy

```
/game
  └── /next-move (main hub, home of Daily Loop)
```

### Guards

| Route | Guard | Action if Fail |
|-------|-------|----------------|
| `/game/next-move` | Auth check | Redirect to `/auth` |
| `/game/next-move` | Profile exists | Create profile if missing |

### Redirects

| From | To | Condition |
|------|------|-----------|
| `/game` | `/game/next-move` | Always |
| `/today` | `/game/next-move` | Legacy support |
| `/character` | `/game/next-move` | Legacy support |

---

## 2.3 DATA SCHEMA

### Existing Tables Used

```sql
-- game_profiles (exists)
-- Has: user_id, first_name, avatar, level, xp, onboarding_status

-- zog_snapshots (exists)
-- Has: profile_id, perspective data, appleseed_data, excalibur_data

-- qol_assessments (exists)
-- Has: profile_id, domain scores, overall_score

-- user_assets (exists)
-- Has: profile_id, assets array

-- mission_statements (exists)  
-- Has: profile_id, statement text
```

### New Table: recommendation_log

```sql
CREATE TABLE recommendation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES game_profiles(id),
  recommendation_type TEXT NOT NULL, -- 'zog', 'qol', 'resources', 'mission', 'learn', etc.
  recommendation_action TEXT NOT NULL, -- specific action name
  shown_at TIMESTAMPTZ DEFAULT now(),
  clicked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX idx_recommendation_log_profile ON recommendation_log(profile_id);
```

### Recommendation Logic (Pseudo-code)

```typescript
function getNextRecommendation(profile: GameProfile): Recommendation {
  // 1. GROW Phase — Profile Completion
  if (!profile.hasZoG) {
    return { type: 'zog', action: 'Complete Zone of Genius', path: '/zone-of-genius/entry' };
  }
  if (!profile.hasQoL) {
    return { type: 'qol', action: 'Complete Quality of Life Map', path: '/quality-of-life-map/assessment' };
  }
  if (!profile.hasResources) {
    return { type: 'resources', action: 'Map Your Resources', path: '/asset-mapping' };
  }
  if (!profile.hasMission) {
    return { type: 'mission', action: 'Discover Your Mission', path: '/mission-discovery' };
  }
  
  // 2. LEARN Phase — Ongoing (default)
  return getLearnRecommendation(profile);
}

function getLearnRecommendation(profile: GameProfile): Recommendation {
  // Priority: unfinished paths > library > skill trees
  if (profile.activeGrowthPath) {
    return { type: 'learn', action: 'Continue Growth Path', path: `/game/learn/path/${profile.activeGrowthPath}` };
  }
  return { type: 'learn', action: 'Explore Practice Library', path: '/game/learn/library' };
}
```

---

## 2.4 SHELL & LAYOUT

### Navigation Rules

| Context | SpacesRail | SectionsPanel |
|---------|------------|---------------|
| `/game/next-move` | ✅ Visible | ❌ Hidden (no sub-sections) |
| Mobile | Collapsed (icons only) | Hidden |
| Desktop | Full (icons + labels) | Hidden |

### Focus Mode

My Next Move is NOT focus mode — it shows full navigation because:
- It's the main hub
- User should see all spaces available
- Explore option uses SpacesRail

### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 768px) | Single column, SpacesRail collapsed to icons |
| Tablet (768-1024px) | Single column, SpacesRail with labels |
| Desktop (> 1024px) | SpacesRail + Content area |

---

## 2.5 STATE MANAGEMENT

### What Persists Where

| State | Storage | Reason |
|-------|---------|--------|
| Profile data | Supabase | Source of truth |
| Current recommendation | Computed | Derived from profile state |
| XP/Level | Supabase | Permanent progression |
| Last shown recommendation | Supabase (recommendation_log) | Analytics + prevent repetition |
| UI preferences | localStorage | Device-specific |

### Resume Logic

| Scenario | Behavior |
|----------|----------|
| User refreshes page | Re-fetch profile, re-compute recommendation |
| User returns after hours | Same — stateless, always computes fresh |
| User returns mid-module | Module has its own resume logic |

### Tab/Device Sync

- Profile data syncs via Supabase
- Real-time subscription optional (could add later)
- No critical need for instant sync — data is relatively static

---

## 🔥 ROAST GATE 2: ARCHITECTURE

### Navigation Walkthrough

- [x] User navigates to `/game/next-move`
- [x] If not authenticated → redirect to `/auth`
- [x] If authenticated → load profile + compute recommendation
- [x] User clicks "Start Now" → navigate to recommended module
- [x] User completes module → returns to `/game/next-move`
- [x] CelebrationModal shows → dismiss → updated recommendation

### "What If" Tests

| Scenario | Result |
|----------|--------|
| User clicks Back from module | Module handles it (each module owns its back logic) |
| User refreshes mid-page | Re-loads, re-computes — no lost state |
| Deep link to `/game/next-move` | Works — auth guard, then load |
| Error loading profile | Show error state with retry |

### Roast Findings

**Cycle 1: Routes**
- ✅ Routes are simple: just `/game/next-move`
- ✅ Legacy redirects in place (`/game`, `/today`, `/character`)

**Cycle 2: Data Flow**
- ✅ All data from Supabase
- ✅ Recommendation computed, not stored (except for logging)
- ⚠️ Need to handle case where user has NO profile data at all

**Cycle 3: What Was Missed?**
- ⚠️ Add: New user with zero data should see "Welcome" state
- ✅ Celebration modal is overlay, doesn't need separate route

### Fixes Applied
- Added empty/new user state handling
- Confirmed CelebrationModal as modal, not route

---

**✓ PHASE 2 COMPLETE — Proceed to PHASE 3: UI**
