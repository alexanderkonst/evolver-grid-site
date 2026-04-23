# Schema Delta — Unique Business Builder v2.0

*Minimal changes. Reuses existing infrastructure wherever possible.*

---

## Existing tables we reuse (no changes)

### `user_business_artifacts` (already versioned)
Existing columns fit cleanly:
- `user_id`, `artifact_key`, `step_number`, `content` (JSONB), `version`, `precision_score`

**What needs to change:** the `artifact_key` domain expands from v1.0's ~8 keys to v2.0's 18. If this column has a CHECK constraint or ENUM, it needs loosening. If it's a free text column, no migration required.

**Full v2.0 artifact_key set:**
```
uniqueness, myth, tribe, pain, promise, lead_magnet, value_ladder,
session_bridge,
core_belief, packaging, frictionless_purchase,
reach, delivery, spread,
surface_inventory, tuning_fork, golden_dm,
dossier
```

### `canvas_snapshots` (already has 7 JSONB slots)
The existing columns (`uniqueness`, `myth`, `tribe`, `pain`, `promise`, `lead_magnet`, `value_ladder`) map 1:1 to v2.0 Phase A artifacts. No change.

Phase B, C, D artifacts live in `user_business_artifacts` (versioned per-artifact). `canvas_snapshots` stays as the "canvas state snapshot" record — a denormalized read model.

### `game_profiles` (unchanged)
`last_canvas_snapshot_id` already there. Touched on each Improve accept.

### `zog_snapshots` (unchanged)
Read-only input to v2.0. `excalibur_data` JSONB column read when seeding the `uniqueness` artifact.

---

## New columns on `user_business_artifacts`

Needed for the Improve loop's version lineage:

```sql
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
```

- `parent_version_id` — threads the version chain per artifact
- `roast_findings` — JSONB of the roast output that produced this version (null for v1 drafts)
- `what_changed` — one-sentence delta description (null for v1 drafts)
- `is_locked` — set true when user clicks Lock & Continue; downstream artifacts can now depend on it

---

## New table: `artifact_improvements` (audit log)

Optional but recommended — separates improvement events from artifact rows for analytics.

```sql
CREATE TABLE IF NOT EXISTS artifact_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artifact_key TEXT NOT NULL,
  artifact_before_id UUID REFERENCES user_business_artifacts(id) ON DELETE SET NULL,
  artifact_after_id UUID REFERENCES user_business_artifacts(id) ON DELETE SET NULL,
  roast_findings JSONB NOT NULL,
  what_changed TEXT,
  crystallized_action TEXT,
  precision_before NUMERIC(3,1),
  precision_after NUMERIC(3,1),
  precision_delta NUMERIC(3,1),
  user_note TEXT,
  accepted BOOLEAN NOT NULL,  -- true if user clicked Accept, false if Reject
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aimp_user ON artifact_improvements(user_id, created_at DESC);
CREATE INDEX idx_aimp_artifact ON artifact_improvements(user_id, artifact_key, created_at DESC);

ALTER TABLE artifact_improvements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own improvements"
  ON artifact_improvements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own improvements"
  ON artifact_improvements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## New table: `unique_business_dossiers`

Published Dossier records. Parallel to v1.0's `marketplace_products` but richer payload.

```sql
CREATE TABLE IF NOT EXISTS unique_business_dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,  -- pattern: 'ubd-{timestamp}' or custom
  title TEXT NOT NULL,
  artifact_snapshot JSONB NOT NULL,  -- frozen copy of all 17 artifacts at publish time
  precision_avg NUMERIC(3,1) NOT NULL,
  high_stakes_precision JSONB NOT NULL,  -- { myth, pain, promise, golden_dm }
  rendered_html TEXT,  -- optional: pre-rendered dossier HTML
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

Publishes to public route `/ubd/{slug}` (parallel to v1.0's `/mp/{slug}`).

---

## Summary of changes

| Change | Type | File |
|--------|------|------|
| Add 4 columns to `user_business_artifacts` | Migration | `supabase/migrations/{ts}_ubb_artifact_versioning.sql` |
| Create `artifact_improvements` | Migration | `supabase/migrations/{ts}_ubb_artifact_improvements.sql` |
| Create `unique_business_dossiers` | Migration | `supabase/migrations/{ts}_ubb_dossiers.sql` |
| Loosen `artifact_key` constraint if present | Migration | combined with first migration |

Total: 3 migration files. No changes to `canvas_snapshots`, `game_profiles`, `zog_snapshots`, `marketplace_products`.

---

## Open decisions (Phase 2)

1. Do we keep `canvas_snapshots` as a read model synchronized from `user_business_artifacts`, or deprecate it in favor of materialized queries?
2. Does `unique_business_dossiers.artifact_snapshot` store the composed HTML, the raw JSONB, or both?
3. Is there a need for `artifact_dependencies` tracking (e.g., "Pain is stale because Tribe was re-improved")? Or compute client-side from `is_locked` + `updated_at` timestamps?

Pick up in Phase 2.1 Module Boundaries.
