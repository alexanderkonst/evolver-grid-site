# Modules in corpus and code: read for Module 2

Read-only, 2026-11-21, snapshot /workspace/work/egs2. Paths are relative to docs/ unless they start with src/ or supabase/.

## 1. What the corpus defines

**Taxonomy.** `02-strategy/module_taxonomy.md` v3.3 (2026-07-27) is the live library. Its structure: the Divine Stack (Tier 0 → OSes → applications), six Spaces («ME. LEARN. MEET. COLLABORATE. BUILD. BUY & SELL.»), and semver from 0.1 to 1.0. Each record holds Version, **Master Result (A→B)**, Start, End, Dependencies and submodules. Rule: re-audit against `src/App.tsx`. **No external or partner modules.** Competing vocabularies: `game_spaces.md` (2026-03-12) has 5 spaces, and `villagePlaces.ts` has 11 places.

**The only external-module template.** `05-reference/module_registry.md` (2025-01-03, superseded 2026-08-16): «LEGO blocks… from all aligned projects». Fields: **Source, Version, Status (⚪ External), Description, Inputs, Outputs, Integration Notes, Contact**. Entries for Priroda and Boardy.

**Module form (canonical).** `templates/module-form.md` (2026-10-27; §12 Sasha 2026-11-03).
- «Every product and module has one transformational result and one button.»
- Intro: headline = Master Result; button = «the result as a verb», in the player's voice. Passage: «the form wraps, it doesn't rebuild». Then Result, then Outro («never a toast»).
- Around them: the 1–10 rating, the real choice, the Koster check, and the fidelity test («something true about the player's life»).
- Lock rule via `placeState()`: guests see only Reception, Academy and Fire Circle; **Market opens at J7**.
- §12.5b: «a module without an assigned artifact is not finished».
- §11: share card with `utm_*`.

**Landing infrastructure.** `module_landing_page_infrastructure.md` (2026-02-10): «Each module gets its own landing page. People find THEIR module, not the whole system.» Superseded by module-form §10 («the Intro now carries that job»). Customer forces stays valid for Market stalls and public pages.

**Integration layer.** `06-architecture/integration_layer_manifesto.md` v1.1 (2026-04-06).
- «Layer 2 (modules) should be shared. Layer 3 (branding) should be distinct.»
- The mission includes «Create the module protocol — How contributions plug in.»
- Its warning: architects «confuse "being ON a platform" with "plugging modules INTO a forkable backbone".»
- Sequence: «Serve small communities → Prove value → Architects recognize elephant».
- Open questions: rev-share credit, «attribution & licensing protocol», profile portability.
- It lists 8 «Known Elephant Builders» and says «focus on the BASEPLATE».

**Game architecture.** `06-architecture/game_architecture.md`: modules are «reused, not replaced».
- Node Architecture (2026-10-30, doc only): Goal · «Done when…» written in advance · Ledger · Agents.
- An Offer node is done when «a sale is recorded (`sales_events`)». Venture: delivery 50/50, licence 90/10.
- Humans confirm «revenue-share agreements» and «Outreach on someone's behalf».

**Canon and terms.**
- `golden_age_canon.md` Face 2: «others plug their modules into his system, his into theirs». The canon lists a «Plug-in pipeline (see modules → find founders → offer → terms → connect)».
- Three Terms (2026-09-16): «The gift is free. The system is paid. The name is permanent.»
- Split precedents: 50/50 host bridge (`community_whitelabel_spec.md`, 2026-10-30); 50/50 Oyi licence (roadmap L1); 90/10 licence; 33% referral (`src/pages/ProposalForWeGoodOvaHere.tsx`).
- UB §4496: «Plug into people who already hold your tribe».

**Neighbours.**
- `templates/ecosystem-offer.md` runs in reverse (our circle into their community). Rules: «Under 90 words», «One ask, one link», «The founder sends it personally».
- `templates/source-integration.md` v1.2 is the existing «AI reads a source» pipeline: an intake card with url, date and privacy. Its rule: «Someone else's unreleased work is their IP… never in the public corpus».
- `product-map.md`: a business as shifts × paths.
- `product_formats_taxonomy.md`: a «kind» vocabulary; «Stage 5: ECOSYSTEM».
- `roadmap.md` L4 (Apr 2026, not done): «`/playbook/discover?src=oyi` + rev-share tracking», the earlier level 0/1.
- Roadmap Day 119/123: app-as-MCP-connector, parked; fits level 3/4.

**Marginal:** `complete_product_stack.md`, `framework_integration_map.md`, `module_scope.md`, `paid_and_hidden_surfaces.md`, `06-modules/` (content only). `module_taxonomy_audit.md` (2026-02-10) urged «Expand src/data/modules.ts» and «Separate Services from Modules»; **neither was done.**

## 2. What exists in code

- **Module type** (`src/types/module.ts`): title, slug, category, tagline, status, `hero_CTA_link`, **`app_links[] {label,url}`**, `who_for`, `outcomes`, `price` (string), `space`, `versionStage`, `startRoute`, `dependencies`, `landingData`. Missing: owner, external flag, referral, integration level, source, payee.
- **Five module lists:**
  - `src/data/modules.ts` (10 entries)
  - `src/pages/HolonicModulesPage.tsx` (hardcoded, admin-only `/modules`)
  - `src/data/villagePlaces.ts` (11 places + `rule`)
  - `ACADEMY_COURSES` + `NEXT_COURSES` in `src/components/game/AcademyPath.tsx` («Two courses, one path», Sasha 2026-10-30)
  - `src/data/courseSales.ts`
- **Inbound referral only:** `?ref=<uuid>` → `game_profiles.invited_by` (2026-01-15). Nothing tags clicks going out to partners.
- **`funnel_events`** (step, source, metadata, referrer) can log outbound clicks.
- **`marketplace_products`:** `user_id NOT NULL`, `cta_config jsonb`; no price or URL column.
- **`sales_events`:** `seller_user_id NOT NULL`; source must be `stripe`, `self_report` or `local`.
- **Skins:** `src/lib/skinScope.ts` (/ns, /daouniverse, /planetir, /aurum, /techstars).
- **Bulk email:** `admin-send-bulk-email` (200 per call, opt-out, campaign log).

## 3. Implications

**Reuse, no new schema.** The partner card = the existing `Module` type, extended. Copy follows module-form §12. Accounting follows the node model. Contact and Integration Notes come from the 2025 registry.

**Our 9-field card against what exists:**

| Ours | Existing | Verdict |
|---|---|---|
| 1 Name, owner | title; registry Source/Contact | add owner |
| 2 Kind | category; formats catalogue | reuse the catalogue |
| 3 For whom, result | `who_for`; **Master Result**; §12 | one named result + a button label (missing field) |
| 4 «space (e.g. Academy)» | `space` = LEARN; place = `VillagePlaceKey` | **clash**: use `place` |
| 5 Entry | `hero_CTA_link`/`app_links` take any URL | our_rack's «external URL missing» is partly wrong; what's missing is an `external` flag and a ref parameter |
| 6 Price, payee | `price` | add payee |
| 7 Attribution | none outbound | new |
| 8 Integration level | `versionStage` is maturity, a different axis | separate field `integration_level` |
| 9 Source | source-integration intake card | reuse its fields |

Still missing from our card: lock state, «done when», artifact/Outro, fidelity check.

**Contradictions:**
1. The «artifact required» rule vs an external passage. Proposed (my reading, needs Sasha): partner module = Intro + external passage, with the Outro coming at level 1.
2. connector.md retires «can I incorporate into your system», but `golden_age_canon.md` (line 69, Face 2 row) still uses it. One of the two needs fixing.
3. our_rack's «one registry» repeats the 2026-02-10 audit, never done. With five lists in code, it is a precondition.
4. Academy partner courses vs «Two courses, one path» plus the core-flow rule. **Launch-critical:** players from the mass message arrive as guests and can't see Market (it opens at J7). For guests to see partners, the slot needs an always-open place or a public page. Sasha decides.
5. landing.md is fine as a public page, but its CTA and rows should follow the §12 law.
6. Terms: connector A–D ignores the precedents (50/50, 90/10, 33%, Three Terms). Offer Sasha one number plus «the name is permanent».
7. The manifesto and connector §7 both say partner flow follows player traction. The message should say so.
8. The mass message has two asks (partners, players). Ecosystem-offer wants one link, so: one page with two doors.

**Gaps for self-serve:**
- No partner entity: contact, accepted terms with a timestamp (the partner's irreversible step), payout.
- No outbound attribution. Level 0 needs `?ref=<partner>.<player>` plus a `funnel_events` step `partner_outbound`.
- `sales_events` can't take partner reports. Needs a `partner_report` source or a partner ledger. This is a migration, so it needs Sasha's yes.
- `marketplace_products` needs an auth-user owner.
- No public intake and no automatic quality gate (fidelity, one named result, Koster «not a recolor»). Manual review at stage 1.
- Partner cards stay out of the public repo.
- Level 4 has to respect the visibility matrix (`data_architecture.md`) and player consent.
- Channels:
  - email: the bulk composer
  - LinkedIn: Sasha writes himself (20/day, 80/week)
  - first prospects: the 8 elephant builders + `partners/` (planetir, priroda, coown)
