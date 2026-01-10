# Task: Appleseed Generation UI

**Assigned to:** Codex  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

We're building the Appleseed generation flow. This task covers the UI components.
The AI model integration will be done separately through Lovable.

---

## What to Build

### 1. AppleseedDisplay Component

**File:** `src/modules/zone-of-genius/AppleseedDisplay.tsx`

Display a generated Appleseed with collapsible sections for each of the 12 perspectives.

```tsx
interface AppleseedData {
  bullseyeSentence: string;
  vibrationalKey: {
    name: string; // e.g. "Architect of Integration Codes"
    tagline: string; // e.g. "He who sees what wants to be whole..."
  };
  threeLenses: {
    actions: string[]; // ["Envision", "Architect", "Activate"...]
    primeDriver: string; // "Activate Dormant Potential"
    archetype: string; // "Visionary Architect — Evolutionary Mirror"
  };
  appreciatedFor: Array<{
    effect: string;
    scene: string;
    outcome: string;
  }>;
  masteryStages: Array<{
    stage: number;
    name: string;
    description: string;
  }>;
  professionalActivities: Array<{
    activity: string;
    targetAudience: string;
    purpose: string;
  }>;
  rolesEnvironments: {
    asCreator: string;
    asContributor: string;
    asFounder: string;
    environment: string;
  };
  complementaryPartner: {
    skillsWise: string;
    geniusWise: string;
    archetypeWise: string;
    synergy: string;
  };
  monetizationAvenues: string[];
  lifeScene: string;
  visualCodes: Array<{
    symbol: string;
    meaning: string;
  }>;
  elevatorPitch: string;
}
```

**UI:**
- Hero section with Unique Vibrational Key (big, centered)
- Bullseye Sentence below
- Collapsible sections for each perspective
- Glow animation on vibrational key
- "Save to Profile" button at bottom

### 2. AppleseedRitualLoading Component

**File:** `src/modules/zone-of-genius/AppleseedRitualLoading.tsx`

Sacred loading animation while Appleseed generates.

```tsx
// Show:
// 1. Sacred geometry animation (spinning dodecahedron or torus)
// 2. Text phases: "Tuning into your frequency..."
//                 "Amplifying your signal..."
//                 "Crystallizing your essence..."
// 3. Duration: ~3-5 seconds minimum to feel ritual-like
```

---

## Success Criteria

- [ ] AppleseedDisplay shows all 12 perspectives
- [ ] Sections are collapsible
- [ ] Vibrational Key has subtle glow animation
- [ ] RitualLoading feels sacred, not just a spinner
- [ ] Mobile responsive
- [ ] TypeScript compiles without errors

---

## When Done

Rename to `DONE_appleseed_ui.md`
