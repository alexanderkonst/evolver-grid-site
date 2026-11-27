/**
 * Starts the first reveal (docs/specs/navigation-instrument/architecture.md §5.3, WP7). The rules are
 * `isRevealDue` in `reveal.ts`; this only supplies the inputs and the waiting:
 *   - nothing on first paint (the reveal never starts in the render that mounts it);
 *   - a short rest once it is due, so a signed-in save has merged and a module form has shown itself;
 *   - the once-flag is the `air` entry of `litSeen` (`markRevealSeen`), recorded when the player reaches the
 *     last step, in the save and in this browser.
 * It is mounted by the shell and by the village map (the map has no shell), never by the title, the game
 * intro, the talent reveal or a theme.
 */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import InstrumentReveal from "@/components/game/InstrumentReveal";
import { useLitSeen } from "@/lib/instrument/litSeenStore";
import { isCalmMoment, moduleFormMounted } from "@/lib/instrument/ritual";
import { isRevealDue, REVEAL_SEEN_ELEMENT } from "@/lib/instrument/reveal";

/** Same rest as the ritual: long enough for a signed-in save to merge. */
export const REVEAL_SETTLE_MS = 1200;

export type InstrumentRevealInput = {
  /** The instrument is carried here (the host's gate). The reveal never plays for a player who does not carry it. */
  enabled: boolean;
  /** Signed-in player id, or null for a guest. */
  ownerId: string | null;
  /** A profile exists for this player. */
  profileCreated: boolean;
  /** The top talent result is done (`hasTopTalentResult`). */
  topTalentDone: boolean;
};

export type InstrumentRevealState = {
  playing: boolean;
  /** Reached the last step: record the reveal as seen. */
  onSettled: () => void;
  /** Nothing of the reveal is on screen any more. */
  onDone: () => void;
};

export const useInstrumentReveal = ({ enabled, ownerId, profileCreated, topTalentDone }: InstrumentRevealInput): InstrumentRevealState => {
  const { pathname } = useLocation();
  const [seen, markSeen, seenLoaded] = useLitSeen(ownerId);
  const [playing, setPlaying] = useState(false);
  // Bumped when the moment turned out not to be calm after all: look again.
  const [recheck, bump] = useState(0);

  const calm = isCalmMoment({ pathname, raised: false, inModuleForm: false });
  const due = enabled && isRevealDue({ profileCreated, topTalentDone, seen, seenLoaded, calm, playing });

  useEffect(() => {
    if (!due) return;
    const timer = window.setTimeout(() => {
      if (document.hidden || moduleFormMounted(document)) {
        bump((n) => n + 1);
        return;
      }
      setPlaying(true);
    }, REVEAL_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [due, recheck]);

  const onSettled = useCallback(() => markSeen(REVEAL_SEEN_ELEMENT), [markSeen]);
  const onDone = useCallback(() => setPlaying(false), []);
  return { playing, onSettled, onDone };
};

/** The hook and its scene in one element: renders nothing until the reveal is due and has rested. */
export const InstrumentRevealGate = (input: InstrumentRevealInput) => {
  const { playing, onSettled, onDone } = useInstrumentReveal(input);
  return playing ? <InstrumentReveal onSettled={onSettled} onDone={onDone} /> : null;
};

export default InstrumentRevealGate;
