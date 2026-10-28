> Synthesized into docs/templates/roasting.md (2026-10-27). This file is kept as a source.

# Daily Loop Product Roast

> **Roast Gate #1: Product Playbook**
> Following the Roasting Protocol (see roasting_protocol.md)
> Date: 2026-01-27

---

## 🔥 ROAST CYCLE 1: Flow Walkthrough

### User Path Trace

Walking through the spec screen by screen:

1. **User opens `/game`** → Sees Home with ME, MY LIFE, MY NEXT MOVE
   - ✅ Clear structure, three-section layout
   - ⚠️ **GAP:** What if user has NO Unique Gift completed? 
   - ⚠️ **GAP:** What if user has NO QoL data? 
   - The spec mentions "Getting to know you state" but doesn't define it

2. **User clicks START** → Navigate to action screen
   - ⚠️ **GAP:** Where EXACTLY does this navigate? Not defined.
   - "Existing module screens" is vague — which URL?
   - Need mapping: Action type → Target route

3. **User completes action** → Celebration modal
   - ✅ XP award logic exists
   - ⚠️ **GAP:** How does system KNOW action is complete?
   - External actions (life tasks) — who marks them done?
   - In-app practices — auto-complete or manual?

4. **User clicks Explore** → `/game/explore`
   - ✅ Filter structure defined
   - ⚠️ **GAP:** What's the source of truth for action catalog?
   - `upgrade_catalog` vs new `action_library` — which?

### Navigation Edge Check

| From | To | Issue |
|------|-----|-------|
| Home | Profile | ✅ Clear |
| Home | QoL Details | ⚠️ Route not specified |
| Home | Action screen | ⚠️ Route pattern unclear |
| Action | Home | ⚠️ Return logic not specified |
| Explore | Home | ✅ Back button |
| Explore | Action | ⚠️ Same action routing issue |

---

## 🔥 ROAST CYCLE 2: Edge Cases & Usability

### Empty States (Critical)

1. **No ZoG data** → What does ME section show?
   - Current spec: Shows archetype and talents
   - If missing: ???? Not defined
   - **FIX NEEDED:** Define "incomplete profile" state

2. **No QoL data** → What does MY LIFE section show?
   - If missing: ???? Not defined
   - **FIX NEEDED:** Define "no life map" state

3. **No next action** → What does MY NEXT MOVE show?
   - If all actions completed: ???? 
   - If no actions available: ????
   - **FIX NEEDED:** Define "no recommendation" state

### Recommendation Algorithm Issues

1. **Growth/Social domains** map to TWO vectors
   - "Spirit / Mind" for Growth — which one wins?
   - **FIX NEEDED:** Deterministic tie-breaker

2. **What if user has NEVER done anything?**
   - No completedActions → first in sequence
   - But what IS the first action in each sequence?
   - **FIX NEEDED:** Define starter actions per vector

3. **Action sequences** are referenced but not defined
   - "findNextInSequence(vector, completedActions)"
   - Where is the sequence defined?
   - **FIX NEEDED:** Define action sequences or defer to catalog

### Data Gaps

1. **`action_completions` table** — spec says "new data needed" but:
   - We already have `active_upgrades` with status
   - Do we need BOTH? Or can we extend existing?

2. **Action library catalog** — is this `upgrade_catalog` or new?
   - Confusion between "upgrades" and "actions"
   - Need unified terminology

---

## 🔥 ROAST CYCLE 3: Meta-Roast

### What Did Cycles 1-2 Miss?

1. **Mobile vs Desktop** — wireframes are desktop-oriented
   - Home screen is long, needs scroll on mobile
   - Is this okay? Or needs redesign?

2. **Return User vs New User** — same home screen?
   - A returning user with momentum ≠ new confused user
   - Should we differentiate the experience?

3. **Gamification subtlety** — spec says "not flashy"
   - But celebration modal has sparkles (✨)
   - Tension between "calm confidence" and "dopamine hit"
   - Which is it?

4. **Bridges to other modules** — well defined
   - But no deep-link patterns
   - How does Matchmaking send user back to Daily Loop?

5. **Time-based recommendations** — mentioned in original spec
   - "Time Available — Short (5 min) vs medium (15 min)"
   - Current algorithm ignores this
   - v1 scope decision: include or defer?

### Hidden Assumptions

1. **User has completed onboarding** — assumed but not stated
2. **Action catalog is populated** — assumed but not verified
3. **XP system works** — assumed but not tested in this context
4. **QoL data is fresh** — what if it's 6 months old?

---

## ✅ SYNTHESIS: What to Fix

### Must Fix Before Architecture

| Issue | Fix |
|-------|-----|
| Empty states undefined | Add Section 3.5: Empty States |
| Action routing unclear | Add action type → route mapping |
| No sequence definition | Reference `upgrade_catalog` or create starter set |
| Dual-vector domains | Add tie-breaker rule |
| Terminology confusion | Standardize: "action" = anything, "upgrade" = skill tree |

### Can Defer to v2

- Time-based recommendations
- Mood-based recommendations  
- Mobile-specific layouts
- Return vs new user differentiation

---

## 📝 UPDATED SECTIONS NEEDED

1. **Section 3.5: Empty States**
2. **Section 5.1: Action Routing**
3. **Section 5.2: Starter Actions**
4. **Section 6.1: Terminology Glossary**

---

*Product Roast completed. Now fix and re-verify.*
