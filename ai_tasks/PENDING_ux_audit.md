# Task: Customer Journey UX Audit

**Assigned to:** Codex  
**Priority:** Critical  
**Created:** 2026-01-11

---

## Context

Navigation is confusing. Multiple profile pages exist. User journey should be "skiing down a slope, not hitting walls in a maze."

---

## Mission

Audit and simplify the entire customer journey so a new user flows smoothly from:
1. Landing → Onboarding → ZoG → QoL → Game World

---

## Check These Flows

### 1. New User Journey

| Step | Expected | Check |
|------|----------|-------|
| Landing at `/` | See landing page | ☐ |
| Click "Start" | Go to Auth or Onboarding | ☐ |
| After Auth | Redirect to `/start` or `/game` | ☐ |
| Onboarding shows | No sidebar, simple flow | ☐ |
| Complete ZoG | See results, option for QoL | ☐ |
| Complete QoL | Sidebar unlocks | ☐ |
| First game view | Clear next action | ☐ |

### 2. Navigation Consistency

| Check | Expected |
|-------|----------|
| "Game of Life" in dropdown | → My Next Move |
| Profile in sidebar | → CharacterHub (single location) |
| No duplicate profile pages | Only CharacterHub |
| ZoG in profile | Summary card (not "Start" button) |

### 3. Dead Ends

Find and fix any:
- 404 pages
- Broken links
- Confusing CTAs
- Loops (going in circles)

---

## Reference Docs

- `docs/customer_journey_progression.md`
- `docs/onboarding_script.md`

---

## Deliverables

1. Fix any broken navigation
2. Remove duplicate pages
3. Ensure onboarding flow is linear
4. Document any remaining issues

---

## When Done

Rename to `DONE_ux_audit.md`
