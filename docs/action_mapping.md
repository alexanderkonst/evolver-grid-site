# Legacy → Unified Action Mapping

This matrix shows how each action producer fills the unified action shape defined in `src/types/actions.ts`. Defaults are applied when legacy data is missing so the recommendation engine can run deterministically.

## Field Defaults
- **duration**: `xs` when time is explicitly ≤3 minutes, `sm` for 3–10 minutes, `md` for 10–25 minutes, `lg` otherwise.
- **loop**: set per source (below); never left undefined.
- **growthPath**: required for transformation-loop items; fallback to `"genius"` until authored data is complete.
- **qolDomain**: optional; map when the source provides it, otherwise omit.
- **intensity/mode**: infer from source flags where present; otherwise leave undefined.
- **whyRecommended**: aggregator sets the rationale (QoL bottleneck, sequence progression, streak preservation).
- **locks/prerequisites**: populate when the source has dependencies; otherwise empty arrays.

## Source Matrix
| Source file | Loop | Type | ID strategy | Title/Description | Growth path | QoL | Duration | Completion payload | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `lib/mainQuest.ts` | transformation | `"quest"` | `quest:${id}` | `name`/`description` | required; fallback `"genius"` | none | map `estimatedDuration` to bucket | `sourceId` = quest id; `xp` from existing quest XP | prerequisites become `prerequisites`; use empty array if absent |
| `lib/practiceSystem.ts` | transformation | `"practice"` | `practice:${id}` | `name`/`description` | required; fallback `"genius"` | none | map `duration` to bucket | `sourceId` = practice id; `xp` from practice config | `locks` capture any gating flags |
| `lib/upgradeSystem.ts` | transformation | `"upgrade"` | `upgrade:${id}` | `title`/`description` | required; fallback `"genius"` | none | use `timeEstimate` buckets | `sourceId` = upgrade code; `xp` from upgrade | prerequisites from upgrade dependencies |
| Library items (TBD location) | marketplace | `"library_item"` | `library:${id}` | `title`/`summary` | optional | optional | bucket from `duration` if present | `sourceId` = library id | mode/intensity left undefined unless provided |
| Growth paths (`src/modules/growth-paths/*.ts`) | transformation | `"growth_path_step"` | `sequence:${growthPath}:${step}` | `title`/`description` | required | optional | bucket from step duration | `sourceId` = step id; `xp` from authored step | mark `draft` steps via `locks` to skip in recs |
| Onboarding celebrations (`src/pages/GameHome.tsx` or helper) | profile | `"celebration"` | `celebration:${slug}` | short title/message | optional | optional | `xs` | minimal payload; `sourceId` = slug | used for level-up or streak beats |

## Sample Payloads

```ts
// Quest
{
  id: "quest:starter-path",
  type: "quest",
  loop: "transformation",
  title: "Starter Path",
  growthPath: "genius",
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
  growthPath: "spirit",
  duration: "xs",
  source: "lib/practiceSystem.ts",
  completionPayload: { xp: 10, sourceId: "micro-breath", growthPath: "spirit" }
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

// Growth path step
{
  id: "sequence:genius:step-1",
  type: "growth_path_step",
  loop: "transformation",
  title: "Name your genius edge",
  growthPath: "genius",
  duration: "sm",
  source: "src/modules/growth-paths/genius.ts",
  completionPayload: { xp: 25, growthPath: "genius", sourceId: "step-1" }
}
```

## Validation Checklist
- [ ] All sources emit a `loop` value and normalized IDs.
- [ ] Duration bucketing produces `xs/sm/md/lg` with no `undefined` values.
- [ ] Transformation-loop actions always set `growthPath`; fallback used only temporarily.
- [ ] Recommendation fixtures include one sample from each source.
- [ ] Mapping stays in sync when new action sources are added.
