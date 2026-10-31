import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FONTS_HREF } from "@/lib/gameFonts";
import { NEW_GAME_PATH, markIntroSeen } from "@/lib/firstVisit";
import { RECEPTION, VILLAGE_MAP } from "@/data/villagePlaces";
import brandLogo from "@/assets/you-be-original-main-lockup.webp";
import "./WordlessIntro.css";

/**
 * WordlessIntro — the first minute, with no words (WP-18).
 *
 * Design: docs/02-strategy/game_of_being_you.md §14.2 (Journey J0), §14.3 (open/new
 * state language). A new player sees the dark village, every place unlit, and one faint
 * light breathing where Reception is. Any gesture (tap, click, swipe, scroll, any key)
 * lights Reception; then its name and line fade in and ENTER appears. ENTER goes straight to
 * the first question of the uniqueness test (NEW_GAME_PATH): two clicks from the splash. The
 * village comes after the answer, as the reward (the reveal ends in «Enter the village»).
 *
 * Before the first gesture the scene reads as night (map dimmed + a night veil) and a quiet
 * "Tap or press any key" cue plus a quiet Skip are visible (WP-7a).
 *
 * Phases: dark → lit (light spreads, ~1.5 s) → ready (name, line, ENTER).
 * prefers-reduced-motion: dark → ready at once, no animation (see the CSS).
 * Mounted by GameTitle only on a first visit (src/lib/firstVisit.ts).
 */

const IDLE_NUDGE_MS = 8000; // no gesture for this long: the breathing light strengthens
const READY_MS = 2600; // light has spread (~1.5 s) and name + line have faded in; ENTER can take focus

type Phase = "dark" | "lit" | "ready";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Map geometry for the CSS: image ratio and where Reception sits (fractions of the image). */
const STAGE = {
  "--wi-ratio": VILLAGE_MAP.width / VILLAGE_MAP.height,
  "--wi-rx": RECEPTION.x / 100,
  "--wi-ry": RECEPTION.y / 100,
} as CSSProperties;

type Props = {
  /** Skip affordance: leave the intro and show the title menu. */
  onSkip: () => void;
};

const WordlessIntro = ({ onSkip }: Props) => {
  const [phase, setPhase] = useState<Phase>("dark");
  const [eager, setEager] = useState(false);
  const enterRef = useRef<HTMLAnchorElement>(null);

  // Fonts + tab title, scoped like the title screen.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
    const prevTitle = document.title;
    document.title = "The Game of Being You · FindYourTopTalent";
    return () => {
      link.remove();
      document.title = prevTitle;
    };
  }, []);

  // A signed-in player whose session is not visible to the synchronous check
  // never needs the intro.
  useEffect(() => {
    let live = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (live && data.session?.user?.id) {
          markIntroSeen();
          onSkip();
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [onSkip]);

  const light = useCallback(() => {
    // The world answered: this browser has had its first minute.
    markIntroSeen();
    setPhase((p) => (p === "dark" ? "lit" : p));
  }, []);

  // Any gesture, anywhere. Listeners go away once Reception is lit.
  useEffect(() => {
    if (phase !== "dark") return;
    const onGesture = (e: Event) => {
      const target = e.target as Element | null;
      if (target?.closest?.("[data-wi-skip]")) return; // the skip affordance is not a gesture
      if (e instanceof KeyboardEvent) {
        if (e.metaKey || e.ctrlKey || e.altKey) return; // browser shortcuts
        if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) return;
      }
      light();
    };
    // Every pointer path, not only pointerdown: a mouse click, a tap and a touch each advance
    // like a key press. Capture phase, so a handler further down that stops propagation
    // cannot swallow the gesture. `light` is idempotent, so several events for one click are fine.
    const events = ["pointerdown", "mousedown", "touchstart", "touchmove", "click", "wheel", "keydown"] as const;
    const options = { passive: true, capture: true } as const;
    events.forEach((name) => window.addEventListener(name, onGesture, options));
    return () => events.forEach((name) => window.removeEventListener(name, onGesture, options));
  }, [phase, light]);

  // After ~8 s with no gesture the breathing light grows a little stronger (still no words).
  useEffect(() => {
    if (phase !== "dark") return;
    const id = window.setTimeout(() => setEager(true), IDLE_NUDGE_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  // lit → ready: name, line and ENTER arrive after the light has spread.
  useEffect(() => {
    if (phase !== "lit") return;
    const id = window.setTimeout(() => setPhase("ready"), prefersReducedMotion() ? 0 : READY_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  // ENTER takes focus so a keyboard player can press Enter again to go in.
  useEffect(() => {
    if (phase === "ready") enterRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const skip = () => {
    markIntroSeen();
    onSkip();
  };

  return (
    <div className="wi-root" data-phase={phase} data-eager={eager || undefined}>
      <div className="wi-grain" aria-hidden="true" />

      <main className="wi-stage" style={STAGE}>
        {/* Screen readers get what the eyes get, in words. Visually hidden. */}
        {phase === "dark" && (
          <p className="wi-sr">
            The Game of Being You. A village at night, every window dark. One faint light
            breathes at the Reception. Press any key or tap anywhere and it lights.
          </p>
        )}

        <div className="wi-box" aria-hidden="true">
          <img
            className="wi-map wi-map--dark"
            src={VILLAGE_MAP.image}
            width={VILLAGE_MAP.width}
            height={VILLAGE_MAP.height}
            alt=""
            decoding="async"
          />
          <div className="wi-lit">
            <img
              className="wi-map"
              src={VILLAGE_MAP.image}
              width={VILLAGE_MAP.width}
              height={VILLAGE_MAP.height}
              alt=""
              decoding="async"
            />
          </div>
          <span className="wi-night" />
          <span className="wi-bloom" />
          <span className="wi-breath" />
        </div>
        <div className="wi-vignette" aria-hidden="true" />

        {/* The one quiet cue before the first gesture. Visible, not just in the DOM
            (the screen-reader line above says the same in words). Gone once lit. */}
        {phase === "dark" && (
          <div className="wi-brand" aria-hidden="true">
            <img className="wi-brand__logo" src={brandLogo} alt="" decoding="async" />
            <p className="wi-brand__promise">Find your top talent and play the game of being you.</p>
          </div>
        )}
        {phase === "dark" && (
          <p className="wi-cue" aria-hidden="true">
            Tap or press any key
          </p>
        )}

        <div className="wi-copy" aria-live="polite">
          {phase === "ready" && (
            <>
              <h1 className="wi-name">{RECEPTION.name}</h1>
              <p className="wi-line">{RECEPTION.line}</p>
              <Link
                ref={enterRef}
                className="wi-enter"
                to={NEW_GAME_PATH}
                onClick={markIntroSeen}
              >
                ENTER
              </Link>
            </>
          )}
        </div>
      </main>

      <button
        type="button"
        className="wi-skip"
        data-wi-skip
        aria-label="Skip intro"
        onClick={skip}
      >
        <span aria-hidden="true">Skip »</span>
      </button>
    </div>
  );
};

export default WordlessIntro;
