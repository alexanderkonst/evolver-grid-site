import { describe, expect, it } from "vitest";
import {
  FRAME_MS,
  MAX_FPS,
  OCTAHEDRON_EDGES,
  OCTAHEDRON_FACES,
  STATIC_POSE,
  frameGate,
  octahedronVertices,
  poseAt,
  projectFaces,
  rotate,
  shouldAnimate,
} from "../airOctahedron";

describe("octahedron geometry", () => {
  it("has the exact vertices (±r,0,0), (0,±r,0), (0,0,±r)", () => {
    expect(octahedronVertices(2)).toEqual([
      [2, 0, 0],
      [-2, 0, 0],
      [0, 2, 0],
      [0, -2, 0],
      [0, 0, 2],
      [0, 0, -2],
    ]);
  });

  it("has 8 faces and 12 edges, and every edge joins two non-opposite vertices", () => {
    expect(OCTAHEDRON_FACES).toHaveLength(8);
    expect(OCTAHEDRON_EDGES).toHaveLength(12);
    for (const [a, b] of OCTAHEDRON_EDGES) expect(Math.floor(a / 2)).not.toBe(Math.floor(b / 2));
  });

  it("every face edge is one of the 12 edges", () => {
    const key = (a: number, b: number) => [a, b].sort().join("-");
    const edges = new Set(OCTAHEDRON_EDGES.map(([a, b]) => key(a, b)));
    for (const [a, b, c] of OCTAHEDRON_FACES) {
      expect(edges.has(key(a, b))).toBe(true);
      expect(edges.has(key(b, c))).toBe(true);
      expect(edges.has(key(a, c))).toBe(true);
    }
  });

  it("rotation keeps every vertex on the unit sphere", () => {
    for (const t of [0, 7.3, 40, 1234.5]) {
      for (const v of octahedronVertices(1)) {
        expect(Math.hypot(...rotate(v, poseAt(t)))).toBeCloseTo(1, 10);
      }
    }
  });

  it("projects faces far to near, with outward normals (half face the viewer)", () => {
    const faces = projectFaces(STATIC_POSE, 40, 48, 48);
    for (let i = 1; i < faces.length; i++) expect(faces[i].depth).toBeGreaterThanOrEqual(faces[i - 1].depth);
    // A convex solid: a face is front-facing exactly when its centroid is nearer than the centre.
    for (const f of faces) expect(f.normal[2] > 0).toBe(f.depth > 0);
    expect(faces.filter((f) => f.normal[2] > 0)).toHaveLength(4);
    for (const f of faces) for (const [x, y] of f.points) {
      expect(x).toBeGreaterThanOrEqual(8);
      expect(x).toBeLessThanOrEqual(88);
      expect(y).toBeGreaterThanOrEqual(8);
      expect(y).toBeLessThanOrEqual(88);
    }
  });
});

describe("motion", () => {
  it("starts from the still pose", () => {
    expect(poseAt(0)).toEqual(STATIC_POSE);
  });

  it("is slow: well under a quarter turn per second", () => {
    expect(poseAt(1).yaw - poseAt(0).yaw).toBeLessThan(Math.PI / 12);
  });

  it("shows different faces over time: the front face set changes through a turn", () => {
    const front = (t: number) =>
      projectFaces(poseAt(t), 1, 0, 0)
        .map((f, i) => ({ f, i }))
        .filter(({ f }) => f.normal[2] > 0.6)
        .map(({ f }) => f.normal.map((n) => n.toFixed(1)).join(","))
        .sort()
        .join("|");
    const seen = new Set([0, 5, 10, 15, 20, 25, 30, 35, 40].map(front));
    expect(seen.size).toBeGreaterThan(2);
  });
});

describe("performance budget", () => {
  it("caps the loop at 30 fps", () => {
    expect(MAX_FPS).toBe(30);
    // Simulate a 60 Hz and a 144 Hz display for one second: never more than 30 (+1 for the boundary) draws.
    for (const hz of [60, 120, 144, 240]) {
      let last = 0;
      let draws = 0;
      for (let now = 1000 / hz; now <= 1000; now += 1000 / hz) {
        const next = frameGate(now, last);
        if (next !== null) {
          last = next;
          draws++;
        }
      }
      expect(draws).toBeLessThanOrEqual(31);
      expect(draws).toBeGreaterThanOrEqual(25);
    }
    expect(FRAME_MS).toBeCloseTo(33.33, 1);
  });

  it("runs only when visible, panel closed and motion allowed", () => {
    expect(shouldAnimate({ hidden: false, panelOpen: false, reduced: false })).toBe(true);
    expect(shouldAnimate({ hidden: true, panelOpen: false, reduced: false })).toBe(false);
    expect(shouldAnimate({ hidden: false, panelOpen: true, reduced: false })).toBe(false);
    expect(shouldAnimate({ hidden: false, panelOpen: false, reduced: true })).toBe(false);
  });
});
