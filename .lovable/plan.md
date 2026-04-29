# /ai-os iOS Crash — Bisection Plan

## What we now know that we didn't before

1. **No `bare=1` / `empty=1` handling exists in the codebase.** The "stripped" tests from the previous 3 hours did not actually strip anything. Every test ran the full module. This invalidates the strongest piece of evidence the prior diagnosis rested on.
2. **No service worker.** Stale-cache hypothesis is dead.
3. **GameShellV2 already suppresses its own MuxVideoBackground on `/ai-os`** (`src/components/game/GameShellV2.tsx:597-625`), so "two stacked HLS streams" is not the cause.
4. **Routes that survive on iOS** (`/`, `/library`, `/path`, `/dashboard`) **do** mount `MuxVideoBackground`. So the shell's HLS video is not, by itself, an iOS killer.
5. **The `isHeavyFxCapable` gate** (`AiOsPage.tsx:2528-2533`) determines whether `HlsVideo`, `StarryBackground`, cursor-glow, and parallax `will-change-transform` mount. On iOS it should evaluate `false` (`pointer: coarse` is true). If it ever returns `true` on iOS Chrome, mobile gets the desktop render path — which is provably too heavy.
6. **Hero compositing surface** even with `isHeavyFxCapable=false`: a fullscreen poster (z-0) + fixed gradient overlay (z-1) + fixed vignette (z-1, radial-gradient) + fixed noise overlay (z-2, tiled SVG `feTurbulence`) + main content (z-10) + GameShellV2 chrome on top. Three text shadows per heading and `WebkitBackgroundClip: text` with gradient on `<h1>`. Most of this is cheap, but it stacks with the shell's own layers.

## Hypothesis ranking after this round

1. **`isHeavyFxCapable` returns `true` on iOS Chrome** — small mistake in the gate produces the desktop-only render path on a phone, which is known too heavy. **Cheapest to verify, highest leverage.**
2. **GPU-process OOM from the stacked compositing layers** even on the gated mobile path, when combined with the shell's chrome. Not the JS heap.
3. **Some non-render side effect that fires on /ai-os and not on the survivor routes** — body background mutation in two effects, the `data-ai-os` attribute interacting with global CSS in an unexpected way.
4. **JS-heap pressure from PROMPTS / SUITE_FUSIONS at module-eval** — possible, lowest of the live hypotheses, hardest to fix.

## Test plan — three deploys, each cuts the search space cleanly

These tests are designed so each one **definitively kills hypotheses**, not so each one is a candidate fix. None of them are intended to ship.

### Test A — Instrument the gate (5-line change, 30-second deploy)

Add a top-level effect in `AiOsPage.tsx` that writes the result of all the device-detection branches to the page itself, before anything heavy runs:

```tsx
useEffect(() => {
  const data = {
    isHeavyFxCapable,
    pointerCoarse: window.matchMedia('(pointer: coarse)').matches,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    dpr: window.devicePixelRatio,
    ua: navigator.userAgent,
  };
  document.title = JSON.stringify(data).slice(0, 60);
  console.log('[ai-os-debug]', data);
  // also paint to a fixed div so we see it even if the tab dies before console flushes
  const el = document.createElement('div');
  el.textContent = JSON.stringify(data);
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#fff;color:#000;font:12px/1.2 monospace;padding:6px;z-index:99999;white-space:pre-wrap';
  document.body.appendChild(el);
}, []);
```

Open `/ai-os` on the iPhone. Even if it crashes in 1 s, the title is set during commit and the div paints first frame. **Outcome:** we know exactly which render path iOS Chrome is getting. This kills or confirms hypothesis 1 without any guessing.

### Test B — Render an empty `<div>` body, keep all imports (1-line change)

Replace the entire `return (...)` of `AiOsPage` with `return <div style={{padding:40,color:'#fff'}}>ai-os smoke test</div>;`. Leave every `import` and every top-level `const` untouched. Deploy. Open on iPhone.

- **If it survives**: the killer is in what AiOsPage *renders* (hypotheses 1, 2, 3). Module-eval / JS-heap is exonerated. Proceed to Test C.
- **If it still crashes**: the killer is in module evaluation or in `GameShellV2` itself (hypothesis 4 or something in the shell we haven't seen). Skip C, run D.

### Test C — Render the hero only, no main content (only runs if Test B survives)

Restore only the fixed background layers + the `<h1>AI OS</h1>` block. No `<main>`, no prompts, no SectionsPanel, no AiOsSpotlight. Deploy. Open on iPhone.

- **If it survives**: killer is in the body content (suite cards, AiOsSpotlight, sub-modules — somewhere in the 1000+ rendered nodes).
- **If it crashes**: killer is in the hero compositing stack (hypothesis 2 confirmed) — we'd remove the noise SVG, vignette, and one of the gradient overlays one at a time.

### Test D — Empty children inside GameShellV2 (only if Test B crashes)

Temporarily change the route to `<Route path="/ai-os" element={<GameShellV2><div>x</div></GameShellV2>} />` and rename `AiOsPage.tsx` → `AiOsPage.tsx.bak` so it's not in the bundle at all. Deploy. Open on iPhone.

- **If it survives**: AiOsPage's *module evaluation* is the killer (hypothesis 4 confirmed — the 175 KB / PROMPTS theory after all).
- **If it crashes**: something in GameShellV2 is the killer when activated by this URL. We'd then bisect inside the shell.

## Rules during testing

- One change per deploy. No combined fixes.
- Don't remove instrumentation between A and B/C/D — keep the title/div writer so we can read what survived.
- Test on the same iPhone Chrome each time, with the URL bar in the same state (cold open from Lovable preview, not from a hot tab).
- After each test, paste the on-screen `<div>` text and the new `document.title` back into chat. That's the data the next test branches on.

## What I am explicitly not doing (and why)

- **Not refactoring PROMPTS into JSON / lazy-loading anything yet.** That was my prior recommendation; it may still be right, but it's a 90-minute change for what is right now an unverified hypothesis.
- **Not removing the noise SVG, vignette, gradient overlays, or any visual element.** Same reason.
- **Not rotating to a different shell, removing GameShellV2, etc.** Same reason.
- **Not adding a UA sniff to the gate.** That's a candidate fix once Test A tells us the gate is wrong; it's not a diagnostic.

## Expected outcome

Three deploys (A, B, then either C or D depending on B's result), each ≤5 lines changed, gives us the actual culprit with certainty rather than a fourth hypothesis. Once we know which layer kills the tab, the fix is small and obvious — and we won't waste a fifth hour on the wrong layer.

Approve this and I'll execute Test A first, then branch based on what the iPhone shows.
