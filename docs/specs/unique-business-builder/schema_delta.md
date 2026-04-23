# Schema Delta — Unique Business Builder v2.0

*Minimal changes. Reuses existing infrastructure. Paramount invariant: **each accepted Improve creates a NEW row, never an in-place update.***

---

## Paramount invariant — monotonic versioning

- `user_business_artifacts` is **append-only** for v2.0 writes.
- Each accepted Improve = INSERT a new row with incremented `version` and a higher `specificity_score` than the previous locked row.
- Previous versions are never deleted, never overwritten.
- The founder's version history is the business's memory of its own sharpening. This is not a soft-delete pattern — it's structural.

---

## Existing tables we reuse

### `user_business_artifacts` (extended, see below)
Already versioned. Already has precision_score (legacy). Expanding to v2.0's 18 artifact keys.

### `canvas_snapshots`
Existing 7 JSONB slots map 1:1 to Phase A artifacts. Stays as a denormalized read model of the canvas state. No column changes.

### `game_profiles`
`last_canvas_snapshot_id` already there. Touched on each Improve accept.

### `zog_snapshots`
Read-only input. `excalibur_data` JSONB read when seeding `uniqueness` v1.

---

## Full artifact_key set for v2.0 (18 keys)

```
-- Phase A (Canvas)
uniqueness, myth, tribe, pain, promise, lead_magnet, value_ladder,

-- Phase B (Session bridge — 1 compound)
session_bridge,

-- Phase C (Market path — 9)
core_belief, packaging, frictionless_purchase,
reach, delivery, spread,
surface_inventory, tuning_fork, golden_dm,

-- Phase D (Publication — 1 improvable artifact)
landing_page
```

`dossier` is NOT an artifact_key — it's a composed view stored in its own table (`unique_business_dossiers`).

If `user_business_artifacts.artifact_key` has a CHECK constraint or ENUM today, it must be loosened to accept all 18 keys above. If it's free text, no migration needed for the key set itself.

---

## Migration 1 — extend `user_business_artifacts`

```sql
-- Add specificity tracking (v2.0 terminology)
ALTER TABLE user_business_artifacts
  ADD COLUMN IF NOT EXISTS specificity_score NUMERIC(3,1);

-- Backfill from legacy column (if v1.0 data exists)
UPDATE user_business_artifacts
  SET specificity_score = precision_score
  WHERE specificity_score IS NULL AND precision_score IS NOT NULL;

-- Versioning lineage
ALTER TABLE user_business_artifacts
  ADD COLUMN IF NOT EXISTS parent_version_id UUID
    REFERENCES user_business_artifacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS roast_findings JSONB,
  ADD COLUMN IF NOT EXISTS what_changed TEXT,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_uba_parent
  ON user_business_artifacts(parent_version_id);

CREATE INDEX IF NOT EXISTS idx_uba_user_artifact_latest
  ON user_business_artifacts(user_id, artifact_key, version DESC);

-- Loosen artifact_key constraint if needed
-- (check current schema first; only run if CHECK/ENUM exists)
-- ALTER TABLE user_business_artifacts DROP CONSTRAINT IF EXISTS user_business_artifacts_artifact_key_check;
```

Note: `precision_score` column is kept as legacy alias for v1.0 compatibility. v2.0 code reads/writes `specificity_score`. Eventually drop `precision_score` once v1.0 fully migrated or deprecated.

### Monotonic invariant enforcement (application-layer, not DB)

The `improve-artifact` edge function enforces: `specificity_score` of v_{n+1} ≥ specificity_score of v_n. If model returns lower, function returns `diminishing_returns: true` and no row is written.

DB-level CHECK would be over-constrained (some edge cases: manual admin edits, restore-from-backup). Keep in application layer.

---

## Migration 2 — `artifact_improvements` audit log

Captures every Improve attempt (accept OR reject OR diminishing returns).

```sql
CREATE TABLE IF NOT EXISTS artifact_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artifact_key TEXT NOT NULL,

  artifact_before_id UUID REFERENCES user_business_artifacts(id) ON DELETE SET NULL,
  artifact_after_id  UUID REFERENCES user_business_artifacts(id) ON DELETE SET NULL,

  roast_findings JSONB NOT NULL,
  what_changed TEXT,
  crystallized_action TEXT,

  specificity_before NUMERIC(3,1),
  specificity_after  NUMERIC(3,1),
  specificity_delta  NUMERIC(3,1),

  accepted BOOLEAN NOT NULL,                   -- true: user clicked Accept (row written)
  diminishing_returns BOOLEAN NOT NULL DEFAULT false,  -- true: model self-reported, no version proposed

  model_used TEXT NOT NULL DEFAULT 'openai/gpt-5.2',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aimp_user
  ON artifact_improvements(user_id, created_at DESC);
CREATE INDEX idx_aimp_artifact
  ON artifact_improvements(user_id, artifact_key, created_at DESC);

ALTER TABLE artifact_improvements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own improvements"
  ON artifact_improvements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own improvements"
  ON artifact_improvements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

Analytics use: which artifacts hit diminishing returns earliest? Which roast findings correlate with highest-specificity jumps? Which user_notes (future) produce best deltas?

---

## Migration 3 — `unique_business_dossiers` + landing page publish

Dossier = composed snapshot of all 18 artifacts at a publish moment.
Landing Page = one artifact inside, versioned independently, also publishable.

```sql
CREATE TABLE IF NOT EXISTS unique_business_dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,                     -- 'ubd-{user}-{timestamp}' or custom
  title TEXT NOT NULL,

  artifact_snapshot JSONB NOT NULL,              -- frozen {artifact_key: {content, version, specificity}} for all 18

  specificity_avg NUMERIC(3,1) NOT NULL,
  landing_page_version INTEGER,                  -- version of landing_page artifact at publish
  landing_page_rendered_html TEXT,               -- cached render of the landing page at publish

  rendered_html TEXT,                            -- cached render of the dossier view

  is_live BOOLEAN NOT NULL DEFAULT true,
  views INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ubd_user ON unique_business_dossiers(user_id, published_at DESC);
CREATE INDEX idx_ubd_slug ON unique_business_dossiers(slug) WHERE is_live = true;

ALTER TABLE unique_business_dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view live dossiers by slug"
  ON unique_business_dossiers FOR SELECT
  USING (is_live = true);

CREATE POLICY "Users manage own dossiers"
  ON unique_business_dossiers FOR ALL
  USING (auth.uid() = user_id);
```

**Public URL patterns:**
- Dossier: `/ubd/{slug}`
- Landing Page: `/ubl/{slug}-v{landing_page_version}` OR reuse v1.0's `/mp/{slug}` pattern with marketplace_products — Phase 2 decides.

**Landing Page publish semantics:**
- User clicks "Publish v{n}" on LandingPageScreen.
- New row in `unique_business_dossiers` with current `landing_page` artifact cached.
- Or (alternative for Phase 2): dedicated `unique_business_landing_pages` table if Dossier and Landing Page lifecycles differ enough. For now, one table is cleaner.

---

## Summary of migrations

| File | Purpose |
|------|---------|
| `supabase/migrations/{ts}_ubb_artifact_versioning.sql` | Migration 1 — extend `user_business_artifacts` |
| `supabase/migrations/{ts}_ubb_artifact_improvements.sql` | Migration 2 — audit log table |
| `supabase/migrations/{ts}_ubb_dossiers.sql` | Migration 3 — published dossiers + landing pages |

Total: 3 migration files. No changes to `canvas_snapshots`, `game_profiles`, `zog_snapshots`, `product_builder_snapshots`, `marketplace_products`.

---

## Phase 2 open decisions

1. Keep `canvas_snapshots` as read model synced from `user_business_artifacts`, or deprecate?
2. Store Dossier `rendered_html` or compute on request?
3. Landing Page publish: reuse `unique_business_dossiers` with `landing_page_*` columns, OR create a dedicated `unique_business_landing_pages` table?
4. `artifact_dependencies` staleness tracking — DB-level, or compute client-side from `is_locked` + `updated_at`?
5. v1.0 compatibility: keep `precision_score` column indefinitely, or deprecate in v2.1?

Pick up in Phase 2.1 Module Boundaries.
