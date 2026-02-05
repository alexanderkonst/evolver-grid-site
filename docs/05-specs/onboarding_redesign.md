# Onboarding Flow Redesign

> *"Like iOS — simple, short, wow effects, then boom: you're in the operating system."*

---

## The Problem

Current onboarding:
- Located in Profile section (wrong place)
- Should be in "My Next Move"
- Not intuitive
- Platform can be overwhelming (too many options)

---

## The iOS Analogy

**How iOS does it:**
1. Screen after screen, simple clicks
2. User is taken on a journey
3. Then **boom** — they're in
4. They see apps, explore, install, open
5. Apps send notifications
6. Settings available when needed

**We are an operating system.** Onboard like one.

---

## New Onboarding Flow

### Phase 1: CORE PROFILE (Required)

```
SCREEN 1: Zone of Genius
───────────────────────────────────
"Discover who you really are"
[12 questions → AI synthesis → Hero Card]

WOW MOMENT: "You are The Synthesizer"

UNLOCK MESSAGE:
"With your Zone of Genius, you've unlocked:
• Genius Business Builder (in Business Incubator)  
• Personalized Growth Paths
• Genius Matching with others"

[Continue →]
```

```
SCREEN 2: Quality of Life
───────────────────────────────────
"Now let's see where you are in life"
[8 domain assessment → Life Map]

WOW MOMENT: Spider chart appears

CORE INSIGHT:
"To improve your quality of life, you grow."
[Optional: 60-second video explaining the connection]

UNLOCK MESSAGE:
"Find your growth paths in the Transformation space"

[Continue →]
```

### Phase 2: PLATFORM TOUR (Quick)

```
SCREEN 3: Your Resources
───────────────────────────────────
"You already have resources — let's map them"

PREVIEW: Asset Mapping module

"Like cards in poker — know what you're holding"

[Explore Later] or [Map Now]
```

```
SCREEN 4: Find Your People
───────────────────────────────────
"Connect with complementary geniuses"

PREVIEW: Discover/Matchmaking space

"Find collaborators, teams, co-creators"

[Explore Later]
```

```
SCREEN 5: Build Your Business
───────────────────────────────────
"Turn your genius into an offer"

PREVIEW: Business Incubator space

"From Zone of Genius → Published Product"

[Explore Later]
```

```
SCREEN 6: Marketplace
───────────────────────────────────
"See what others have created"

PREVIEW: Marketplace with example products

"Your product can be here too"

[Enter Platform →]
```

### Phase 3: YOU'RE IN

```
HOME SCREEN: My Next Move
───────────────────────────────────
Welcome, [Name]!

YOUR PROFILE: The Synthesizer | Level 1

TODAY'S RECOMMENDATION:
[One clear action based on their QoL bottleneck]

EXPLORE:
[Profile] [Transformation] [Incubator] [Discover] [Marketplace]
```

---

## Key Principles

| Principle | Implementation |
|-----------|----------------|
| **Simple** | One thing per screen |
| **Short** | Core = 2 screens, Tour = 4 quick screens |
| **Wow effects** | Hero card reveal, life map visualization |
| **Set up for success** | Explain what they unlocked, where to find it |
| **Not overwhelming** | Tour is optional, can skip to platform |

---

## What's Required vs Optional

| Step | Required? | Notes |
|------|-----------|-------|
| ZoG | ✅ Yes | Core identity |
| QoL | ✅ Yes | Core prioritization |
| Asset Mapping | ❌ Skip option | Can do later |
| Discover Tour | ❌ Skip option | Show once |
| Incubator Tour | ❌ Skip option | Show once |
| Marketplace Tour | ❌ Skip option | Show once |

---

## Scope Decision: Genius Business in Onboarding?

**Current thinking:** NO

- ZoG is enough for onboarding
- Genius Business (Excalibur) = too much
- Tell them it's unlocked, show where to find it
- Let them go there when ready

**Alternative:** Make it optional ("Want to see your Genius Business now?" [Yes] [Later])

---

## Technical Changes Needed

1. **Move onboarding to "My Next Move"** — not Profile
2. **Create tour flow component** — screen by screen
3. **Add "What you unlocked" messages** — after each reveal
4. **Add skip/explore options** — for tour screens
5. **Track onboarding completion** — so tour doesn't repeat

---

## Connection to iOS Metaphor

| iOS | Evolver |
|-----|---------|
| Apple ID setup | ZoG (identity) |
| Preferences | QoL (life priorities) |
| App overview | Tour of 5 Spaces |
| Home screen | My Next Move |
| Apps | Actions, modules, paths |
| Settings | Profile |
| Notifications | Recommendations, streaks |

---

*Document created: January 26, 2026*
*Part of MVP scope for this sprint*
