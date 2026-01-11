# Task: Onboarding Flow

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

New users currently land on /game without clear direction.
Need a guided first experience.

---

## What to Build

### 1. Onboarding state tracking

In game_profiles or separate table:
- `onboarding_completed: boolean`
- `onboarding_step: number`

### 2. OnboardingFlow component

**File:** `src/modules/onboarding/OnboardingFlow.tsx`

Steps:
1. **Welcome** — "Welcome to Game of Life"
2. **Choose Path** — AI or Manual assessment
3. **Complete ZoG** — Either generate Appleseed or do assessment
4. **First QoL** — Rate your 8 life domains
5. **Explore** — Tour of main features (Profile, Quests, Missions)

### 3. Redirect logic

In GameHome or App.tsx:
```typescript
if (!profile.onboarding_completed) {
  return <OnboardingFlow />;
}
```

### 4. Skip option

Allow users to skip onboarding if they want.

---

## Flow Mockup

```
[ Welcome Screen ]
      ↓
[ Choose: AI knows me / Manual assessment ]
      ↓
[ Generate Appleseed OR Complete Assessment ]
      ↓
[ Quick QoL rating ]
      ↓
[ Tour: Here's your profile, here's quests... ]
      ↓
[ Done! Go to Game Home ]
```

---

## Success Criteria

- [ ] New users see onboarding
- [ ] Can complete ZoG through onboarding
- [ ] Can skip if desired
- [ ] State persists (don't show again)

---

## When Done

Rename to `DONE_onboarding.md`
