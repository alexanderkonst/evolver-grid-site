# User Flows

> Screen-by-screen progression from entry to daily loop

*Draft: 2025-01-07*

---

## Overview

```
LANDING → ONBOARDING → GAME WORLD → DAILY LOOP
   │          │            │            │
   │          ▼            ▼            ▼
   │    Unique Gift   5 Spaces    My Next Move
   │    Quality of Life  Practice    Progress
   │    Game Unlock      Explore     Streak
```

---

## Flow 1: First-Time User (Onboarding)

### Screen 1.1: Landing / Entry

**Elements:**
- Value proposition: "Discover who you really are"
- CTA: "Start Free" or "Begin"
- Social proof (optional)

**Exit:** → Screen 1.2

---

### Screen 1.2: Unique Gift Intro

**Elements:**
- Brief explanation: "Your Unique Gift is where you're naturally valuable"
- Time commitment: "Takes ~3 minutes"
- CTA: "Let's find yours"

**Exit:** → Screen 1.3

---

### Screen 1.3: AI Model Check

**Elements:**
- Question: "Do you have an AI (ChatGPT, Claude) that knows you well?"
- [YES] → Show prompt to paste in AI → Paste result back → Screen 1.5
- [NO] → Screen 1.4

---

### Screen 1.4: Talent Assessment

**Elements:**
- 81 talents, Tinder-style swipe
- Progress bar: "17 of 81"
- Gamified: quick, satisfying, low friction

**Flow:**
1. Swipe through talents (like/pass)
2. Select top 10 from likes
3. Narrow to top 3
4. Rank 1-2-3
5. "Generating your profile..."

**Exit:** → Screen 1.5

---

### Screen 1.5: Reveal — Genius Profile 🎉

**Elements:**
- Archetype title (e.g., "The Synthesizer")
- Core pattern description
- Top 3 talents
- One-sentence genius statement
- Visual identity (colors, generated image)

**Voice:** "Here's what makes YOU uniquely valuable"

**Exit:** → Screen 1.6

---

### Screen 1.6: Reveal — Genius Applications

**Elements:**
- Where genius applies professionally (roles, industries)
- Where genius applies personally (relationships, hobbies)

**Exit:** → Screen 1.7

---

### Screen 1.7: Transition — "Now Let's Grow"

**Elements:**
- Message: "You've just met yourself. Now you can grow."
- Tamagotchi moment: "You are the character you grow"
- CTA: "Start growing →"

**Exit:** → Screen 2.1

---

## Flow 2: Quality of Life Assessment

### Screen 2.1: QoL Intro

**Elements:**
- Explain 8 domains briefly (visual)
- Time: "Takes ~2 minutes"
- CTA: "Map your life"

**Exit:** → Screen 2.2

---

### Screen 2.2: Domain Assessment

**Elements:**
- 8 domains, one at a time (or all visible)
- Slider or stage selection per domain
- Progress: "4/8 domains"

**Exit:** → Screen 2.3

---

### Screen 2.3: Reveal — Life Snapshot 🎉

**Elements:**
- Radar chart or grid visualization
- Highest domains celebrated
- Lowest domains framed as opportunities

**Voice:** "Here is YOUR life map"

**Exit:** → Screen 2.4

---

### Screen 2.4: Biggest Opportunity

**Elements:**
- Identify lowest domain(s)
- Frame as opportunity: "Your biggest growth area is [X]"
- Optional: Zoom-in for precise positioning

**Exit:** → Screen 2.5

---

### Screen 2.5: Self-Development → Life Results

**Elements:**
- Infographic: 5 Vectors → 8 Domains
- Explanation: "What you grow inside shows up in your life"
- CTA: "Start growing"

**Voice:** "This is YOUR game. This is YOUR story."

**Exit:** → Screen 3.1

---

## Flow 3: Game World (Daily Use)

### Screen 3.1: Home / Dashboard

**Primary layout:**
```
┌─────────────────────────────────────┐
│ ME          │ MY LIFE    │ MY NEXT  │
│ (Character) │ (QoL Map)  │ MOVE     │
└─────────────────────────────────────┘
```

**ME Section:**
- Avatar / visual identity
- Level, XP bar
- Current streak

**MY LIFE Section:**
- 8-domain radar (or simplified)
- Click to expand

**MY NEXT MOVE Section:**
- One recommended action
- "Do it now" CTA
- Explore more options

**Exit:** → Action flow OR Explore flow

---

### Screen 3.2: My Next Move — Action

**Elements:**
- Recommended upgrade/practice
- Duration: "3 minutes"
- CTA: "Start"

**After completion:**
- XP awarded
- Streak updated
- Next recommendation appears

---

### Screen 3.3: Explore (Freedom Mode)

**Elements:**
- 5 Game Spaces as tabs/buttons:
  - Profile
  - Transformation
  - Marketplace
  - Matchmaking
  - Venture Co-op
- Each space shows available actions

---

## Flow 4: Returning User (Daily Loop)

### Entry: Home Screen

**Personalized greeting:**
- "Welcome back, [Name]"
- Current streak: "🔥 5-day streak"
- Today's recommendation ready

### Primary Action:
- One clear "My Next Move"
- 1-3 minute easy win

### After Action:
- Celebratory beat
- XP awarded
- Choice: another action OR exit

---

## Screen Map Summary

| # | Screen | Purpose |
|---|--------|---------|
| 1.1 | Landing | Entry, value prop |
| 1.2 | ZoG Intro | Set expectation |
| 1.3 | AI Check | Branch point |
| 1.4 | Talent Assessment | Core data collection |
| 1.5 | Genius Reveal | Dopamine #1 |
| 1.6 | Applications | Deepen insight |
| 1.7 | Transition | Game world unlock |
| 2.1 | QoL Intro | Set expectation |
| 2.2 | Domain Assessment | Life mapping |
| 2.3 | Life Snapshot | Dopamine #2 |
| 2.4 | Opportunity | Focus bottleneck |
| 2.5 | Inner→Outer | Core insight |
| 3.1 | Home/Dashboard | Daily hub |
| 3.2 | Next Move | Action screen |
| 3.3 | Explore | Freedom mode |

---

## UI Principles

1. **One action per screen** — no overwhelm
2. **Progress always visible** — where am I?
3. **Celebratory beats** — every completion feels good
4. **Voice lines** — "Here's what makes YOU uniquely valuable"
5. **Under 3 taps to action** — reduce friction

---

*User Flows v1.0*
*Draft: 2025-01-07*
