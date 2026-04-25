# Lovable Prompt — Apply `resonance_events` Migration & Wire Unified Telemetry

> *Day 51 (2026-04-25). Paste the prompt block below verbatim into a Lovable session. The migration file already exists in the repo at `supabase/migrations/20260425000001_resonance_events.sql` — Lovable just needs to apply it and wire the client helpers.*

---

## Context for the Lovable session (read-me, NOT for paste)

**What this ships:**
1. The `resonance_events` Postgres table (already drafted in `supabase/migrations/20260425000001_resonance_events.sql` — append-only, RLS-enabled, anonymous-friendly).
2. A unified client-side helper `src/lib/saveResonanceEvent.ts` that any reveal-with-rating in the funnel calls.
3. Migration of the six existing in-funnel callers from `saveResonanceRating` (which writes to `zog_snapshots` columns) to also write through `saveResonanceEvent` — keeping the legacy path during transition for backward compatibility on existing dashboards.

**Why it matters:** until this lands, 4 of the 6 active resonance ratings (icp / pain / tp / landing in product-builder) save only to React Context and disappear on reload. The Specificity Loop (Playbook Principle 15) becomes telemetry only when every rating is persisted in one place. Per-founder UBB matrices generated from Day 51 onward also need this table — they introduce new artifact_kinds with zero schema work.

---

## ── PASTE BELOW INTO LOVABLE ─────────────────────────────────────

I'm shipping the unified resonance telemetry from Day 51 (Specificity Loop, Playbook Principle 15 / Phase Shift Library Domain 81).

**Step 1 — Apply the migration.**

The migration file is already in the repo at `supabase/migrations/20260425000001_resonance_events.sql`. Apply it to the connected Supabase project. It creates one table `public.resonance_events`, four indexes, RLS enabled with two policies (insert-any, select-own). It is non-destructive and idempotent (`if not exists`).

**Step 2 — Create the client helper `src/lib/saveResonanceEvent.ts`.**

Function signature:

```ts
export async function saveResonanceEvent(input: {
  profileId?: string | null;
  userId?: string | null;
  artifactKind: string;        // 'appleseed' | 'excalibur' | 'icp' | 'pain' | 'tp' | 'landing' | any UBB ArtifactKey
  artifactId?: string | null;  // optional FK-by-convention to the source row
  rating: number;              // 1-10
  messageSeen?: string;        // the actual reveal text the user saw
  matrixSource?: 'master' | 'founder_override' | 'explicit_override';
  matrixVersion?: string;
  contextJson?: Record<string, unknown>;
}): Promise<void>
```

Behaviour:
- Compute `tier` from rating using the same boundaries as `src/lib/resonanceMatrix.ts → tierFor()` (≥8 resonant, ≥5 partial, else off). Import that helper rather than duplicating the thresholds.
- If `clientSessionId` isn't supplied, derive a stable per-tab id from `sessionStorage` under key `resonance_session_id` (UUID generated once and reused).
- Insert one row into `public.resonance_events`. Never throw into the UI — this is telemetry. Wrap in try/catch and `console.warn` on failure (mirror `saveResonanceRating.ts` style).
- Default `matrixSource` to `'master'` when omitted.

**Step 3 — Wire the six existing callers.**

Each of these already calls `saveResonanceRating(profileId, kind, rating)`. After that call, additionally call `saveResonanceEvent` with the matching `artifactKind` and the `messageSeen` (which is what `useResonanceMessage(step, rating).message` returned for that rating). Keep the legacy `saveResonanceRating` call in place — it writes to the existing `zog_snapshots.resonance_rating` / `excalibur_resonance_rating` columns that downstream dashboards may already depend on.

| File | step / artifactKind |
|------|---------------------|
| `src/modules/zone-of-genius/AppleseedDisplay.tsx` (`onResonanceRating`) | `appleseed` |
| `src/modules/zone-of-genius/ExcaliburDisplay.tsx` (`onResonanceRating`) | `excalibur` |
| `src/modules/product-builder/steps/DeepICPScreen.tsx` (`handleResonanceRating`) | `icp` |
| `src/modules/product-builder/steps/DeepPainScreen.tsx` (`handleResonanceRating`) | `pain` |
| `src/modules/product-builder/steps/DeepTPScreen.tsx` (`handleResonanceRating`) | `tp` |
| `src/modules/product-builder/steps/LandingPageScreen.tsx` (`handleResonanceRating`) | `landing` |

The cleanest place to fire `saveResonanceEvent` is inside `ResonanceRating`'s `handleRate` itself — that way every existing AND future caller participates in telemetry by virtue of using the component. To do this, the component needs the `step` prop (already wired on Day 51) plus access to the resolved `messageSeen`. The hook `useResonanceMessage(step, rating)` (already in `resonanceMatrix.ts`) returns `{ message, tier }` — read it inside `handleRate` and pass `message` as `messageSeen` and source as appropriate (master vs founder_override based on whether a `ResonanceMatrixProvider` was active above; for Lovable's first wire, default to `'master'` and we'll thread the source later when per-founder matrix loading lands).

**Step 4 — UBB artifact ratings (forward-looking, don't ship yet).**

The Day 51 work added `specificity_matrix` as UBB artifact #19. When per-artifact ratings land in UBB (each artifact gets its own ResonanceRating after the founder reads the generated content), they will use the same `saveResonanceEvent` with `artifactKind = <ArtifactKey>` and `artifactId = <user_business_artifacts.id>`. No further schema work needed. Don't build the UBB-side rating UI in this Lovable session — that's a separate slice.

**Step 5 — Verify.**

After shipping, in the running app:
1. Visit `/zone-of-genius`, complete the Appleseed flow, rate.
2. Run a Supabase query: `select artifact_kind, rating, tier, message_seen, matrix_source from public.resonance_events order by created_at desc limit 5;`
3. Confirm at least one row appears with `artifact_kind = 'appleseed'` and a non-empty `message_seen`.

That's the whole slice. RLS already restricts `select` to the user's own rows, so no app changes needed for permissioning.

## ── END OF PASTE BLOCK ───────────────────────────────────────────

---

## After Lovable applies (notes for Sasha)

- The migration is non-destructive — running it twice is safe (`if not exists` everywhere).
- Existing `saveResonanceRating` writes to `zog_snapshots` columns are preserved. Eventually those can be deprecated once dashboards are migrated to query `resonance_events`. No rush.
- Per-founder matrix loading (`ResonanceMatrixProvider` reading from `user_business_artifacts.specificity_matrix`) is a separate next slice. When it lands, the `matrix_source` column starts capturing `'founder_override'` instead of `'master'`, and analytics can compare conversion rates between Sasha's master matrix and per-founder matrices.
- AI Credits MVP is the third leg (charging credits on regenerate-for-higher-resonance). The `tier = 'off'` rows in `resonance_events` are the trigger surface for "Try a sharper version (1 credit)?".
