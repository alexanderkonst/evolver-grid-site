# Software Architecture

> The missing layer between User Journey and UI Code.

---

## Current State Analysis

### 🔴 Critical Issue Found

**Current `/start` route:**
```
/start → /auth → /zone-of-genius/entry
```

**Problem:** This BYPASSES `OnboardingFlow` and our new intro screens!

**Should be:**
```
/start → /auth → OnboardingPage → [Welcome → ZoG Intro → ZoG → QoL Intro → QoL → Tour → Home]
```

---

## Route Architecture

### Three Zones

| Zone | Routes | Has Shell? | Auth Required? |
|------|--------|------------|----------------|
| **Public** | `/`, `/library`, `/contact`, `/mens-circle` | No | No |
| **Auth** | `/auth`, `/auth/reset-password` | No | No |
| **Game** | `/game/*` | Yes (3 panels) | Yes |
| **Modules** | `/zone-of-genius/*`, `/quality-of-life-map/*`, `/product-builder/*` | No (full screen) | Yes |

### Module Routes (No Shell)

These run full-screen without navigation panels:

```
/zone-of-genius/entry       → AI prompt import intro
/zone-of-genius/assessment  → 5-step manual assessment
/quality-of-life-map/*      → QoL assessment flow
/product-builder/*          → Product builder wizard
/mission-discovery/*        → Mission discovery wizard
```

### Game Routes (With Shell)

These show inside the 3-panel game shell:

```
/game                       → GameHome (main hub)
/game/profile               → Character Profile
/game/transformation        → Growth paths & practices
/game/marketplace           → Guides marketplace
/game/teams                 → Discover (matchmaking)
/game/events                → Community events
/game/coop                  → Business incubator
```

---

## Onboarding Flow Architecture

### Current Implementation

**OnboardingStart.tsx** (`/start` after auth):
- Fetches/creates game_profile
- Checks: `onboarding_step`, `last_zog_snapshot_id`, `last_qol_snapshot_id`
- Renders `OnboardingFlow` with state

**OnboardingFlow.tsx** (step machine):
- Step 0: WelcomeScreen ✅
- Step 1: ZoGIntroScreen ✅  
- Step 2: AI Choice (card layout)
- Step 3: ZoG Complete marker
- Step 4: QoLIntroScreen ✅
- Step 5: TourOverviewScreen ✅

**External Modules** (called via navigate):
- `/zone-of-genius/entry?return=/start` — AI import path
- `/zone-of-genius/assessment?return=/start` — Manual path  
- `/quality-of-life-map/assessment?return=/start` — QoL flow

**Return Logic** (`onboardingRouting.ts`):
- After ZoG → auto-redirect to QoL
- After QoL → return to `/start` (OnboardingFlow step 5)

### 🔴 Problem: Route Mismatch

**In App.tsx (line 163):**
```tsx
<Route path="/start" element={<Navigate to="/auth?mode=signup&redirect=/zone-of-genius/entry" replace />} />
```

This redirects to ZoG directly, **skipping OnboardingFlow**.

**But we also have OnboardingStart.tsx** which is supposed to render OnboardingFlow.

**Question:** Is OnboardingStart even mounted anywhere?

---

## Recommended Fix

### Option A: Fix /start Route (Recommended)

Change App.tsx line 163 from:
```tsx
<Route path="/start" element={<Navigate to="/auth?mode=signup&redirect=/zone-of-genius/entry" replace />} />
```

To:
```tsx
<Route path="/start" element={<OnboardingStart />} />
```

And wrap OnboardingStart with auth check (redirect to `/auth` if not logged in).

### Option B: New Onboarding Route

Add new route:
```tsx
<Route path="/onboarding" element={<OnboardingStart />} />
```

And change `/start` to redirect to `/auth?redirect=/onboarding`.

---

## State Management

### Where Data Lives

| Data | Storage | Key |
|------|---------|-----|
| Auth state | Supabase Auth | session |
| Game profile | Supabase `game_profiles` | `id` |
| Onboarding progress | Supabase `game_profiles` | `onboarding_step`, `onboarding_completed` |
| ZoG snapshot | Supabase `zog_snapshots` | `last_zog_snapshot_id` |
| QoL snapshot | Supabase `qol_snapshots` | `last_qol_snapshot_id` |

### Resume Logic

When user returns to `/start`:
1. Check `onboarding_completed` → if true, go to `/game`
2. Check `last_qol_snapshot_id` → if exists, step 5
3. Check `last_zog_snapshot_id` → if exists, step 3
4. Check `onboarding_step` → resume from that step
5. Default → step 0 (Welcome)

---

## Shell Logic

### When to Show Panels

| Route Pattern | Show Shell? | Reason |
|---------------|-------------|--------|
| `/game/*` | ✅ Yes | Inside game world |
| `/zone-of-genius/*` | ❌ No | Focus mode for assessment |
| `/quality-of-life-map/*` | ❌ No | Focus mode for assessment |
| `/start` or `/onboarding` | ❌ No | Pre-game onboarding |

---

## Next Actions

1. [ ] Fix `/start` route to use OnboardingStart
2. [ ] Add auth guard to OnboardingStart
3. [ ] Verify OnboardingFlow → ZoG → QoL → OnboardingFlow return path
4. [ ] Test full flow

