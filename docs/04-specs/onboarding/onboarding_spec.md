# Onboarding Spec — Final v1.0

> *"Like iOS — ZoG, QoL, Tour, boom: you're in."*

*Last updated: 2026-01-27*

---

## Master Result

**From:** New user who just signed up  
**To:** User ready to play daily loop

**Done when:**
- [x] User knows their Zone of Genius
- [x] User knows their Quality of Life status
- [x] User understands how the platform works (Tour)
- [x] User is at Home screen, ready to take first action

---

## Onboarding Style: Game + iOS Hybrid

| Approach | What We Take |
|----------|--------------|
| **iOS** | Screen-by-screen flow, one thing at a time, progressive unlock |
| **Game** | Wow moments, reveal animations, achievement unlocks, identity creation |
| **SaaS Tutorial** | Tooltips for Tour phase (after core onboarding) |

**Why hybrid:** 
- iOS = simplicity and flow
- Game = emotional investment and identity
- SaaS = contextual help without blocking

---

## The Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         ONBOARDING                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [1. WELCOME]  →  [2. ZOG]  →  [3. QOL]  →  [4. TOUR]  →  [5. HOME]
│      10 sec       3-5 min      2-3 min      1 min       Ready!  │
│                                                                  │
│                        TOTAL: ~7-10 min                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Welcome (10 sec)

### Screen 1.0: Promise

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    [EVOLVER LOGO]                               │
│                                                                 │
│              "Your Operating System for Life"                   │
│                                                                 │
│    Discover your genius. Grow yourself. Transform your life.   │
│                                                                 │
│                   [ Begin Journey → ]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Data Output:** Promise of transformation  
**Data Input:** None  
**Magic Button:** "Begin Journey"  
**Time:** 10 seconds

---

## Phase 2: Zone of Genius (3-5 min)

### Screen 2.0: ZoG Intro

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              "Let's discover who you really are"                │
│                                                                 │
│    Your Zone of Genius is where your natural talents meet      │
│    your deepest passions. It's what you do best without        │
│    even trying.                                                 │
│                                                                 │
│                   [ Discover My Genius → ]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Screens 2.1-2.4: Talent Assessment

**Existing module** — 12 questions → AI synthesis

Progress indicator: ●●●○○○○○○○○○ (12 steps)

### Screen 2.5: Reveal Moment 🎉

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ✨ GENERATING... ✨                          │
│                                                                 │
│              [Animation: particles coalescing]                   │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Screen 2.6: Hero Card

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     You are...                                  │
│                                                                 │
│              ╔═══════════════════════════╗                      │
│              ║                           ║                      │
│              ║    THE SYNTHESIZER        ║                      │
│              ║                           ║                      │
│              ║   [Visual Identity]       ║                      │
│              ║                           ║                      │
│              ║   "You see connections    ║                      │
│              ║    others miss"           ║                      │
│              ║                           ║                      │
│              ╚═══════════════════════════╝                      │
│                                                                 │
│                 🎉 GENIUS UNLOCKED 🎉                           │
│                                                                 │
│                     [ Continue → ]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Wow moment:** Hero card reveal with animation  
**Unlock message:** "You've unlocked personalized growth recommendations"

---

## Phase 3: Quality of Life (2-3 min)

### Screen 3.0: QoL Intro

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              "Now let's see where you are in life"              │
│                                                                 │
│    We'll assess 8 key areas of your life to find your          │
│    biggest growth opportunity.                                  │
│                                                                 │
│              [ Map My Life → ]                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Screens 3.1-3.8: Domain Assessment

**Existing module** — 8 domains, slider for each

Progress: ●●●●○○○○ (8 domains)

Domains:
1. 💰 Wealth
2. ❤️ Health
3. 😊 Happiness
4. 💕 Love
5. 🌍 Impact
6. 📈 Growth
7. 👥 Social
8. 🏠 Home

### Screen 3.9: Life Map Reveal 🎉

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    Your Life Map                                │
│                                                                 │
│                  [Spider/Radar Chart]                           │
│                                                                 │
│    Strongest: 💕 Love (8/10)                                    │
│    Opportunity: 💰 Wealth (3/10)                                │
│                                                                 │
│    "Your life results come from your development.               │
│     Let's grow what matters most."                              │
│                                                                 │
│                     [ Continue → ]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Wow moment:** Spider chart visualization  
**Core insight:** "To improve your life, you develop yourself"

---

## Phase 4: Quick Tour (1 min)

**Style:** iOS-style screen-by-screen OR tooltip overlays

### Option A: Screen-by-Screen (Recommended)

```
TOUR SCREEN 1: Your Home
───────────────────────────────────────
"This is where you start every day"
[Preview of Home screen]
[Next →]

TOUR SCREEN 2: Transformation
───────────────────────────────────────
"Grow yourself across 5 dimensions"
[Preview of Growth Paths]
[Next →]

TOUR SCREEN 3: Business Incubator
───────────────────────────────────────
"Turn your genius into an offer"
[Preview of Product Builder]
[Next →]

TOUR SCREEN 4: Discover
───────────────────────────────────────
"Find your people"
[Preview of Matchmaking]
[Enter Platform →]
```

### Option B: Tooltip Overlay (Alternative)

User lands on Home, tooltips appear pointing to key areas:
1. "This is your profile" → Profile section
2. "Your next recommended action" → My Next Move
3. "Explore these spaces" → Navigation

**Each tooltip:** "Got it" button to dismiss

---

## Phase 5: Home — You're In!

### Screen 5.0: Home Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  [Profile]  [Transform]  [Incubator]  [Discover]  [Market]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Welcome, Alexander!                                            │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║  ME                                                       ║  │
│  ║  The Synthesizer | Level 1 | 0 XP                         ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║  MY LIFE                                                  ║  │
│  ║  [Mini Radar Chart]                                       ║  │
│  ║  Focus: 💰 Wealth                                         ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║  MY NEXT MOVE                                             ║  │
│  ║                                                           ║  │
│  ║  🎯 Recommended: Watch "How Genius Becomes Income" (90s)  ║  │
│  ║                                                           ║  │
│  ║           [ DO IT → ]      or      [ Explore More ]       ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**User state:** Ready to take first action  
**Onboarding complete:** ✅

---

## Summary Table

| Phase | Screens | Time | Status |
|-------|---------|------|--------|
| 1. Welcome | 1 | 10 sec | ⬜ Needs creation |
| 2. Zone of Genius | 6+ | 3-5 min | ✅ Exists |
| 3. Quality of Life | 9+ | 2-3 min | ⚠️ Exists, needs placement |
| 4. Tour | 4 | 1 min | ⬜ Needs creation |
| 5. Home | 1 | — | ✅ Exists |

---

## What Needs to Be Built

| Item | Priority | Effort |
|------|----------|--------|
| **Welcome screen** | HIGH | Small |
| **Flow wrapper** (screen-to-screen transition) | HIGH | Medium |
| **QoL placement** (after ZoG, not in Profile) | HIGH | Small |
| **Tour screens** | MEDIUM | Medium |
| **Reveal animations** | MEDIUM | Small |
| **Progress indicators** | LOW | Small |

---

## Technical Implementation Notes

1. **Flow state:** Track onboarding progress in user profile
2. **Skip logic:** Can't skip ZoG or QoL, can skip Tour
3. **Resume:** If user exits mid-onboarding, resume where they left off
4. **Completion flag:** `user.onboarding_complete = true` after reaching Home

---

## Mobile-First (Discord Pattern Applied)

```
MOBILE:  Full-screen, one thing at a time
         Navigation hidden during onboarding
         
TABLET:  Same as mobile (onboarding is focused)

DESKTOP: Centered card, max-width 600px
         Background subtle branding
```

---

## Related Documents

- [customer_journey_map.md](./customer_journey_map.md) — Full journey after onboarding
- [onboarding_redesign.md](./onboarding_redesign.md) — iOS analogy details
- [ux_ui_playbook.md](./ux_ui_playbook.md) — Design principles

---

*Onboarding Spec v1.0 — January 27, 2026*
*Target: Functional by tomorrow mid-day*
