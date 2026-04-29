Task framing: this needs a small but structural mobile fix, not another cosmetic tweak. The previous change treated the button as an iOS hover/focus problem. Based on the current code and a mobile preview check, I would instead fix the actual scroll target + mobile layout structure.

Definition of Done:

| # | Requirement | Evidence | Status |
|---|---|---|---|
| 1 | “Start here” reliably activates on mobile first tap and repeated taps | On 390px and 375px mobile preview, tapping scrolls to the install spotlight / “One paste. Permanent AI upgrade.” section | Planned |
| 2 | No duplicate / invalid target IDs for the install spotlight | Code has exactly one scroll target ID for the install section | Planned |
| 3 | Partnership line no longer breaks the page or creates a weird underline | Mobile screenshot shows clean license text + partnership link, with underline only under the link text | Planned |
| 4 | Mobile hero spacing feels intentional, with no dead empty bottom area | Mobile screenshot shows CTA and next section spacing harmonized; desktop remains visually unchanged | Planned |
| 5 | Desktop AI OS shell is not regressed | Desktop preview still scrolls inside the AI OS pane and the hero/spotlight layout remains intact | Planned |

What I found:

1. The “Start here” target is structurally fragile.
   - `AiOsPage.tsx` renders an outer `<div id="ai-os-spotlight">`.
   - `AiOsSpotlight.tsx` also renders an inner `<section id="ai-os-spotlight">`.
   - Duplicate IDs are invalid HTML and make `document.getElementById("ai-os-spotlight")` unreliable.
   - The current click handler also depends on a very specific ancestor selector and manual scroll math. On mobile, with the transformed shell panes and nested scroll container, this is exactly the kind of thing that can appear to “tap” but not move.

2. The underline issue is not solved by `inline-block whitespace-nowrap`.
   - In the screenshot, the link text is still part of one inline paragraph with browser text-decoration.
   - Mobile browser text-decoration + text shadows + tight inline layout can draw the underline in a visually wrong place.
   - The safer fix is to stop relying on native underline for this hero line and render the partnership link as its own controlled inline-block/link unit, with a custom bottom border/pseudo underline.

3. The bottom empty space is coming from the mobile hero sizing strategy.
   - The current hero uses `min-h-[calc(100dvh-9rem)]` and vertical centering.
   - That can look balanced on one viewport, but on real mobile browser chrome it creates a large dead area below the CTA and pushes the real install section too far away.

Implementation plan:

1. Make the install spotlight target unique and stable
   - Replace the duplicated `id="ai-os-spotlight"` structure with one canonical target, for example:
     - outer wrapper: `id="ai-os-install"` / `data-ai-os-install-target`
     - inner `AiOsSpotlight` section: no duplicate ID, only `aria-labelledby="ai-os-spotlight-heading"`
   - Update all references to use the new single target.
   - Add a quick code search check after implementation to confirm only one canonical target exists.

2. Replace the Start here activation with a robust mobile-safe scroll helper
   - Add a small helper inside `AiOsPage.tsx`, e.g. `scrollToAiOsInstall()`.
   - It will:
     - find `[data-ai-os-install-target]`, not a duplicated ID;
     - find the real scroll container by walking ancestors and checking computed `overflow-y` + `scrollHeight > clientHeight`, with fallbacks to `.mobile-content-scroll`, `.ai-os-desktop-content-scroll`, then `window`;
     - use scroll math based on the chosen container;
     - use `behavior: "smooth"` unless reduced motion is enabled;
     - focus the target after scroll with `preventScroll: true` for accessibility.
   - Change the CTA to use both safe native semantics and JS fallback:
     - either a styled `<a href="#ai-os-install">` with `onClick` interception, or a button with pointer/touch-safe activation;
     - avoid iOS-sticky hover classes entirely on mobile;
     - ensure repeated taps call the same function and do not leave the button in a stuck visual state.

3. Rebuild the partnership/license line for mobile
   - Change the hero license block from one inline paragraph into a small responsive cluster:
     - Mobile: two clean centered lines:
       - `Open source · CC BY-SA 4.0`
       - `Reach out for partnership`
     - Desktop/tablet: can stay inline if there is enough width.
   - Replace native `text-decoration` with a controlled underline using `border-bottom` or an absolutely positioned pseudo underline.
   - Keep `Reach out for partnership` as `whitespace-nowrap`, but do not force the entire paragraph to behave as one line.
   - This removes both the weird underline and the page-jump risk.

4. Tune mobile-only hero spacing
   - Remove the mobile `min-h-[calc(100dvh-9rem)]` / hard centering approach.
   - Use mobile-specific vertical rhythm instead:
     - controlled top padding;
     - slightly tighter `space-y` between hero blocks;
     - smaller gap between hero and spotlight on mobile (`space-y-10` instead of `space-y-20`);
     - enough bottom padding after CTA, but not a whole empty viewport.
   - Keep desktop layout unchanged via `sm:` / `lg:` responsive classes.

5. Verification pass before reporting done
   - Test `/ai-os` at 390×844 and 375×812.
   - Tap “Start here” once: verify the install spotlight appears.
   - Tap it again after returning/scrolling: verify it still works.
   - Screenshot the hero: verify the partnership underline is clean and the bottom empty space is gone.
   - Test desktop width: verify no regression to the AI OS app-shell scrolling.

Files I expect to touch:

- `src/modules/ai-os/AiOsPage.tsx`
  - CTA activation helper
  - unique target wrapper
  - mobile hero spacing
  - partnership/license markup

- `src/modules/ai-os/components/AiOsSpotlight.tsx`
  - remove duplicate `id` or rename to non-conflicting structure
  - optional `tabIndex={-1}` if we focus the section after scroll

- `src/index.css` only if a small scoped class is cleaner for the custom underline. If Tailwind classes are enough, I will avoid adding CSS.

The key correction: I will not try another superficial button class tweak. I will fix the invalid duplicate target, make scroll-container detection robust, and verify the interaction in the mobile preview before calling it done.