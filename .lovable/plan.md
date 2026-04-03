

## Fix Game Shell Panel Contrast

### Problem
- Panel 2 (SectionsPanel) at `bg-black/25` looks nearly identical to Panel 1 (`bg-black/50`) — not enough visual separation
- Panel 3 (Content) at `bg-white/5 backdrop-blur-xl` is too dark for the 126+ content files that use dark text colors (`text-[#2c3150]`, `text-[rgba(44,49,80,0.7)]`) and light card backgrounds (`bg-white/85`)

### Strategy
Rather than rewriting 126 files to use white text, we make Panel 3 light enough that existing dark text is readable. This creates a natural left-to-right brightness gradient: **dark → medium → light**.

### Changes

**1. SectionsPanel.tsx — Panel 2 lighter**
- Change `bg-black/25` → `bg-black/10` (currently too close to Panel 1's `bg-black/50`)
- This creates a clear visual step between the two dark panels

**2. GameShellV2.tsx — Panel 3 significantly lighter**
- Desktop: change `bg-white/5 backdrop-blur-xl` → `bg-white/70 backdrop-blur-xl`
- Mobile content view: apply same `bg-white/70 backdrop-blur-xl` treatment
- This makes the content area a frosted-light surface where dark text is fully readable, while the gradient still subtly shows through

**3. GameShellV2.tsx — Mobile header bar**
- Mobile content header uses `liquid-glass-strong` — change to `bg-white/80 backdrop-blur-xl` so the back button and title have proper contrast against the now-lighter content area
- Update mobile header text from `text-white` → `text-[#2c3150]` to match the lighter background

### Result
```text
Panel 1          Panel 2          Panel 3
bg-black/50      bg-black/10      bg-white/70
(darkest)        (medium dark)    (light frosted)
```

All 126 content files with dark text colors work as-is. The gradient.jpg still bleeds through Panel 3 at ~30% opacity, maintaining the glass feel without sacrificing readability.

### Files to edit
1. `src/components/game/SectionsPanel.tsx` — line 258: `bg-black/25` → `bg-black/10`
2. `src/components/game/GameShellV2.tsx` — line 344: Panel 3 desktop bg; lines 403-416: mobile content header

