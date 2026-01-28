# Lint Baseline Plan

Goal: get lint to a stable, reproducible baseline without blocking feature work.

## Current Hotspots (from recent lint runs)
- `@typescript-eslint/no-explicit-any` across pages, hooks, and Supabase functions.
- React hooks dependencies (`react-hooks/exhaustive-deps`).
- `@typescript-eslint/no-empty-object-type` in UI components.
- `@typescript-eslint/no-require-imports` in `tailwind.config.ts`.
- `@typescript-eslint/triple-slash-reference` in mission-discovery data files.

## Baseline Snapshot (2026-01-08)
- Total: 90 problems (72 errors, 18 warnings).
- Top offenders:
  - `@typescript-eslint/no-explicit-any` (majority of errors).
  - `@typescript-eslint/triple-slash-reference` (mission-discovery data files).
  - `react-hooks/exhaustive-deps` (warnings in hooks/pages).

## Plan (3 passes)
1) **Inventory + baseline**
   - Run `npm run lint` and capture the error list.
   - Group by rule + file area (pages, hooks, components, functions).
   - Record counts in this doc for a baseline snapshot.
2) **Low-risk fixes**
   - Replace obvious `any` with concrete types where types already exist.
   - Fix empty object interfaces in UI components.
   - Adjust hook deps when safe (or add explicit comments if intentional).
3) **Targeted cleanups**
   - Triage larger `any` blocks into small refactors.
   - Add minimal type aliases for data from Supabase functions.
   - Address `tailwind.config.ts` import style once we confirm the preferred lint config.

## Guardrails
- Do not refactor unrelated code; only address lint issues in touched files.
- Keep fixes small and grouped by rule to avoid regressions.
- Note any rule changes or suppressions explicitly in this doc.

## Success Criteria
- Lint output is stable and repeatable in CI.
- New changes do not add lint errors.
- High‑impact `any` usage is reduced in core user flows.
