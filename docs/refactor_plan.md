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

## Execution & Tracking
- **Work cadence:** ship one PR per phase (0–5). Keep legacy behavior available behind the feature flag until Phase 5 cleanup is complete.
- **Status breadcrumbs:** each phase includes a mini checklist (`[ ]`) to track readiness; tick them in follow-up PRs.
- **Prompt chunks:** use focused prompts per phase (e.g., “implement Phase 1 layout behind flag”) rather than a single mega prompt to reduce ambiguity and merge risk.
- **Who/when:** record DRI and ETA for each phase in `docs/roadmap.md` to keep accountability visible alongside feature flag rollout steps.

## Phase 0 — Groundwork (1–2 days)
[Status snapshot: mapping contract ✅; game shell audit ✅; action producer inventory ✅. Unified action shape + XP router wiring + DRI/ETA remain open. Completion ~50% based on 3/6 items landed; see Phase 0 resolution plan below.]
[ ] DRI + ETA logged in `docs/roadmap.md` (owner + rollback trigger included)
[ ] Unified action shape agreed and mapped
[x] Audit current game shell (`src/pages/GameHome.tsx`, `Navigation`, `SkillTree`): map which sections feed Main/Side/Upgrade cards and how XP/streaks are computed; documented below.
[x] Inventory action producers: upgrades (`lib/upgradeSystem.ts`), practices (`lib/practiceSystem.ts`), quests (`lib/mainQuest.ts`), and library items; field gaps vs. unified schema noted below.
[x] Legacy → unified mapping contract: see `docs/action_mapping.md` for canonical mapping matrix, defaults, validation rules, and aggregator test fixtures.
[ ] Align XP router: confirm XP per vector fields in `game_profiles` and `calculateQuestXp` can consume the unified action payload.

### Phase 0 resolution plan (to clear conflicts and close the phase)
- **Assign ownership & ETA:** log a named DRI plus a one-week ETA for Phase 0 in `docs/roadmap.md` so merge blockers tied to missing ownership can be cleared quickly.
- **Lock the unified action shape:** confirm the canonical schema (fields + enums) against the mapping matrix and propagate to aggregator fixture definitions to avoid future merge conflicts over field naming.
- **XP router alignment:** map the unified action payload to existing XP helpers so the completion handler can reuse `calculateQuestXp` bucketing and vector-specific `awardXp` updates (path → `xp_*` columns) without divergent logic.【F:src/pages/GameHome.tsx†L379-L424】【F:src/lib/xpSystem.ts†L29-L90】
- **Completion payload audit:** ensure every source’s payload carries the identifiers required by the current Supabase writes and toast flows in `handleQuestComplete`, keeping legacy streak/XP updates intact while the new pipeline lands.【F:src/pages/GameHome.tsx†L379-L424】
- **Merge-handling checklist:** when reconciling with main, preserve the unified schema keys and fallback ladders defined in `docs/action_mapping.md`, keep the sample fixtures intact unless a source schema changes, and carry forward any upstream XP/timing guardrails into the Phase 0 tests instead of dropping them.
### Phase 0 working notes (audit + inventories)

**Current game shell audit (GameHome + Navigation + SkillTree)**
- **Data loading & context:** `GameHome` fetches the player profile, QoL snapshot, ZoG snapshot, and upgrade catalog on mount; it parallelizes profile and uniqueness mastery upgrades, then computes player stats for main quest progression and auto-advancement. XP and streak updates are driven by `calculateQuestXp`/`calculateStreak` inside `handleQuestComplete`, which writes to Supabase and reloads profile data for freshness.【F:src/pages/GameHome.tsx†L285-L429】
- **Side quest (practice) surface:** The “Side Quest” card triggers an edge function (`suggest-next-quest`) with curated practice candidates filtered by duration/mode and QoL context. Fallback picks a random library practice when the function fails. Completion inserts into `quests` with XP awarded per duration.【F:src/pages/GameHome.tsx†L285-L377】【F:src/pages/GameHome.tsx†L386-L424】
- **Suggested upgrade surface:** The Suggested Upgrade card selects the first unlocked, incomplete upgrade from the uniqueness/mastery branch and routes CTAs (e.g., ZoG assessment, personality tests) via `handleUpgradeAction` navigation/open behavior. Unlock state is also visualized through `SkillTree` by mapping upgrade codes to node progress and prerequisite locks.【F:src/pages/GameHome.tsx†L215-L503】【F:src/pages/GameHome.tsx†L703-L724】
- **Character snapshot:** “Who I Am and Where I Am” shows the latest ZoG archetype/top talents and QoL domain grid, highlighting lowest domains to inform recommendations. QoL stages drive practice suggestions via `getSuggestedPractices`.【F:src/pages/GameHome.tsx†L208-L279】【F:src/pages/GameHome.tsx†L741-L805】

**Action producer inventory vs. unified schema**
- **Upgrades (`lib/upgradeSystem.ts`):** Catalog rows expose `code`, `path_slug`, `branch`, `xp_reward`, optional `prereqs` and `unlock_effects`. Completion is idempotent, awards XP via `awardXp`, and records player unlocks. Gaps: no QoL domain, no explicit duration/mode; vector inferred from `path_slug` with async-mode default for unified schema.【F:src/lib/upgradeSystem.ts†L13-L182】
- **Practices (`lib/practiceSystem.ts` + `modules/library/libraryContent.ts`):** Library items carry `primaryPath`/`primaryDomain`, duration minutes/labels, and intents. `markPracticeDone` delegates to a Supabase function that returns XP/level deltas; `getSuggestedPractices` filters by lowest QoL domain and shortest duration. Gaps: no explicit intensity/mode; why-recommended synthesized; prereqs absent.【F:src/lib/practiceSystem.ts†L7-L84】【F:src/modules/library/libraryContent.ts†L1-L115】
- **Quests (`lib/mainQuest.ts`):** Main quest stages encode domain, CTA route, and completion hints; progression gates on profile setup, practice count, upgrade count, streak, and real-world output. For unified actions, `domain` → vector mapping is clear; missing duration/intensity requires defaults; completion payload must include stage id plus gating counters for validation.【F:src/lib/mainQuest.ts†L1-L194】
- **Library items (modules):** Each item has `id`, `title`, `categoryId`, optional teacher, URL/youtubeId, duration, `primaryPath`/`secondaryPath`, and `primaryDomain`; can be normalized directly to unified actions with fallback vector from `primaryPath` and QoL from `primaryDomain` or vector inference. Intensities/modes need defaults per mapping matrix.【F:src/modules/library/libraryContent.ts†L22-L115】

## Phase 1 — UI Shell Swap (Daily Loop v2)
[ ] Layout renders behind `DAILY_LOOP_V2`
[ ] Legacy cards intact under flag-off
[ ] Placeholder recommendation flow working
1) **Create layout component** (`src/components/game/DailyLoopLayout.tsx`): sections for Me (profile snapshot + streak), My Life (QoL bottlenecks, recent wins), My Next Move (one primary action + rationale + quick actions), and Freedom Mode trigger.
2) **States & errors:** design loading/skeleton, empty state (no recommendation), and error fallback with retry; ensure My Next Move always has a deterministic placeholder.
3) **Wire into `GameHome`:** replace Main/Side/Upgrade rendering with the new layout while reusing data loaders. Keep legacy cards behind a `DAILY_LOOP_V2` feature flag.
4) **Minimal heuristic:** use current suggestion data to pick one action (QoL bottleneck > vector backlog > streak-preserving alternative) until unified pipeline lands; first 1–3 actions post-onboarding must be ≤3 minutes and low friction to confirm activation.
5) **Building mapping:** clarify how the layout maps to the “five buildings” metaphor—e.g., Me = Profile/Identity hub, My Life = Life Map/QoL observatory, My Next Move = Action deck; link the other two buildings (Marketplace, Matchmaking/Coop) via Freedom Mode pathways.

## Phase 2 — Unified Action Pipeline
[ ] Aggregator normalizes all sources
[ ] Rec engine returns primary + alternates
[ ] Completion handler updates XP/streaks
1) **Action aggregator** (`src/lib/actionEngine.ts`): normalize candidates from quests, practices, upgrades, and library into the unified shape; tag with vector, QoL mapping, effort, loop. Validate against the legacy → unified mapping matrix.
2) **Recommendation strategy:** implement Daily Loop logic across all five loops (not just transformation): QoL bottleneck first, then vector growth sequence step, then streak-preserving alternates. Return one primary + two alternates. Action frequency should scale 1%–ish upward with player level while respecting non-overwhelm.
3) **Completion handling:** single `completeAction` updates XP, streaks, and source-specific side effects (upgrade completion, practice done, main quest progression); emit toast and refresh recommendations.
4) **Fixtures & tests:** add unit tests for aggregation and recommendation ordering; snapshot the expected My Next Move payloads.

## Phase 3 — Vector Growth Sequences Integration
[ ] Sequence data ingested and versioned
[ ] Steps exposed via unified actions
[ ] Progress persisted and surfaced
1) **Content ingestion**: load authored sequences as structured data (`src/modules/vector-sequences/*.ts` or JSON) with `id`, `vector`, `stage`, `duration`, `prerequisites`, `tags`, `version`.
2) **Versioning & completeness:** allow optional `draft` flag; recommendations skip drafts and fall back to alternates when a sequence is incomplete.
3) **Map to actions:** expose each sequence step through the unified action schema so recommendations can pull the next eligible step per vector.
4) **Progress tracking:** persist per-vector step index in Supabase (new columns or companion table) and surface it in the Me section.

## Phase 4 — Onboarding & QoL Flow Polish
[ ] Onboarding writes all required fields
[ ] Celebrations show on completion/level-up
[ ] Freedom Mode logs override picks
1) **Onboarding refinements:** ensure Zone of Genius → QoL snapshot → portal entry writes required fields for the recommendation engine (vector affinities, QoL stages).
2) **Celebratory beats:** add lightweight animations or badges in the Me section after completing an action or leveling up.
3) **Freedom Mode:** implement a filtered library explorer that still tags selections with the unified action shape for tracking; log voluntary overrides.

## Phase 5 — Stabilization & Rollout
[ ] Telemetry & latency budgets met in staging
[ ] QA matrix passes on flag on/off
[ ] Legacy cards removed post-flag
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
