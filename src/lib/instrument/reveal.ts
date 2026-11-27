/**
 * The first reveal's rules (docs/specs/navigation-instrument/architecture.md §5.3, GoBY §25.10, WP7),
 * as pure functions: when it is due, which step comes next, what "Continue" does, and where the
 * once-flag lives. `InstrumentReveal.tsx` (next job) only draws what this decides.
 *
 * The once-flag is not a new record. Air "is lit with the first reveal, so it has no separate ritual"
 * (§5.2), which leaves the air entry of `litSeen` free: the reveal marks it. It travels with the save
 * (`game_profiles.first_time_actions.instrument_lit_air`) and the localStorage mirror that
 * `litSeenStore.ts` already keeps, so there is no schema change and no new storage key.
 *
 * Due rule, all of:
 *   1. the player's profile exists (§25.10: "after the player's profile is created");
 *   2. the top talent result is done (§5.3: "never before the top talent result"), by the same
 *      lenient OR the shell uses for `topTalentComplete`;
 *   3. the once-flag is not set, and the saved flag has been read (a returning player on a new
 *      device must not see it again while the remote record is still loading);
 *   4. the moment is calm (the ritual's `isCalmMoment`) and nothing else is playing.
 */
import { TOUR_GROUPS, type TourGroup } from "@/lib/yourAiInstrument";
import { hasSeen, markLitSeen, type LitSeen } from "@/lib/instrument/state";

/** The `litSeen` entry that records the reveal. */
export const REVEAL_SEEN_ELEMENT = "air" as const;

export const hasSeenReveal = (seen: LitSeen): boolean => hasSeen(seen, REVEAL_SEEN_ELEMENT);

/** Record the reveal as seen. Returns the same object when it already is. */
export const markRevealSeen = (seen: LitSeen): LitSeen => markLitSeen(seen, REVEAL_SEEN_ELEMENT);

export type TopTalentProbe = {
  /** The shell's `zogComplete` (a ZoG snapshot is in hand). */
  zogComplete?: boolean;
  /** `game_profiles.last_zog_snapshot_id`. */
  lastZogSnapshotId?: string | null;
  /** `game_profiles.zone_of_genius_completed`. */
  zoneOfGeniusCompleted?: boolean | null;
  /** The journey probe for the first step ("journey-start-here"). */
  journeyStart?: boolean;
};

/**
 * The top talent result exists. Same lenient OR as `topTalentComplete` in `GameShellV2`: the pointer
 * columns are the fast path, the journey probe is the fallback.
 */
export const hasTopTalentResult = (p: TopTalentProbe): boolean =>
  !!p.zogComplete || !!p.lastZogSnapshotId || !!p.zoneOfGeniusCompleted || !!p.journeyStart;

export type RevealDueInput = {
  /** A profile exists for this player. */
  profileCreated: boolean;
  /** `hasTopTalentResult(...)`. */
  topTalentDone: boolean;
  seen: LitSeen;
  /** The saved `litSeen` has been read (remote merged in, or there is no remote: signed out). */
  seenLoaded: boolean;
  /** `isCalmMoment(...)` from `ritual.ts`. */
  calm: boolean;
  /** The reveal, or a body-lit ritual, is on screen right now. */
  playing: boolean;
};

/** True when the reveal should start now. */
export const isRevealDue = ({ profileCreated, topTalentDone, seen, seenLoaded, calm, playing }: RevealDueInput): boolean =>
  profileCreated && topTalentDone && seenLoaded && !hasSeenReveal(seen) && calm && !playing;

// ---------------------------------------------------------------------------------------------
// The sequence
// ---------------------------------------------------------------------------------------------

/**
 * §5.3, in order. `dim` the world; `gather` the point of air light into the octahedron; `ring` the water
 * ring closes with today's moon; `open` the instrument opens itself once; then one step per tour group
 * (the §25.10 micro-onboarding, `TOUR_GROUPS`, one line each); `outlines` the three earthly bodies show
 * "Opens on your path"; `settle` into the corner.
 */
export const REVEAL_STEPS = ["dim", "gather", "ring", "open", ...TOUR_GROUPS, "outlines", "settle"] as const;
export type RevealStepId = (typeof REVEAL_STEPS)[number];

/** The three earthly bodies shown as outlines (fire, earth, ether; air and water are lit by now). */
export const REVEAL_OUTLINES = ["fire", "earth", "ether"] as const;

export const isTourStep = (id: RevealStepId): id is TourGroup => (TOUR_GROUPS as readonly string[]).includes(id);

/** `instrument.reveal.line.<step>`: one line per step (en/es/ru). */
export const revealLineKey = (id: RevealStepId): string => `instrument.reveal.line.${id}`;
/** The one button, on every step. */
export const REVEAL_CONTINUE_KEY = "instrument.reveal.continue";
/** The caption under each outline. */
export const REVEAL_OPENS_ON_PATH_KEY = "instrument.reveal.opensOnPath";

export const firstRevealStep = (): RevealStepId => REVEAL_STEPS[0];

/**
 * What "Continue" does: the next step, or null after the last one (the reveal is over and the caller
 * marks it seen). An unknown step ends the reveal rather than looping it.
 */
export const nextRevealStep = (id: RevealStepId): RevealStepId | null => {
  const i = REVEAL_STEPS.indexOf(id);
  return i >= 0 && i < REVEAL_STEPS.length - 1 ? REVEAL_STEPS[i + 1] : null;
};

export const isLastRevealStep = (id: RevealStepId): boolean => nextRevealStep(id) === null;

/** 1-based position, for the screen-reader line ("3 of 9"). */
export const revealStepNumber = (id: RevealStepId): number => REVEAL_STEPS.indexOf(id) + 1;

export type RevealMotion = {
  /** Edges draw, the ring closes, the zoom scales. */
  animate: boolean;
  /** Steps cross-fade. */
  fade: boolean;
};

/** Reduced motion (§25.11): no drawing and no fade; each step simply appears, and Continue moves on. */
export const revealMotion = (reducedMotion: boolean): RevealMotion =>
  reducedMotion ? { animate: false, fade: false } : { animate: true, fade: true };
