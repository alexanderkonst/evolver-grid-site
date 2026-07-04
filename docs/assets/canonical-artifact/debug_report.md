# Canonical Artifact Debug Report

Date: 2026-07-03.

## Output Set

| Output | Path | Status |
|---|---|---|
| Procedural generator | `scripts/canonical-artifact/render.mjs` | Pass |
| Source model | `docs/assets/canonical-artifact/geometry/canonical-artifact.model.json` | Pass |
| Canonical still render | `docs/assets/canonical-artifact/renders/canonical-artifact-render.svg` | Pass |
| Canonical still preview | `docs/assets/canonical-artifact/renders/canonical-artifact-render.svg.png` | Pass |
| Primary projection | `docs/assets/canonical-artifact/projections/primary-projection.svg` | Pass |
| Primary projection preview | `docs/assets/canonical-artifact/projections/primary-projection.svg.png` | Pass |
| Three.js viewer | `docs/assets/canonical-artifact/viewer.html` | Pass |
| Three.js desktop render | `docs/assets/canonical-artifact/renders/canonical-artifact-three-desktop.png` | Pass |
| Three.js mobile render | `docs/assets/canonical-artifact/renders/canonical-artifact-three-mobile.png` | Pass |
| Three.js v2 desktop render | `docs/assets/canonical-artifact/renders/canonical-artifact-three-v2-desktop.png` | Pass |
| Three.js v2 mobile render | `docs/assets/canonical-artifact/renders/canonical-artifact-three-v2-mobile.png` | Pass |
| Three.js v3 Anatomy desktop render | `docs/assets/canonical-artifact/renders/canonical-artifact-three-v3-anatomy-desktop.png` | Pass |
| Three.js v3 Anatomy mobile render | `docs/assets/canonical-artifact/renders/canonical-artifact-three-v3-anatomy-mobile.png` | Pass |
| Motion v1 MP4 | `docs/assets/canonical-artifact/renders/canonical-artifact-motion-v1.mp4` | Pass |
| Motion v1 poster | `docs/assets/canonical-artifact/renders/canonical-artifact-motion-v1-poster.png` | Pass |
| Motion v1 capture report | `docs/assets/canonical-artifact/renders/motion_capture_report.md` | Pass |
| Motion v2 Metabolic MP4 | `docs/assets/canonical-artifact/renders/canonical-artifact-motion-v2-metabolic.mp4` | Pass |
| Motion v2 Metabolic poster | `docs/assets/canonical-artifact/renders/canonical-artifact-motion-v2-metabolic-poster.png` | Pass |
| Motion v3 Implicit MP4 | `docs/assets/canonical-artifact/renders/canonical-artifact-motion-v3-implicit.mp4` | Pass |
| Motion v3 Implicit poster | `docs/assets/canonical-artifact/renders/canonical-artifact-motion-v3-implicit-poster.png` | Pass |
| Three.js capture report | `docs/assets/canonical-artifact/renders/three_capture_report.md` | Pass |
| Execution log | `docs/assets/canonical-artifact/execution_log.md` | Pass |

## Geometry Audit

| Check | Evidence | Status |
|---|---|---|
| 6 octahedron vertices | Model JSON: `geometry.vertexCount = 6` | Pass |
| 12 octahedron edges | Model JSON: `geometry.edgeCount = 12` | Pass |
| 8 triangular faces | Model JSON: `geometry.faceCount = 8` | Pass |
| Equal edge lengths | Model JSON: `edgeLengthSpread = 0` | Pass |
| Vertices on one spherical boundary | Model JSON: `radiusSpread = 0` | Pass |
| 3 coherence axes | Model JSON: `sourceModel.coherenceAxes.length = 3` | Pass |
| 6 half-rays | 3 axes x 2 endpoints | Pass |

## Coherence Audit

| Risk | Result | Status |
|---|---|---|
| 2D logo becomes source | Generator builds from 3D vertices first; projection camera recorded as `[1, 1, 1]` | Pass |
| Accidental Cartesian cross | Source model keeps octahedron edges plus opposite-vertex coherence axes; projection is not a plain XYZ gizmo | Pass |
| Starburst drift | Projection contains exactly three axes / six half-rays; no extra rays, particles, or flares | Pass |
| Heavy cage drift | Spherical field is a faint boundary and wash, not a metal wireframe cage | Pass |
| Great-circle drift | No great circles are modeled as canonical source geometry | Pass |
| Luxury jewelry drift | Current SVG material is a restrained champagne luminous alloy; higher-fidelity material remains a renderer upgrade | Pass with limitation |
| Field subtlety | Boundary is barely visible with soft iridescent wash | Pass |
| Brand alignment | Uses Bio-Light / iridescent field language and preserves the not-decoration rule | Pass |

## Three.js Renderer Audit

| Check | Evidence | Status |
|---|---|---|
| Viewer loads from local Vite server | `viewer.html` captured through `http://127.0.0.1:5177/docs/assets/canonical-artifact/viewer.html` | Pass |
| Desktop render captured | `renders/canonical-artifact-three-desktop.png` at 1440x1200 | Pass |
| Mobile render captured | `renders/canonical-artifact-three-mobile.png` at 390x844 | Pass |
| v2 shader render captured | `renders/canonical-artifact-three-v2-desktop.png` and `renders/canonical-artifact-three-v2-mobile.png` | Pass |
| v3 Anatomy render captured | `renders/canonical-artifact-three-v3-anatomy-desktop.png` and `renders/canonical-artifact-three-v3-anatomy-mobile.png` | Pass |
| Canvas is nonblank | `three_capture_report.md` grid samples show `nonBlank=true` for both captures | Pass |
| Mobile object is framed | Mobile screenshot contains full field/object after camera-fit correction | Pass |
| Console health | Mobile clean; desktop only reports expected `readPixels` performance warnings from the audit itself | Pass with note |

## v3 Anatomy Audit

| Check | Evidence | Status |
|---|---|---|
| Sphere / octahedron / torus anatomies are implemented | `viewer.html` supports `mode=anatomy` | Pass |
| Canonical topology is unchanged | Viewer still loads `canonical-artifact.model.json` | Pass |
| Relationship graph is lighter than v2 | v3 edge radius and shell opacity are reduced in Anatomy Mode | Pass |
| Coherence axes remain legible | v3 render keeps 3 axes / 6 half-rays visible through center | Pass |
| Sphere is quieter | v3 reduces field shader alpha by Anatomy Mode scaling | Pass |
| Toroidal becoming is present | v3 adds faint circulation paths through `torusGroup` | Pass |
| Desktop/mobile captures exist | v3 desktop/mobile PNGs captured and listed above | Pass |

## Motion v1 Audit

| Check | Evidence | Status |
|---|---|---|
| Deterministic time control exists | `viewer.html` exposes `window.__setArtifactTime(ms)` | Pass |
| Motion capture script exists | `scripts/canonical-artifact/capture-motion.mjs` | Pass |
| MP4 generated | `canonical-artifact-motion-v1.mp4`, 96 frames, 24fps, 4s | Pass |
| Poster generated | `canonical-artifact-motion-v1-poster.png` | Pass |
| Topology remains invariant | Motion changes field, torus group, and aura timing; source geometry is unchanged | Pass |
| Becoming is visible | Toroidal circulation rotates around the invariant over time | Pass |
| Breathing is subtle | Singularity aura scales gently, without pulsing the topology | Pass |

## Motion v2 Metabolic Audit

| Check | Evidence | Status |
|---|---|---|
| Metabolic motion mode exists | `viewer.html` supports `motion=metabolic` | Pass |
| Field motion is phase-based | Field shader mixes layered waves when metabolism is enabled | Pass |
| Toroidal motion is not simple group rotation | Circulation paths use per-path phase offsets and scale modulation | Pass |
| Central coherence breathes subtly | Aura, warm light, axis emissive intensity, and glow opacity modulate gently | Pass |
| Invariant topology is preserved | Motion affects materials/transforms of field/circulation/aura, not source model | Pass |
| MP4 generated | `canonical-artifact-motion-v2-metabolic.mp4`, 96 frames, 24fps, 4s | Pass |

## Motion v3 Implicit Audit

| Check | Evidence | Status |
|---|---|---|
| Implicit motion mode exists | `viewer.html` supports `motion=implicit` | Pass |
| Field carries more circulation burden | Field shader adds traveling caustic bands and layered phase waves in implicit mode | Pass |
| Toroidal paths are reduced | Implicit mode lowers path opacity and narrows transform amplitude | Pass |
| Light propagation is present | Caustic bands modulate field color and alpha over time | Pass |
| Invariant topology is preserved | Motion changes shader/material timing only; source model remains unchanged | Pass |
| MP4 generated | `canonical-artifact-motion-v3-implicit.mp4`, 96 frames, 24fps, 4s | Pass |
| Console health | Capture reports expected WebGL `ReadPixels` performance warnings from screenshot capture | Pass with note |

## Known Limitations

1. The SVG implementation is exact and audit-friendly; the Three.js render is more material-rich but still not a final Blender/Cycles-grade photograph.
2. The material now includes deterministic brushed texture and stronger physicality, but still needs final art direction to escape ordinary gold completely.
3. Motion v3 reduces explicit path-work and makes circulation more implicit, but the field shader remains a real-time approximation rather than physically simulated refraction.
4. The privileged viewpoint is operationalized as `[1, 1, 1]`; Sasha may later tune this from lived visual memory.

## Debug Conclusion

The first execution target is complete and the renderer now has five layers: v2 artifact/material render, v3 Anatomy Mode, Motion v1, Motion v2 Metabolic, and Motion v3 Implicit. All derive from the same procedural geometry. The next quality leap is higher-fidelity physics/material rendering: more convincing refraction, anisotropy, and light propagation without adding decorative structure.
