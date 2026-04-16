# Landing Page Spec — Seven-Step Circular Hero

> ⚠️ **SUPERSEDED — April 16, 2026.** This spec is kept for historical reference only. The canonical instruction is now `docs/05-specs/claude_code_handoff_playbook_funnel.md`, which consolidates landing + auth + claim + assessment into one end-to-end spec. If anything here disagrees with the consolidated handoff, the handoff wins.

*For Claude Code (Mac app) to implement in `src/`. Prepared by Claude in Cowork, April 15, 2026, Day 41.*

*Supersedes the current App Store grid layout in `src/pages/MethodologyLandingPage.tsx` for the `/` route. Everything else on the page (testimonials, other-projects link, social proof) stays as-is.*

---

## Goal

Replace the hero section + 7-tile grid with:

1. **New hero headline** (centered, above the infographic)
2. **Circular 7-step infographic** (animated, below the hero)
3. **CTA button** (below the infographic)

Keep the `GameShellV2` wrapper. Keep testimonials + other-projects link + social-proof counter below. Keep the page mounted at `/` via `JourneyPage.tsx`.

---

## Route + component map

| Surface | File | Action |
|---------|------|--------|
| `/` route | `src/App.tsx` | No change — still renders `<JourneyPage />` |
| Shell | `src/pages/JourneyPage.tsx` | No change |
| Page body | `src/pages/MethodologyLandingPage.tsx` | REPLACE hero + grid with hero + infographic + CTA. Keep testimonials + footer blocks below |
| New asset | `public/images/landing/seven-steps-infographic.png` (and `.webp`, `.mp4`, `.webm`) | Generate via Gemini 3.1 Flash Image Preview (still) + Veo 3 (loop). See `docs/08-content/landing_page_infographic_prompts.md` |
| Playbook page | `src/pages/PlaybookPage.tsx` | NEW — placeholder stub for now. CTA routes here after auth. Full build = next task |

---

## Hero section

Replace lines 162–193 of the current `MethodologyLandingPage.tsx` with:

```tsx
<header className="text-center mb-10">
  <h1
    className="text-2xl sm:text-3xl md:text-[2.4rem] font-semibold leading-[1.2] tracking-[-0.02em] mb-4"
    style={{
      fontFamily: "'Cormorant Garamond', serif",
      color: "#0a1628",
    }}
  >
    Unnamed talent{" "}
    <span
      className="bg-clip-text text-transparent"
      style={{ backgroundImage: "linear-gradient(135deg, #8460ea, #29549f)" }}
    >
      →
    </span>{" "}
    thriving biz in flow.
  </h1>
  <p
    className="text-sm sm:text-base uppercase tracking-[0.24em] mt-2"
    style={{ color: "#1a2a44", fontWeight: 500 }}
  >
    In seven steps.
  </p>
</header>
```

**Rationale**:
- Cormorant Garamond serif for the headline — inscription feel, matches brandbook "inscription font" note.
- Arrow as gradient accent in electric violet → royal blue (Strip 1 palette).
- "IN SEVEN STEPS" as uppercase tracker-wide subhead — ritual quality.
- No extra body copy below — the image carries the message.

---

## Infographic section (new)

Between hero and testimonials. Use `<video>` with `<img>` fallback.

```tsx
{/* ═══════ INFOGRAPHIC ═══════ */}
<section className="relative mb-10" aria-label="The seven-step journey">
  <figure className="relative aspect-square max-w-[520px] mx-auto">
    <video
      autoPlay
      loop
      muted
      playsInline
      poster="/images/landing/seven-steps-infographic.webp"
      className="w-full h-full rounded-3xl object-cover"
      style={{
        boxShadow:
          "0 20px 60px -20px rgba(132, 96, 234, 0.35), 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <source src="/images/landing/seven-steps-infographic.mp4" type="video/mp4" />
      <source src="/images/landing/seven-steps-infographic.webm" type="video/webm" />
      {/* Image fallback if video fails */}
      <img
        src="/images/landing/seven-steps-infographic.webp"
        alt="Seven-step circular journey from unnamed talent to thriving business in flow, with a dragonfly at the top of the circle"
        className="w-full h-full rounded-3xl object-cover"
      />
    </video>
    <figcaption className="sr-only">
      A circle with seven luminous nodes. An unnamed-talent origin point sits
      just off the circle at the left. Light travels clockwise, touching each
      node in turn, arriving at a dragonfly at the top of the circle — the
      symbol of flow.
    </figcaption>
  </figure>

  {/* Step labels — optional overlay or below. For v1, keep off the image
      and surface them in the testimonial row or a subtle caption row. */}
</section>
```

### CSS fallback for motion (until Veo 3 video is generated)

If the `.mp4` asset isn't available yet, the `<video>` will fall through to `<img>` silently. The image alone is still beautiful. The motion upgrade is non-blocking.

Optional: add a very subtle CSS animation on the wrapper:

```css
@keyframes gentle-breath {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.01); filter: brightness(1.04); }
}
.infographic-breathing {
  animation: gentle-breath 6s ease-in-out infinite;
}
```

Apply `.infographic-breathing` to the `<figure>`.

---

## CTA button (new)

Below the infographic.

```tsx
{/* ═══════ CTA ═══════ */}
<div className="flex flex-col items-center gap-3 mb-16">
  <button
    onClick={() => navigate("/auth?next=/playbook")}
    className={cn(
      "liquid-glass-strong px-8 py-4 rounded-full",
      "text-sm sm:text-base font-semibold tracking-wide uppercase",
      "transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]",
      "focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
    )}
    style={{
      color: "#0a1628",
      border: "1px solid rgba(132, 96, 234, 0.35)",
      backgroundImage:
        "linear-gradient(135deg, rgba(231, 233, 229, 0.9), rgba(200, 183, 216, 0.9))",
      boxShadow:
        "0 8px 32px -8px rgba(132, 96, 234, 0.5), inset 0 1px 1px rgba(255,255,255,0.5)",
    }}
  >
    Read the playbook
  </button>
  <p
    className="text-[11px] uppercase tracking-[0.2em]"
    style={{ color: "#1a2a44", opacity: 0.7 }}
  >
    Email-only. No password. One click.
  </p>
</div>
```

**Rationale**:
- Pill shape — friendlier than rect, matches "grasshopper leap" threshold metaphor.
- Pearl → lilac gradient — Strip 2 palette, not aggressive.
- Electric violet border — the one accent color across the site.
- Subcopy below the button is the magic-link reassurance — removes friction concern.

---

## Signup flow (email-only magic link)

The CTA navigates to `/auth?next=/playbook`. The existing `src/pages/Auth.tsx` should handle the `next` query param — after successful magic-link verification, redirect to `/playbook`.

### If `Auth.tsx` does not yet support `?next=` param

Minimal patch:

```tsx
// In Auth.tsx, after successful magic-link send or verification:
const searchParams = new URLSearchParams(window.location.search);
const nextPath = searchParams.get("next") || "/game/journey";
navigate(nextPath);
```

Backend (Supabase):
- Use `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + "/auth/callback?next=/playbook" } })`.
- The callback route stores the session and redirects to `/playbook`.

If a silent account creation + magic-link backend task already sits in the roadmap (Active Backlog item 14), this CTA is the demand side of that work.

---

## Playbook page stub (new, placeholder)

Create `src/pages/PlaybookPage.tsx` as a gated placeholder. Full content comes in the next session.

```tsx
import GameShellV2 from "@/components/game/GameShellV2";

const PlaybookPage = () => (
  <GameShellV2>
    <div className="max-w-[740px] mx-auto px-5 py-16 text-center">
      <h1
        className="text-3xl md:text-4xl font-semibold mb-4"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#0a1628" }}
      >
        The Playbook
      </h1>
      <p className="text-sm sm:text-base" style={{ color: "#1a2a44" }}>
        Coming soon — the full seven-step playbook, free to read.
      </p>
    </div>
  </GameShellV2>
);

export default PlaybookPage;
```

Wire the route in `src/App.tsx`:

```tsx
import PlaybookPage from "./pages/PlaybookPage";
// ...
<Route path="/playbook" element={<RequireAuth><PlaybookPage /></RequireAuth>} />
```

`RequireAuth` wraps it — so the page is the reward for signing up.

---

## What stays

| Block | Location in current file | Keep as-is |
|-------|--------------------------|------------|
| Testimonials section | Lines 347–360 | Yes |
| Other-projects link | Lines 362–385 | Yes |
| Social proof counter | Lines 387–406 | Yes — sits below testimonials |
| The `STEPS` const | Lines 33–111 | **DELETE** — no longer used on this page. Keep the data somewhere (maybe `src/data/steps.ts`) for use in the playbook and Journey sub-pages |
| The `TileIcon` component | Lines 115–151 | **DELETE** — grid removed |
| `useJourneyProgression` hook | Import line 4 | **DELETE from this file** — still used elsewhere |

---

## Assets needed (Sasha / Claude Code delivers)

1. **Generate the infographic** — paste the Gemini 3.1 Flash Image Preview prompt from `docs/08-content/landing_page_infographic_prompts.md` into aistudio.google.com. Save highest-res PNG as `public/images/landing/seven-steps-infographic.png` (2048×2048). Convert to WebP.

2. **Generate the video loop** (optional for v1, can ship without) — use Veo 3 or Runway with the static PNG as first frame and the video prompt from the same doc. Save as `public/images/landing/seven-steps-infographic.mp4` (1080×1080, 30fps, 4s loop).

3. **Ship v1 without video** if Veo access is slow — the `<video>` tag falls back to `<img>` automatically. Add Veo loop later as a silent enhancement.

---

## Testing checklist

- [ ] `/` loads the new hero + infographic + CTA
- [ ] Headline renders in serif with gradient arrow
- [ ] Infographic sits centered, aspect-square, max-width 520px
- [ ] Video plays muted, loops, no controls — OR fallback image shows if no video
- [ ] CTA button navigates to `/auth?next=/playbook`
- [ ] After magic-link signup, user lands on `/playbook`
- [ ] `/playbook` is gated — unauthenticated users get bounced to `/auth`
- [ ] Testimonials, other-projects, social-proof all still render below
- [ ] Mobile: headline wraps gracefully, infographic scales, CTA readable
- [ ] Dark mode already handled by `GameShellV2` wrapper — no extra work

---

## Out of scope for this task

- Full playbook page content (next session).
- Step labels overlaid on the infographic (the image itself carries them).
- A/B testing. Not ripe yet per "The One Rule" — we need more people in the funnel first, not a better funnel.
- Changing the `GameShellV2` sidebar nav.

---

*Spec complete. Drop into Claude Code Mac app. Any ambiguity — ask, don't guess.*
