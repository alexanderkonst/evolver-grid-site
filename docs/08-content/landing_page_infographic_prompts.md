# Landing Page Infographic — Generation Prompts

*For the `/` homepage hero. Replaces the App Store grid with a circular 7-step hero's journey infographic. Based on Sasha's Day 41 download sketch. April 15, 2026.*

---

## Source sketch (what the user drew)

A golden-ink hand drawing on dark paper. A smiling dragonfly sits at the top of a circle (step 7½, the wings open wide). Seven dots around the circle, numbered 2 at right, 3 bottom-right, 4 bottom, 5 bottom-left, 6 top-left. Step 1 sits just off-circle at the left edge (the origin). Above: *"Unnamed talent → thriving biz in flow. IN SEVEN STEPS."*

---

## Infographic Image-Gen Prompt (Gemini 3.1 Flash Image Preview / Nano Banana 2)

Paste the prompt block directly into aistudio.google.com with model **Gemini 3.1 Flash Image Preview**. Aspect ratio: **1:1 square** (can be cropped to 4:5 for mobile hero).

```
Circular hero's-journey infographic, 1:1 square format, ethereal and sacred.

Composition:
- A perfect circle centered in the frame, drawn as a thin luminous thread that glows from within.
- Seven equidistant nodes sit on the circle. A subtle eighth node hovers just outside the circle on the left edge — the "unnamed talent" origin point, smaller and dimmer, waiting to cross the threshold.
- At the top of the circle (12 o'clock) a translucent dragonfly with diaphanous, iridescent wings rests with wings half-open, as if it just landed. The dragonfly is the completion symbol — step 7½ — the soul arriving in flow.
- Between nodes, the circular thread is made of soft particle trails — like breath or pollen catching light — not a hard line. Gentle motion implied, clockwise.

Color and atmosphere:
- Background: deep periwinkle-to-midnight gradient (#1e4374 → #342c48 → #2c3150), with veils of iridescent pastel haze (lavender #a4a3d0, lilac #c8b7d8, seafoam #a7cbd4, blush #cea4ae, pearl #e7e9e5) drifting across the frame like aurora or soft-focus bokeh.
- The circle itself glows in electric violet #8460ea at its thinnest points, shifting to pearl #e7e9e5 at the brightest points.
- The seven numbered nodes pulse subtly, each a tiny orb with a soft halo in a pastel tone from the Evolver palette (lavender, lilac, seafoam, blush, pale sage, champagne beige, pearl).
- The dragonfly wings refract light like dichroic glass — violet → seafoam → rose-gold shimmer.

Typography (optional, bilingual-friendly):
- Small numerals "1" through "7" placed just inside the circle next to each node, in a refined uppercase serif (think Cormorant Garamond), white-pearl with 60% opacity.
- No other text. The image carries symbol alone.

Aesthetic direction:
- Wabi-sabi meets Apple Industrial Design. Ultra-minimalist, institutional-grade finish, bokeh-softened depth of field.
- Not decorative — inscriptional. Etched, not printed. Like a sacred diagram rendered in light.
- Avoid: clipart feel, cartoon flatness, generic fantasy, neon arcade glow, emoji, kitsch.
- Think: Hilma af Klint meets James Turrell meets a James Webb nebula capture, rendered in the language of a high-end product launch.

Output: A single 1:1 square image at highest available quality. Transparent background NOT required — ship with the full atmospheric gradient as part of the composition, so the image can sit on top of the site's existing iridescent backdrop without visual conflict.
```

### Variations to try
- Replace "dragonfly" with "luminous moth" if dragonfly reads too literal.
- For light-background version, swap the deep periwinkle→midnight gradient for pearl #e7e9e5 → icy white #dcdde2, and make the circle thread electric violet on the lighter field.
- For bilingual headline treatment above the infographic, add: *"In the top margin, render a single line of refined serif lettering — in English: 'Unnamed talent → thriving biz in flow. In seven steps.'"*

---

## Video Animation Prompt (Veo 3 / Runway Gen-3 / Google Stitch video)

Run on top of the static infographic (upload as first frame). **Duration: 3–5 seconds, seamless loop.**

```
Seamless 4-second loop. Camera locked, no pan or zoom. Starting frame: the circular hero's-journey infographic.

Animation layers:

1. Living light travels clockwise along the circle — a luminous pearl-and-violet filament tracing the path from the unnamed-talent origin (off-circle left) into node 1, then smoothly arcing through nodes 2, 3, 4, 5, 6, 7, finally arriving at the dragonfly at the top. The light does not jump — it flows like breath, each arc taking ~500ms.

2. As the traveling light reaches each node, the node pulses once — a soft bloom outward in its signature pastel color (lavender for 1, lilac for 2, seafoam for 3, pale sage for 4, blush for 5, champagne beige for 6, pearl for 7), then settles.

3. The dragonfly's wings open by two degrees when the light arrives at its node, then close back. Barely perceptible. Like a breath.

4. Throughout the loop, the iridescent aurora haze in the background drifts slowly — very slow parallax, less than 1 pixel per frame. Not distracting. Just alive.

5. At the end of the loop, the traveling light dissolves into pearl mist that reforms at the origin point, ready to begin again. The loop is seamless — the end-frame matches the start-frame exactly.

Style: painterly, luminous, sacred. No hard edges. Motion blur on the traveling light. Grain texture preserved from the source image. Deep depth of field preserved — background stays softly out of focus.

Avoid: harsh flashing, rapid cuts, cartoony bounce, video-game particle effects, generic "magic sparkle" overlays.

Technical: MP4, H.264, 1080×1080 (1:1), 30fps, seamless loop enabled (first frame === last frame).
```

### Fallback (CSS-only animation in the browser)

If Veo / Runway access is slow, we can ship a CSS/SVG version in-code:
- Static PNG infographic as base layer.
- SVG circle overlay with `stroke-dasharray` + `stroke-dashoffset` animating clockwise over 4 seconds on infinite loop.
- Each node: `@keyframes` pulse tied to the stroke-offset position, offset by `0.125 * duration` for each of the 7 nodes.
- Wings: SVG `transform: rotate()` tied to the same loop, +2deg at t=0.9, back to 0deg at t=1.0.

This fallback ensures the page has motion from day one even before the Veo video is generated. The Veo video can be swapped in later as a `<video autoplay loop muted playsinline>` replacement.

---

## File output conventions

| Asset | Path | Note |
|-------|------|------|
| Static infographic PNG | `public/images/landing/seven-steps-infographic.png` | 1:1 square, 2048×2048 minimum |
| Static infographic WebP (perf) | `public/images/landing/seven-steps-infographic.webp` | Same dimensions, optimized |
| Video loop MP4 | `public/images/landing/seven-steps-infographic.mp4` | 4s, 30fps, 1080×1080 |
| Video loop WebM (fallback) | `public/images/landing/seven-steps-infographic.webm` | Same, VP9 codec |

The React component will use `<picture>` + `<video>` with graceful degradation: video if browser supports, static WebP if not, PNG fallback for very old browsers.
