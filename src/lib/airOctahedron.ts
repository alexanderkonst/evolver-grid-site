/**
 * The octahedron of air: the pure geometry and timing behind the corner object
 * (docs/specs/your-ai-instrument/sow.md, D1). The canvas lives in
 * `src/components/game/AirOctahedron.tsx`.
 *
 * Approach from docs/assets/your-ai/platonic_canonical_interactive.html: exact vertices, plain 2D
 * canvas, orthographic projection, no 3D library. Vertices (±r,0,0), (0,±r,0), (0,0,±r).
 */

export type Vec3 = readonly [number, number, number];

/** Vertex order: +X, -X, +Y, -Y, +Z, -Z. */
export const octahedronVertices = (r = 1): Vec3[] => [
  [r, 0, 0],
  [-r, 0, 0],
  [0, r, 0],
  [0, -r, 0],
  [0, 0, r],
  [0, 0, -r],
];

/** Eight triangular faces, one per sign octant: an x vertex, a y vertex and a z vertex each. */
export const OCTAHEDRON_FACES: ReadonlyArray<readonly [number, number, number]> = [0, 1].flatMap((x) =>
  [2, 3].flatMap((y) => [4, 5].map((z) => [x, y, z] as const)),
);

/** Twelve edges: every pair of vertices except the three opposite pairs (+X/-X, +Y/-Y, +Z/-Z). */
export const OCTAHEDRON_EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 4], [2, 5], [3, 4], [3, 5],
];

/** Slow and endless: one full turn about the vertical axis in about 42 seconds. */
export const YAW_RAD_PER_SEC = (Math.PI * 2) / 42;
/** The tilt drifts on its own slower beat so the turn never repeats the same faces in the same order. */
export const TILT_BEAT_RAD_PER_SEC = (Math.PI * 2) / 61;
/** The roll drifts on a third beat. */
export const ROLL_BEAT_RAD_PER_SEC = (Math.PI * 2) / 83;

/** Performance budget: the loop draws at most this many frames per second. */
export const MAX_FPS = 30;
export const FRAME_MS = 1000 / MAX_FPS;
/** Frame-skip tolerance so a 60 Hz display lands on every second frame, not every third. */
const FRAME_SLACK_MS = 2;

export type Pose = { yaw: number; tilt: number; roll: number };

/** The still view: the one used for reduced motion, the open panel and the header. Shows 4 faces and both apexes. */
export const STATIC_POSE: Pose = { yaw: 0.62, tilt: 0.52, roll: 0.14 };

/** The pose at `seconds` of accumulated spin. Always finite, never repeats exactly. */
export const poseAt = (seconds: number): Pose => ({
  yaw: STATIC_POSE.yaw + seconds * YAW_RAD_PER_SEC,
  tilt: STATIC_POSE.tilt + 0.38 * Math.sin(seconds * TILT_BEAT_RAD_PER_SEC),
  roll: STATIC_POSE.roll + 0.22 * Math.sin(seconds * ROLL_BEAT_RAD_PER_SEC),
});

/** Rotate by yaw (about Y), then tilt (about X), then roll (about Z). Right-handed, +Z toward the viewer. */
export const rotate = ([x, y, z]: Vec3, { yaw, tilt, roll }: Pose): Vec3 => {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const y2 = y * ct - z1 * st;
  const z2 = y * st + z1 * ct;
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  return [x1 * cr - y2 * sr, x1 * sr + y2 * cr, z2];
};

export type DrawnFace = {
  /** Screen-space points, canvas y down. */
  points: [number, number][];
  /** Outward unit normal after rotation; z > 0 faces the viewer. */
  normal: Vec3;
  /** Mean depth; larger is nearer. */
  depth: number;
};

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * The eight faces projected for a pose, sorted far to near (painter's order, exact for a convex solid).
 * `scale` is pixels per unit of r, `cx`/`cy` the screen centre.
 */
export const projectFaces = (pose: Pose, scale: number, cx: number, cy: number): DrawnFace[] => {
  const rotated = octahedronVertices(1).map((v) => rotate(v, pose));
  return OCTAHEDRON_FACES.map(([a, b, c]) => {
    const [p, q, r] = [rotated[a], rotated[b], rotated[c]];
    const n = cross(sub(q, p), sub(r, p));
    const len = Math.hypot(n[0], n[1], n[2]) || 1;
    // Faces are wound arbitrarily: orient the normal away from the centre, which is the origin.
    const centroid: Vec3 = [(p[0] + q[0] + r[0]) / 3, (p[1] + q[1] + r[1]) / 3, (p[2] + q[2] + r[2]) / 3];
    const sign = n[0] * centroid[0] + n[1] * centroid[1] + n[2] * centroid[2] < 0 ? -1 : 1;
    return {
      points: [p, q, r].map((v): [number, number] => [cx + v[0] * scale, cy - v[1] * scale]),
      normal: [(sign * n[0]) / len, (sign * n[1]) / len, (sign * n[2]) / len] as Vec3,
      depth: centroid[2],
    };
  }).sort((f, g) => f.depth - g.depth);
};

/** Mean-depth-per-edge, projected: for light edges in front and fainter edges behind. */
export const projectEdges = (pose: Pose, scale: number, cx: number, cy: number) => {
  const rotated = octahedronVertices(1).map((v) => rotate(v, pose));
  return OCTAHEDRON_EDGES.map(([a, b]) => ({
    from: [cx + rotated[a][0] * scale, cy - rotated[a][1] * scale] as [number, number],
    to: [cx + rotated[b][0] * scale, cy - rotated[b][1] * scale] as [number, number],
    depth: (rotated[a][2] + rotated[b][2]) / 2,
  })).sort((e, f) => e.depth - f.depth);
};

/**
 * Frame gate for the capped loop. Returns the new "last drawn" timestamp when a frame should be drawn,
 * or null to skip this rAF tick.
 */
export const frameGate = (now: number, last: number): number | null => (now - last >= FRAME_MS - FRAME_SLACK_MS ? now : null);

/** True when the loop must not run: tab hidden, panel open, or reduced motion. */
export const shouldAnimate = ({ hidden, panelOpen, reduced }: { hidden: boolean; panelOpen: boolean; reduced: boolean }): boolean =>
  !hidden && !panelOpen && !reduced;
