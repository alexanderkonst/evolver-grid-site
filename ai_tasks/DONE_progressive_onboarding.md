# Task: Progressive Onboarding — Hide Sidebar Until Earned

**Assigned to:** Claude CLI  
**Priority:** Critical  
**Created:** 2026-01-11

---

## Context

The platform should reveal itself progressively. **Nothing is visible until it's earned.**

See existing documentation:
- `docs/customer_journey_progression.md` — Full progression logic
- `docs/onboarding_script.md` — Exact screen copy

---

## Core Principle

> **Phase 1: Zone of Genius (Entry)**
> - No sidebar
> - No game world  
> - Just the ZoG experience
>
> **Phase 2: QoL Snapshot**
> - User maps their life in 8 domains
> - **→ Game World Unlocks (sidebar appears)**
>
> **Phase 3+: Progressive Unlocks**
> - Matchmaking: locked until deeper self-knowledge
> - Startup Co-op: locked until Genius Offer
> - Marketplace Shop: locked until Genius Offer

---

## What to Build

### 1. Track onboarding stage

```sql
ALTER TABLE game_profiles ADD COLUMN onboarding_stage TEXT DEFAULT 'new';
-- Stages: 'new', 'zog_started', 'zog_complete', 'qol_complete', 'unlocked'
```

### 2. Hide sidebar for new users

In `GameShell.tsx` or root layout:
```tsx
const { profile } = useProfile();
const showSidebar = profile?.onboarding_stage === 'unlocked' || 
                    profile?.onboarding_stage === 'qol_complete';

// If no sidebar, show full-width content
```

### 3. Onboarding route

**Route:** `/onboarding` or `/start`

New users automatically redirected here if `onboarding_stage === 'new'`.

### 4. Flow screens

| Screen | Copy | CTA |
|--------|------|-----|
| 1. Landing | "Discover who you really are." | Start → |
| 2. ZoG Intro | "Your Zone of Genius: Where you're naturally valuable." | Find mine → |
| 3. AI Check | "Do you have an AI that knows you well?" | Yes / No |
| 4-8. Assessment or AI Flow | ... | ... |
| 9. Genius Reveal 🎉 | "You are [Archetype Name]." | Continue → |
| 10. Transition | "You've met yourself. Now you can grow." | Start growing → |
| 11. QoL Intro | "Map your life. 8 areas. 2 minutes." | Begin → |
| 12-13. QoL Assessment | ... | ... |
| 14. Life Snapshot 🎉 | "Your life map." | Continue → |
| 15. Opportunity | "Your biggest opportunity: [Domain]" | Let's grow → |
| 16. Game Entry | "This is your game. This is your story." | Begin → |

### 5. Update stage after each milestone

```typescript
// After ZoG complete
await updateProfile({ onboarding_stage: 'zog_complete' });

// After QoL complete
await updateProfile({ onboarding_stage: 'qol_complete' });
// → Sidebar now visible

// After first transformation unit
await updateProfile({ onboarding_stage: 'unlocked' });
```

### 6. XP Awards

| Milestone | XP |
|-----------|-----|
| ZoG Complete | +100 XP |
| QoL Complete | +50 XP |
| First Transformation Unit | +25 XP |
| Genius Offer Created | +200 XP |

---

## Success Criteria

- [ ] New users see no sidebar
- [ ] ZoG flows without game UI chrome
- [ ] Sidebar appears after QoL completion
- [ ] XP awarded at milestones
- [ ] Onboarding stage tracked in DB
- [ ] Existing users unaffected

---

## Reference Files

- `docs/customer_journey_progression.md`
- `docs/onboarding_script.md`
- `src/modules/onboarding/OnboardingFlow.tsx` (existing)

---

## When Done

Rename to `DONE_progressive_onboarding.md`
