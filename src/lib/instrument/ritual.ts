/**
 * The body-lit ritual's rules (docs/specs/navigation-instrument/architecture.md §5.2), as pure
 * functions: which body plays next, when the moment is calm enough, and what step the sequence is in.
 * `InstrumentRitual.tsx` only draws what this decides; `state.ts` owns `litSeen` and the queue
 * (`unseenLit`); `sound.ts` owns the tone.
 *
 * The ritual never interrupts. A body that is lit and not yet seen waits in the queue until the player
 * is somewhere calm: on the village map and its place panes, on the journey board, or on the Academy
 * hub. Inside a module form (its intro, steps and outro) it never plays, and neither does it play
 * while the instrument is open or while another ritual is on screen. One body plays per calm visit,
 * so a player who arrives with several bodies waiting sees them one by one, not in a row.
 */
import type { ElementKey } from "@/data/villagePlaces";
import { unseenLit, type LitSeen } from "@/lib/instrument/state";

/** The sequence, about 2.5 s (§5.2). Each step starts at `at` ms and runs `ms`. */
export const RITUAL_STEPS = [
  { id: "flare", at: 0, ms: 400 }, // 1. the quarter sign in the world flares
  { id: "thread", at: 400, ms: 600 }, // 2. a thread of light flies from it to the glyph
  { id: "draw", at: 1000, ms: 800 }, // 3. the body draws itself, edge by edge, inside the crystal
  { id: "tone", at: 1800, ms: 700 }, // 4. one tone in the element's voice
] as const;
export type RitualStepId = (typeof RITUAL_STEPS)[number]["id"];

/** The sequence proper, ms. */
export const RITUAL_MS = 2500;
/** 5. the line appears with the tone, holds long enough to read, then fades. */
export const LINE_AT_MS = 1800;
export const LINE_HOLD_MS = 2200;
export const LINE_FADE_MS = 500;
/** Everything on screen is gone by here. */
export const RITUAL_TOTAL_MS = LINE_AT_MS + LINE_HOLD_MS + LINE_FADE_MS;

/** Reduced motion: no flare, no thread, no drawing. The body fades in inside the glyph; tone and line stay. */
export const REDUCED_FADE_MS = 400;
export const REDUCED_TOTAL_MS = REDUCED_FADE_MS + LINE_HOLD_MS + LINE_FADE_MS;

/** The step the sequence is in at `elapsedMs`, or null once the steps are over (only the line is left). */
export const ritualStepAt = (elapsedMs: number): RitualStepId | null => {
  for (const s of RITUAL_STEPS) if (elapsedMs >= s.at && elapsedMs < s.at + s.ms) return s.id;
  return null;
};

/** 0..1 through one step (0 before it starts, 1 after it ends). */
export const stepProgress = (id: RitualStepId, elapsedMs: number): number => {
  const s = RITUAL_STEPS.find((x) => x.id === id)!;
  return Math.max(0, Math.min(1, (elapsedMs - s.at) / s.ms));
};

/** The line is on screen (appearing, held or fading) at `elapsedMs`. */
export const lineVisibleAt = (elapsedMs: number, reduced = false): boolean =>
  elapsedMs >= (reduced ? 0 : LINE_AT_MS) && elapsedMs < (reduced ? REDUCED_TOTAL_MS : RITUAL_TOTAL_MS);

/** Exact paths and prefixes where the player is at rest. Anywhere else the ritual waits. */
export const CALM_PATHS: readonly string[] = ["/game/journey", "/game/learn"];
export const CALM_PREFIXES: readonly string[] = ["/village"];

/** `.mf` is the module form (intro, steps, outro): ModuleForm.css, docs/templates/module-form.md. */
export const MODULE_FORM_SELECTOR = ".mf, [data-module-form]";

export const isCalmPath = (pathname: string): boolean =>
  CALM_PATHS.includes(pathname) || CALM_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export type CalmInput = {
  pathname: string;
  /** The instrument is open (or a face is): the player is in it, not at rest. */
  raised: boolean;
  /** A module form is mounted on the page (see `MODULE_FORM_SELECTOR`). */
  inModuleForm: boolean;
  /** The tab is hidden: nobody is there to see it. */
  hidden?: boolean;
};

/** True when a ritual may start now. */
export const isCalmMoment = ({ pathname, raised, inModuleForm, hidden = false }: CalmInput): boolean =>
  !raised && !inModuleForm && !hidden && isCalmPath(pathname);

/** True when a module form is on the page. Pass `document`; a test passes a fragment. */
export const moduleFormMounted = (root: Pick<ParentNode, "querySelector">): boolean => root.querySelector(MODULE_FORM_SELECTOR) !== null;

export type NextRitualInput = {
  lit: Record<ElementKey, boolean>;
  seen: LitSeen;
  calm: boolean;
  /** A ritual is on screen right now. */
  playing: boolean;
  /** One has already played during this calm visit (`InstrumentRitual` clears it when the player leaves). */
  playedThisVisit: boolean;
};

/** The body whose ritual should start now, or null. Air has none (it is lit with the first reveal). */
export const nextRitual = ({ lit, seen, calm, playing, playedThisVisit }: NextRitualInput): ElementKey | null => {
  if (!calm || playing || playedThisVisit) return null;
  return unseenLit(lit, seen)[0] ?? null;
};

/** `instrument.ritual.line.<element>`: «Fire is lit. The Academy and FMF are open to you.» (en/es/ru). */
export const ritualLineKey = (element: ElementKey): string => `instrument.ritual.line.${element}`;
