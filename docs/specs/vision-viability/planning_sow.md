# Vision ↔ Viability Upgrade: Planning SOW + DoD

> *Operationalizes Domain 93 (Vision ↔ Viability Balancing for Business Strategies). Adds the **viability** (crash-test) axis beside the existing **fidelity** (roast) axis in the platform's under-the-hood refinement. Dated June 5, 2026 (Day 94).*
>
> Links: [Domain 93](../../01-vision/phase_shift_technology_library.md) · [Roasting Protocol](../../05-reference/roasting_protocol.md)

---

## 1. The strategy in one paragraph

The platform already roasts generated artifacts for **fidelity** (truth to essence, distinguishability from noise). We add a **viability** pass that crash-tests strategy, offer, and positioning artifacts against real human behavior, using the three-question loop (state the exact ask, pre-mortem the failure, recover the surviving seed), and surfaces a **kinetic-calm** read (small enough to try, real enough to matter) plus the single buyer-native next move. Fidelity makes it true; viability makes it survivable; kinetic calm is the felt signal that both axes passed.

## 2. Scope

**In scope (strategy / offer / positioning surfaces):**
- `improve-artifact` (UBB Improve flow). Primary chokepoint.
- `generate-excalibur` (Unique Business / Offer at birth). Secondary.

**Out of scope (the category-error guard):**
- `generate-appleseed` / Zone of Genius essence. Fidelity only. Crash-testing someone's soul-signal against "will a stranger buy this" is the wrong axis on the wrong object.
- `assetMappingPrompt` (v5 deliberately removed roasting: "fields must earn their place").
- **Phase 2+ candidates, not now:** `deepen-icp`, `deepen-pain`, `deepen-tp`, `generate-landing`, `generate-blueprint`, `match-*`. Strategy-adjacent; added once Phase 1 proves the pattern.

## 3. Confirmed touch points (verified in code, not inferred)

| Surface | Entry / files | Roast today | Model | Where viability slots in |
|---------|---------------|-------------|-------|--------------------------|
| **UBB Improve** | `supabase/functions/improve-artifact/index.ts` (ROAST_PROTOCOL injected at userPrompt ~L161; returns `roast_findings` L46/170, `crystallized_action` L186). Prompts source: `supabase/functions/_shared/ubb-prompts.ts` (`ROAST_PROTOCOL`, `ARTIFACT_CONFIGS`, `MODEL`, `AI_GATEWAY_URL`) | 27-perspective holonic roast, fidelity/specificity | `google/gemini-2.5-flash` | Add `CRASH_TEST_PROTOCOL` after `ROAST_PROTOCOL`, OR a second independent pass on `improved_content`; extend output JSON with a `viability` block |
| **Excalibur** | client `src/modules/zone-of-genius/excaliburGenerator.ts` (`EXCALIBUR_ROASTING` L147, `buildExcaliburPrompt` L317, `invoke("generate-excalibur")` L359) → `supabase/functions/generate-excalibur/index.ts` (model call L282) | 3 internal rounds, already viability-leaning (purchase readiness, "this is mine, let's go") | `google/gemini-2.5-flash-lite` | Make the implicit crash-test explicit and structured; add `viability` + `kinetic_calm` to the returned `{ excalibur }` |

> **Cleanup note (not blocking):** `generate-excalibur/index.ts` carries a stale, shorter copy of `EXCALIBUR_ROASTING` (L133-145) that is currently dead, since the client passes the richer `prompt`. Consolidate to one source when we touch this file.

## 4. Category-error guard and per-artifact gating

Strategy-class artifacts get viability; essence-class do not. Implement as a `viability_applicable` flag per artifact in `ARTIFACT_CONFIGS` (`_shared/ubb-prompts.ts`).

- **Viability ON:** ICP, offer / Excalibur, positioning, channels and hook, pricing, value ladder, go-to-market.
- **Viability OFF:** myth, core essence / why, the Zone of Genius profile itself.

*(Exact `ARTIFACT_CONFIGS` keys to be read at implementation time; the gating principle above is the contract.)*

## 5. Design decision: embedded vs second pass

**Recommendation: a second, independent pass.** The method's integrity depends on the burner not being the lover. If the same call that generated and fell in love with the artifact also crash-tests it, it is marking its own homework, which violates Domain 93's honesty caveat. A second call with a fresh adversarial context (no generation history beyond the artifact plus the founder/tribe root context) is structurally more honest, and lets us read a real kinetic-calm score.

**Embedded** (one call, `CRASH_TEST_PROTOCOL` appended after the roast) is cheaper and lower-latency; acceptable as a v1 fallback. Build it behind a flag so the two can be compared.

> Decision needed from Sasha (see §12).

## 6. The viability instruction (the crash-test, adapted to artifacts)

Draft `CRASH_TEST_PROTOCOL` text:

> After the artifact is at its truest (post-roast), subject it to the viability crash-test. Do not refine for truth here; test for survival in the real world. Default to "it failed" unless the artifact earns otherwise.
>
> 1. **State the ask.** If a real, busy, slightly skeptical member of this tribe met this artifact, what exactly are they being asked to believe, want, or do? Say it in one plain sentence.
> 2. **Pre-mortem.** Assume that ask failed. It is six months later and no one acted. Why? Name the concrete reasons a tired, busy, defensive, under-resourced human did not move: trust, timing, buyer language, budget, inertia, proof, ego, follow-through.
> 3. **The ashes.** What survived? Which part still holds, and what is the smallest, most buyer-native version of the ask that a stranger could act on this week?

## 7. Output shape (kinetic calm, operationalized)

Add to the `improve-artifact` response (and the Excalibur response) on viability-applicable artifacts:

```json
"viability": {
  "applicable": true,
  "findings": [
    { "dimension": "trust|timing|language|cost|inertia|proof|action-friction",
      "risk": "<one sentence, plain buyer language, no framework vocab>" }
  ],
  "kinetic_calm": 0.0,
  "next_move": "<the one buyer-native action that makes it real this week>",
  "surviving_seed": "<optional: the most-exposed field rewritten to what survives>"
}
```

- `kinetic_calm` is a 0-10 read of "small enough to try AND real enough to matter." Low = manic (true but not survivable) or vague (survivable but not true).
- Output quarantine holds: framework vocabulary appears nowhere except the `dimension` enum, exactly like `roast_findings`.
- **Orthogonality:** viability does NOT alter `specificity_score` or the monotonic invariant. Two axes, two reads.

## 8. Phasing (each phase ends in real-world contact)

- **Phase 1, the chokepoint:** `_shared/ubb-prompts.ts` (`CRASH_TEST_PROTOCOL` + `viability_applicable` + output schema) and `improve-artifact/index.ts`.
- **Phase 2:** `generate-excalibur` (make the implicit crash-test explicit, consolidate the duplicate roast text).
- **Phase 3:** `deepen-icp` / `deepen-pain` / `deepen-tp` / `generate-landing` / `generate-blueprint`.

Every phase closes by taking **one real artifact to one real human.** This is the anti-Kool-Aid gate (Domain 93 caveat 1): the loop produces a sharper hypothesis, never validation. Simulated reality is not reality.

## 9. UI surfacing (light, editorial)

The user already sees "Roasting…" during improve. Add a quiet viability read: a kinetic-calm indicator and the one next move, in the same editorial register as the rest of the surface (back-office matches the front). Not a dashboard. Can be deferred to internal-only for v1 (see §12).

## 10. Risks (Domain 93's own caveats, plus product)

| Risk | Guard |
|------|-------|
| **Simulated ≠ real.** Viability is a hypothesis, not validation. | Each phase ends in one real human contact; the `next_move` field pushes toward shipping. |
| **Conservatism bias.** Viability could sand down moonshot artifacts. | It advises, never overwrites. `surviving_seed` is additive; `viability_applicable=OFF` for essence/vision artifacts. |
| **Honesty dependency.** A flattering crash-test is worse than none. | Second pass with fresh adversarial context; instruction defaults to "it failed." |
| **Cost / latency.** +1 Gemini-flash call per applicable improve. | Acceptable on flash; gated by `viability_applicable`. |
| **Specificity interaction.** | Viability is orthogonal; it never touches `specificity_score`. |

## 11. Definition of Done

> *Implementation note (June 5, 2026): the viability machinery lives in a new decoupled module `supabase/functions/_shared/viability.ts`, not inside `ubb-prompts.ts`. This keeps `generate-excalibur` from importing the large UBB prompts file, and keeps the category-error guard (`VIABILITY_EXEMPT`) legible in one place. The per-artifact policy is a single exempt-set + `isViabilityApplicable()`, not 19 scattered flags.*

| # | Done means | Evidence | Status |
|---|------------|----------|--------|
| 1 | `CRASH_TEST_PROTOCOL` authored (3-question loop, buyer-native, defaults to "it failed") | `_shared/viability.ts` | ✅ done |
| 2 | Category-error guard: essence-class exempt (`uniqueness`, `myth`, `specificity_matrix`); 16 strategy artifacts ON, via `isViabilityApplicable()` | `_shared/viability.ts` | ✅ done (classification pending Sasha confirm) |
| 3 | `improve-artifact` runs the second pass + returns `viability`; specificity invariant untouched | `improve-artifact/index.ts`; `deno check` clean | ✅ backend done; runtime pending deploy |
| 4 | `generate-excalibur` runs the second pass + returns `{ excalibur, viability }` | `generate-excalibur/index.ts`; `deno check` clean | ✅ backend done; runtime pending deploy |
| 5 | Design fork (second independent pass) implemented | `runViabilityPass` in `_shared/viability.ts` | ✅ done |
| 6 | Quiet kinetic-calm read + the one next move shown in UI (UBB Improve drawer + Excalibur reveal) | shared `ViabilityReadout` (dark/light); both variants screenshotted via throwaway route | ✅ done |
| 7 | Each shipped phase ends with one real artifact taken to one real human | the contact, logged | ⏳ pending (anti-Kool-Aid gate) |

## 12. Open decisions for Sasha

1. **Design fork:** second independent pass (recommended) or embedded single-call for v1?
2. **Kinetic-calm read:** surface to the user now, or keep internal-only for v1?
3. **Scope of first build:** Phase 1 only, or Phase 1 + 2 together?
