# The Improve Roast Prompt

*Template for `improve-artifact` edge function. One prompt, parametrized per `artifact_key`.*

**Model:** `google/gemini-2.5-flash` via Lovable AI Gateway (cost decision 2026-04-23 — ~60× cheaper than GPT-5.2; monotonic specificity invariant protects against lower reasoning ceiling).

---

## The paramount invariant

**Specificity is monotonic.** Every accepted Improve iteration MUST raise the specificity score. If the model cannot produce a version with `specificity_delta ≥ 0`, it returns `diminishing_returns: true` and does NOT propose a new version.

Versioning mirrors this: every accepted improvement creates a new row in `user_business_artifacts`. Previous versions are never overwritten, never deleted. The founder's lineage of iterations is the memory of how the business sharpened itself.

---

## Function signature

```ts
// supabase/functions/improve-artifact/index.ts
POST /functions/v1/improve-artifact

Body: {
  artifact_key: ArtifactKey,
  current_content: Json,
  current_specificity: number,     // 0–10 float
  sibling_artifacts: Record<ArtifactKey, { content: Json, specificity: number }>,
  root_context: {
    zog_snapshot: ZogSnapshot,
    excalibur_data?: ExcaliburData
  },
  previous_versions: Json[]        // up to 3 prior versions (for "already tried" context)
}

Returns: ImproveResult (shape below) | { error: 'insufficient_credit' | 'model_error' }
```

---

## System prompt

> You are applying the 27-perspective holonic roast to a unique business artifact.
> Your goal: identify what the current version is missing, and produce an improved version that holds MORE specificity.
>
> Specificity means: the version reads less like something generic and more like something only THIS founder, for THIS tribe, at THIS moment, could have said. Specificity is distinguishability from noise.
>
> You are NOT a copywriter. You are a holonic seeing instrument. The founder has already done the seeing — you check the architecture, surface blind spots, sharpen the signal.
>
> You have ONE job: produce a version with higher specificity. If you cannot, admit it cleanly.

---

## User prompt template

```
ARTIFACT: {artifact_key}

SPECIFICITY CRITERIA FOR THIS ARTIFACT:
{specificity_criteria_for_this_artifact_key}
[Injected from artifact_prompts_spec.md → specificity_bars.json]

CURRENT CONTENT (version {n}, specificity {current_specificity}):
{current_content_json}

SIBLING LOCKED ARTIFACTS (context — preserve coherence across canvas):
{sibling_artifacts_summary}

ROOT CONTEXT:
- Top talent: {zog_top_talent}
- Archetype: {zog_archetype}
- Core pattern: {zog_core_pattern}
{if excalibur_data: - Legacy business identity: ...}

PREVIOUS VERSIONS (what was already tried — don't repeat):
{previous_versions_summary}

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

---

SPECIFICITY RULES:

1. New version MUST have specificity strictly greater than current ({current_specificity}).
   If you cannot produce such a version, return diminishing_returns: true.

2. Specificity rises by: adding distinguishing detail, removing generic phrasing,
   naming what only this founder / this tribe would say, tightening the photon of truth.

3. Specificity does NOT rise by: adding more words, hedging, adding caveats,
   or moving toward safer generic language.

4. Length is not specificity. Often the more specific version is shorter.

---

GUARDRAILS:
• Preserve Russian register if current_content is in Russian. Same for English.
• Never invent client names, testimonials, revenue numbers, or dates.
• If current_content has a `locked_phrasing` field, honor it verbatim and improve only the surrounding structure.
• Never weaken a phrase the founder already got to 9+ specificity on; build around it.

---

RETURN STRICT JSON:

{
  "roast_findings": [
    {
      "quadrant": "UL" | "UR" | "LL" | "LR" | "13" | "depth" | "27",
      "weakness": "<one sentence naming what's missing or weak>"
    }
    // 2–5 findings, not more. Each finding must map to a concrete change in improved_content.
  ],
  "improved_content": <same shape as current_content>,
  "what_changed": "<one sentence describing the delta from old to new>",
  "specificity_score": <float 0–10, must be > {current_specificity} OR set diminishing_returns: true>,
  "specificity_delta": <float, new minus current>,
  "crystallized_action": "<the ONE irreversible next action this artifact names>",
  "diminishing_returns": <boolean>
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
  improved_content: Json;       // same shape as current_content, per artifact_key
  what_changed: string;
  specificity_score: number;    // if diminishing_returns=true, may equal current
  specificity_delta: number;    // if diminishing_returns=true, may be 0 or <0
  crystallized_action: string;
  diminishing_returns: boolean;
};
```

---

## Acceptance semantics

**Accept path** (user clicks ✓ Accept in ImproveReviewScreen):
1. New row inserted into `user_business_artifacts`:
   ```
   user_id, artifact_key,
   content = improved_content,
   version = current + 1,
   specificity_score = specificity_score (new),
   parent_version_id = current row id,
   roast_findings (JSONB),
   what_changed,
   is_locked = false   // user must still click Lock & Continue
   ```
2. Log row in `artifact_improvements`:
   ```
   user_id, artifact_key,
   artifact_before_id, artifact_after_id,
   roast_findings, what_changed, crystallized_action,
   specificity_before, specificity_after, specificity_delta,
   accepted = true
   ```
3. `game_profiles.last_canvas_snapshot_id` touched.

**Reject path** (user clicks ✗ Reject):
1. No new version row.
2. Log row in `artifact_improvements` with `accepted = false` (still captured for learning what users reject).

**Diminishing returns path** (model self-reports `diminishing_returns: true`):
1. UI surfaces: *"Couldn't increase specificity this pass. This version may be at its current ceiling — try again later after surrounding artifacts sharpen."*
2. No review drawer opened. No DB write.
3. Optional: log to `artifact_improvements` with `accepted = false` and a `diminishing_returns_flag` for analytics.

---

## Error handling (Lovable AI Gateway)

| Error | Cause | Behavior |
|-------|-------|----------|
| 402 Payment Required | AI balance exhausted | Client toast: *"AI credit limit reached. Top up in Settings → Plans & Credits, then retry."* No DB write. No version. |
| Invalid JSON in response | Model drift | Retry once with stricter `response_format: { type: "json_object" }`. On second failure, surface generic error. |
| 5xx from gateway | Transient | Retry once. On second failure, surface. |
| Empty / identical `improved_content` | No-op | Treat as `diminishing_returns: true` regardless of what model claimed. |
| `specificity_delta < 0` but `diminishing_returns: false` | Model miscalculated | Override: force `diminishing_returns = true`. Don't propose version. |

---

## Cost envelope

Per call estimate (Gemini 2.5 Flash via Lovable AI Gateway):
- Input: ~3,000–5,000 tokens (roast protocol + current content + 3 siblings + root context + previous versions)
- Output: ~1,000–2,000 tokens (improved content + roast findings + metadata)
- Cost: **~$0.0003–$0.0008 per Improve call**

Typical founder pass (~50–70 calls across 18 artifacts) → **~$0.02–$0.06 per full Dossier.** Negligible even at small-scale traffic. Swap in `openai/gpt-5.2` for this one function if Flash's reasoning ceiling proves insufficient.

---

## First-holon test (Phase 5)

Sasha runs Improve on his own Myth artifact.
- Current (from `alexanders_unique_business.md`): *"There exists a venture so structurally yours that building it IS your personal development."*

Expected:
- 2–5 roast findings, each naming a concrete weakness.
- Improved version preserves the photon but sharpens one layer (attack / reframe / invitation).
- `specificity_delta > 0` or clean `diminishing_returns: true`.
- `crystallized_action` names a concrete move Sasha would make today.

**Test passes if:** after one Improve, Sasha reads the new version and says "yes, sharper" (or "no, the old was better — reject"). Test fails if: improvement is generic, findings are bureaucratic, or delta claimed but not felt.

If the first-holon test fails, the prompt needs tuning before any downstream artifact gets wired.
