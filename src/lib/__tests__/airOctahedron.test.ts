import { describe, expect, it } from "vitest";
import {
  CRYSTAL_MAX_PX,
  CRYSTAL_MIN_PX,
  EDGE_ALPHA_BACK,
  EDGE_ALPHA_FRONT,
  FACE_ALPHA_SCALE,
  FRAME_MS,
  MAX_FPS,
  OCTAHEDRON_EDGES,
  OCTAHEDRON_FACES,
  STATIC_POSE,
  crystalPx,
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

describe("clear air: faint facets", () => {
  it("cuts face fills and edge strokes to about a third of #458 (faces 0.9 / 0.34 edges)", () => {
    expect(FACE_ALPHA_SCALE).toBeLessThanOrEqual(0.34);
    expect(EDGE_ALPHA_FRONT).toBeLessThanOrEqual(0.9 / 3);
    expect(EDGE_ALPHA_BACK).toBeLessThanOrEqual(0.34 / 3);
    expect(EDGE_ALPHA_BACK).toBeLessThan(EDGE_ALPHA_FRONT);
  });
});

describe("crystalPx", () => {
  it("stays inside the clamp from a small phone to a large desktop", () => {
    for (const [w, h] of [[320, 568], [375, 667], [768, 1024], [1280, 800], [1920, 1080], [3840, 2160]]) {
      const px = crystalPx(w, h);
      expect(px).toBeGreaterThanOrEqual(CRYSTAL_MIN_PX);
      expect(px).toBeLessThanOrEqual(CRYSTAL_MAX_PX);
    }
  });

  it("follows the shorter side, so rotating a device does not change it", () => {
    expect(crystalPx(768, 1024)).toBe(crystalPx(1024, 768));
  });

  it("grows between phone and tablet, and never shrinks as the screen grows", () => {
    expect(crystalPx(768, 1024)).toBeGreaterThan(crystalPx(375, 667));
    expect(crystalPx(1920, 1080)).toBeGreaterThanOrEqual(crystalPx(1280, 800));
  });

  it("falls back to the minimum for a zero or broken viewport", () => {
    expect(crystalPx(0, 0)).toBe(CRYSTAL_MIN_PX);
    expect(crystalPx(NaN, 800)).toBe(CRYSTAL_MIN_PX);
  });
});
