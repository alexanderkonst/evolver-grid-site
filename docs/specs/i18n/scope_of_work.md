# i18n + l10n — Scope of Work

*Find Your Top Talent / Evolver platform · drafted 2026-06-13 (Day 100) · launch pair: Spanish + Russian*

---

## Bottom line

This is **not a brochure site that needs its buttons translated.** It is an AI-native product where the thing a user pays for (their Top Talent profile, Appleseed, Excalibur, Mission, UBB Dossier) is *generated*, not written. So localization has **three layers, not one**, and the only real decision is **how deep v1 goes.**

- **i18n** (the plumbing) is built once and is language-agnostic.
- **l10n** (the content) repeats per language. We launch Spanish + Russian.
- Recommendation: **full stack, phased.** Build the plumbing, prove all three layers end-to-end in Spanish (first-holon principle), then replicate to Russian. The trap to avoid: translating the menus while the user's generated profile still comes back in English. That is half a product.

---

## The terrain (grounded counts, not guesses)

Surveyed by a 5-agent codebase sweep on 2026-06-13.

| Surface | Finding | Bearing on effort |
|---|---|---|
| **Static UI strings** | ~6,200 user-facing (admin adds ~1,069 more, deferred) | Large, but ~60% already centralized |
| **Centralization** | ~60% lives in `src/data/` + `src/modules/*/data/` (missions.ts 1,166 · outcomes.ts 422 · challenges.ts 246 · talents.ts · qolConfig.ts …) | High-leverage; translate data hubs in bulk |
| **Scattered copy** | ~40% inline JSX: 197 `toast()` calls, ~1,067 validation refs, 194 aria-labels, 185 titles, 111 alts | The grind; needs extraction |
| **AI generation** | 15 edge functions + 6 client prompt templates, **100% English-hardcoded** | The strategic layer (see fork) |
| **Seeded content** | testimonials · founder_canvases · upgrade_catalog · mission hierarchy (4 tables) | Translate once, admin-time |
| **Routes** | 227, React Router v6, **no SSR** | `basename` already used for white-label skins (constraint, below) |
| **SEO** | react-helmet-async present but only ~10 of 227 routes use it; static sitemap; no hreflang | Per-locale OG matters (share-driven product) |
| **i18n library** | **None installed.** All copy English, no fallbacks | Greenfield, clean slate |
| **Persistence template** | `SkinProvider` = localStorage (device) + `game_profiles.preferred_skin` (person); `preferred_skin` migration is the blueprint | Copy the pattern for `preferred_language` |

---

## The three layers of localization

```
Layer 1 — CHROME          buttons · nav · labels · validation · toasts · seeded UI copy
Layer 2 — SEEDED CONTENT  testimonials · founder canvases · mission catalog · growth paths
Layer 3 — AI GENERATION   the Top Talent profile · Appleseed · Excalibur · Mission · UBB artifacts
                          ↑ THIS is the product. The paid artifact. Where the charge lives.
```

**The trap:** Layer 1 only means a Spanish-speaking user navigates a Spanish app, runs the assessment, and receives their genius profile **in English.** For *Find Your Top Talent*, the artifact is the product. Localizing the shell but not the output is the one outcome to avoid.

**The cost of going deep:** Layer 3 is not "add a `target_language` param." The prompts are calibrated to an English register (second-person address, precise verbs, concrete scenes, no corporate speak, transmitted recognition). The calibration banks (Aleksandr / Karime / Tracey / Tylor) are English exemplars. The specificity rubric (the "5-second friend test") is English-tuned. Naive machine translation or non-native AI generation **will degrade the felt-truth.** Layer 3 needs language-specific calibration and native-speaker resonance review, not just a flag. (This is the "don't rationalize the charge out" boundary, applied to a second language.)

---

## The strategic fork (your decision)

| Option | What ships | Cost / risk |
|---|---|---|
| **A. Full stack (recommended)** | All three layers in ES + RU. The user's generated profile speaks their language. Phased: plumbing → prove in ES → replicate RU. | Highest value. Layer 3 needs native resonance review. ~5–7 weeks for both languages; ES provable in ~3. |
| **B. Chrome + seeded only** | Layers 1+2. App speaks ES/RU; AI output stays English. | Faster, lower risk, but paid artifact still English. Half the value for an AI-native product. |
| **C. Plumbing-first, defer** | Layer 0 only: library, LocaleProvider, routing, formatting, extraction tooling. Nothing new gets hardcoded; translation depth decided later. | Lowest commitment. Good if timing is uncertain and you want the architecture in place now. |

**Recommendation: A, sequenced as 0 → ES(full) → RU(full).** It honors the first-holon principle (one holon fully proves the stack before the network) and it is the only option where the product, not just the chrome, crosses the language line.

---

## Architecture decisions

| Decision | Recommendation | Note |
|---|---|---|
| **Library** | `react-i18next` v14+ with `i18next-http-backend` | Vite chunk-aware namespace loading; matches lazy-route split; no SSR complexity |
| **Provider** | `LocaleProvider` nested after `SkinProvider` in `App.tsx` | Mirrors the proven Skin pattern |
| **Persistence** | localStorage (`app-language`) + optional `game_profiles.preferred_language` | Device fallback + person sync; one small migration (or defer for MVP) |
| **Routing** | Path prefix `/es/`, `/ru/` | Most SEO-native + share-stable. **Caveat below.** |
| **Formatting** | `Intl` (date/number/currency) replacing hardcoded `en-US` | date-fns locales + `Intl.NumberFormat` |
| **SEO** | hreflang alternates + per-locale OG title/description; locale-aware sitemap generation | Share previews (ZoG results, `/u/:username`, dossiers) need stable per-locale URLs |
| **AI layer** | `target_language` param into every prompt + `output_language` tag on stored rows + language-specific calibration banks + native resonance review | The long pole of Phase 2 |

### The one real architectural snag

`App.tsx` already uses `BrowserRouter` `basename` for **white-label skin scopes** (`/ns`, `/aurum`, `/planetir`, `/daouniverse`, `/techstars`). A locale path prefix (`/es/`) collides with that scheme. Phase 0 must resolve this deliberately: either (a) compose locale + scope into one basename strategy (`/es/aurum/…`), or (b) carry locale as the first segment with scope detected separately. This is the single decision most likely to cause rework if skipped. It gets locked in Phase 0, not discovered in Phase 2.

---

## Phased plan + Definition of Done

### Phase 0 — Plumbing (language-agnostic, build once)
1. Install + configure `react-i18next` + http-backend; `src/locales/{lang}/{namespace}.json` structure.
2. `LocaleProvider` + persistence (localStorage + optional Supabase column).
3. **Resolve the basename/white-label routing conflict.** Choose and implement the locale URL strategy.
4. Swap `en-US` formatting for `Intl`-based locale formatting.
5. String-extraction tooling/convention so new copy lands in resource files, not inline.

**DoD:** App runs identically in English with all chrome strings served through `t()` from an `en` bundle; a stub `es` bundle flips a visible subset; locale survives reload and route changes; no `en-US` hardcoded formatters remain on user-facing surfaces.

### Phase 1 — Chrome + seeded content → Spanish, then Russian (Layers 1+2)
1. Extract ~6,200 strings: bulk the centralized `data/` hubs first (highest ROI), then scattered JSX (toasts, validation, aria, alts, titles).
2. Translate to ES (method per your choice), native review.
3. Translate seeded Supabase content (testimonials, founder canvases, mission catalog); extend `AdminContentManager` for per-locale variants or a translations table.
4. Replicate to RU.

**DoD:** A Spanish (then Russian) user can navigate the entire funnel and app with zero English chrome; all seeded testimonials/canvases/mission copy render in-locale; locale switcher works; no missing-key fallbacks visible.

### Phase 2 — AI generation → Spanish, then Russian (Layer 3, the product)
1. Inject `target_language` into all 15 edge functions + 6 client prompts.
2. Add `output_language` tag to stored rows (`zog_snapshots`, `user_business_artifacts`, etc.).
3. Build **language-specific calibration banks** (ES exemplars, not translated English ones).
4. Native-speaker **resonance review** with a charge/precision regression check before sign-off.
5. Replicate to RU.

**DoD:** A Spanish user's ZoG snapshot, Appleseed, Excalibur, Mission, and UBB Dossier are generated in Spanish and a native reviewer confirms the transmission holds (charge + specificity not degraded vs the English baseline). Same gate for Russian.

### Phase 3 — SEO, share, switcher, QA
1. hreflang + per-locale OG/meta across the live routes; locale-aware sitemap.
2. Locale switcher UX (funnel-monogamy-respecting placement).
3. Per-locale share-preview verification (Slack/WhatsApp/Twitter scrapers).
4. Full QA pass per locale.

**DoD:** Share a ZoG result / dossier in each locale and the preview renders in that language with a stable URL; hreflang validates; switcher is discoverable but not intrusive.

---

## Effort + sequencing (estimates, contingent on translation method + review availability)

| Phase | Rough effort | Gating factor |
|---|---|---|
| 0 — Plumbing | 3–5 focused days | Routing/basename decision |
| 1 — Chrome + seeded (ES then RU) | ~1–2 weeks | Extraction grind + native review |
| 2 — AI generation (ES then RU) | ~2–3 weeks | Calibration banks + resonance review (the long pole) |
| 3 — SEO/share/switcher/QA | 3–5 days | Per-locale OG verification |
| **Total (both languages, all layers)** | **~5–7 weeks** | Spanish provable end-to-end in ~3 |

---

## Risks

1. **Charge degradation in AI output (highest).** Mitigation: native calibration banks + resonance review gate, not machine translation.
2. **Basename/white-label routing conflict.** Mitigation: resolve in Phase 0, before any locale content exists.
3. **Translation drift over time.** Mitigation: resource-file convention + extraction tooling so new English copy can't ship without a translation slot.
4. **Per-locale share previews on a client-rendered SPA.** Mitigation: path-prefix URLs + per-locale OG; verify with real scrapers.

---

## Decisions locked (2026-06-13)

1. **v1 depth → Full stack (Option A).** All three layers in ES + RU. The generated artifact crosses the language line. Sequenced 0 → prove fully in Spanish → replicate Russian.
2. **Translation method → Hybrid.** AI draft + native review for chrome + seeded content; language-specific calibration + native resonance review mandatory on Layer 3 (the AI-generated product).

## Still open

3. **Roadmap placement** — new initiative; not yet in `docs/02-strategy/roadmap.md`. Say the word and I add it to the backlog at the leverage tier you choose.
4. **Go signal for Phase 0** — plumbing is language-agnostic and the lowest-risk start (library + LocaleProvider + the basename/white-label routing resolution). Not started; awaiting your go.
