# Onboarding Architecture Spec

> Applying Software Architecture Playbook to Onboarding Module

---

## Phase 1: Module Boundaries

### Modules (from Product Playbook)

| Module | Master Result | Screens |
|--------|---------------|---------|
| **Onboarding** | "I don't know what to do" → "I know my genius + baseline + next step" | 11 |
| ↳ ZoG Assessment | Discover Zone of Genius | 5 (shared) |
| ↳ QoL Assessment | Map Quality of Life baseline | 3 (shared) |

### Entry/Exit Points

| Module | Entry Points | Exit Points |
|--------|--------------|-------------|
| Onboarding | `/start`, redirect from `/game` (if incomplete) | `/game` |
| ZoG Assessment | From Onboarding step 2, or `/zone-of-genius/entry` | Return to `/start` or `/game` |
| QoL Assessment | From Onboarding step 4, or `/quality-of-life-map/assessment` | Return to `/start` or `/game` |

### Data In/Out

| Module | Data In (requires) | Data Out (produces) |
|--------|-------------------|---------------------|
| Onboarding | `user.id`, `profile.id` | `onboarding_completed`, `onboarding_step` |
| ZoG | `profile.id` | `zog_snapshot`, `profile.last_zog_snapshot_id` |
| QoL | `profile.id` | `qol_snapshot`, `profile.last_qol_snapshot_id` |

---

## Phase 2: Routing

### Route Map

```
/start              → OnboardingPage (auth required, no shell)
                        ↓
                    OnboardingFlow (state machine)
                        ↓
                    [step 0] WelcomeScreen
                    [step 1] ZoGIntroScreen
                    [step 2] → /zone-of-genius/entry?return=/start
                    [step 3] ZoGRevealScreen (after return)
                    [step 4] QoLIntroScreen
                    [step 5] → /quality-of-life-map/assessment?return=/start
                    [step 6] QoLRevealScreen (after return)
                    [step 7] TourOverviewScreen
                    [step 8] TourCompleteScreen
                        ↓
                    /game
```

### Route Hierarchy

| Route | Pattern | Why |
|-------|---------|-----|
| `/start` | Flat | Single entry point |
| `/zone-of-genius/*` | Nested | Multi-step wizard, own flow |
| `/quality-of-life-map/*` | Nested | Multi-step wizard, own flow |

### Guards & Redirects

| Route | Guard | Redirect If Fail |
|-------|-------|------------------|
| `/start` | Auth required | → `/auth?mode=signup&redirect=/start` |
| `/game` | Auth + onboarding | → `/start` if not completed |

---

## Phase 3: Data Schema (Existing)

### Already Exists ✅

```sql
game_profiles (
    id uuid,
    user_id uuid,
    onboarding_step int,          -- Current step (0-8)
    onboarding_completed bool,    -- Flow complete flag
    onboarding_stage text,        -- 'new', 'zog_started', 'zog_complete', 'qol_complete', 'unlocked'
    last_zog_snapshot_id uuid,    -- Latest ZoG result
    last_qol_snapshot_id uuid,    -- Latest QoL result
    zone_of_genius_completed bool
)

zog_snapshots (
    id uuid,
    profile_id uuid,
    archetype_title text,
    core_pattern text,
    top_three_talents text[]
)

qol_snapshots (
    id uuid,
    profile_id uuid,
    created_at timestamp,
    wealth_stage int,
    health_stage int,
    ...
)
```

### No New Tables Needed ✅

---

## Phase 4: Shell & Layout

### Shell Rules

| Route | Shell | Why |
|-------|-------|-----|
| `/start` | **None** | Immersive onboarding |
| `/zone-of-genius/*` | **None** | Focus mode |
| `/quality-of-life-map/*` | **None** | Focus mode |
| `/game` | **GameShellV2** | Main app |

### Focus Mode Behavior

When in onboarding/assessments:
- No navigation bar
- Full-screen content
- Single exit (complete or back)
- Progress indicator visible

---

## Phase 5: State Management

### What Persists

| Data | Persistence | Location |
|------|-------------|----------|
| Current step | Long-term | `game_profiles.onboarding_step` |
| Completion flag | Long-term | `game_profiles.onboarding_completed` |
| Stage | Long-term | `game_profiles.onboarding_stage` |
| ZoG result | Long-term | `zog_snapshots` |
| QoL result | Long-term | `qol_snapshots` |
| Return URL | Session | URL query `?return=/start` |

### Resume Logic

```
User arrives at /start:
    1. Check auth → no auth → redirect to /auth?redirect=/start
    2. Fetch game_profile
    3. If onboarding_completed → redirect to /game
    4. Determine step from:
        - If has QoL → step 6
        - If has ZoG → step 3
        - Else → use onboarding_step from DB
    5. Render OnboardingFlow at correct step
```

---

## Phase 6: Roast & Verify

### Transition Checklist

| From | To | Works? |
|------|----|--------|
| `/` | `/start` (via CTA) | ✅ |
| `/auth` | `/start` (after login) | ✅ |
| `/start` | `/zone-of-genius/entry` | ✅ |
| ZoG complete | back to `/start` | ⚠️ Need to verify |
| `/start` | `/quality-of-life-map/assessment` | ✅ |
| QoL complete | back to `/start` | ⚠️ Need to verify |
| `/start` | `/game` (onComplete) | ✅ |
| `/game` | `/start` (if not completed) | ✅ |

### Edge Cases

| Case | Expected | Status |
|------|----------|--------|
| Refresh at step 3 | Resume step 3 | ✅ (persisted in DB) |
| Back from ZoG mid-flow | Return to onboarding | ⚠️ Test |
| Deep link `/start` (new user) | Auth → onboarding | ✅ |
| Already completed | Redirect to /game | ✅ |

---

## Implementation Checklist

- [x] OnboardingPage created (auth wrapper)
- [x] OnboardingFlow with step state machine
- [x] Screen components built (10/11)
- [ ] Wire ZoG return → advance to step 3
- [ ] Wire QoL return → advance to step 6
- [ ] Test full flow end-to-end
- [ ] Verify resume logic works
