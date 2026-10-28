> Synthesized into docs/templates/roasting.md (2026-10-27). This file is kept as a source.

# Daily Loop Architecture Roast

> **Roast Gate #2: Architecture Playbook**
> Following the Roasting Protocol
> Date: 2026-01-27

---

## 🔥 ROAST CYCLE 1: Navigation Walkthrough

### User Path Trace

1. **User opens `/game`** after onboarding
   - ✅ Route exists: `GameHome.tsx`
   - ✅ Auth check happens in component
   - ✅ Profile loads via `loadGameData()`

2. **User clicks START on Next Move card**
   - ⚠️ **Current:** Opens quest picker modal or navigates to path
   - ⚠️ **Target:** Navigate to specific action route
   - **GAP:** Need to unify action routing logic

3. **User completes action and returns**
   - ⚠️ **Current:** Uses URL param `?completed=true` in some places
   - ⚠️ **Target:** Standardized `?completed={actionId}`
   - **GAP:** Return param handling inconsistent

4. **User clicks Explore**
   - ✅ Route exists: `/game/transformation/library`
   - ✅ Linked from GameHome

5. **User clicks ME section**
   - ✅ Route exists: `/game/profile`
   - ⚠️ **Current:** `PlayerStatsBadge` is complex
   - **TARGET:** Simplified `MeSummary` component

6. **User clicks MY LIFE section**
   - ✅ Route exists: `/game/transformation/qol-results`
   - ⚠️ **Current:** QoL data shown inline, needs simplification

### Back Button Check

| From | Back → | Status |
|------|--------|--------|
| `/game/profile` | `/game` | ✅ Works (browser) |
| `/game/transformation/library` | `/game` | ✅ Works |
| `/game/transformation/path/:id` | `/game/transformation/paths` | ✅ Works |
| Action completion | `/game` | ⚠️ Needs explicit return param |

---

## 🔥 ROAST CYCLE 2: Edge Cases

### Empty States (from Product Spec)

| State | Handled? | Notes |
|-------|----------|-------|
| No ZoG data | ⚠️ Partial | `zogSnapshot` checked but UX unclear |
| No QoL data | ⚠️ Partial | Falls back to default, no CTA |
| No next action | ⚠️ Partial | Shows explore, but not as spec'd |
| No user auth | ✅ Redirects | Auth guard works |

### Refresh Behavior

| Scenario | Current | Target |
|----------|---------|--------|
| Refresh on `/game` | ✅ Reloads all data | ✅ Correct |
| Refresh mid-action | ⚠️ Loses context | Action state in URL params |
| Refresh after celebration | ✅ No duplicate | Celebration clears |

### 1077-Line File Risk

**Concern:** `GameHome.tsx` is 1077 lines. Refactoring has risk.

**Mitigation:**
1. Extract sections to new components (low risk, high clarity)
2. Keep existing data fetching logic (proven working)
3. Incremental changes with build verification

---

## 🔥 ROAST CYCLE 3: Meta-Roast

### What Did Cycles 1-2 Miss?

1. **Performance:** 1077-line file loads everything at once
   - Consider: lazy loading for Explore section?
   - v1 scope: keep as-is, optimize later

2. **Recommendation caching:** Algorithm runs on every load
   - Consider: cache recommendation for session?
   - v1 scope: accept re-computation

3. **Action completion verification:** How do we KNOW action is done?
   - In-app: explicit button click
   - External: honor system (ask user)
   - ✅ Documented in product spec

4. **Growth path version:** Existing `GROWTH_PATH_VERSION` constant
   - Need to maintain compatibility
   - ✅ Will use existing version

### Hidden Assumptions

1. **User has profile** — enforced by `getOrCreateGameProfileId()`
2. **Network available** — Supabase calls may fail
   - ⚠️ Error handling exists but UX needs review
3. **Browser supports modern features** — CSS variables, etc.
   - ✅ Already in use across app

---

## ✅ SYNTHESIS: Architecture Is Sound

### Must Address in Implementation

| Issue | Fix |
|-------|-----|
| Return param handling | Standardize `?completed={actionId}` |
| Empty state UX | Add explicit CTAs per product spec |
| Component extraction | Create MeSummary, MyLifeSummary, NextMoveCard |

### Can Proceed With

- Module boundaries are clear
- Routes are defined
- State management using existing patterns
- Refactor approach is safe (extract, don't rewrite)

---

**Verdict: ✅ Pass Architecture Roast Gate**

Proceed to UI Playbook.

---

*Architecture Roast completed. Ready for implementation.*
