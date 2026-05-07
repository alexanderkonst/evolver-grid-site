## Root cause

The Top Talent assessment route `/zone-of-genius/assessment/*` mounts `ZoneOfGeniusAssessmentLayout`, which renders inside `<GameShellV2 hideLogo>` — but does **not** pass `hideNavigation`. The shell then decides whether to show or hide its panes based on the user's `onboarding_stage`, which is fetched async after mount. This produces the flicker the user is seeing.

Sequence for a logged-in user with `onboarding_stage = "new"` or `"zog_started"` (the typical assessment-taker):

```text
t0  Mount → profile = null
    isPublicSurface = false  (assessment path is NOT in the allowlist:
                              "/", "/ai-os*", "/codex", "/playbook*",
                              "/path", "/dashboard")
    earlyOnboardingHide = false (profile not loaded yet)
    hideNavigation = false      → FULL shell renders (Pane 1 + Pane 2 visible)
                                   ← screenshot #2 shows this state

t1  Profile fetch resolves, stage = "new" / "zog_started"
    earlyOnboardingHide = true  → hideNavigation = true
                                → Navless render path (logo only)
                                   ← shell "disappears"

t2  Auth state listener fires again on tab focus / token refresh
    → setProfile(null) momentarily during reload
    → earlyOnboardingHide flips back to false → shell reappears
    → fetch completes again → hides again
```

The Day-47 comment in `GameShellV2.tsx` (line 457) explicitly states the design intent: *"forceHideNavigation (set explicitly by assessment Step1‑4 pages) still wins — those pages truly need full focus."* But `ZoneOfGeniusAssessmentLayout` never sets that prop, so the intent was never wired through after the layout was migrated to `GameShellV2`.

## Fix

One-line change in `src/modules/zone-of-genius/ZoneOfGeniusAssessmentLayout.tsx`:

```tsx
<GameShellV2 hideLogo hideNavigation>
```

This:
1. Restores the documented "focus mode" for the 4-step assessment funnel.
2. Eliminates the flicker — `hideNavigation` is now decided synchronously from props, not from an async profile fetch.
3. Removes the dependency on `onboarding_stage` for this route entirely, so guests, half-onboarded users, and fully-unlocked users all see the same calm assessment surface.

## Verification

After the change, on `/zone-of-genius/assessment/step-1`:
- No Pane 1 / Pane 2 ever render.
- No flicker on initial load, on tab refocus, or after auth token refresh.
- Step indicator + talent grid render immediately on the cream surface.
- Other routes (`/`, `/playbook`, `/path`, `/game/*`) are unaffected.

## Files touched

- `src/modules/zone-of-genius/ZoneOfGeniusAssessmentLayout.tsx` — add `hideNavigation` prop to the `GameShellV2` wrapper (1 line).
