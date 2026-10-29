# i18n — how copy works here

Engine: **react-i18next**. Launch languages: **Russian first, then Spanish** (English is the default / fallback). Full scope of work: [`docs/specs/i18n/scope_of_work.md`](../../docs/specs/i18n/scope_of_work.md).

## The one rule

**No user-facing English string ships hardcoded.** Every visible string, placeholder, `aria-label`, alt text, toast, and validation message goes through `t()` and lands in `src/locales/<lang>/<namespace>.json`.

## Using it

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();          // default namespace: "common"
<h1>{t("notFound.title")}</h1>
<p>{t("welcome.body", { name })}</p>      // interpolation: "Hi {{name}}"
```

For dates / numbers / currency, use the locale-aware helpers (not raw `toLocaleString`):

```ts
import { formatDate, formatNumber, formatCurrency } from "@/i18n/format";
```

## Files

- `config.ts` — the single i18next instance, supported languages, storage key.
- `format.ts` — Intl date/number/currency helpers bound to the active locale.
- `LanguageSwitcher.tsx` — language toggle (Phase 0 placement is the pilot page; final home decided in Phase 1).
- `src/locales/{en,ru,es}/common.json` — message catalogs. `en` is the source of truth; `ru`/`es` mirror its keys.

## Adding a string

1. Add the key to `src/locales/en/common.json`.
2. Add the same key with the translation to `ru` and `es`.
3. Reference it with `t("your.key")`.

Missing keys fall back to English (no crash), but a missing key in `ru`/`es` means an untranslated surface, so keep the three files key-aligned. Check it with `node scripts/i18n-key-check.mjs` (add `--prefix village.` to look at one area, `--same-as-en` to list values still identical to English).

### Copy that lives in data files (the village)

Some English is data, not JSX: `VILLAGE_PLACES`, `JOURNEY_MODULES`, `JOURNEY_SEQUENCE`, `VILLAGE_SKY_MOODS`. It stays in those files as the English source and the tests read it. Translate it at render, never in the data:

- `tr(t, key, english)` in `src/lib/villageCopy.ts` returns the catalog string for `key`, with the data's English as the `defaultValue`. Pass no `t` and you get the English back.
- Helpers take an optional `t`: `placeName`, `placeTagline`, `placeAlt`, `closedLine(place, t)`, `placeLine(place, state, t)`, `whatChangedLine(fresh, t)`, `nextMoveCopy(move, t)`, `moduleText(module, field, t)`, `moduleClosedLine(id, t)`, `villageSkyMood(phase, t)`, `journeyRows(save, t)`.
- Keys are `village.*`: `village.place.<key>.{name,line,alt,opened}`, `village.closed.<key>` (the whole «Opens when … Inside: …» line), `village.live.<key>`, `village.module.<id>.{eyebrow,headline,silhouette,verb,task}`, `village.result.<id>`, `village.sky.<phase>`, `village.state.<state>`.
- `src/lib/__tests__/villageCopy.test.ts` fails if a catalog string and its data file ever differ in English.

## Namespaces (when bundles grow)

Today everything is one `common` namespace, bundled statically. When catalogs grow, split by area (`funnel`, `profile`, `ubb`, …) and lazy-load per route via `i18next-http-backend` so each chunk only pulls its own messages.

## RU translation glossary (charge-preserving — apply in every wave)

Locked during review so future waves stay consistent:

- **match / matching (the product)** → professional framing: `найти бизнес-партнёров`, `профессиональный мэтчинг`. **Never romantic** (not `найди мне пару`, not `метчмейкинг`). Sasha, 2026-06-14: *"у нас профессиональный, не романтический"*.
- **top talent** → `главный талант` (consistent on every surface).
- **Productize / Scale** → `Упакуй` / `Масштабируй` (punchy startup verbs, no corporate drift).
- Em-dashes (тире) are correct standard Russian punctuation; the no-em-dash rule applies to Sasha's **English** copy and chat, not Russian prose.
- Register: second-person `ты`/`вы` per surface, concrete, no corporate-speak. Preserve the charge over literal accuracy.

## QoL framework — official Russian (use the CSV, NOT machine translation)

Sasha provided the canonical Russian for the Integral Map of Quality of Life: [`docs/specs/i18n/qol_map_ru_official.csv`](../../docs/specs/i18n/qol_map_ru_official.csv) (8 aspects × 10 stages, full descriptions). **Use it verbatim for `qolConfig.ts` and every QoL surface** — it carries his charge and overrides any machine draft.

Official domain names (correct the machine drafts that already shipped):
- Wealth → **Богатство** (not Достаток)
- Health → Здоровье
- Happiness → Счастье
- Love → **Отношения и любовь** (not Любовь)
- Impact → Влияние
- Growth → Рост
- Social → **Социальные связи**
- Home → Дом

Stages render as «Этап 1…10»; framework name = «Интегральная карта качества жизни». A shared `domains.*` namespace should hold these so the labels never diverge across components.

**Spanish** ([`docs/specs/i18n/qol_map_es_official.csv`](../../docs/specs/i18n/qol_map_es_official.csv)) — official domain names: Wealth → Riqueza · Health → Salud · Happiness → Felicidad · Love → Amor y relaciones · Impact → Impacto · Growth → Crecimiento · Social → Lazos sociales · Home → Casa. Stages = «Etapa 1…10»; framework = «Mapa Integral de la Calidad de Vida». Use this CSV verbatim for the ES QoL pass (Phase 2).

## Roadmap (Phase 0 increments)

- [x] Engine + provider + persistence + pilot surface
- [ ] URL-prefix routing (`/ru`, `/es`) composed with the skin-scope basename (`/ru/aurum/…`)
- [ ] `game_profiles.preferred_language` sync (mirrors `preferred_skin`)
- [ ] hreflang + per-locale OG (Phase 3)
