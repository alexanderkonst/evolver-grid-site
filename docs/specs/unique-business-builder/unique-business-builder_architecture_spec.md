# Unique Business Builder v2.0 — Architecture Spec

*Phase 2 output · 2026-04-23 · Status: drafted, awaiting Roast Gate 2*

> **Derives from:** Phase 1 Product Spec + `schema_delta.md`. If this spec contradicts the Product Spec, the Product Spec wins (constitution > federal law > derivation).
> **Runtime:** React + Vite + Supabase + Lovable AI Gateway (`google/gemini-2.5-flash`).
> **Pattern alignment:** mirrors v1.0 `src/modules/product-builder/` where possible. Diverges only where v2.0's paramount invariants (specificity + versioning) require it.

---

## 2.1 Module Boundaries

### Entry points
1. **Direct URL:** `/ubb` → `CanvasOverviewScreen`
2. **Sidebar link:** inside `BUILD` space, labeled *"Unique Business Builder (v2)"*, next to existing `Canvas`
3. **ZoG completion CTA:** after user saves ZoG snapshot, show *"Build your unique business →"* → `/ubb`
4. **Legacy canvas upgrade:** `/game/build/canvas` overview banner — *"Upgrade to Unique Business Builder v2"*

### Exit points
1. **Public Dossier URL:** `/ubd/{slug}` (shareable, world-readable)
2. **Public Landing Page URL:** `/ubl/{slug}-v{version}` (shareable, world-readable)
3. **Back to `/game` dashboard**
4. **Forward to `/ignite`** booking (from Golden DM CTA)

### Data in
| Source | Purpose | Required |
|---|---|---|
| `zog_snapshots` (latest for user) | Seeds `uniqueness` v1 | **Yes** — redirect to `/zone-of-genius/entry` if missing |
| `zog_snapshots.excalibur_data` | Optional seed context for canvas | No |
| `user_business_artifacts` (existing rows) | Resume-in-place for returning users | No (empty on first run) |
| Supabase Auth `user.id` | Scope all writes | Yes |

### Data out
| Target | Written when |
|---|---|
| `user_business_artifacts` | Each accepted Improve → new row (append-only) |
| `artifact_improvements` | Every Improve attempt (accept / reject / diminishing) |
| `unique_business_dossiers` | User clicks Publish on Dossier or Landing Page |
| `canvas_snapshots` (legacy, denormalized) | Updated on each Lock for dashboard speed |
| `game_profiles.last_canvas_snapshot_id` | Touched on each Improve accept |

### Dependencies
- **Supabase Auth** — RLS enforces per-user isolation
- **Supabase Realtime** — live sync of version history across tabs (nice-to-have, not blocking)
- **Lovable AI Gateway** at `openai/gpt-5.2` — model for both generate + improve
- **shadcn/ui + PremiumCard** — UI tokens already in project
- **v1.0 Product Builder** — read-only neighbor. Optional one-way handoff (v2.0 `frictionless_purchase` → v1.0 marketplace landing). NOT in MVP.

### Relationship to v1.0

| v1.0 (`product-builder`) | v2.0 (`unique-business-builder`) |
|---|---|
| Lives at `src/modules/product-builder/` | Lives at `src/modules/unique-business-builder/` |
| Writes to `product_builder_snapshots`, `marketplace_products` | Writes to `user_business_artifacts`, `artifact_improvements`, `unique_business_dossiers` |
| Entry: `/game/build/product-builder` | Entry: `/ubb` |
| Published at `/mp/{slug}` | Published at `/ubd/{slug}` and `/ubl/{slug}-v{n}` |
| Remains live and functional | New build, coexists |
| Gemini-era edge functions | GPT-5.2-era edge functions |

Zero shared code between modules. Shared infra only: auth, ZoG input, Supabase, Lovable AI Gateway.

---

## 2.2 Routing

### Authenticated routes (guard: `user + zog_snapshot`)

```ts
// In src/App.tsx — new block alongside existing /game/build/product-builder/*

<Route path="/ubb" element={<UniqueBusinessLayout />}>
  <Route index element={<CanvasOverviewScreen />} />
  <Route path="uniqueness" element={<UniquenessScreen />} />
  <Route path="myth" element={<MythScreen />} />
  <Route path="tribe" element={<TribeScreen />} />
  <Route path="pain" element={<PainScreen />} />
  <Route path="promise" element={<PromiseScreen />} />
  <Route path="lead-magnet" element={<LeadMagnetScreen />} />
  <Route path="value-ladder" element={<ValueLadderScreen />} />
  <Route path="session" element={<SessionBridgeScreen />} />
  <Route path="marketing" element={<MarketingScreen />} />
  <Route path="distribution" element={<DistributionScreen />} />
  <Route path="communications" element={<CommunicationsScreen />} />
  <Route path="landing-page" element={<LandingPageScreen />} />
  <Route path="dossier" element={<DossierScreen />} />
  <Route path="*" element={<Navigate to="/ubb" replace />} />
</Route>
```

### Public routes (no auth)

```ts
<Route path="/ubd/:slug" element={<PublicDossierPage />} />
<Route path="/ubl/:slugWithVersion" element={<PublicLandingPage />} />
```

Where `:slugWithVersion` follows pattern `{slug}-v{n}` (e.g., `alex-konst-v5`). Parsed server-side / client-side via regex.

### Guards (composed)

| Guard | Trigger | Redirect |
|---|---|---|
| `RequireAuth` | Any `/ubb/*` | `/auth/sign-in?next=/ubb` |
| `RequireZoG` | `/ubb/*` except `/ubb/dossier` (public-read) | `/zone-of-genius/entry?next=/ubb` |
| `RequireSiblingLocks` | Per-artifact (e.g., Pain requires Tribe locked) | Toast + keep user on current screen |
| `RequirePublication` | `/ubb/landing-page` publish button | Inline error if Landing Page artifact has no version |

### Redirect rules
- Unknown artifact key → `/ubb` (canvas overview)
- Logged-out user hitting `/ubb` → `/auth/sign-in?next=/ubb`
- Public `/ubd/:slug` → always accessible; 404 page if slug unknown or `is_live=false`
- v1.0 user on `/game/build/product-builder` → unchanged, no forced migration

---

## 2.3 Data Schema

Full schema in [`schema_delta.md`](./schema_delta.md). Phase 2 resolutions of the open questions there:

| Open question | Decision |
|---|---|
| Keep `canvas_snapshots` as read model? | **Yes.** Updated on each Lock. Used by dashboard queries that don't need version history. |
| Store Dossier `rendered_html`? | **Yes, cache on publish.** Regenerate on republish. Public route serves from cache. |
| Landing Page publish table? | **Reuse `unique_business_dossiers`** with `landing_page_version` + `landing_page_rendered_html` columns. Simpler lifecycle. One publish event = one row. |
| Staleness tracking? | **Client-side compute** from `updated_at` timestamps. "Myth locked after Tribe" triggers UI banner *"Tribe was updated — Pain may be stale."* DB-level dependency tracking is over-engineering now. |
| v1.0 `precision_score` column? | **Keep as alias** indefinitely. Sync on write (`specificity_score = precision_score` backfill). Drop in v3.0 or when v1.0 is deprecated. |

### Key query patterns

```sql
-- Get latest locked version per artifact_key for a user
SELECT DISTINCT ON (artifact_key) *
FROM user_business_artifacts
WHERE user_id = $1 AND is_locked = true
ORDER BY artifact_key, version DESC;

-- Get full version history for one artifact
SELECT * FROM user_business_artifacts
WHERE user_id = $1 AND artifact_key = $2
ORDER BY version DESC;

-- Get roast findings for a specific version
SELECT * FROM artifact_improvements
WHERE artifact_after_id = $1;

-- Public dossier fetch
SELECT * FROM unique_business_dossiers
WHERE slug = $1 AND is_live = true;
```

### Indexes (see migration files in schema_delta.md)

- `idx_uba_user_artifact_latest` on `(user_id, artifact_key, version DESC)` — primary lookup
- `idx_uba_parent` on `parent_version_id` — version tree traversal
- `idx_aimp_user` + `idx_aimp_artifact` — audit queries
- `idx_ubd_slug` on `slug` WHERE `is_live=true` — public fetch

---

## 2.4 Shell & Layout

### Focus mode rules

| Context | Sidebar | Progress indicator |
|---|---|---|
| `/ubb` (Canvas Overview) | Full nav visible | Header shows `4/18 locked` |
| `/ubb/{any-artifact}` | **Hidden** (focus mode) | Header shows breadcrumb `Canvas › {Artifact}` + `4/18` |
| `/ubb/dossier` | Full nav visible | Header shows `Dossier` + Share button |
| Mobile (<640px) | Bottom sheet nav on overview, hidden on artifact screens | Sticky top bar with progress |

**Justification:** artifact screens require depth. Hiding nav prevents accidental context switches mid-Improve. Overview and Dossier are "surfacing" moments — full nav helps orientation.

### Responsive breakpoints (from UI Playbook)

- **Mobile (<640px):** single column, ImproveReviewScreen = full-screen sheet from bottom
- **Tablet (640–1023):** single column, ImproveReviewScreen = modal
- **Desktop (≥1024):** two-column on artifact screens when Improve is active (artifact left 60% / diff right 40%), single column otherwise

### Progress indicator

```
┌─────────────────────────────────┐
│ Canvas › Myth         4/18 ●●●● │  ← filled proportional to locked count
└─────────────────────────────────┘
```

On compound screens (Marketing, Distribution, etc.), progress shows sub-artifact lock state:
```
Marketing (2/3)   ●●○
```

---

## 2.5 State Management

### Pattern: React Context (matches v1.0 `ProductBuilderContext`)

```ts
// src/modules/unique-business-builder/UniqueBusinessContext.tsx

type UniqueBusinessState = {
  // Core state
  artifacts: Record<ArtifactKey, ArtifactState | null>;  // latest locked version per key
  versionHistory: Record<ArtifactKey, VersionRow[]>;     // loaded lazily on demand
  
  // Transient UI
  pendingImprovement: ImproveResult | null;   // shown in ImproveReviewDrawer
  isImproving: ArtifactKey | null;            // which artifact is currently mid-Improve
  isGenerating: ArtifactKey | null;           // which is mid-initial-generate
  
  // Derived
  lockedCount: number;
  unlockedCount: number;
  avgSpecificity: number;
  stalenessWarnings: Array<{ artifact: ArtifactKey, reason: string }>;
  
  // Dossier
  dossier: DossierSnapshot | null;            // composed view, computed on demand
};

type UniqueBusinessActions = {
  generateArtifact: (key: ArtifactKey) => Promise<void>;
  improveArtifact: (key: ArtifactKey) => Promise<void>;
  acceptImprovement: () => Promise<void>;
  rejectImprovement: () => Promise<void>;
  lockArtifact: (key: ArtifactKey) => Promise<void>;
  unlockArtifact: (key: ArtifactKey) => Promise<void>;
  loadVersionHistory: (key: ArtifactKey) => Promise<void>;
  publishLandingPage: () => Promise<{ slug: string, version: number }>;
  publishDossier: () => Promise<{ slug: string }>;
};
```

### Persistence layers

| Layer | What | TTL |
|---|---|---|
| **Supabase** (`user_business_artifacts`) | Source of truth. Every locked version. | Permanent |
| **Supabase** (`artifact_improvements`) | Every Improve event (accept + reject + diminishing) | Permanent |
| **Supabase Realtime** | Subscribes to rows for current user + artifact_keys | Live |
| **localStorage** | UI prefs only: expanded compound cards, dismiss'd banners, last visited artifact | Device-local |
| **URL** | Current artifact screen (`/ubb/:key`) → shareable WIP state | Session |

### Realtime sync

```ts
// UniqueBusinessContext subscribes on mount:
supabase
  .channel(`uba:${user.id}`)
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'user_business_artifacts',
      filter: `user_id=eq.${user.id}` },
    (payload) => reloadArtifact(payload.new.artifact_key)
  )
  .subscribe();
```

Covers: multi-tab consistency, someone on a shared account (edge case), concurrent browser sessions.

### Resume logic

On module mount:
1. Fetch latest locked version per artifact_key (one query, DISTINCT ON).
2. Compute state: `{ locked: [...], unlocked: [...], in_progress: [...] }`.
3. If no artifacts → route stays on `/ubb` (overview), CTA = "Start with Uniqueness".
4. If some locked → resume on first unlocked artifact, or stay on overview.
5. Lazy-load version history only when user clicks "▸ Version history" on an artifact.

---

## Edge Function Contracts

### `generate-artifact`

**Location:** `supabase/functions/generate-artifact/index.ts`

```ts
POST /functions/v1/generate-artifact
Body: {
  artifact_key: ArtifactKey,
  root_context: {
    zog_snapshot: ZogSnapshot,
    excalibur_data?: ExcaliburData,
  },
  sibling_artifacts: Record<ArtifactKey, { content, specificity }>,
}
Response: {
  content: Json,                    // artifact-specific shape
  initial_specificity: number,      // typical 5–7
  crystallized_action: string,
}
OR: { error: 'insufficient_credit' | 'model_error' }
```

- Model: `google/gemini-2.5-flash` via Lovable AI Gateway
- Timeout: 60s
- No retry on 402; one retry on 5xx
- Cost: ~$0.0002–$0.0006 per call

### `improve-artifact`

**Location:** `supabase/functions/improve-artifact/index.ts`
**Prompt template:** see `ROAST_PROTOCOL` in [`supabase/functions/_shared/ubb-prompts.ts`](../../../supabase/functions/_shared/ubb-prompts.ts) — source of truth.

```ts
POST /functions/v1/improve-artifact
Body: {
  artifact_key: ArtifactKey,
  current_content: Json,
  current_specificity: number,
  sibling_artifacts: Record<ArtifactKey, { content, specificity }>,
  root_context: { zog_snapshot, excalibur_data? },
  previous_versions: Json[],  // up to 3 prior
}
Response: ImproveResult  // shape defined inline in improve-artifact/index.ts; see ROAST_PROTOCOL in ubb-prompts.ts
OR: { error: 'insufficient_credit' | 'model_error' }
```

- Model: `google/gemini-2.5-flash` via Lovable AI Gateway
- Timeout: 90s (larger prompt + reasoning)
- Enforces monotonic: if model returns `specificity_delta < 0` and `diminishing_returns: false`, server overrides `diminishing_returns = true`
- Cost: ~$0.0003–$0.0008 per call

### `publish-landing-page` (optional)

Can be done client-side if render is client-side. Defer to Phase 3 UI decision on HTML rendering approach.

---

## Error & Failure Modes

| Failure | Surface | DB effect |
|---|---|---|
| **402 Payment Required** (Lovable AI Gateway) | Toast: *"AI credit limit reached. Top up in Settings → Plans & Credits."* + link to Settings | No writes |
| **5xx from model** | Retry once silently; on second failure toast: *"AI is briefly unavailable. Try again in a minute."* | No writes |
| **Invalid JSON** from model | Retry once with stricter `response_format`. On second failure: toast + log. | No writes |
| **Empty improvement** | Treat as `diminishing_returns: true`. Show inline notice. | Log to `artifact_improvements` with `accepted=false, diminishing_returns=true` |
| **specificity_delta < 0** | Server overrides `diminishing_returns=true`; no version proposed | Log only |
| **DB write fails after model succeeds** | Critical. Toast: *"Improvement generated but save failed. Please retry — no data lost."* + preserve pendingImprovement in Context. | `artifact_improvements` may have entry without matching `artifact_after_id` — reconcile on retry |
| **Concurrent edits (same user, two tabs)** | Realtime sync fetches on INSERT. If a race creates two v_{n+1}, second one gets `version = n+2` via DB trigger or app-layer check. | Both rows kept (append-only invariant holds) |
| **Network offline** | Queue Improve request in Context; retry on reconnect. No DB write until success. | — |

---

## Directory Structure (Frontend)

```
src/modules/unique-business-builder/
├── index.ts                          — barrel exports
├── UniqueBusinessRoutes.tsx          — <Route> block for App.tsx mounting
├── UniqueBusinessContext.tsx         — Provider + hook
├── UniqueBusinessLayout.tsx          — shell, focus mode, progress
├── types.ts                          — TypeScript types (see below)
├── constants.ts                      — ARTIFACT_KEYS, phase groupings
├── screens/
│   ├── CanvasOverviewScreen.tsx
│   ├── UniquenessScreen.tsx
│   ├── MythScreen.tsx
│   ├── TribeScreen.tsx
│   ├── PainScreen.tsx
│   ├── PromiseScreen.tsx
│   ├── LeadMagnetScreen.tsx
│   ├── ValueLadderScreen.tsx
│   ├── SessionBridgeScreen.tsx
│   ├── MarketingScreen.tsx
│   ├── DistributionScreen.tsx
│   ├── CommunicationsScreen.tsx
│   ├── LandingPageScreen.tsx
│   └── DossierScreen.tsx
├── components/
│   ├── ArtifactPanel.tsx             — shared artifact display (passed current artifact)
│   ├── ImproveButton.tsx             — the one-button Improve trigger
│   ├── ImproveReviewDrawer.tsx       — diff + roast findings + accept/reject
│   ├── SpecificityBadge.tsx          — `8.5 (↑ from 7.1)` pill
│   ├── VersionHistoryPanel.tsx       — expandable "Version history (3)"
│   ├── CompoundArtifactCard.tsx      — for Marketing/Distribution/Communications sub-cards
│   ├── LockAndContinueButton.tsx
│   └── DiminishingReturnsNotice.tsx
├── hooks/
│   ├── useArtifact.ts                — read latest locked + in-progress for one key
│   ├── useImprove.ts                 — wraps improve-artifact call
│   ├── useGenerate.ts                — wraps generate-artifact call
│   ├── useVersionHistory.ts          — lazy-load per artifact
│   ├── useDossierSnapshot.ts         — compose current state
│   ├── usePublishLandingPage.ts
│   └── usePublishDossier.ts
└── lib/
    ├── artifact-schemas.ts           — per-artifact content shape validators
    ├── compose-dossier.ts            — assembles 18 artifacts into dossier JSON
    └── render-landing-page.ts        — turns landing_page artifact into HTML
```

## Directory Structure (Edge Functions)

```
supabase/functions/
├── generate-artifact/
│   ├── index.ts
│   └── prompts/
│       └── (17 per-artifact generation prompts, keyed by artifact_key)
├── improve-artifact/
│   ├── index.ts
│   └── roast-prompt.ts               — the shared 27-perspective template
└── (optional) render-dossier/
    └── index.ts                       — server-side HTML render if needed
```

Both edge functions load per-artifact specificity criteria and generation prompts from shared JSON configs (to be defined in Phase 3).

---

## Key TypeScript Types (preview)

```ts
// src/modules/unique-business-builder/types.ts

export type ArtifactKey =
  | 'uniqueness' | 'myth' | 'tribe' | 'pain' | 'promise' | 'lead_magnet' | 'value_ladder'
  | 'session_bridge'
  | 'core_belief' | 'packaging' | 'frictionless_purchase'
  | 'reach' | 'delivery' | 'spread'
  | 'surface_inventory' | 'tuning_fork' | 'golden_dm'
  | 'landing_page';

export const PHASE_A_CANVAS = [
  'uniqueness', 'myth', 'tribe', 'pain', 'promise', 'lead_magnet', 'value_ladder'
] as const;
export const PHASE_B_SESSION = ['session_bridge'] as const;
export const PHASE_C_MARKET = [
  'core_belief', 'packaging', 'frictionless_purchase',
  'reach', 'delivery', 'spread',
  'surface_inventory', 'tuning_fork', 'golden_dm',
] as const;
export const PHASE_D_PUBLICATION = ['landing_page'] as const;

export type VersionRow = {
  id: string;
  user_id: string;
  artifact_key: ArtifactKey;
  version: number;
  content: unknown;              // shape depends on artifact_key
  specificity_score: number;     // 0–10
  parent_version_id: string | null;
  roast_findings: RoastFinding[] | null;
  what_changed: string | null;
  is_locked: boolean;
  created_at: string;
};

export type ArtifactState = {
  key: ArtifactKey;
  latest: VersionRow | null;      // latest row (locked or not)
  latestLocked: VersionRow | null;
  isStale: boolean;               // some sibling locked after this one
  staleReason?: string;
};

export type RoastFinding = {
  quadrant: 'UL' | 'UR' | 'LL' | 'LR' | '13' | 'depth' | '27';
  weakness: string;
};

export type ImproveResult = {
  roast_findings: RoastFinding[];
  improved_content: unknown;
  what_changed: string;
  specificity_score: number;
  specificity_delta: number;
  crystallized_action: string;
  diminishing_returns: boolean;
};

export type DossierSnapshot = {
  slug?: string;
  artifact_snapshot: Record<ArtifactKey, VersionRow>;
  specificity_avg: number;
  published_at?: string;
};
```

Full shapes for each `ArtifactKey`'s content JSON live in `lib/artifact-schemas.ts` and match the output shapes in [`artifact_prompts_spec.md`](./artifact_prompts_spec.md).

---

## Roast Gate 2 — Navigation Walkthrough

### Trace every user path
| Path | Expected behavior | Covered? |
|---|---|---|
| First-time user with ZoG → lands at `/ubb` | Overview with all 18 unlocked, CTA = "Start with Uniqueness" | ✅ |
| First-time user no ZoG → `/ubb` | Redirect to `/zone-of-genius/entry?next=/ubb` | ✅ |
| Returning user, 4 artifacts locked → `/ubb` | Overview shows 4 locked, CTA = "Continue with Pain" | ✅ |
| User mid-Improve refreshes page | Pending improvement lost (not persisted). Must re-click Improve. | ⚠️ trade-off noted |
| User clicks Back mid-artifact | Returns to `/ubb` overview | ✅ |
| User navigates away mid-generate | Generate continues server-side; result fetched on return via realtime | ✅ |
| Deep link `/ubb/pain` when Tribe not locked | Toast "Lock Tribe first", redirect to `/ubb/tribe` | ✅ |
| User clicks `/ubb/dossier` before all locked | Shows partial dossier + "Gap" markers | ✅ |
| User publishes Landing Page v5, later Improves to v6 | v5 still live at `/ubl/{slug}-v5`. Must re-publish to get v6 live. | ✅ |
| User unlocks a locked artifact → stale warnings on downstream | Banner appears on each stale artifact with "Re-Improve?" CTA | ✅ |

### Cycle 1 — Entry/exit, step counters

- Entry points: 4 defined ✅
- Exit points: 4 defined ✅
- Step counter is proportional to locked count (4/18), not position (4th of 18) — matches monotonic framing ✅
- Public exit URLs (`/ubd`, `/ubl`) defined ✅

### Cycle 2 — Data flow, auth guards, error states

- Data flow: seed → generate v1 → improve → lock → compose dossier → publish ✅
- Auth: RequireAuth + RequireZoG + RequireSiblingLocks composed ✅
- Error states: 402 + 5xx + invalid JSON + DB-after-model + concurrent all covered ✅

### Cycle 3 — What did 1-2 miss?

- **Missed:** what happens if the user's ZoG snapshot is updated *after* they've started building? The existing canvas was seeded from the OLD ZoG — now stale. Decision: show banner *"Your Zone of Genius has been updated. Affected: Uniqueness, Myth"* with "Re-Improve?" CTA per affected artifact.
- **Missed:** what if a user has TWO Lovable accounts and logs into both? Realtime sync handles but the cost might surprise. Not a blocker — document in FAQ.
- **Missed:** no clear UX for deleting a published Dossier. Decision: set `is_live=false`, keep row for history. User can un-publish but not hard-delete v1.
- **Missed:** landing page `slug` collisions across users. Decision: prefix slug with short user hash OR require uniqueness globally with auto-suffix (`-2`, `-3`).

---

## Open questions for Roast Gate 2 (your review)

1. **Focus mode ON by default for artifact screens?** Or always-show sidebar (less focused, easier orientation)?
2. **Mid-Improve page refresh:** lose pending improvement (current plan — stateless) OR persist pendingImprovement to Supabase for resume? (Adds a row that isn't yet accepted, slightly messy.)
3. **Landing Page slug pattern:** `{user-hash}-{custom}-v{n}` (user-namespaced, no collisions) OR `{custom}-v{n}` + auto-suffix on collision (cleaner URLs, possible race)?
4. **Cost-aware UI:** show user a small "~$0.02 this improve, $0.43 this session" indicator? Transparent but might make them hesitate to iterate. Hide by default, surface on settings?
5. **ZoG-updated staleness:** show per-artifact banners as proposed, OR block all Improve until user acknowledges ZoG change?

Answer these, we move to Phase 3 (UI).

---

## What Phase 3 (UI) decides

- Visual design (colors, typography, spacing) — tokens already set in UI Playbook
- Building blocks (Button / Card / Input variants — reuse existing)
- All 9 component states (default/hover/focus/active/disabled/loading/error/empty/skeleton)
- Micro-interactions (specificity rising animation, version history slide)
- Accessibility (WCAG 2.2 AA)
- Nielsen critique per screen
- Published Landing Page / Dossier HTML render templates
