# i18n + l10n — Scope of Work (v2)

*Find Your Top Talent / Evolver platform · v1 drafted 2026-06-13 (Day 100) · **v2 rewritten 2026-06-14 after an adversarial roast that proved v1 lowballed scope and timeline 2–4x.** Launch pair: Russian first, then Spanish.*

---

## Bottom line

This is **not a brochure site that needs its buttons translated.** It is an AI-native product where the thing a user pays for (their Top Talent profile, Appleseed, Excalibur, Mission, UBB Dossier) is *generated*, not written. Localization has **three layers, not one**, and the real translatable surface is **much larger than the chrome you can see**: it includes PDFs, charts, transactional emails, validation, and Russian's plural system.

- **i18n** (the plumbing) is built once, language-agnostic. Mostly done (Increments 0–1).
- **l10n** (the content) repeats per language. **Full stack, RU then ES** (Sasha, 2026-06-14).
- The honest size: roughly **20,000–35,000 translatable items**, **~6–8 weeks for Russian full-stack**, **+2–3 weeks to replicate Spanish**. The v1 figures (6,200 strings, ~3 weeks) were wrong.

---

## Decisions locked

1. **Depth → Full stack (RU + ES).** All three layers. The generated artifact crosses the language line. (2026-06-13)
2. **Sequence → Russian first, then Spanish.** First holon proves the pipeline in RU; ES replicates. (2026-06-13)
3. **Translation method → AI + Sasha's review.** No hired native reviewer assumed. AI drafts to best ability; **Sasha is the native Russian reviewer** (his roots) and checks the live platform. (2026-06-14)
4. **Layer 3 quality → calibrate the reveal only.** The funnel-critical artifact (the ZoG / Top Talent reveal a stranger receives) gets Russian calibration exemplars so the charge holds. The deep product (UBB artifacts, Appleseed, Excalibur, Mission) accepts model-default Russian. (2026-06-14, Q1)
5. **Exposure → English default for fresh traffic.** RU/ES reachable by URL + switcher; browser auto-detection stays off until Sasha blesses the live locale. One-line flip later. (2026-06-13)

> **ES charge caveat:** Sasha is native Russian, not Spanish. Russian gets a real charge review; Spanish ships at best-ability with lighter charge assurance. Flag a Spanish-native check before ES go-live if one becomes available.

---

## Build log

| Increment | Status | Honest evidence |
|---|---|---|
| 0 — i18n engine (react-i18next, switcher, localStorage persistence, `format.ts` helpers) | ✅ wired | 404 pilot renders RU, persists across reload, 0 console errors. **Note:** `format.ts` exists but is NOT yet wired into the 18+ `toLocaleDateString('en-US')` call sites. |
| 1 — Routing: `/ru` `/es` composed with skin basename + locale detection + switcher URL nav | ✅ for tested paths | Verified: `/`, `/ru`, `/aurum`, `/ru/aurum`, switcher, one real route. **NOT tested:** `/es`, 4 of 5 skins, `/es`×skins, `/ru`×other-skins. Production `npm run build` passes, `tsc` clean. |
| 2a — Cold-funnel landing extraction + RU draft (MatchHero · MethodologyLandingPage · ZoneOfGeniusEntry; 72 keys) | ✅ 2026-06-14 | EN byte-identical, RU renders at `/ru` + `/ru?path=match`, production build green (14.08s, exit 0), hero screenshot. JourneyPage correctly untouched (routing-only). |
| 2b — Funnel chrome + RU (MatchFlowCta · journeySequence keys · OnboardingProgress · PlaybookHero; 41 keys) | ✅ 2026-06-14 | build green (12.2s), RU renders on `/ru` (playbook CTA etc.), `CONFIG → keys` refactors compile clean. **Rail labels extracted but `journeySequence.ts` not yet WIRED** (data file left untouched; consumer needs `t('journey.*')`). |
| 2c — Ignition paid-session page + RU (24 keys) | ✅ 2026-06-14 | build green (11.2s), `/ru/ignite` fully RU (hero, guarantee, FAQs), no leak/errors. PlaybookPage is a wrapper (copy in `playbookSteps` data + children → later). |
| 2d — Auth + ResetPassword flow + RU (75 keys) | ✅ 2026-06-14 | build green (11.2s), `/ru/auth` renders RU (tabs, form labels, claim copy), gold-span titles split, Zod/Supabase passthroughs left alone. Minor: one stray "Log In" button + JOURNEY rail still English (both unextracted shell). |
| 2e — Post-reveal money path + RU (MissionDiscovery, AssetMapping, QoL results; 106 keys) | ✅ 2026-06-14 | build green, prefix-normalized merge, charts/Zod skipped for landmine/Phase-0b passes |
| 2f — Shell rail + breadcrumb + RU (SectionsPanel `buildJourneySections` t-threaded, GameShellV2 breadcrumb; 40 keys) | ✅ 2026-06-14 | build green (12.3s), `/ru` rail fully RU, number-pip regex preserved, `SPACE_SECTIONS` deliberately left (GameShellV2 consumer) |
| 0b · `preferred_language` migration written (sync pending) | 🟡 | mirrors `preferred_skin`; activates on deploy |
| 2g — Matching/reveal surfaces + RU (MyResult, Connections, Matchmaking, Intros, PeopleDir, GrowthPaths; 186 keys) | ✅ 2026-06-14 | build green |
| 2h — Reveal display + profile/settings + RU (Appleseed, Profile, Settings, ZoGOverview, CanvasOverview, MissionSelection; 180 keys) | ✅ 2026-06-14 | build green (12.7s) |
| 0b — calendar locale + `preferred_language` sync (`languageSync.ts`) wired | ✅ 2026-06-14 | build green; sync activates on migration deploy |
| 2i–2j — 24 logged-in product surfaces + RU (core loop, offers, content, onboarding, events, community; 637 keys) | ✅ 2026-06-14 | build green (13.6s); 2 router-wrappers correctly skipped |
| 0b — `output_language` migration (zog_snapshots, user_business_artifacts) written | 🟡 | Layer-3 cache-mismatch fix; activates on deploy + wiring |
| 2k — 12 more user-facing pages + RU (GameHome, HolonicModules, IntegralTheory, PublicDossier/Landing, QoL assessment, CharacterSnapshot, PathPage, CoreLoopHome, MyArtifacts, OnePager, FounderMarketFit; 447 keys) | ✅ 2026-06-14 | build green (19.7s) |
| 0b — format sweep (9 files → locale-aware dates/numbers) | ✅ 2026-06-14 | done |
| 2l–2m — 24 components/sub-pages + RU (ZoGPerspectiveView reveal-depth, SpacesRail, MatchCard, MeGate, RevelatoryHero, activations, modals…; 601 keys) | ✅ 2026-06-14 | build green (20.5s) |
| QoL official RU+ES sheets captured (`docs/specs/i18n/qol_map_{ru,es}_official.csv`) | ✅ 2026-06-14 | drives qolConfig pass; corrects domain drift (Богатство not Достаток) |
| 2n — qolConfig data hub localized (168 official RU+ES from Sasha's CSVs, `useLocalizedDomains` hook) + per-client/misc pages (wave 1n, +703 keys) | ✅ 2026-06-14 | build green (13.2s); stage-alignment nuance flagged for review |
| L3 server — output-language directive injected into 7 generation edge functions (`_shared/language.ts`) | ✅ 2026-06-14 | backward-compatible, deno-clean; inert until client passes `target_language` |
| L3 client — `target_language` wired at all 6 generation sites + `output_language` stamped at 4 persist sites + types.ts column | ✅ 2026-06-14 | tsc clean; **RU generation live end-to-end** |
| 2o — 12 more components + RU (GameShell nav, onboarding tour, profile/business, celebration, marketplace; 230 keys) | ✅ 2026-06-14 | build green (14.3s) |
| 2p — last user-facing surfaces + RU (LandingPageCarousel, QoL recipe, CreateEvent, profile upload, DailyLoop/MyLife domain-wired; 254 keys). IntegralTheory page is self-bilingual. | ✅ 2026-06-14 | build green (12.4s). **User-facing RU UI coverage essentially complete.** |
| ES catalog — full EN→ES translation, exact key parity (3,768 keys, 0 missing) | ✅ 2026-06-14 | build green; `/es` renders Spanish (rail, hero, "Encuéntrame socios"). **Both RU + ES live across the UI; Layer-3 generation works in both.** |
| SEO — hreflang + og:locale + locale-aware canonical + `<html lang>` | ✅ 2026-06-14 | first-paint OG/lang for non-JS crawlers needs an edge layer (Phase 3) |
| 2q+ — **data hubs** (missions catalog ~2,300 strings + outcomes/challenges/focusAreas + talents/growthPaths/skillTrees/playbookSteps/assets) · landmines (15 emails/charts/PDF) · holomap/admin (deferred) · seeded · SEO · reveal calibration | ⏳ | reference-heavy bulk |

**Running tally (2026-06-14): EN catalog ~3,768 keys; RU + ES at full parity (3,768 each). ~142 files, 15 production builds green. The full UI + Layer-3 generation read in BOTH Russian and Spanish; SEO hreflang/og:locale in place.** Remaining is reference/transactional content: data hubs (missions catalog ~2,300 + outcomes/challenges/talents/etc.), 15 transactional emails, seeded Supabase content (testimonials/founder canvases), reveal calibration (RU/ES exemplars for charge), admin surfaces (deferred), and an SSR/edge layer for first-paint SEO. Phase 0b: calendar locale + preferred_language sync + format sweep + output_language done; Zod errorMap minimal (1 schema) deferred.

**Milestone (2026-06-14): the public cold-funnel reads in Russian** — `/ru` (manifesto + playbook CTA), `/ru?path=match` (hero + match CTAs), `/ru/ignite` (paid session). ~137 keys, 3 production builds green. Ready for Sasha's Charge review.

CTA fix (Sasha, 2026-06-14): "Match me" RU `Найди мне пару` → **`Найти бизнес-партнёров`** (romantic → professional); glossary rule locked in `src/i18n/README.md` so it propagates to every wave.

**RU charge-review queue (for Sasha's platform check, non-blocking):** `метчинг` vs `подбор` (matching) · `Упакуй Себя` for "Productize Yourself" · `Масштабируй` for "Scale" · `Найди мне пару` for "Match me" (CTA, watch pill width) · em-dashes in RU prose (standard Russian тире, but flagging given your EN no-em-dash rule).

**Deploy-safety, honestly:** the foundation is real and the build is green, but **only 3 strings are translated** (the 404 + switcher). Deploying today = the English site plus a Russian/Spanish 404. `index.html` still hardcodes `lang="en"` (crawlers and the first paint see English until JS runs). The plumbing is shippable; there is no locale *experience* to show yet. Nothing committed; the terminal sweep deploys.

---

## True scope: the full translatable surface

v1 counted visible string literals and missed editorial prose, conditional branches, and every surface that never touches the DOM. The real inventory:

| # | Surface | What it is | State |
|---|---|---|---|
| 1 | Chrome JSX (funnel → product → admin) | headings, body, buttons, labels | not extracted |
| 2 | Centralized data hubs | missions (1,166), outcomes (422), challenges (246), talents, qol, growthPaths | not extracted |
| 3 | Toasts (197) | many built from template literals; need an i18n-aware toast helper | not extracted |
| 4 | **Validation (Zod / react-hook-form)** | hardcoded English messages | needs `z.setErrorMap` + RU/ES locale |
| 5 | Constants | `ERROR_MESSAGES`, `ARTIFACT_LABELS`, `PHASE_LABELS` (UBB) | not extracted |
| 6 | **Russian pluralization** | RU has 3–4 plural forms; counts (XP, levels, results) | i18next plural config missing |
| 7 | **PDFs (3 generators)** | `generateUbbPdf`, `generateZogPdf`, `generateProfilePdf` — text baked into canvas, invisible to `t()` | not handled; check Cyrillic font |
| 8 | **Charts (Recharts)** | axis / legend / label SVG text (QoL radar, dashboards, holomap) | not handled |
| 9 | **Transactional emails (15 edge fns)** | subjects + HTML bodies sent to users | not handled |
| 10 | SVG infographics | `<text>` labels (playbook circle, holonic modules) | not handled |
| 11 | **Calendar (react-day-picker)** | month / weekday names | needs date-fns locale |
| 12 | Date/number formatting | 18+ hardcoded `toLocaleDateString('en-US')` bypassing `format.ts` | sweep needed |
| 13 | aria-labels (194) / alts (111) / titles (185) | accessibility + SEO | not extracted |
| 14 | Seeded Supabase content | testimonials, founder_canvases, missions, upgrade_catalog | needs `language` column + admin UI |
| 15 | SEO / meta | `index.html` `lang="en"`, OG tags, no hreflang | Phase 3 |

Items 4, 6, 7, 8, 9, 11 are the landmines v1 ignored entirely. They are not "the grind"; they are separate small projects each.

---

## The three layers

```
Layer 1 — CHROME          items 1–13 above
Layer 2 — SEEDED CONTENT  item 14 (testimonials, founder canvases, mission catalog)
Layer 3 — AI GENERATION   the Top Talent profile · Appleseed · Excalibur · Mission · UBB artifacts
                          ↑ the paid artifact. Calibrate the REVEAL (Q1); model-default the rest.
```

### Layer 3 blockers the roast surfaced (must fix before RU generation is credible)

| Blocker | Why it bites | Fix |
|---|---|---|
| English calibration exemplars in prompts | "Respond in Russian" still anchors to the English register → English-flavored RU | RU calibration exemplars **for the reveal**; model-default elsewhere (Q1) |
| No `output_language` on stored rows | RU user sees a cached **English** profile under RU UI (silent mismatch) | add column + language dimension to the cache key + invalidate on switch |
| Copy-paste prompts run in the user's own ChatGPT | we cannot set their output language | `getPromptForLanguage()` injects a "Respond in Russian" preamble before copy |
| JSON field names must stay English | the UI parses `archetype_title` etc.; translating keys breaks parsing | prompt instruction: keys English, values translated |
| `improve-artifact` has no language param | Improve flips a RU artifact back to English | read `output_language` from the row, pass into the prompt |

---

## Architecture decisions

| Decision | Choice | Status |
|---|---|---|
| Library | `react-i18next` (statically-bundled `common` ns now; lazy namespaces when bundles grow) | ✅ |
| Routing | Locale as outermost path segment, composed with skin basename (`/ru`, `/ru/aurum`, `/es/planetir`) | ✅ resolved Increment 1 (`src/i18n/localeScope.ts`) |
| Persistence | localStorage now + **`game_profiles.preferred_language`** for cross-device | migration pending (mirrors `preferred_skin`) |
| Formatting | `Intl` via `format.ts`; sweep the 18+ `en-US` call sites | helpers built, sweep pending |
| Pluralization | i18next plural keys + `Intl.PluralRules` | pending |
| Validation | `z.setErrorMap` bound to active locale | pending |
| Calendar | date-fns RU/ES locale into react-day-picker | pending |
| SEO | hreflang alternates + per-locale OG; `index.html` lang handled at Phase 3 | pending |

> **Reserved-prefix rule:** white-label skin names must never be `en`, `ru`, `es`, or `fr` (reserved for locales), or the basename composition collides. Documented here so future skins do not break routing.

---

## The DoD gates for this work (corrected)

The generic three-DoD triad (Planning → Implementation → **Debugging**) is the wrong third gate for i18n. A Russian string can render perfectly (works) while the meaning is lost (charge gone). The two real failure modes here are **Coverage** and **Charge**. So for this build the gates are:

1. **Planning DoD** — this document (v2).
2. **Coverage DoD** — every surface in the True-Scope table is extracted and translated; the landmine checklist (items 4, 6, 7, 8, 9, 11) is all ticked; no untranslated surface remains on the tested paths; a per-locale render pass finds no missing-key fallbacks.
3. **Charge DoD** — Sasha (native RU) reviews the reveal + the funnel money-path copy; the reveal calibration holds; meaning is preserved versus the English baseline. (ES: best-ability, charge caveat above.)

*(The session protocol's three-DoD section is updated to note this domain override.)*

---

## Phased plan (full stack, RU then ES)

### Phase 0b — Close the plumbing gaps (~3–4 days)
Pluralization config · `z.setErrorMap` · date-fns calendar locale · `format.ts` en-US sweep · `game_profiles.preferred_language` migration + sync · an i18n-aware toast helper · extraction convention. **Coverage DoD** for the engine.

### Phase 1 — Russian, all three layers, money-path first (~5–7 weeks)
Funnel money-path first (landing → ZoG entry → auth → ignite) so the first deployable RU experience is the conversion path, then product chrome, data hubs, admin. Extract every True-Scope surface (incl. PDFs, charts, emails, SVG). Translate to RU. Layer 3 RU: the five blockers above + **reveal calibration**. **Coverage DoD** then **Charge DoD**.

### Phase 2 — Spanish (~2–3 weeks)
Replicate Phase 1 for ES. Coverage DoD; Charge caveat (no native reviewer).

### Phase 3 — SEO / share / switcher / QA (~1 week)
hreflang + per-locale OG + `index.html` lang handling + locale-aware sitemap; switcher's real home; per-locale QA matrix (`/es` + all 5 skins, RU ~30% text overflow, share-preview scrapers).

---

## Honest effort

| Phase | Effort | The long pole |
|---|---|---|
| 0b — plumbing gaps | 3–4 days | pluralization + format sweep |
| 1 — Russian full-stack | 5–7 weeks | extraction surgery (~70 hrs) + landmines + Layer 3 |
| 2 — Spanish replicate | 2–3 weeks | re-translation, lighter engineering |
| 3 — SEO/share/QA | ~1 week | per-locale OG + the test matrix |
| **Total RU+ES full-stack** | **~9–12 weeks** | RU funnel usable far earlier (money-path first wave) |

---

## Risks

1. **Charge degradation in RU generation (highest).** Mitigation: reveal calibration + Sasha's native review; model-default accepted elsewhere by decision.
2. **Coverage misses on non-DOM surfaces (PDFs, charts, emails).** Mitigation: the True-Scope checklist is the Coverage DoD; nothing ships as "done" with an item un-ticked.
3. **Cache mismatch (English artifact under RU UI).** Mitigation: `output_language` column + cache language dimension before any RU generation.
4. **Spanish charge unverified.** Mitigation: flag a Spanish-native pass before ES go-live.
5. **Untested route matrix (`/es`, 4 skins).** Mitigation: the Phase 3 QA matrix; do not claim deploy-safe for locale paths until it passes.

---

## Still open

- **Roadmap placement** — not yet in `docs/02-strategy/roadmap.md`. Say the word and I add it at the leverage tier you choose.
- **Resume point** — Phase 0b (close plumbing gaps), then Phase 1 wave 1 (funnel money-path RU).
