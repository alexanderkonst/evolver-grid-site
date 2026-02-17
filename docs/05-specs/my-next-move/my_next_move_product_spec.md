# My Next Move — Product Spec

> **Module:** My Next Move  
> **Space:** Not a Space — это центральный хаб  
> **Route:** `/game/next-move`

---

## 1.1 MASTER RESULT ✅

> **Overwhelmed by options → Clear on my ONE next action**

| Point A | Point B |
|---------|---------|
| "There's so much here, where do I start?" | "I know exactly what to do right now" |
| Decision paralysis | Confident action |
| Platform feels overwhelming | Platform feels like a personal guide |

---

## 1.2 SUB-RESULTS

Breaking the Master Result into intermediate wins:

| # | Sub-Result | User Feels | Start → End |
|---|------------|------------|-------------|
| 1 | **See myself** | "The platform knows who I am" | View my profile snapshot (ZoG, QoL, Mission) |
| 2 | **See my life** | "I see where I stand across all domains" | View QoL scores / life map |
| 3 | **See my next move** | "I know exactly what to do" | View ONE recommended action |
| 4 | **Take action** | "I'm doing it!" | Start the recommended module |
| 5 | **Complete & celebrate** | "I did it! I'm progressing" | Complete action, earn XP, see progress |

### Sequence Logic (from module_taxonomy.md)

```
1. GROW → Profile completion first
   └── ZoG → QoL → Resources → Mission

2. LEARN → Ongoing forever (default rabbit hole)
   └── Library → Growth Paths → Skill Trees

3. One-time nudges:
   ├── Resources done → nudge COLLABORATE
   └── ZoG done → nudge BUILD (badge on icon)
```

---

## 1.3 SCREENS

| # | Screen Name | Purpose | Sub-Result |
|---|-------------|---------|------------|
| 1 | **NextMoveHomeScreen** | Main hub: Me + My Life + My Next Move | 1, 2, 3 |
| 2 | **ActionDetailScreen** | Expanded view of recommended action | 3 |
| 3 | **CelebrationScreen** | Completion celebration with XP | 5 |

### Screen 1: NextMoveHomeScreen (Main Hub)

This is the PRIMARY screen. Contains 3 sections:

```
┌─────────────────────────────────┐
│         ★ ME ★                  │
│   [Avatar] [Name] [Level]       │
│   XP: ████░░ 340/500            │
├─────────────────────────────────┤
│         MY LIFE                 │
│   [8 QoL Domain Cards]          │
│   Health: 7.2  Career: 6.5 ...  │
├─────────────────────────────────┤
│       MY NEXT MOVE              │
│  ┌─────────────────────────┐    │
│  │ 🎯 Complete your QoL    │    │
│  │    Assessment           │    │
│  │                         │    │
│  │ "Map your life to see   │    │
│  │  where to focus"        │    │
│  │                         │    │
│  │ [Start Now →]           │    │
│  └─────────────────────────┘    │
│                                 │
│  [Explore Other Options ▼]      │
└─────────────────────────────────┘
```

### Screen 2: ActionDetailScreen (Optional expansion)

Only if user wants more context before starting:

```
┌─────────────────────────────────┐
│ ← Back                          │
├─────────────────────────────────┤
│   🎯 Complete your QoL          │
│      Assessment                 │
│                                 │
│   WHY THIS ACTION?              │
│   "You've discovered your       │
│   genius. Now map where you     │
│   stand in life's 8 domains."   │
│                                 │
│   WHAT YOU'LL GET:              │
│   • 8-domain life snapshot      │
│   • See priorities clearly      │
│   • Unlock Growth Paths         │
│                                 │
│   TIME: ~10 minutes             │
│                                 │
│   [Start Assessment →]          │
└─────────────────────────────────┘
```

### Screen 3: CelebrationScreen (Modal)

After completing an action:

```
┌─────────────────────────────────┐
│                                 │
│         🎉 LEVEL UP! 🎉         │
│                                 │
│     [Confetti Animation]        │
│                                 │
│       +50 XP Earned             │
│                                 │
│   "QoL Assessment Complete!"    │
│                                 │
│   NEW UNLOCK:                   │
│   🔓 Growth Paths now available │
│                                 │
│       [Continue →]              │
│                                 │
└─────────────────────────────────┘
```

---

## 1.4 SCREEN DETAILS (Three Dan Tians)

### NextMoveHomeScreen

| Dan Tian | Content |
|----------|---------|
| 🫀 **Heart** | Pride ("I'm growing"), Clarity ("I see my path"), Relief ("I know what to do") |
| 🧠 **Mind** | "Here's who I am, where I stand, and what's next" |
| 🔥 **Gut** | **"Start [Action Name]"** — single primary CTA |

### ActionDetailScreen

| Dan Tian | Content |
|----------|---------|
| 🫀 **Heart** | Motivation ("This makes sense"), Anticipation ("I want to do this") |
| 🧠 **Mind** | "Here's why this action, what I'll get, how long it takes" |
| 🔥 **Gut** | **"Start [Action]"** — single primary CTA |

### CelebrationScreen

| Dan Tian | Content |
|----------|---------|
| 🫀 **Heart** | Joy ("I did it!"), Pride ("I'm leveling up"), Excitement ("What's next?") |
| 🧠 **Mind** | "+XP earned, what I unlocked" |
| 🔥 **Gut** | **"Continue"** — return to hub with new state |

---

## 1.5 EXTENSIONS

### Artifacts Produced
- `recommendation_history` — log of shown recommendations
- `completed_actions[]` — what user has done
- `xp_events[]` — XP awards

### Emotional States
| Screen | Primary Emotion |
|--------|-----------------|
| NextMoveHome | Clarity + Relief |
| ActionDetail | Motivation |
| Celebration | Joy + Pride |

### Completion Criteria
- User completes recommended action
- OR user explicitly chooses to explore instead

### Skip Paths
- User can tap "Explore Other Options" to browse all spaces
- No penalty for exploring vs following recommendation

### Bridges (Connected Modules)

| From My Next Move | To |
|-------------------|----|
| Recommend ZoG | → GROW / Unique Gift |
| Recommend QoL | → GROW / Quality of Life |
| Recommend Resources | → GROW / Asset Mapping |
| Recommend Mission | → GROW / Mission Discovery |
| Recommend Library | → LEARN / Practice Library |
| Recommend Growth Paths | → LEARN / Growth Paths |
| Nudge COLLABORATE | → COLLABORATE / Matchmaking |
| Nudge BUILD | → BUILD / Unique Business |

---

## 1.6 WIREFRAMES

### Mobile (375px) — NextMoveHomeScreen

```
┌─────────────────────────────────┐
│ ☰                    ⚙️        │
├─────────────────────────────────┤
│                                 │
│         [Avatar]                │
│      Alexander K.               │
│        Level 3                  │
│   ████████░░░░ 340/500 XP       │
│                                 │
├─────────────────────────────────┤
│   MY LIFE                       │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │Health│ │Career│ │Money │    │
│  │ 7.2  │ │ 6.5  │ │ 5.8  │    │
│  └──────┘ └──────┘ └──────┘    │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │Relat.│ │Growth│ │Spirit│    │
│  │ 8.1  │ │ 7.0  │ │ 6.2  │    │
│  └──────┘ └──────┘ └──────┘    │
│                                 │
├─────────────────────────────────┤
│   MY NEXT MOVE                  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🎯                       │  │
│  │  Complete your Resources  │  │
│  │  Assessment               │  │
│  │                           │  │
│  │  Map what you have to     │  │
│  │  offer the world          │  │
│  │                           │  │
│  │  ⏱️ 15 min                │  │
│  │                           │  │
│  │  [ Start Now → ]          │  │
│  └───────────────────────────┘  │
│                                 │
│  ▼ Explore All Spaces           │
│                                 │
└─────────────────────────────────┘
```

---

## 🔥 ROAST GATE 1: PRODUCT

### Flow Walkthrough
- [x] User lands on NextMoveHomeScreen
- [x] Sees: Me section (who I am), My Life (where I stand), My Next Move (what to do)
- [x] Taps "Start Now" → navigates to recommended module
- [x] Completes module → returns with CelebrationScreen
- [x] CelebrationScreen shows XP + unlocks → tap Continue
- [x] Back to NextMoveHomeScreen with new recommendation

### Navigation Edges
- NextMoveHome → Any recommended module (ZoG, QoL, Resources, etc.)
- Any module completion → CelebrationScreen (modal)
- CelebrationScreen → NextMoveHome (updated state)
- NextMoveHome → Explore (expands space navigation)

### Roast Findings

**Cycle 1: Usability**
- ✅ Clear hierarchy: Me → Life → Next Move
- ✅ Single primary CTA prominent
- ✅ Explore option available but secondary

**Cycle 2: Edge Cases**
- ⚠️ What if all GROW actions completed? → Default to LEARN
- ⚠️ What if user has no ZoG yet? → ZoG is first recommendation
- ✅ Copy is motivational, not pushy

**Cycle 3: What Was Missed?**
- ⚠️ Need empty state for brand new user → Show "Start your journey" instead of QoL scores
- ✅ Mobile-first works well

### Fixes Applied
- Added logic: if no ZoG, first action = ZoG
- Added empty state handling for new users
- Default to LEARN when GROW is complete

---

**✓ PHASE 1 COMPLETE — Proceed to PHASE 2: ARCHITECTURE**
