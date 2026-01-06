# Unified Action Mapping Matrix

This matrix documents how each current action producer maps into the unified action schema used by the action aggregator and Daily Loop v2. It captures field derivations, defaults, validation rules, and representative payloads to unblock aggregator fixtures/tests.

## Unified Action Schema (target)

| Field | Description | Validation |
| --- | --- | --- |
| `id` | Stable unique identifier combining source prefix + source id/code. | Required; string; must be unique across sources. |
| `type` | Action type enum (`quest`, `practice`, `upgrade`, `library_item`). | Required; one of the enum values. |
| `loop` | Loop tag (`profile`, `transformation`, `marketplace`, `matchmaking`, `coop`). | Required; defaults to `transformation` unless source is explicitly marketplace/coop. |
| `title` | User-facing title. | Required; non-empty string. |
| `vector` | Core growth vector (`body`, `mind`, `emotions`, `spirit`, `uniqueness`, etc.). | Required; fallback rules below. |
| `qol_domain` | QoL domain (`wealth`, `health`, `happiness`, `love_relationships`, `impact`, `growth`, `social_ties`, `home`). | Optional but preferred; default strategy below. |
| `duration` | Duration bucket (`micro` ≤5m, `short` 6–15m, `medium` 16–45m, `long` >45m). | Required; derive from numeric minutes or author tag. |
| `intensity/mode` | Effort or mode hint (e.g., `low`, `medium`, `high`, `async`, `sync`, `flow`, `research`). | Optional; default `low` for practices/library if missing; `flow` for quests; `async` for upgrades. |
| `why_recommended` | Rationale string or bullet list used in My Next Move. | Required at recommendation-time; aggregator may synthesize if missing. |
| `source` | Source system identifier (`upgradeSystem`, `practiceSystem`, `mainQuest`, `libraryItem`). | Required for telemetry and completion routing. |
| `completion_payload` | Source-specific payload for completion handler (ids, CTA routes, XP). | Required for actionable items. |
| `prereq/locks` | Prerequisite ids/codes or lock conditions; include hints. | Optional; empty array when none. |

## Defaulting Rules & Missing Data Handling

- **Vector fallback order:** explicit `path_slug`/`primaryPath` → `secondaryPath` → `profile` vector affinity → `"general"` sentinel.
- **QoL domain fallback:** explicit `primaryDomain` → inferred from vector (`body` → `health`, `mind` → `growth`, `emotions` → `happiness`, `spirit` → `growth`, `uniqueness` → `impact`). Mark as `null` if inference impossible.
- **Duration bucket:** use minutes when available; otherwise parse labels (`5 min` → `micro`, `15 min` → `short`, `45+` → `medium`, `90+` → `long`). When no signal, default to `short` and flag `needs_duration_review` in validation.
- **Intensity/mode defaults:**
  - Practices & library: `low` unless explicit `activation`/`challenge` tag sets `medium`; `high` only when author marks.
  - Quests: `flow` to encourage narrative; elevate to `medium` if XP > 50.
  - Upgrades: `async` to reflect background/account linking work; raise to `medium` if unlocks have multiple prereqs.
- **Why recommended:** aggregator synthesizes from context (e.g., "Supports current vector: body" or "Maintains streak"); mark as `auto_generated` in payload when not author-provided.
- **Locks/prereqs:** always normalize to `{ type: "upgrade"|"quest"|"practice", id/code, hint? }[]`. When source lacks prereq data, emit empty array and `lock_state: "unlocked"`.
- **Validation:** reject actions missing `id`, `type`, `title`, or `duration`. Soft-warn (but keep) when `qol_domain` or `intensity/mode` is missing—aggregator will auto-fill. Deduplicate by `id` and prefer the most specific `vector` when merging duplicates.

## Mapping Matrix by Source

| Source | Field Notes |
| --- | --- |
| `upgradeSystem.ts` | `id=upgrade:{code}`; `type="upgrade"`; `loop=transformation`; `title` from `short_label`/`title`; `vector` from `path_slug`; `qol_domain` inferred from vector; `duration=short` unless `unlock_effects` indicates multi-step (then `medium`); `intensity/mode=async` (or `medium` if `prereqs` length > 2); `why_recommended` from unlock hint or synthesized; `completion_payload` includes `{ upgradeCode, xp_reward, path_slug }`; `prereq/locks` from `prereqs` with `unlock_hint`. |
| `practiceSystem.ts` | `id=practice:{id}` from library item; `type="practice"`; `loop=transformation`; `title` from practice/library entry; `vector` from `primaryPath` → `secondaryPath`; `qol_domain` from `primaryDomain`; `duration` bucketed from `durationMinutes`/`durationLabel`; `intensity/mode` defaults to `low` unless intents include `activation` (`medium`); `why_recommended` from advisor prompt response or "Quick win for {vector}" fallback; `completion_payload` includes `{ practiceId, librarySlug?, xp_reward }`; `prereq/locks` usually empty. |
| `mainQuest.ts` | `id=quest:{id}`; `type="quest"`; `loop=transformation`; `title` from quest; `vector` from quest `path`; `qol_domain` inferred via vector; `duration` uses quest `effort` minutes if present else `medium`; `intensity/mode=flow` (raise to `medium` if quest XP > 50); `why_recommended` from quest narrative/objective; `completion_payload` carries `{ questId, ctaRoute?, xp_reward }`; `prereq/locks` from `requires` fields. |
| Library items (`modules/library/libraryContent.ts`) | `id=library:{id}`; `type="library_item"`; `loop=transformation`; `title` from item; `vector` from `primaryPath` → `secondaryPath`; `qol_domain` from `primaryDomain` or vector inference; `duration` bucketed from `durationMinutes`/labels; `intensity/mode` `low` unless intents include `activation` (`medium`); `why_recommended` synthesized from match reason (e.g., QoL bottleneck, intent match); `completion_payload` includes `{ libraryId, url, youtubeId }`; `prereq/locks` empty. |

## Handling Missing or Ambiguous Data

- **Ambiguous vector:** if multiple vectors are equally likely, prefer the player's weakest QoL domain mapping; mark `vector_confidence: "low"` for tests.
- **Missing duration:** default to `short` and add `validationWarnings: ["duration_missing"]` so aggregator snapshots surface the gap.
- **Unknown QoL domain:** allow `null` but record `qol_inferred: false` to avoid downstream filtering errors.
- **Conflicting prereqs:** if duplicates or circular prereqs are detected, drop the prereq list and set `lock_state: "needs_review"` to avoid blocking recommendations.

## Sample Aggregator Payloads

These samples should be used as fixtures for action aggregator tests to confirm normalization and defaulting rules.

```jsonc
// Upgrade from upgradeSystem
{
  "id": "upgrade:fb-4",
  "type": "upgrade",
  "loop": "transformation",
  "title": "Complete First Practice",
  "vector": "body",
  "qol_domain": "health",
  "duration": "short",
  "intensity": "async",
  "why_recommended": "Unlocks practice recommendations and first XP gain",
  "source": "upgradeSystem",
  "completion_payload": { "upgradeCode": "fb-4", "xp_reward": 25, "path_slug": "body" },
  "prereq": []
}

// Practice from practiceSystem (library-backed)
{
  "id": "practice:use-breath-relax-energize",
  "type": "practice",
  "loop": "transformation",
  "title": "Use Breath to Relax and Energize",
  "vector": "body",
  "qol_domain": "health",
  "duration": "micro",
  "intensity": "low",
  "why_recommended": "Quick win to reduce stress for today's QoL bottleneck",
  "source": "practiceSystem",
  "completion_payload": { "practiceId": "use-breath-relax-energize", "xp_reward": 10 },
  "prereq": []
}

// Main quest step from mainQuest
{
  "id": "quest:q1-step1",
  "type": "quest",
  "loop": "transformation",
  "title": "Complete your first practice from the library",
  "vector": "body",
  "qol_domain": "health",
  "duration": "medium",
  "intensity": "flow",
  "why_recommended": "Progresses onboarding questline and unlocks streak tracking",
  "source": "mainQuest",
  "completion_payload": { "questId": "q1-step1", "ctaRoute": "/library", "xp_reward": 50 },
  "prereq": []
}

// Library item direct pick
{
  "id": "library:feel-high-naturally",
  "type": "library_item",
  "loop": "transformation",
  "title": "Feel High Naturally",
  "vector": "body",
  "qol_domain": "happiness",
  "duration": "micro",
  "intensity": "medium",
  "why_recommended": "Matches your selected intent: activation",
  "source": "libraryItem",
  "completion_payload": { "libraryId": "feel-high-naturally", "url": "https://www.youtube.com/watch?v=70obRpYkeFc" },
  "prereq": []
}
```

## Usage Notes for Tests

- Aggregator fixtures should include both authored and synthesized `why_recommended` values to validate fallback messaging.
- Validation tests should assert hard failures when `id`, `type`, `title`, or `duration` are missing, and soft warnings when `qol_domain` or `intensity` are inferred.
- Snapshot tests should confirm vector/QoL inference from `path_slug` and `primaryPath` and duration bucketing edge cases (e.g., `5 min` → `micro`, `16` → `medium`).
