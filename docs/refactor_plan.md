# Incremental Refactor Plan for Daily Loop v2

## Goals
- Replace the Main/Side/Upgrade card flow with the Daily Loop v2 layout (Me / My Life / My Next Move) without a ground-up rewrite.
- Centralize action handling (enum, XP routing, completion tracking, recommendations) so future vector growth sequences reuse one pipeline.
- Preserve existing Supabase data while preparing for new content (vector sequences, unified actions, QoL-driven recommendations).

## Guiding Principles
- **Small, mergeable slices:** ship UI scaffolding and data adapters in short iterations to avoid long-lived branches.
- **Compatibility by default:** keep legacy structures available behind feature flags until the new loop is verified.
- **Single source of truth:** one action schema powering UI, XP, streaks, and recommendation logic; every action is tagged with
  its loop (profile | transformation | marketplace | matchmaking | coop) for cross-loop recommendations.
- **UX non-overwhelm contract:** always present one recommended next move with clear rationale and an escape hatch (Freedom Mode).
- **Test-first wiring:** snapshots/fixtures for action candidates and recommendation outcomes before integrating live data.
- **Ownership & rollback:** record DRIs, timelines, and rollback triggers so partial delivery has a safe path.

## Phase 0 — Groundwork (1–2 days)
1) **Audit current game shell** (`src/pages/GameHome.tsx`, `Navigation`, `SkillTree`): map which sections feed Main/Side/Upgrade cards and how XP/streaks are computed; document in the PR.
2) **Inventory action producers:** upgrades (`lib/upgradeSystem.ts`), practices (`lib/practiceSystem.ts`), quests (`lib/mainQuest.ts`), and library items; note field gaps vs. unified schema.
3) **Define unified action shape** (new `src/types/actions.ts`): `id`, `type`, `loop`, `title`, `vector`, `qol_domain`, `duration`, `intensity/mode`, `why_recommended`, `source`, `completion_payload`, `prereq/locks`.
4) **Align XP router:** confirm XP per vector fields in `game_profiles` and `calculateQuestXp` can consume the unified action payload.
5) **Owner & rollout doc:** assign DRI, deadlines, and rollback trigger in `docs/roadmap.md` (add small section).
6) **Legacy → unified mapping contract:** add a short matrix in this doc (or `docs/action_mapping.md`) showing how quests, practices, upgrades, and library items populate the unified shape (default vector/QoL, duration buckets, missing data handling) with one sample payload per source.

## Phase 1 — UI Shell Swap (Daily Loop v2)
1) **Create layout component** (`src/components/game/DailyLoopLayout.tsx`): sections for Me (profile snapshot + streak), My Life (QoL bottlenecks, recent wins), My Next Move (one primary action + rationale + quick actions), and Freedom Mode trigger.
2) **States & errors:** design loading/skeleton, empty state (no recommendation), and error fallback with retry; ensure My Next Move always has a deterministic placeholder.
3) **Wire into `GameHome`:** replace Main/Side/Upgrade rendering with the new layout while reusing data loaders. Keep legacy cards behind a `DAILY_LOOP_V2` feature flag.
4) **Minimal heuristic:** use current suggestion data to pick one action (QoL bottleneck > vector backlog > streak-preserving alternative) until unified pipeline lands; first 1–3 actions post-onboarding must be ≤3 minutes and low friction to confirm activation.
5) **Building mapping:** clarify how the layout maps to the “five buildings” metaphor—e.g., Me = Profile/Identity hub, My Life = Life Map/QoL observatory, My Next Move = Action deck; link the other two buildings (Marketplace, Matchmaking/Coop) via Freedom Mode pathways.

## Phase 2 — Unified Action Pipeline
1) **Action aggregator** (`src/lib/actionEngine.ts`): normalize candidates from quests, practices, upgrades, and library into the unified shape; tag with vector, QoL mapping, effort, loop. Validate against the legacy → unified mapping matrix.
2) **Recommendation strategy:** implement Daily Loop logic across all five loops (not just transformation): QoL bottleneck first, then vector growth sequence step, then streak-preserving alternates. Return one primary + two alternates. Action frequency should scale 1%–ish upward with player level while respecting non-overwhelm.
3) **Completion handling:** single `completeAction` updates XP, streaks, and source-specific side effects (upgrade completion, practice done, main quest progression); emit toast and refresh recommendations.
4) **Fixtures & tests:** add unit tests for aggregation and recommendation ordering; snapshot the expected My Next Move payloads.

## Phase 3 — Vector Growth Sequences Integration
1) **Content ingestion**: load authored sequences as structured data (`src/modules/vector-sequences/*.ts` or JSON) with `id`, `vector`, `stage`, `duration`, `prerequisites`, `tags`, `version`.
2) **Versioning & completeness:** allow optional `draft` flag; recommendations skip drafts and fall back to alternates when a sequence is incomplete.
3) **Map to actions:** expose each sequence step through the unified action schema so recommendations can pull the next eligible step per vector.
4) **Progress tracking:** persist per-vector step index in Supabase (new columns or companion table) and surface it in the Me section.

## Phase 4 — Onboarding & QoL Flow Polish
1) **Onboarding refinements:** ensure Zone of Genius → QoL snapshot → portal entry writes required fields for the recommendation engine (vector affinities, QoL stages).
2) **Celebratory beats:** add lightweight animations or badges in the Me section after completing an action or leveling up.
3) **Freedom Mode:** implement a filtered library explorer that still tags selections with the unified action shape for tracking; log voluntary overrides.

## Phase 5 — Stabilization & Rollout
1) **Telemetry & UX checks:** log selection vs. completion rates per action type and abandonment reasons to validate the non-overwhelm contract; set latency budgets (e.g., My Next Move render under 200ms from cached data, <500ms with fresh fetch; fallback shown within 1s on error).
2) **QA matrix:** run unit tests for aggregation/recommendation ordering, integration tests for `GameHome` with `DAILY_LOOP_V2` on/off, Supabase migrations against a staging snapshot, and analytics event validation. Gate rollout with minimal success thresholds (activation on first session, completion of first action within 24h).
3) **Clean-up:** remove legacy Main/Side/Upgrade cards and redundant helpers once the new loop is stable and metrics are healthy.
4) **Docs & playbook:** update `docs/roadmap.md` and `docs/game_architecture.md` with the new flow and action engine once shipped.

## Migration & Ops Plan
- **Supabase migrations:** add tables/columns for vector sequence progress and action logs; include reversible migrations and backfill scripts. Proposed tables:
  - `vector_progress` (`profile_id` uuid FK, `vector` text, `step_index` int, `version` text, `draft_skipped_at` timestamptz, PK: `profile_id`+`vector`).
  - `action_events` (`action_id` text, `source` text, `loop` text, `vector` text, `qol_domain` text, `selected_at` timestamptz, `completed_at` timestamptz, `duration` int, `mode` text, `profile_id` uuid FK).
  - Provide rollback SQL (drop columns/tables) and backfill script to seed `vector_progress` from any existing progress signals.
  - Verification queries: row counts pre/post, null checks on required columns, sample consistency checks for a few profiles.
- **Feature-flag rollout:** default off in staging, on for internal testers, then progressive % rollout if metrics are good.
- **Analytics hooks:** instrument My Next Move render, accept/decline, completion, and Freedom Mode picks.

## Success Criteria
- Players see one clear next move with rationale; legacy cards are gone without breaking XP/streak accounting.
- All action sources route through one completion path and update XP per vector consistently.
- Vector growth sequences drive at least one recommendation per session and expose visible progress in the UI.
- Migration is reversible, and telemetry confirms improved completion/retention vs. legacy flow.
