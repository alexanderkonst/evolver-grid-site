# Prime Radiant Identity Canonical Lock

Date: 2026-07-04.

## Purpose

Phase 1 lock document for `artifact_identity_10x_sow.md`.

This file stops variant drift. It names the current canonical source state for the next identity-system phase and labels prior outputs as canonical, derivative, or study.

## Canonical Lock Decision

The identity work should proceed from this state:

| Role | Locked Asset | Status |
|---|---|---|
| Source geometry | `docs/assets/canonical-artifact/geometry/canonical-artifact.model.json` | Canonical source |
| Primary artifact still | `docs/assets/canonical-artifact/renders/canonical-artifact-three-v4-physical-desktop.png` | Canonical hero baseline |
| Mobile artifact still | `docs/assets/canonical-artifact/renders/canonical-artifact-three-v4-physical-mobile.png` | Canonical responsive baseline |
| Primary projection | `docs/assets/canonical-artifact/projections/primary-projection.svg` | Canonical projection source |
| Projection preview | `docs/assets/canonical-artifact/projections/primary-projection.svg.png` | Canonical projection preview |
| Motion behavior | `docs/assets/canonical-artifact/renders/canonical-artifact-motion-v3-implicit.mp4` | Canonical motion baseline |
| Review surface | `docs/assets/canonical-artifact/review_plate.html` | Canonical review surface v1 |

## Render Settings To Preserve

Canonical artifact render URL:

```text
/docs/assets/canonical-artifact/viewer.html?mode=anatomy&motion=implicit&quality=physical
```

Working interpretation:

- `mode=anatomy`: preserves sphere / octahedron / torus relationship grammar.
- `motion=implicit`: treats becoming as field behavior more than visible path-work.
- `quality=physical`: uses environment reflection, anisotropy, iridescence, transmission, and dispersion.

## Canonical Material Direction

The next render pass should sharpen the v4 material, not replace it.

Direction: colder and more impossible than champagne gold; still luminous alloy, not jewelry. Highlights should feel like coherent light caught in satin metal. The field should be perceived through refraction and interference, not a decorative bubble.

Forbidden drift:

- yellow gold,
- brass,
- crypto coin,
- wellness talisman,
- luxury jewelry,
- fantasy glow,
- lab-tech chrome.

## Canonical Motion Direction

Use Motion v3 Implicit as the baseline.

Rule: motion should breathe, circulate, and propagate. It should not rotate mechanically, pulse like a notification, explode, flare, sparkle, or add particles.

## Asset Classification

| Asset | Classification | Reason |
|---|---|---|
| `canonical-artifact.model.json` | Canonical source | Exact geometry and topology |
| `primary-projection.svg` | Canonical derivative | Projection generated from source model |
| `primary-projection.svg.png` | Canonical derivative preview | Raster preview of projection |
| `canonical-artifact-three-v4-physical-desktop.png` | Canonical hero baseline | Best current still for identity work |
| `canonical-artifact-three-v4-physical-mobile.png` | Canonical responsive baseline | Mobile framing proof |
| `canonical-artifact-motion-v3-implicit.mp4` | Canonical motion baseline | Best current motion behavior |
| `canonical-artifact-motion-v3-implicit-poster.png` | Canonical motion poster | Still from canonical motion |
| `review_plate.html` | Canonical review surface | Family-level presentation |
| `canonical-artifact-review-plate.png` | Canonical review capture | Shareable review still |
| `canonical-artifact-render.svg` | Study / audit asset | Exact SVG, useful for geometry audit |
| `canonical-artifact-render.svg.png` | Study / audit asset | Raster preview of exact SVG |
| `canonical-artifact-three-desktop.png` | Study | Early Three.js material pass |
| `canonical-artifact-three-mobile.png` | Study | Early mobile material pass |
| `canonical-artifact-three-v2-desktop.png` | Study | Material/shader refinement pass |
| `canonical-artifact-three-v2-mobile.png` | Study | Material/shader refinement pass |
| `canonical-artifact-three-v3-anatomy-desktop.png` | Study / anatomy reference | Useful for anatomy clarity, not hero baseline |
| `canonical-artifact-three-v3-anatomy-mobile.png` | Study / anatomy reference | Useful for anatomy clarity, not hero baseline |
| `canonical-artifact-motion-v1.mp4` | Study | First motion proof; too mechanical |
| `canonical-artifact-motion-v1-poster.png` | Study | Poster for first motion proof |
| `canonical-artifact-motion-v2-metabolic.mp4` | Study | Useful intermediate; paths too explicit |
| `canonical-artifact-motion-v2-metabolic-poster.png` | Study | Poster for metabolic intermediate |

Frame folders are build artifacts for audit and regeneration, not identity deliverables.

## Phase 1 DoD Status

| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | Canonical artifact state is selected | v4 physical desktop/mobile paths above | Pass |
| 2 | Privileged projection state is selected | `primary-projection.svg`; projection camera remains `[1, 1, 1]` from source generator | Pass |
| 3 | Material direction is locked for next pass | `Canonical Material Direction` section | Pass |
| 4 | Motion behavior is selected or scoped | Motion v3 Implicit selected | Pass |
| 5 | Non-canonical variants are explicitly labeled as studies | `Asset Classification` table | Pass |
| 6 | Open decisions are listed | `Open Decisions` section | Pass |

## Open Decisions

None block the next execution phase.

Later Sasha-level decisions:

- Whether the `[1, 1, 1]` projection is the final public viewpoint.
- Whether the artifact becomes the whole identity spine or remains a source symbol.
- Whether to fund an offline renderer / external motion pass.

## T1 Self-Check

What this revealed:

- The current best canonical state is not the earliest exact SVG or the most explanatory anatomy still. It is the v4 physical artifact backed by exact source geometry.
- The projection is usable as a canonical derivative, but it still needs small-size stress testing before becoming a final mark.
- Motion v3 Implicit is the right behavioral baseline because it moves away from literal torus drawing.

SOW revision needed:

- None yet. Phase 1 DoD is satisfied.

Next irreversible action:

- Build the identity stress-test sheet before investing in a stronger hero render, because small-size failures will reveal what the hero render must solve.
