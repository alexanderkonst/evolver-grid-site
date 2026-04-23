# The Improve Roast Prompt

*Template for `improve-artifact` edge function. One prompt, parametrized per `artifact_key`. Model: Gemini 2.5 Flash (consistent with v1.0).*

---

## Function signature

```ts
// supabase/functions/improve-artifact/index.ts
POST /functions/v1/improve-artifact
Body: {
  artifact_key: ArtifactKey,
  current_content: Json,
  sibling_artifacts: Record<ArtifactKey, Json>,  // other locked artifacts
  root_context: {
    zog_snapshot: ZogSnapshot,
    excalibur_data?: ExcaliburData
  },
  previous_versions: Json[],  // up to 3 prior versions
  user_note?: string  // optional, free text
}
Returns: ImproveResult (shape below)
```

---

## System prompt

> You are applying the 27-perspective holonic roast to a unique business artifact.
> Your goal: identify what the current version is missing, and produce an improved version that holds precision.
>
> You are NOT a copywriter. You are a holonic seeing instrument. The founder has already done the seeing — you are checking the architecture and surfacing blind spots.

---

## User prompt template

```
ARTIFACT: {artifact_key}

ARTIFACT-SPECIFIC PRECISION BAR:
{precision_definition_for_this_artifact_key}
[Injected from artifact_prompts_spec.md]

CURRENT CONTENT (v{n}, precision {current_score}):
{current_content_json}

SIBLING LOCKED ARTIFACTS (context — preserve coherence):
{sibling_artifacts_summary}

ROOT CONTEXT:
- Top talent: {zog_top_talent}
- Archetype: {zog_archetype}
- Pattern: {zog_core_pattern}
{if excalibur_data: - Legacy business identity: ...}

PREVIOUS VERSIONS (what was already tried):
{previous_versions_summary}

{if user_note: USER NOTE — honor this in the improvement: "{user_note}"}

---

ROAST PROTOCOL — apply ALL checks internally before producing output:

FOUR QUADRANTS (UL/UR/LL/LR Essence):
• UL-Essence: Does this feel true from the inside? (soul test)
• UR-Essence: Does this work mechanically? (engineering test)
• LL-Essence: Would the tribe recognize themselves in this? (resonance test)
• LR-Essence: Does this serve the system at scale? (architecture test)

13TH PERSPECTIVE:
• Does the CENTER hold? Does the whole see something the parts missed?

DEPTH CHECK:
• Was Essence (what IS this) addressed before Implications (what to change)?
• Was Significance (why it matters) named before suggesting changes?
• Are all 4 quadrants balanced — not just UR/LR mechanics?

27TH CRYSTALLIZATION:
• Is the ONE irreversible next action named that makes this land in reality?
• Is it specific enough to execute immediately?
• Does it feel inevitable — like all 26 perspectives were pointing there?

GUARDRAILS:
• Preserve Russian register if current_content is in Russian. Same for English.
• Never invent client names, testimonials, revenue numbers, or dates.
• If current_content has a `locked_phrasing` field, honor it verbatim and improve only the surrounding structure.
• If you cannot improve beyond diminishing returns (precision_delta would be < 0.2), say so and recommend "this artifact may be done."

---

RETURN STRICT JSON:

{
  "roast_findings": [
    {
      "quadrant": "UL" | "UR" | "LL" | "LR" | "13" | "depth" | "27",
      "weakness": "<one sentence naming what's missing or weak>"
    }
    // 2–5 findings, not more
  ],
  "improved_content": <same shape as current_content>,
  "what_changed": "<one sentence describing the delta>",
  "precision_score": <float 0–10>,
  "precision_delta": <float, new minus old>,
  "crystallized_action": "<the ONE irreversible next action this artifact names for the founder>",
  "diminishing_returns": <boolean, true if recommend stop improving>
}
```

---

## Output shape (TypeScript)

```ts
type ImproveResult = {
  roast_findings: Array<{
    quadrant: 'UL' | 'UR' | 'LL' | 'LR' | '13' | 'depth' | '27';
    weakness: string;
  }>;
  improved_content: Json;  // same shape as current_content, per artifact_key
  what_changed: string;
  precision_score: number;
  precision_delta: number;
  crystallized_action: string;
  diminishing_returns: boolean;
};
```

---

## Storage on Accept

When user clicks Accept in ImproveReviewScreen:

1. New row inserted into `user_business_artifacts`:
   ```
   user_id, artifact_key,
   content = improved_content,
   version = current + 1,
   precision_score = new,
   parent_version_id = current row id
   ```
2. Log row inserted into `artifact_improvements`:
   ```
   user_id, artifact_id_before, artifact_id_after,
   roast_findings (JSONB), what_changed,
   precision_before, precision_after, user_note
   ```
3. `game_profiles.last_canvas_snapshot_id` touched (activity).

---

## Storage on Reject

No database write. Client-side: improvement discarded. User can press Improve again with a different `user_note`.

---

## Edge cases

| Case | Behavior |
|------|----------|
| Gemini returns invalid JSON | Retry once with stricter instruction. If still invalid, surface toast: "Improvement failed, try again." No DB write. |
| Gemini returns identical content | Detect via hash. Show: "No change found — this artifact may be done." Don't count as new version. |
| `precision_delta` < 0 | Accept only if user explicitly overrides. Default: reject and surface "This version may be weaker — keep current?" |
| User presses Improve with precision already 9.8+ | Show confirmation: "This is already high-precision. Improve anyway?" |

---

## First-holon test (Phase 5)

Sasha runs Improve on his own Myth artifact (current: *"There exists a venture so structurally yours that building it IS your personal development"*). Expected behavior:
- Roast findings name at least one blind spot per quadrant.
- Improved version preserves the photon of truth.
- Precision delta > 0 (current is already strong; should be hard to improve).
- If no improvement possible, `diminishing_returns: true` surfaces cleanly.

If the first-holon test fails (improvement is worse, or roast findings are generic), the prompt needs tuning before we wire any downstream artifact.
