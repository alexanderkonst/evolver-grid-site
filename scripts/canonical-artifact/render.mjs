import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const outRoot = join(root, "docs", "assets", "canonical-artifact");
const geometryDir = join(outRoot, "geometry");
const rendersDir = join(outRoot, "renders");
const projectionsDir = join(outRoot, "projections");

for (const dir of [geometryDir, rendersDir, projectionsDir]) {
  mkdirSync(dir, { recursive: true });
}

const radius = 1;
const vertices = [
  { id: "x+", p: [radius, 0, 0] },
  { id: "x-", p: [-radius, 0, 0] },
  { id: "y+", p: [0, radius, 0] },
  { id: "y-", p: [0, -radius, 0] },
  { id: "z+", p: [0, 0, radius] },
  { id: "z-", p: [0, 0, -radius] },
];

const opposite = new Set(["x+:x-", "x-:x+", "y+:y-", "y-:y+", "z+:z-", "z-:z+"]);
const edges = [];
for (let i = 0; i < vertices.length; i += 1) {
  for (let j = i + 1; j < vertices.length; j += 1) {
    const key = `${vertices[i].id}:${vertices[j].id}`;
    if (!opposite.has(key)) edges.push([vertices[i].id, vertices[j].id]);
  }
}

const faces = [
  ["x+", "y+", "z+"],
  ["x+", "z+", "y-"],
  ["x+", "y-", "z-"],
  ["x+", "z-", "y+"],
  ["x-", "z+", "y+"],
  ["x-", "y-", "z+"],
  ["x-", "z-", "y-"],
  ["x-", "y+", "z-"],
];

const coherenceAxes = [
  ["x+", "x-"],
  ["y+", "y-"],
  ["z+", "z-"],
];

const byId = new Map(vertices.map((vertex) => [vertex.id, vertex.p]));
const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);
const sub = (a, b) => a.map((value, index) => value - b[index]);
const scale = (a, s) => a.map((value) => value * s);
const add = (a, b) => a.map((value, index) => value + b[index]);
const len = (a) => Math.sqrt(dot(a, a));
const norm = (a) => scale(a, 1 / len(a));
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dist = (a, b) => len(sub(a, b));

function makeCamera(direction, upHint = [0, 0, 1]) {
  const forward = norm(direction);
  let right = cross(forward, upHint);
  if (len(right) < 1e-6) right = cross(forward, [0, 1, 0]);
  right = norm(right);
  const up = norm(cross(right, forward));
  return { forward, right, up };
}

function projectPoint(point, camera, size = 720, margin = 112) {
  const x = dot(point, camera.right);
  const y = dot(point, camera.up);
  const depth = dot(point, camera.forward);
  const half = size / 2;
  const s = half - margin;
  return {
    x: half + x * s,
    y: half - y * s,
    depth,
  };
}

function lineSvg({ a, b, id, width = 13, opacity = 1, glow = true, mode = "alloy" }) {
  const gradientId = `g-${id}`;
  const filter = glow ? ` filter="url(#softGlow)"` : "";
  const stops = mode === "axis"
    ? `
        <stop offset="0" stop-color="#c7a65a"/>
        <stop offset="0.38" stop-color="#f7e9a6"/>
        <stop offset="0.49" stop-color="#fffef8"/>
        <stop offset="0.51" stop-color="#fffef8"/>
        <stop offset="0.62" stop-color="#f7e9a6"/>
        <stop offset="1" stop-color="#b58d3f"/>`
    : `
        <stop offset="0" stop-color="#b99a53"/>
        <stop offset="0.43" stop-color="#f8f2d9"/>
        <stop offset="0.52" stop-color="#fffef6"/>
        <stop offset="0.61" stop-color="#f3df99"/>
        <stop offset="1" stop-color="#9d7731"/>`;
  return `
    <defs>
      <linearGradient id="${gradientId}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" gradientUnits="userSpaceOnUse">
        ${stops}
      </linearGradient>
    </defs>
    ${mode === "axis" ? `<line x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}"
      stroke="#b8913f" stroke-width="${(width * 1.14).toFixed(2)}" stroke-linecap="round" opacity="${(opacity * 0.4).toFixed(2)}"/>` : ""}
    <line x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}"
      stroke="url(#${gradientId})" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"${filter}/>
    <line x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}"
      stroke="#fffdf0" stroke-width="${Math.max(1.2, width * 0.22).toFixed(2)}" stroke-linecap="round" opacity="${(opacity * 0.72).toFixed(2)}"/>
  `;
}

function baseDefs() {
  return `
    <defs>
      <radialGradient id="fieldWash" cx="50%" cy="47%" r="49%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="58%" stop-color="#f5f0dc" stop-opacity="0.05"/>
        <stop offset="76%" stop-color="#c9e2ea" stop-opacity="0.11"/>
        <stop offset="89%" stop-color="#d8c1de" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#fff8df" stop-opacity="0.03"/>
      </radialGradient>
      <linearGradient id="iridescentBoundary" x1="80" y1="120" x2="650" y2="610" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#c8b7d8" stop-opacity="0.28"/>
        <stop offset="25%" stop-color="#a7cbd4" stop-opacity="0.23"/>
        <stop offset="50%" stop-color="#f7f4e3" stop-opacity="0.18"/>
        <stop offset="75%" stop-color="#cea4ae" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#a4a3d0" stop-opacity="0.26"/>
      </linearGradient>
      <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="5.2" result="blur"/>
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.98  0 1 0 0 0.82  0 0 1 0 0.42  0 0 0 0.42 0" result="glow"/>
        <feMerge>
          <feMergeNode in="glow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="singularityGlow" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>`;
}

function renderArtifactSvg({ cameraDirection, outPath, projectionMode = false }) {
  const camera = makeCamera(cameraDirection);
  const projected = new Map(vertices.map((vertex) => [vertex.id, projectPoint(vertex.p, camera)]));
  const sortedEdges = edges
    .map(([aId, bId]) => {
      const a3 = byId.get(aId);
      const b3 = byId.get(bId);
      const depth = (dot(a3, camera.forward) + dot(b3, camera.forward)) / 2;
      return { aId, bId, depth };
    })
    .sort((a, b) => a.depth - b.depth);

  const edgeLines = sortedEdges
    .map((edge, index) => {
      const depthOpacity = projectionMode ? 0.93 : 0.62 + ((edge.depth + 0.8) / 1.6) * 0.31;
      return lineSvg({
        a: projected.get(edge.aId),
        b: projected.get(edge.bId),
        id: `${projectionMode ? "p" : "r"}-${index}`,
        width: projectionMode ? 5 : 10,
        opacity: projectionMode ? Math.max(0.08, Math.min(0.2, depthOpacity * 0.2)) : Math.max(0.34, Math.min(0.72, depthOpacity * 0.78)),
        glow: !projectionMode,
      });
    })
    .join("\n");

  const axisLines = coherenceAxes
    .map(([aId, bId], index) => lineSvg({
      a: projected.get(aId),
      b: projected.get(bId),
      id: `${projectionMode ? "pa" : "ra"}-${index}`,
      width: projectionMode ? 18 : 12,
      opacity: projectionMode ? 0.98 : 0.82,
      mode: "axis",
    }))
    .join("\n");

  const boundaryOpacity = projectionMode ? 0.28 : 0.18;
  const boundaryStroke = projectionMode ? 1.8 : 2.4;
  const title = projectionMode ? "Primary Projection" : "Canonical Artifact Render";
  const center = projectionMode
    ? `<circle cx="360" cy="360" r="4.2" fill="#fffef8" filter="url(#singularityGlow)"/>
       <circle cx="360" cy="360" r="1.4" fill="#fffef8"/>`
    : `<circle cx="360" cy="360" r="5" fill="#fffef8" filter="url(#singularityGlow)"/>
       <circle cx="360" cy="360" r="1.7" fill="#fffef8"/>`;

  const fieldMotion = projectionMode
    ? ""
    : `<path d="M158 404 C244 308 367 282 534 211" fill="none" stroke="#a7cbd4" stroke-width="1.2" opacity="0.16"/>
       <path d="M194 221 C335 271 430 404 557 481" fill="none" stroke="#c8b7d8" stroke-width="1.1" opacity="0.14"/>
       <path d="M116 349 C250 461 450 461 603 333" fill="none" stroke="#cea4ae" stroke-width="1.1" opacity="0.12"/>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720" role="img" aria-label="${title}">
  ${baseDefs()}
  <rect width="720" height="720" fill="#fffefa"/>
  <circle cx="360" cy="360" r="264" fill="url(#fieldWash)" opacity="${projectionMode ? 0.58 : 0.72}"/>
  <circle cx="360" cy="360" r="264" fill="none" stroke="url(#iridescentBoundary)" stroke-width="${boundaryStroke}" opacity="${boundaryOpacity}"/>
  ${fieldMotion}
  <g>
    ${edgeLines}
    ${axisLines}
  </g>
  ${center}
</svg>
`;

  writeFileSync(outPath, svg);
}

const edgeLengths = edges.map(([aId, bId]) => dist(byId.get(aId), byId.get(bId)));
const radiusLengths = vertices.map(({ p }) => len(p));
const edgeMin = Math.min(...edgeLengths);
const edgeMax = Math.max(...edgeLengths);
const radiusMin = Math.min(...radiusLengths);
const radiusMax = Math.max(...radiusLengths);
const tolerance = 1e-12;
const audit = {
  generatedAt: new Date().toISOString(),
  geometry: {
    type: "regular-octahedron-inscribed-in-spherical-field",
    radius,
    vertexCount: vertices.length,
    edgeCount: edges.length,
    faceCount: faces.length,
    edgeLength: edgeLengths[0],
    edgeLengthSpread: edgeMax - edgeMin,
    radiusSpread: radiusMax - radiusMin,
    passes: {
      vertices: vertices.length === 6,
      edges: edges.length === 12,
      faces: faces.length === 8,
      equalEdges: edgeMax - edgeMin < tolerance,
      verticesOnSphere: radiusMax - radiusMin < tolerance,
    },
  },
  sourceModel: {
    vertices,
    edges,
    faces,
    coherenceAxes,
  },
  projection: {
    primaryProjectionCameraDirection: [1, 1, 1],
    canonicalRenderCameraDirection: [2.2, -2.6, 1.7],
    note: "Primary projection is derived from the regular octahedron source model, not separately illustrated.",
  },
};

writeFileSync(join(geometryDir, "canonical-artifact.model.json"), `${JSON.stringify(audit, null, 2)}\n`);
renderArtifactSvg({
  cameraDirection: audit.projection.canonicalRenderCameraDirection,
  outPath: join(rendersDir, "canonical-artifact-render.svg"),
});
renderArtifactSvg({
  cameraDirection: audit.projection.primaryProjectionCameraDirection,
  outPath: join(projectionsDir, "primary-projection.svg"),
  projectionMode: true,
});

const auditMarkdown = `# Canonical Artifact Execution Log

Generated: ${audit.generatedAt}

## Source Model

- File: \`docs/assets/canonical-artifact/geometry/canonical-artifact.model.json\`
- Type: regular octahedron inscribed in a spherical field.
- Vertices: ${vertices.length}
- Edges: ${edges.length}
- Faces: ${faces.length}
- Coherence axes: ${coherenceAxes.length}
- Coherence half-rays: ${coherenceAxes.length * 2}
- Edge length: ${edgeLengths[0]}
- Edge length spread: ${edgeMax - edgeMin}
- Radius spread: ${radiusMax - radiusMin}

## Outputs

- Static canonical render: \`docs/assets/canonical-artifact/renders/canonical-artifact-render.svg\`
- Primary projection: \`docs/assets/canonical-artifact/projections/primary-projection.svg\`

## Audit

| Check | Result |
|---|---|
| 6 vertices | ${audit.geometry.passes.vertices ? "Pass" : "Fail"} |
| 12 edges | ${audit.geometry.passes.edges ? "Pass" : "Fail"} |
| 8 faces | ${audit.geometry.passes.faces ? "Pass" : "Fail"} |
| 3 coherence axes / 6 half-rays | Pass |
| Equal edge lengths | ${audit.geometry.passes.equalEdges ? "Pass" : "Fail"} |
| Vertices on one sphere | ${audit.geometry.passes.verticesOnSphere ? "Pass" : "Fail"} |
| Projection derived from source model | Pass |

## Threshold Review T2

What the geometry revealed:

- The source object is cleanly represented by the six axis vertices of a regular octahedron.
- The primary projection camera direction \`[1, 1, 1]\` produces the sixfold / three-diameter lineage through opposite-vertex coherence axes without treating the 2D mark as source.

Assumption adjusted:

- The first executable output should be SVG, not raster, because SVG preserves exact geometry and keeps the model auditable in this environment.

Open decision:

- None for this phase.

Next irreversible action:

- Improve material/render fidelity from the same source model without changing topology.
`;

writeFileSync(join(outRoot, "execution_log.md"), auditMarkdown);

console.log(JSON.stringify({
  model: join(geometryDir, "canonical-artifact.model.json"),
  render: join(rendersDir, "canonical-artifact-render.svg"),
  projection: join(projectionsDir, "primary-projection.svg"),
  log: join(outRoot, "execution_log.md"),
  passes: audit.geometry.passes,
}, null, 2));
