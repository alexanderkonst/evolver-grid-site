# Incremental Refactor Plan for Daily Loop v2

## Goals
- Replace the Main/Side/Upgrade card flow with the Daily Loop v2 layout (Me / My Life / My Next Move) without a ground-up rewrite.
- Centralize action handling (enum, XP routing, completion tracking, recommendations) so future growth paths reuse one pipeline.
- Preserve existing Supabase data while preparing for new content (growth paths, unified actions, QoL-driven recommendations).

## Guiding Principles
- **Small, mergeable slices:** ship UI scaffolding and data adapters in short iterations to avoid long-lived branches.
- **Compatibility by default:** keep legacy structures available behind feature flags until the new loop is verified.
- **Single source of truth:** one action schema powering UI, XP, streaks, and recommendation logic; every action is tagged with
  its loop (profile | transformation | marketplace | matchmaking | coop) for cross-loop recommendations.
- **UX non-overwhelm contract:** always present one recommended next move with clear rationale and an escape hatch (Freedom Mode).
- **Test-first wiring:** snapshots/fixtures for action candidates and recommendation outcomes before integrating live data.
- **Ownership & rollback:** record DRIs, timelines, and rollback triggers so partial delivery has a safe path.

## Testing & Validation Expectations
- **Run what matches the change:**
  - Documentation-only edits: no runtime checks required; still skim for broken links/typos.
  - Type or logic changes: run `npm run lint` and `npm run build` locally; note current baseline lint failures (legacy `any` usage and React hook deps). Record the failing set in the PR and ensure new code does not add more.
  - Supabase migrations/integration work: run lint + build plus the migration verification queries in staging.
- **Feature-flag regression:** for any Daily Loop v2 code, manually verify `DAILY_LOOP_V2` on/off paths and snapshot recommendation fixtures before merging.
- **Artifacts for reviewers:** include command output (pass/fail) in PR notes; if lint fails due to known debt, call it out with counts so reviewers can assess blast radius.

## Execution & Tracking
- **Work cadence:** ship one PR per phase (0–5). Keep legacy behavior available behind the feature flag until Phase 5 cleanup is complete.
- **Status breadcrumbs:** each phase includes a mini checklist (`[ ]`) to track readiness; tick them in follow-up PRs.
- **Prompt chunks:** use focused prompts per phase (e.g., “implement Phase 1 layout behind flag”) rather than a single mega prompt to reduce ambiguity and merge risk.
- **Who/when:** record DRI and ETA for each phase in `docs/roadmap.md` to keep accountability visible alongside feature flag rollout steps.

### Status check (after Daily Loop layout PR)
- Phase 0: unified action shape and legacy mapping shipped; audit snapshot captured. DRI/ETA and rollback trigger now in `docs/roadmap.md`; XP router alignment reviewed — XP columns use `xp_uniqueness`, so unified actions must map `genius` → `uniqueness` before awarding XP.
- Phase 1: Daily Loop layout renders behind `DAILY_LOOP_V2`; legacy cards remain available when the flag is off; placeholder recommendation flow hooked to existing suggestions. My Next Move loading skeleton/error state, CTA handling, and Freedom Mode tagging are wired.
- Phase 2+: started. Legacy aggregation helper + fixtures added, and `completeAction` introduced; rec strategy and tests still pending.

## Phase 0 — Groundwork (1–2 days)
[x] DRI + ETA logged in `docs/roadmap.md`
[x] Unified action shape agreed and mapped
[x] Legacy → unified matrix drafted
[x] Current shell and data flows audited
1) **Audit current game shell** (`src/pages/GameHome.tsx`, `Navigation`, `SkillTree`): map which sections feed Main/Side/Upgrade cards and how XP/streaks are computed; document in the PR.
2) **Inventory action producers:** upgrades (`lib/upgradeSystem.ts`), practices (`lib/practiceSystem.ts`), quests (`lib/mainQuest.ts`), and library items; note field gaps vs. unified schema.
3) **Define unified action shape** (new `src/types/actions.ts`): `id`, `type`, `loop`, `title`, `growthPath`, `qol_domain`, `duration`, `intensity/mode`, `why_recommended`, `source`, `completion_payload`, `prereq/locks`. Ship this early so tests/fixtures can import a single contract.
4) **Align XP router:** confirm XP per growth path fields in `game_profiles` and `calculateQuestXp` can consume the unified action payload.
5) **Owner & rollout doc:** assign DRI, deadlines, and rollback trigger in `docs/roadmap.md` (add small section).
6) **Legacy → unified mapping contract:** maintain `docs/action_mapping.md` with a matrix for quests, practices, upgrades, library items, and growth paths. Capture defaults (growthPath/QoL fallbacks, duration buckets, missing data handling) and sample payloads per source for fixtures.

### Phase 0 Audit Snapshot (current build)
- **Screen structure:** `GameHome` renders Navigation + guest banner, then three legacy surfaces: Main Quest (progress + complete CTA), Side Quest picker (duration/mode selects → Supabase `suggest-next-quest` edge function → practice suggestion + alternatives), and Upgrades/Practices cards (mastery path + library suggestions). SkillTree visualization is keyed to upgrade codes for the Showing Up tree.
- **Data sources:**
  - Profile, XP, streak, QoL/ZoG snapshots loaded from `game_profiles`, `qol_snapshots`, `zog_snapshots`. Streaks use `calculateStreak`; XP from quests uses `calculateQuestXp` and updates `game_profiles` totals and quest row in `quests` table.
  - Upgrades: pulled from Supabase `upgradeSystem` (branch `mastery_of_genius`) with fallback hardcoded list; completion tracked via `getPlayerUpgrades` and `completeUpgrade` (auto-completes ZoG if snapshot exists).
  - Main Quest: progress computed via `buildPlayerStats` and `advanceMainQuestIfEligible`; stage copy comes from `getMainQuestCopy` with stage calculations (`computeNextMainQuestStage`, `isStageComplete`).
  - Practices: `getSuggestedPractices` maps QoL snapshot to library items (`LIBRARY_ITEMS`); `markPracticeDone` posts completions.
  - Side Quest picker: uses `LIBRARY_ITEMS` filtered by duration/mode, then Supabase function `suggest-next-quest`; fallback picks random library item.
- **Gaps vs. unified action shape:** Quest/practice/upgrade surfaces don’t expose `loop`, `growth path`, or QoL tags; durations are numeric minutes; rationale for recommendations is free text. Side quest suggestions and practice completions record `practice_type` strings but no growth path/QoL alignment. Completion paths for quests/practices/upgrades diverge (different tables and toasts), so aggregation will need adapters before the unified pipeline lands.

## Phase 1 — UI Shell Swap (Daily Loop v2)
[x] Layout renders behind `DAILY_LOOP_V2`
[x] Legacy cards intact under flag-off
[x] Placeholder recommendation flow working
1) **Create layout component** (`src/components/game/DailyLoopLayout.tsx`): sections for Me (profile snapshot + streak), My Life (QoL bottlenecks, recent wins), My Next Move (one primary action + rationale + quick actions), and Freedom Mode trigger.
2) **States & errors:** design loading/skeleton, empty state (no recommendation), and error fallback with retry; ensure My Next Move always has a deterministic placeholder.
3) **Wire into `GameHome`:** replace Main/Side/Upgrade rendering with the new layout while reusing data loaders. Keep legacy cards behind a `DAILY_LOOP_V2` feature flag.
4) **Minimal heuristic:** use current suggestion data to pick one action (QoL bottleneck > growth path backlog > streak-preserving alternative) until unified pipeline lands; first 1–3 actions post-onboarding must be ≤3 minutes and low friction to confirm activation.
5) **Building mapping:** clarify how the layout maps to the “five buildings” metaphor—e.g., Me = Profile/Identity hub, My Life = Life Map/QoL observatory, My Next Move = Action deck; link the other two buildings (Marketplace, Matchmaking/Coop) via Freedom Mode pathways.

## Phase 2 — Unified Action Pipeline
[x] Aggregator normalizes all sources
[x] Rec engine returns primary + alternates
[x] Completion handler updates XP/streaks
1) **Action aggregator** (`src/lib/actionEngine.ts`): normalize candidates from quests, practices, upgrades, and library into the unified shape; tag with growthPath, QoL mapping, effort, loop. Validate against the legacy → unified mapping matrix.
2) **Recommendation strategy:** implement Daily Loop logic across all five loops (not just transformation): QoL bottleneck first, then growth path sequence step, then streak-preserving alternates. Return one primary + two alternates. Action frequency should scale 1%–ish upward with player level while respecting non-overwhelm.
3) **Completion handling:** single `completeAction` updates XP, streaks, and source-specific side effects (upgrade completion, practice done, main quest progression); emit toast and refresh recommendations.
4) **Fixtures & tests:** add unit tests for aggregation and recommendation ordering; snapshot the expected My Next Move payloads.

**Phase 2 kickoff notes:** Added legacy action aggregation helper + fixtures, introduced `completeAction` with quest/practice/upgrade wiring plus generic XP fallback, added completion + selection event logging, and added a Vitest runner with initial tests. Remaining: full source coverage and rec strategy across loops beyond legacy inputs.

## Phase 3 — Growth Path Sequences Integration
[x] Sequence data ingested and versioned
[x] Steps exposed via unified actions
[x] Progress persisted and surfaced
1) **Content ingestion**: load authored sequences as structured data (`src/modules/growth-paths/*.ts` or JSON) with `id`, `growthPath`, `stage`, `duration`, `prerequisites`, `tags`, `version`.
2) **Versioning & completeness:** allow optional `draft` flag; recommendations skip drafts and fall back to alternates when a sequence is incomplete.
3) **Map to actions:** expose each sequence step through the unified action schema so recommendations can pull the next eligible step per growth path.
4) **Progress tracking:** persist per-growth path step index in Supabase (new columns or companion table) and surface it in the Me section.

**Phase 3 kickoff notes:** Added a minimal growth path steps scaffold in `src/modules/growth-paths/index.ts`, mapped it to unified actions, introduced a progress-based selector, and added a progress updater on completion.

## Phase 4 — Onboarding & QoL Flow Polish
[x] Onboarding writes all required fields
[x] Celebrations show on completion/level-up
[x] Freedom Mode logs override picks
1) **Onboarding refinements:** ensure Zone of Genius → QoL snapshot → portal entry writes required fields for the recommendation engine (growth path affinities, QoL stages).
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
- **Supabase migrations:** add tables/columns for growth path progress and action logs; include reversible migrations and backfill scripts. Proposed tables:
  - `growth_path_progress` (`profile_id` uuid FK, `growth_path` text, `step_index` int, `version` text, `draft_skipped_at` timestamptz, PK: `profile_id`+`growth_path`).
  - `action_events` (`action_id` text, `source` text, `loop` text, `growth_path` text, `qol_domain` text, `selected_at` timestamptz, `completed_at` timestamptz, `duration` int, `mode` text, `profile_id` uuid FK).
  - Provide rollback SQL (drop columns/tables) and backfill script to seed `growth_path_progress` from any existing progress signals.
  - Verification queries: row counts pre/post, null checks on required columns, sample consistency checks for a few profiles.
- **Feature-flag rollout:** default off in staging, on for internal testers, then progressive % rollout if metrics are good.
- **Analytics hooks:** instrument My Next Move render, accept/decline, completion, and Freedom Mode picks.

## Success Criteria
- Players see one clear next move with rationale; legacy cards are gone without breaking XP/streak accounting.
- All action sources route through one completion path and update XP per growth path consistently.
- Growth paths drive at least one recommendation per session and expose visible progress in the UI.
- Migration is reversible, and telemetry confirms improved completion/retention vs. legacy flow.
