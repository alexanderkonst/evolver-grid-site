# My AI as a carried instrument: scope of work

Template: spec-handoff (Planning + Implementation SoW shape). Status: Phase 1 in work since 2026-11-25. Owner: Hark. Decisions: Sasha.

## TLDR
My AI stops being a place you walk to. It is an instrument the player carries: a clear octahedron of air in the corner of every game screen. One gesture raises it over the living, dimmed world; the same gesture lowers it, and the player is exactly where they were. Inside: a Hark-like interface, conversation plus the Console of AI Apps (each app a button). The first time it appears, it shows itself in a micro-onboarding that is its own landing.

## Ground truth in code (2026-11-25, main @ after PR #454)
- My AI today is the village place `oracle` (`src/data/villagePlaces.ts`), route `/game/your-ai` → `FamiliarPage` («Take your AI» copies a prompt to an outside chat, then Outro). Rail: `src/lib/railPlaces.ts` maps `oracle` ↔ pane `ai-os`.
- On-platform conversation already exists: `src/modules/zone-of-genius/yourAiDialogue.ts` → deployed edge function `library-advisor`, buttons validated against `src/data/yourAiCatalog.ts`, daily cap `yourAiDailyLimit.ts`. Reuse it; no new backend.
- Console = `/ai-os` (`src/modules/ai-os/AiOsPage.tsx`, suites rendered by category). Free preinstalled apps = these suites.
- Gate that already exists: `GameShellV2.tsx` shows the AI OS chip when `tmaComplete` (top talent + mission + assets) or `localStorage fytt:ai-os-visited === "true"`.
- `SpacesRail.tsx` comments document `/ai-os` background, OOM and stacking-context bugs: an overlay must not mount `AiOsPage`'s heavy backgrounds.

## Locked decisions (Sasha)
- D1 Object: clear octahedron, element of air, clarity. Reference `docs/assets/your-ai/octahedron_reference.png`. (2026-11-24)
- D2 Option A: rises over the living world, world dimmed but visible; same gesture closes; Esc / swipe down. (2026-11-24)
- D3 Inside: never «Take your AI» outward; Hark-like interface; free preinstalled apps + paid apps. (2026-11-24)
- D4 Positioning, the five lines, premium pricing: My AI tracker §21. (2026-11-25)
- D5 First receipt = micro-onboarding: smooth zoom by scale and light onto each product group in turn. (2026-11-25)
- D6 Path moves (QoL out of the profile, receipt after profile, `oracle` → activation quest) are NOT in this SoW. They wait in `docs/02-strategy/player-path-v1-draft.md` § Pending path moves. (2026-11-25 00:30)

## Out of scope
Any change to title screen, intro, reveal, entry, themes; moving QoL; changing who sees the instrument beyond the existing gate; removing or changing the `oracle` place or `/game/your-ai`; new edge functions, migrations or Lovable deploys; paid apps and billing (Stripe is Sasha's).

## Phases
**Phase 1 · The instrument (shell + conversation + Console + first-open tour).** One PR.
- Corner object on every `GameShellV2` screen for players past the existing gate. Tap or key (`.`) opens.
- Overlay: world behind dimmed and visible (not paused); panel rises from the object; Esc, same tap, or swipe down closes; focus returns to where it was; route does not change.
- Inside, three groups matching the five lines: header (the object + «My AI», «Powered by My AI OS»), conversation (reuses `yourAiDialogue`), Console (app buttons from the AI OS suites; each opens its existing route and closes the instrument). «Power-ups for business» appears as one closed row in §25.5 form: «Opens when <real event>. Inside: <result>.»
- First open: micro-onboarding, 4–5 beats, each a smooth zoom by scale and light on one group with one line (tracker §21). Skippable, shown once (localStorage), replayable from the header.
- Design law: GoBY §5 (near-black, one accent ice blue `#bcd7e6`, physical materials, no neon or glow outlines; the octahedron's own light is the one exception, as a material refraction, not a glow ring), §25.11 smoothness, `prefers-reduced-motion` = fades instead of zooms, words ≥4.5:1.

**Phase 2 · Path moves** (after the path spec is reviewed): receipt after profile, `oracle` → activation quest with naming, QoL to Academy.

**Phase 3 · Sold like Hark:** usage tiers, paid apps, direct API (tracker §21).

## Definition of Done, Phase 1
| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | Object visible in a fixed corner on every GameShellV2 screen for a player past the gate, absent for one who is not | preview screenshots, both cases | ⬜ |
| 2 | Opens by tap and by `.`; closes by the same tap, Esc, swipe down; route unchanged; focus restored | screen recording + URL before/after | ⬜ |
| 3 | World stays mounted and visible, dimmed, while open | screenshot | ⬜ |
| 4 | Conversation works through existing `yourAiDialogue` / `library-advisor`, daily cap respected, no new function | diff shows no `supabase/` changes | ⬜ |
| 5 | Console lists the AI OS suites as app buttons; each opens its existing route | screenshot + one click-through | ⬜ |
| 6 | «Power-ups for business» row in §25.5 form, closed | screenshot | ⬜ |
| 7 | First-open micro-onboarding: one beat per group, scale + light zoom, one line each, skip, once only, replay | recording | ⬜ |
| 8 | Reduced motion: fades, no zoom | recording with the OS setting on | ⬜ |
| 9 | Labels in en / ru / es via locales | `common.json` diff | ⬜ |
| 10 | No `AiOsPage` heavy backgrounds mounted in the overlay; no new deps | diff | ⬜ |
| 11 | Out-of-scope files untouched (title, intro, reveal, entry, themes, villagePlaces, FamiliarPage) | diff file list | ⬜ |
| 12 | `npm run lint`, `npx tsc --noEmit`, `npm run build`, tests pass | CI | ⬜ |
| 13 | 3-second test (GoBY §25.12): with the instrument open, a first-timer answers where am I, my one next move and what it gives, how to get home; 4 of 5 pass | San Pancho round notes | ⬜ |
| 14 | Sasha sees the preview before merge | his yes in chat | ⬜ |
