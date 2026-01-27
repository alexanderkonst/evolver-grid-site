# Daily Loop Architecture Spec

> **Module:** Daily Loop (Game Home)
> **Primary Route:** `/game`
> **Purpose:** Transform screens from product spec into working software

---

## 1. Module Boundaries

### Entry Points

| Entry | Source | Route |
|-------|--------|-------|
| Primary | Bottom nav tap | `/game` |
| Post-onboarding | Onboarding completion | `/game` (redirect) |
| Return from action | Action completion | `/game?completed={actionId}` |
| Deep link | External share | `/game` |

### Exit Points

| Exit | Target | Trigger |
|------|--------|---------|
| Profile | ME section tap | `/game/profile` |
| QoL Details | MY LIFE tap | `/game/transformation/qol-results` |
| Action execution | START button | See Action Routing table |
| Explore library | "Explore more" tap | `/game/transformation/library` |
| Skill Trees | Vector tap | `/game/transformation/paths` |

### Data In

| Data | Source | Required? |
|------|--------|-----------|
| `game_profiles` | Supabase | ✅ Yes |
| `zog_snapshots` | Supabase (via profile.last_zog_snapshot_id) | Optional |
| `qol_snapshots` | Supabase (via profile.last_qol_snapshot_id) | Optional |
| `active_upgrades` | Supabase | For recommendation |
| `upgrade_catalog` | Supabase | For recommendation |

### Data Out

| Data | Destination | When |
|------|-------------|------|
| `action_events` | Supabase | On action start/complete |
| `game_profiles.xp_*` | Supabase | On action complete |
| `active_upgrades` | Supabase | On upgrade complete |

---

## 2. Route + Data Contract

### Route Map

```
/game                     → GameHome.tsx (Daily Loop home)
/game/profile             → ProfileOverview.tsx (ME details)
/game/transformation/qol-results → QoL results (MY LIFE details)
/game/transformation/library     → Practice library (Explore)
/game/transformation/paths       → Growth paths overview
/game/transformation/path/:pathId → Specific growth path
/game/skill-trees/:vector        → Skill tree for vector
```

### Action Routing (from Product Spec)

| Action Type | Target Route | Return Handling |
|-------------|--------------|-----------------|
| Upgrade Step | `/game/transformation/path/{pathId}?step={id}` | Return to `/game` |
| Practice | `/game/transformation/library?practice={id}` | Return to `/game` |
| External Link | New tab OR in-app modal | Manual completion prompt |
| Life Action | In-line checkbox modal | Immediate XP award |
| Profile Step | `/game/profile?section={name}` | Return to `/game` |

### URL Parameters

| Param | Purpose | Example |
|-------|---------|---------|
| `completed` | Trigger celebration on return | `/game?completed=upgrade_123` |
| `return` | Where to go after action | `/game/path/genius?return=/game` |

---

## 3. Shell + State Logic

### Shell Rules

| Route | Shell Visible | Focus Mode |
|-------|---------------|------------|
| `/game` | ✅ Yes | No |
| `/game/profile` | ✅ Yes | No |
| `/game/transformation/*` | ✅ Yes | No |
| `/game/path/:pathId` when in action | ❌ No | Yes |

**Shell:** `GameShellV2` with bottom navigation.

### State Management

| State | Storage | Scope |
|-------|---------|-------|
| Current user | `supabase.auth` | Global |
| Profile data | Supabase + local state | Page-level |
| Celebration | React state | Component-level |
| Next move recommendation | Computed on load | Page-level |
| Completed actions | `active_upgrades` table | Persisted |

### Refresh/Back Behavior

| Scenario | Expected Behavior |
|----------|-------------------|
| Refresh on `/game` | Reload profile + recommendation |
| Back from action | Return to `/game`, show celebration if completed |
| Deep link to `/game` | Auth check → load if authenticated |

---

## 4. Existing Infrastructure (What We Keep)

### GameHome.tsx (1077 lines)

**What exists and works:**

| Feature | Status | Notes |
|---------|--------|-------|
| Profile loading | ✅ Works | Lines 162-240 |
| ZoG/QoL snapshot loading | ✅ Works | Parallel fetch |
| XP/Level celebration | ✅ Works | Lines 186-199 |
| Upgrade recommendation | ✅ Works | `nextRecommendedUpgrade` state |
| Practice suggestions | ✅ Works | `suggestedPractices` state |
| Action completion | ✅ Works | `completeAction` lib |
| Growth path progress | ✅ Works | `growthPathProgress` state |

**What needs work (per Product Spec):**

| Feature | Current State | Target State |
|---------|---------------|--------------|
| ME section | Exists (PlayerStatsBadge) | Simplify to archetype + level |
| MY LIFE section | Exists but complex | 8-domain visual summary |
| MY NEXT MOVE | Multiple cards | ONE recommended action card |
| Empty states | Not defined | Add per product spec |
| Explore link | Exists | Clean up routing |

---

## 5. Recommendation Algorithm Implementation

### Current Algorithm (in `actionEngine.ts`)

```typescript
// Existing: buildRecommendationFromLegacy()
// Uses: growth path progress, completed actions, QoL data
```

### Target Algorithm (v1 — minimal change)

```typescript
// Use existing infrastructure, add domain-based priority
function getNextMove(profile, qolSnapshot, completedActions) {
  // 1. If no QoL → return "Map My Life" action
  if (!qolSnapshot) {
    return { type: 'qol_assessment', title: 'Map My Life' };
  }
  
  // 2. Find lowest domain
  const lowestDomain = findLowestDomain(qolSnapshot);
  
  // 3. Map to vector using existing mapping
  const vector = DOMAIN_TO_VECTOR[lowestDomain];
  
  // 4. Get next unlocked upgrade in that vector
  // Use existing: getUpgradesByBranch() + filter by completed
  const nextUpgrade = findNextInVector(vector, completedActions);
  
  return nextUpgrade || fallbackToExplore();
}
```

### Domain → Vector Mapping (from Product Spec)

```typescript
const DOMAIN_TO_VECTOR: Record<DomainId, string> = {
  wealth: 'genius',
  health: 'body',
  happiness: 'spirit',
  love: 'emotions',
  impact: 'mind',
  growth: 'spirit',  // tie-breaker: Spirit wins
  social: 'emotions',
  home: 'body',
};
```

---

## 6. Implementation Approach

### Strategy: Refactor Not Rebuild

GameHome.tsx has 1077 lines of working code. We will:

1. **Simplify the layout** — reduce sections to ME + MY LIFE + MY NEXT MOVE
2. **Add empty states** — per product spec
3. **Unify recommendation** — use existing infrastructure, add domain priority
4. **Add completion celebration** — enhance existing celebration state

### File Changes

| File | Change Type | Scope |
|------|-------------|-------|
| `GameHome.tsx` | Refactor | Simplify layout, add empty states |
| `lib/actionEngine.ts` | Extend | Add domain-based priority |
| `lib/domainMapping.ts` | New | Domain → Vector constants |
| `components/game/NextMoveCard.tsx` | New | Single action card component |
| `components/game/MeSummary.tsx` | New | Simplified ME section |
| `components/game/MyLifeSummary.tsx` | New | 8-domain visual summary |

---

## 7. Architecture Roast Checklist

Before proceeding to UI Playbook, verify:

- [ ] All entry points work (/game, post-onboarding, return from action)
- [ ] All exit points work (profile, QoL, action, explore)
- [ ] Refresh behavior correct (reloads profile + recommendation)
- [ ] Back navigation correct (returns to /game)
- [ ] Empty states defined for all missing data scenarios
- [ ] Celebration triggers on action completion
- [ ] XP awards correctly on completion

---

*Daily Loop Architecture Spec v1.0*
*Created: 2026-01-27*
