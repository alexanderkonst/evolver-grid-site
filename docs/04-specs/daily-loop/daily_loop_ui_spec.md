# Daily Loop UI Spec

> **Module:** Daily Loop (Game Home)
> **Purpose:** Define visual design for Daily Loop components
> **Emotional Mode:** Calm confidence — not flashy, not guilt-inducing

---

## 1. Visual Rules Applied

### Colors From Token Palette

| Element | Token | HEX |
|---------|-------|-----|
| Background | `--wabi-background` | Pearl/near-white |
| Primary CTA | Electric Violet gradient | `#8460ea` → `#6894d0` |
| Text primary | Charcoal Indigo | `#2c3150` |
| Text secondary | `--wabi-text-secondary` | Muted slate |
| Section cards | White with subtle border | `#ffffff` |
| Accent (highlight) | `--depth-violet` | `#8460ea` |
| MY LIFE domains | Pastel spectrum (8 colors) | See domain mapping |

### Domain Color Mapping

| Domain | Color | HEX |
|--------|-------|-----|
| Wealth | Champagne Beige | `#cec9b0` |
| Health | Pale Sage | `#b1c9b6` |
| Happiness | Lavender | `#a4a3d0` |
| Love | Blush Pink | `#cea4ae` |
| Impact | Royal Blue | `#29549f` |
| Growth | Lilac | `#c8b7d8` |
| Social | Orchid | `#cdaed2` |
| Home | Aqua | `#a7cbd4` |

---

## 2. Component Designs

### 2.1 MeSummary Component

**Purpose:** Show who I am at a glance.

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌────┐                                     │
│  │ 🧠 │  The Visionary Architect            │
│  └────┘  Level 4 · 1,250 XP                 │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │ XP progress bar (to level 5)         │   │
│  └──────────────────────────────────────┘   │
│                                             │
│            [View Profile →]                  │
│                                             │
└─────────────────────────────────────────────┘
```

**Styling:**
- Card: `bg-white rounded-2xl shadow-sm border border-slate-100`
- Archetype icon: 48x48, gradient background `from-[var(--wabi-lavender)] to-[var(--depth-violet)]`
- Title: `text-xl font-bold text-[var(--wabi-text-primary)]`
- Level/XP: `text-sm text-[var(--wabi-text-muted)]`
- Progress bar: `bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)]`
- Link: `text-sm text-[var(--depth-violet)] hover:underline`

---

### 2.2 MyLifeSummary Component

**Purpose:** Show where I am across 8 domains.

```
┌─────────────────────────────────────────────┐
│                                             │
│              MY LIFE                        │
│                                             │
│   💰 ❤️ 😊 💕 🌍 📈 👥 🏠                    │
│   [3][7][5][6][4][5][6][7]                  │
│                                             │
│   "Focus: Wealth (3), Impact (4)"           │
│                                             │
│            [See Details →]                   │
│                                             │
└─────────────────────────────────────────────┘
```

**Alternative: Mini radar chart (8 points)**

**Styling:**
- Card: `bg-white rounded-2xl shadow-sm border border-slate-100`
- Title: `text-lg font-semibold text-[var(--wabi-text-primary)]`
- Domain icons: 32x32, color from domain mapping
- Score indicators: Small circles with opacity based on score (1=10%, 10=100%)
- Focus text: `text-sm text-[var(--wabi-text-secondary)] italic`
- Link: `text-sm text-[var(--wabi-sage)] hover:underline`

---

### 2.3 NextMoveCard Component

**Purpose:** Show ONE action to take now.

```
┌─────────────────────────────────────────────┐
│                                             │
│         MY NEXT MOVE                        │
│                                             │
│   ┌───────────────────────────────────────┐ │
│   │                                       │ │
│   │  🎯  Draft Your Offer Headline        │ │
│   │                                       │ │
│   │  Genius Path · 10 min                 │ │
│   │                                       │ │
│   │  "Your lowest area (Wealth) links     │ │
│   │   to your Genius development."         │ │
│   │                                       │ │
│   │  ┌─────────────────────────────────┐  │ │
│   │  │          START                  │  │ │
│   │  │          +15 XP                 │  │ │
│   │  └─────────────────────────────────┘  │ │
│   │                                       │ │
│   └───────────────────────────────────────┘ │
│                                             │
│   "Not this? Explore more →"                │
│                                             │
└─────────────────────────────────────────────┘
```

**Styling:**
- Outer card: `bg-gradient-to-br from-[var(--wabi-lavender)]/10 to-[var(--wabi-pearl)] rounded-2xl p-6`
- Inner card: `bg-white rounded-xl shadow-md p-6`
- Icon: 40x40, color matches vector
- Title: `text-xl font-bold text-[var(--wabi-text-primary)]`
- Meta: `text-sm text-[var(--wabi-text-muted)]`
- Why text: `text-sm text-[var(--wabi-text-secondary)] italic`
- START button: `w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]`
- XP badge: `text-xs text-[var(--wabi-text-muted)]`
- Explore link: `text-sm text-[var(--wabi-text-muted)] hover:text-[var(--depth-violet)]`

---

### 2.4 EmptyStateCard Component

**Purpose:** Handle missing data gracefully.

```
┌─────────────────────────────────────────────┐
│                                             │
│              🌟                             │
│                                             │
│      Let's discover who you are             │
│                                             │
│      [Discover My Genius →]                 │
│                                             │
└─────────────────────────────────────────────┘
```

**Styling:**
- Card: `bg-gradient-to-br from-[var(--wabi-lavender)]/20 to-white rounded-2xl p-8 text-center`
- Icon: 48x48, centered
- Text: `text-lg text-[var(--wabi-text-secondary)]`
- CTA: Secondary button style `border-2 border-[var(--depth-violet)] text-[var(--depth-violet)] rounded-xl px-6 py-3`

---

### 2.5 CelebrationModal Component

**Purpose:** Reinforce progress after action completion.

```
┌─────────────────────────────────────────────┐
│                                             │
│                  ✨                         │
│                                             │
│           Well done!                        │
│                                             │
│      +15 XP → Genius Path                   │
│                                             │
│   ┌──────────────────────────────────────┐  │
│   │ [progress bar fills with animation]  │  │
│   └──────────────────────────────────────┘  │
│                                             │
│        Your next move is ready              │
│                                             │
│            [CONTINUE]                       │
│                                             │
└─────────────────────────────────────────────┘
```

**Styling:**
- Overlay: `fixed inset-0 bg-black/40 backdrop-blur-sm`
- Modal: `bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-auto`
- Sparkle: Animate pulse `animate-pulse`
- Title: `text-2xl font-bold text-[var(--wabi-text-primary)]`
- XP text: `text-lg text-[var(--depth-violet)] font-semibold`
- Progress bar: Animate fill over 1s
- CTA: Primary button style

---

## 3. Layout Template

### GameHome Layout (Mobile-first)

```
┌─────────────────────────────────────────┐
│  [GameShellV2 Header]                   │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │        ME SUMMARY               │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │      MY LIFE SUMMARY            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │      NEXT MOVE CARD             │    │
│  │                                 │    │
│  │                                 │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [GameShellV2 Bottom Nav]               │
└─────────────────────────────────────────┘
```

**Container:** `max-w-2xl mx-auto px-4 py-6 space-y-6`

---

## 4. Micro-interactions

| Element | Hover | Active | Transition |
|---------|-------|--------|------------|
| START button | `scale-[1.02]` | `scale-[0.98]` | `transition-all duration-200` |
| Cards | `shadow-md → shadow-lg` | - | `transition-shadow` |
| Links | `underline` | - | - |
| Progress bars | Animate fill | - | `transition-all duration-1000` |
| Celebration modal | Fade in + scale up | - | `animate-in fade-in zoom-in-95` |

---

## 5. Brandbook Integration

| Moment | Emotional Mode | Application |
|--------|----------------|-------------|
| Home load | Calm confidence | Soft pastels, clean layout |
| See Next Move | Energizing clarity | Violet gradient button stands out |
| Complete action | Celebration | Sparkle animation, XP fill |
| No data state | Warm invitation | Encouraging text, gentle CTA |

---

## 6. Gestalt Check (Pre-Implementation)

**Before coding, answer these:**

- [ ] **First Impression Test:** Does the Home screen feel like "home"?
- [ ] **Premium Feel Test:** Would user say "wow" at the simplicity and clarity?
- [ ] **Consistency Test:** Same button style, same card style everywhere?
- [ ] **Breathing Room Test:** Enough whitespace between sections?
- [ ] **Signal vs Noise:** Every element carries meaning?

---

## 7. Files to Create

| File | Purpose |
|------|---------|
| `components/game/MeSummary.tsx` | Who I am section |
| `components/game/MyLifeSummary.tsx` | 8-domain mini view |
| `components/game/NextMoveCard.tsx` | ONE action card |
| `components/game/EmptyStateCard.tsx` | Missing data states |
| `components/game/CelebrationModal.tsx` | XP award modal |

---

*Daily Loop UI Spec v1.0*
*Created: 2026-01-27*
