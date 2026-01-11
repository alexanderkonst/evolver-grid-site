# Task: Onboarding Flow Design

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

New users need a guided first experience. This should be elegant, simple, and lead to value quickly.

---

## Design Goals

1. **Minimal friction** — Don't overwhelm
2. **Quick value** — Get to Appleseed fast
3. **Personalized path** — Based on what they know

---

## Onboarding Steps

### Step 1: Welcome

```
┌─────────────────────────────────────────┐
│                                         │
│     Welcome to Evolver Grid             │
│                                         │
│     Your journey to discover and        │
│     express your unique genius          │
│     starts here.                        │
│                                         │
│           [Begin →]                     │
│                                         │
└─────────────────────────────────────────┘
```

### Step 2: Quick Profile

```
┌─────────────────────────────────────────┐
│                                         │
│     First, what should we call you?     │
│                                         │
│     First name: [____________]          │
│                                         │
│     Where are you based? (optional)     │
│     [____________]                      │
│                                         │
│         [Skip]      [Continue →]        │
│                                         │
└─────────────────────────────────────────┘
```

### Step 3: Path Selection

```
┌─────────────────────────────────────────┐
│                                         │
│     How would you like to discover      │
│     your Zone of Genius?                │
│                                         │
│   ┌───────────────────────────────┐     │
│   │  ⚡ AI Knows Me                │     │
│   │  I have an AI assistant who   │     │
│   │  knows my work and strengths  │     │
│   └───────────────────────────────┘     │
│                                         │
│   ┌───────────────────────────────┐     │
│   │  📝 Guided Assessment         │     │
│   │  Answer questions to reveal   │     │
│   │  your genius step by step     │     │
│   └───────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

### Step 4: (Based on choice)

**If AI Path:** → ZoneOfGeniusEntry with AI prompt

**If Manual Path:** → ZoneOfGeniusEntry with assessment

### Step 5: Appleseed Result

After generation, show Appleseed + celebration.

### Step 6: What's Next?

```
┌─────────────────────────────────────────┐
│                                         │
│     🎉 Your Appleseed is ready!         │
│                                         │
│     What would you like to do next?     │
│                                         │
│   [Forge My Excalibur (Offer)]          │
│   [Rate My Quality of Life]             │
│   [Explore the Platform]                │
│                                         │
└─────────────────────────────────────────┘
```

---

## Database

```sql
ALTER TABLE game_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE game_profiles ADD COLUMN onboarding_step INTEGER DEFAULT 0;
```

---

## Implementation

**File:** `src/modules/onboarding/OnboardingFlow.tsx` (may already exist)

Check in GameHome:
```tsx
if (!profile.onboarding_completed) {
  return <OnboardingFlow />;
}
```

---

## Success Criteria

- [ ] New users see onboarding
- [ ] Can enter name
- [ ] Can choose AI vs Manual path
- [ ] Leads to ZoG generation
- [ ] Shows completion celebration
- [ ] Can skip if desired
- [ ] State persists

---

## When Done

Rename to `DONE_onboarding_design.md`
