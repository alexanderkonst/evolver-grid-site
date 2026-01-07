# Inventory: Modules, Content, and Open Questions

> Everything that exists, needs building, or needs deciding

*Updated: 2025-01-07 (Day 4)*

---

## Module Inventory

### Built ✅

| Module | Status | Optimization Needed? |
|--------|--------|---------------------|
| Zone of Genius Test | ✅ Built | Reveal moments, celebratory effects |
| QoL Assessment | ✅ Built | Slider UX, zoom-in feature |
| Personality Tests Upload | ✅ Built | — |
| XP + Streak | ✅ Built | Display logic, level-up moments |
| Daily Loop v2 Layout | 🟡 Behind flag | Wire First Actions |

### Prototype Exists 🟡

| Module | Status | Next Step |
|--------|--------|-----------|
| Asset Mapping | Prototype | Spec for build |
| Mission Discovery | Prototype | Spec for build |

### Not Built ⬜

| Module | Priority | Notes |
|--------|----------|-------|
| Matchmaking | MVP | Core value prop; depends on Asset Mapping + Mission Discovery |
| First Actions | MVP | Spec done, needs wiring |
| Micro-learnings | Post-MVP | Content exists, needs packaging |
| Activations (breathwork etc.) | Post-MVP | Content exists, needs packaging |

---

## Content Inventory

### Growth Paths

| Path | Status |
|------|--------|
| Genius | ✅ Complete |
| Spirit | ✅ Complete |
| Mind | ✅ Complete |
| Emotions | 🟡 In progress (Alexander) |
| Body | ⬜ Next |

### Micro-learnings (90s videos)

| Topic | Content Exists? | Packaged? |
|-------|-----------------|-----------|
| Spirit: Awareness + Sensitivity | ✅ | ⬜ |
| Spirit: States of Consciousness | ✅ | ⬜ |
| Mind: Cognitive Distortions | ✅ | ⬜ |
| Mind: Perspectives | ✅ | ⬜ |
| Mind: Integral Framework | ✅ | ⬜ |

*Content exists in Alexander's head/materials; needs 90s video production*

---

## UI/UX Open Questions

| Question | Options | Decision |
|----------|---------|----------|
| Game Screen: Text buttons or graphics? | A) Text buttons per Space B) Visual buildings/map | TBD |
| Onboarding banner: What's on it? | Step progress + NOW/NEXT | See `onboarding_script.md` |
| QoL zoom-in: Slider or stage selection? | A) Slider 1-10 B) Stage cards | TBD |
| Reveal moments: What effects? | Celebratory sounds, confetti, animation | Need to spec |

---

## Gamification Logic (To Spec)

| Element | Status | Notes |
|---------|--------|-------|
| XP scheme | ⬜ Need to define | How much XP per action type? |
| Level thresholds | ⬜ Need to define | Level 1 = 70 XP? Level 2 = ? |
| Streak logic | ✅ Built | May need polish |
| Celebratory moments | ⬜ Need to spec | Sounds, visuals, timing |
| Spaced repetition | ⬜ Need to spec | Watched → Rewatch in 3d → Rewatch in 2w |
| Game explainers | ⬜ Need to create | Onboard users to gamified experience |

---

## Module Optimization Tracker

*For modules that exist but need versioning/improvements*

| Module | Current | Optimization |
|--------|---------|--------------|
| QoL Assessment | Stage buttons | Add slider option |
| QoL Assessment | Single pass | Add zoom-in for precision |
| ZoG Reveal | Basic | Add celebratory effects |
| Daily Loop | Legacy cards | v2 behind flag (flip when ready) |

---

## Platform Architecture (Later)

| Piece | Status | Notes |
|-------|--------|-------|
| Interoperability | ⬜ | Meta-community layer |
| White-label / Forkability | ⬜ | Community theming |
| Data sovereignty | ⬜ | User control over data |

---

## Content for Later

| Item | Notes |
|------|-------|
| Scientific validations | For micro-learnings and activations |
| Disclaimers | Medical/psychological disclaimers |
| NotebookLM collection | Projects by other meta-architects |

---

## Daily Loop v2 — What It Means

**Current (Legacy):** Main Quest / Side Quest / Upgrades cards
**v2 (Behind flag):** Me / My Life / My Next Move layout

When you flip the flag, users see:
- **Me:** Profile snapshot, streak, level
- **My Life:** QoL domains, recent wins
- **My Next Move:** One recommended action

---

## What's the Skeleton?

```
ONBOARDING
├── ZoG (built)
├── QoL (built)
└── Game Entry (built)

GAME WORLD
├── Me (v2 layout, behind flag)
├── My Life (v2 layout, behind flag)
├── My Next Move (needs First Actions wired)
└── 5 Spaces (nav — text buttons for now)

CORE LOOP
├── Get recommendation
├── Complete action
├── XP + Streak update
└── Next recommendation

MVP ADDITIONS
├── Asset Mapping (prototype → build)
├── Mission Discovery (prototype → build)
└── Matchmaking (depends on above)
```

---

*Inventory v1.0*
