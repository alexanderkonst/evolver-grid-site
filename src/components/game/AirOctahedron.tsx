/**
 * AirOctahedron — the carried object, drawn as a clear octahedron of air
 * (docs/specs/your-ai-instrument/sow.md D1; reference docs/assets/your-ai/octahedron_reference.png).
 *
 * One small 2D canvas, no WebGL, no library. Eight translucent faces in sky tones, twelve light edges,
 * both kept faint (2026-11-27: clear air, barely visible facets), painted far to near so the back edges
 * show through the faces. No shadowBlur, no halo: the only light
 * is the object's own, a refraction gradient on each face.
 *
 * Performance budget: rAF capped at ~30fps; the loop is not running when the tab is hidden, when the
 * panel is open, or under prefers-reduced-motion (a still view is drawn instead).
 */
import { useEffect, useRef } from "react";
import {
  EDGE_ALPHA_BACK,
  EDGE_ALPHA_FRONT,
  EDGE_WIDTH_BACK,
  EDGE_WIDTH_FRONT,
  FACE_ALPHA_SCALE,
  STATIC_POSE,
  frameGate,
  poseAt,
  projectEdges,
  projectFaces,
  shouldAnimate,
  type Pose,
} from "@/lib/airOctahedron";

type Props = {
  /** CSS pixels, square. */
  size: number;
  /** The panel is open (or the caller wants a still view): draw once, run no loop. */
  still: boolean;
  /** prefers-reduced-motion. */
  reduced: boolean;
};

/** Sky tones, light to deep. Faces turn from `FACE_NEAR` (facing the light) to `FACE_FAR` (turned away). */
const FACE_NEAR: [number, number, number] = [236, 247, 255];
const FACE_FAR: [number, number, number] = [122, 182, 238];
const EDGE = "232,244,252";
/** Light from the upper left, a little toward the viewer. */
const LIGHT: [number, number, number] = (() => {
  const v: [number, number, number] = [-0.45, 0.6, 0.66];
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
})();

const mix = (a: number[], b: number[], t: number) => a.map((x, i) => Math.round(x + (b[i] - x) * t));

/**
 * Paint the crystal. `scale` is pixels per unit of r (default: fill the box, 3px margin so edges are
 * never clipped); `clear: false` lets the instrument glyph paint the ring and inner bodies on the same canvas.
 */
export const drawOctahedron = (ctx: CanvasRenderingContext2D, size: number, pose: Pose, scale = size / 2 - 3, clear = true) => {
  const c = size / 2;
  if (clear) ctx.clearRect(0, 0, size, size);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  for (const f of projectFaces(pose, scale, c, c)) {
    const front = f.normal[2] > 0;
    // 0 = turned from the light, 1 = facing it.
    const lit = Math.max(0, f.normal[0] * LIGHT[0] + f.normal[1] * LIGHT[1] + f.normal[2] * LIGHT[2]);
    const [r, g, b] = mix(FACE_FAR, FACE_NEAR, lit);
    const [p, q, s] = f.points;
    // Refraction: the face brightens along the line from the light-facing corner to the far one.
    const grad = ctx.createLinearGradient(p[0], p[1], (q[0] + s[0]) / 2, (q[1] + s[1]) / 2);
    const a = front ? 0.07 + 0.2 * lit : 0.03 + 0.06 * lit;
    // Same light, a third of the strength: the facets barely show, the gradient still turns toward the light.
    grad.addColorStop(0, `rgba(${r},${g},${b},${(a + 0.08) * FACE_ALPHA_SCALE})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${Math.max(0.02, a - 0.05) * FACE_ALPHA_SCALE})`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.lineTo(q[0], q[1]);
    ctx.lineTo(s[0], s[1]);
    ctx.closePath();
    ctx.fill();
  }

  // Edges after all faces so the near ones stay crisp over the translucent fills.
  for (const e of projectEdges(pose, scale, c, c)) {
    const front = e.depth > 0;
    ctx.strokeStyle = `rgba(${EDGE},${front ? EDGE_ALPHA_FRONT : EDGE_ALPHA_BACK})`;
    ctx.lineWidth = front ? EDGE_WIDTH_FRONT : EDGE_WIDTH_BACK;
    ctx.beginPath();
    ctx.moveTo(e.from[0], e.from[1]);
    ctx.lineTo(e.to[0], e.to[1]);
    ctx.stroke();
  }
};

const AirOctahedron = ({ size, still, reduced }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Accumulated spin in seconds. Kept across pauses so the turn resumes where it stopped. */
  const spinRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let last = 0;
    let running = false;

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const tick = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const next = frameGate(now, last);
      if (next === null) return;
      // First frame after a start or a pause: no jump, however long we were stopped.
      const dt = last === 0 ? 0 : Math.min((next - last) / 1000, 0.1);
      last = next;
      spinRef.current += dt;
      drawOctahedron(ctx, size, poseAt(spinRef.current));
    };
    const sync = () => {
      if (shouldAnimate({ hidden: document.hidden, panelOpen: still, reduced })) {
        if (running) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(tick);
      } else {
        stop();
        // Still view: the pose the object was in when it stopped, except reduced motion, which always shows the same view.
        drawOctahedron(ctx, size, reduced ? STATIC_POSE : poseAt(spinRef.current));
      }
    };

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, [size, still, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="your-ai-octahedron-canvas"
      width={size}
      height={size}
      style={{ width: size, height: size, display: "block" }}
    />
  );
};

export default AirOctahedron;
