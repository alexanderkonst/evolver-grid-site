# Legacy → Unified Action Mapping

This matrix shows how each action producer fills the unified action shape defined in `src/types/actions.ts`. Defaults are applied when legacy data is missing so the recommendation engine can run deterministically.

## Field Defaults
- **duration**: `xs` when time is explicitly ≤3 minutes, `sm` for 3–10 minutes, `md` for 10–25 minutes, `lg` otherwise.
- **loop**: set per source (below); never left undefined.
- **vector**: required for transformation-loop items; fallback to `"uniqueness"` until authored data is complete.
- **qolDomain**: optional; map when the source provides it, otherwise omit.
- **intensity/mode**: infer from source flags where present; otherwise leave undefined.
- **whyRecommended**: aggregator sets the rationale (QoL bottleneck, sequence progression, streak preservation).
- **locks/prerequisites**: populate when the source has dependencies; otherwise empty arrays.

## Source Matrix
| Source file | Loop | Type | ID strategy | Title/Description | Vector | QoL | Duration | Completion payload | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `lib/mainQuest.ts` | transformation | `"quest"` | `quest:${id}` | `name`/`description` | required; fallback `"uniqueness"` | none | map `estimatedDuration` to bucket | `sourceId` = quest id; `xp` from existing quest XP | prerequisites become `prerequisites`; use empty array if absent |
| `lib/practiceSystem.ts` | transformation | `"practice"` | `practice:${id}` | `name`/`description` | required; fallback `"uniqueness"` | none | map `duration` to bucket | `sourceId` = practice id; `xp` from practice config | `locks` capture any gating flags |
| `lib/upgradeSystem.ts` | transformation | `"upgrade"` | `upgrade:${id}` | `title`/`description` | required; fallback `"uniqueness"` | none | use `timeEstimate` buckets | `sourceId` = upgrade id; `xp` from upgrade | prerequisites from upgrade dependencies |
| Library items (TBD location) | marketplace | `"library_item"` | `library:${id}` | `title`/`summary` | optional | optional | bucket from `duration` if present | `sourceId` = library id | mode/intensity left undefined unless provided |
| Vector sequences (`src/modules/vector-sequences/*.ts`) | transformation | `"vector_sequence_step"` | `sequence:${vector}:${step}` | `title`/`description` | required | optional | bucket from step duration | `sourceId` = step id; `xp` from authored step | mark `draft` steps via `locks` to skip in recs |
| Onboarding celebrations (`src/pages/GameHome.tsx` or helper) | profile | `"celebration"` | `celebration:${slug}` | short title/message | optional | optional | `xs` | minimal payload; `sourceId` = slug | used for level-up or streak beats |

## Sample Payloads

```ts
// Quest
{
  id: "quest:starter-path",
  type: "quest",
  loop: "transformation",
  title: "Starter Path",
  vector: "uniqueness",
  duration: "md",
  source: "lib/mainQuest.ts",
  completionPayload: { xp: 50, sourceId: "starter-path" },
  prerequisites: [],
  locks: []
}

// Practice (quick win)
{
  id: "practice:micro-breath",
  type: "practice",
  loop: "transformation",
  title: "2-minute Micro Breath",
  vector: "spirit",
  duration: "xs",
  source: "lib/practiceSystem.ts",
  completionPayload: { xp: 10, sourceId: "micro-breath" }
}

// Marketplace library item
{
  id: "library:journal-template",
  type: "library_item",
  loop: "marketplace",
  title: "Weekly Reflection Template",
  duration: "sm",
  source: "library",
  tags: ["reflection"],
  completionPayload: { sourceId: "journal-template" }
}

// Vector sequence step
{
  id: "sequence:uniqueness:step-1",
  type: "vector_sequence_step",
  loop: "transformation",
  title: "Name your genius edge",
  vector: "uniqueness",
  duration: "sm",
  source: "src/modules/vector-sequences/uniqueness.ts",
  completionPayload: { xp: 25, vector: "uniqueness", sourceId: "step-1" }
}
```

## Validation Checklist
- [ ] All sources emit a `loop` value and normalized IDs.
- [ ] Duration bucketing produces `xs/sm/md/lg` with no `undefined` values.
- [ ] Transformation-loop actions always set `vector`; fallback used only temporarily.
- [ ] Recommendation fixtures include one sample from each source.
- [ ] Mapping stays in sync when new action sources are added.
