/**
 * The glyph's frame loop, with its rules testable without a browser (architecture §4, §8): at most 30
 * frames a second, not running while the tab is hidden, and no rotation under reduced motion. The
 * timing and the stop rule are the ones #458 settled (`frameGate`, `shouldAnimate` in
 * `src/lib/airOctahedron.ts`); this wraps them in a small controller so the canvas component and the
 * unit tests drive the same code.
 */
import { STATIC_POSE, frameGate, poseAt, shouldAnimate, type Pose } from "@/lib/airOctahedron";

type RafLike = (cb: (now: number) => void) => number;
type CancelLike = (id: number) => void;

export type FrameLoopOptions = {
  /** Paint one frame at `spin` seconds of accumulated turn. Called once per sync when the loop is not running. */
  draw: (spin: number) => void;
  /** prefers-reduced-motion: the loop never runs and the turn never advances. */
  reduced: boolean;
  isHidden: () => boolean;
  raf?: RafLike;
  caf?: CancelLike;
};

export type FrameLoop = {
  /** Start or stop to match the current rules (call on mount, on `visibilitychange`, when inputs change). */
  sync: () => void;
  /** Paint once now with the current spin (inputs changed while the loop is stopped). */
  redraw: () => void;
  dispose: () => void;
  readonly spin: number;
  readonly running: boolean;
};

export const createFrameLoop = ({ draw, reduced, isHidden, raf = requestAnimationFrame, caf = cancelAnimationFrame }: FrameLoopOptions): FrameLoop => {
  let id = 0;
  let running = false;
  let last = 0;
  let spin = 0;

  const stop = () => {
    running = false;
    caf(id);
  };
  const tick = (now: number) => {
    if (!running) return;
    id = raf(tick);
    const next = frameGate(now, last);
    if (next === null) return;
    // First frame after a start or a pause: no jump, however long we were stopped.
    const dt = last === 0 ? 0 : Math.min((next - last) / 1000, 0.1);
    last = next;
    spin += dt;
    draw(spin);
  };
  const sync = () => {
    if (shouldAnimate({ hidden: isHidden(), panelOpen: false, reduced })) {
      if (running) return;
      running = true;
      last = 0;
      id = raf(tick);
    } else {
      stop();
      draw(spin);
    }
  };

  return {
    sync,
    redraw: () => {
      if (!running) draw(spin);
    },
    dispose: stop,
    get spin() {
      return spin;
    },
    get running() {
      return running;
    },
  };
};

/** The crystal's pose: always the still view under reduced motion, whatever the spin. */
export const glyphPose = (spin: number, reduced: boolean): Pose => (reduced ? STATIC_POSE : poseAt(spin));

/** The ring's travelling highlight, radians; 0 under reduced motion. One turn in about a minute. */
export const RING_SWEEP_RAD_PER_SEC = (Math.PI * 2) / 60;
export const ringSweep = (spin: number, reduced: boolean): number => (reduced ? 0 : spin * RING_SWEEP_RAD_PER_SEC);
