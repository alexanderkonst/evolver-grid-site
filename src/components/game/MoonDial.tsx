import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import BiologicClock from "@/components/game/BiologicClock";
import MoonFocusLine from "@/components/game/MoonFocusLine";
import { tr } from "@/lib/villageCopy";
import "./MoonDial.css";

/**
 * MoonDial — the Equilibrium watch on the village map (village-as-dashboard step 2; #385, #405). A
 * compact BiologicClock in the top-right corner of the map frame (the Village mounts it inside
 * `vl-frame`): view 1 is the dial alone; views 2–3 drop a card (≤ 340 px) from it over the map. The
 * player's own Moon Focus is under the Moon block of that card, so nothing runs under the place
 * labels. On a phone the open card pushes «Your next move» down (`onPush`) instead of covering it. Do now is gone (PR #380): the clock shows cycles, never actions. The view is remembered
 * for the village separately from the profile.
 */

/** The village switches to its one-column phone layout (map in the flow, «Your next move» below) at this width. */
export const PHONE_QUERY = "(max-width: 767px)";
/** Air between the open card and the block pushed down under it, px. */
const PUSH_GAP = 12;

/**
 * How far the open watch (dial + card) runs past the bottom of the map frame, plus a little air, px; 0 when it
 * fits inside. On the phone the card hangs below the frame, over «Your next move»: the village adds this much
 * space under the frame so the card pushes that block down instead of covering it (v6.3 item 1).
 */
export const clockPush = (watchTop: number, watchHeight: number, frameHeight: number): number => {
  const over = watchTop + watchHeight - frameHeight;
  return over > 0 ? Math.ceil(over + PUSH_GAP) : 0;
};

/**
 * Reports `clockPush` for the watch inside its map frame on a phone (0 elsewhere): measured on mount, whenever
 * the watch or the frame changes size (a view change, a long Moon Focus, a rotation), and when the screen
 * crosses the phone width.
 */
const useClockPush = (onPush?: (px: number) => void) => {
  const ref = useRef<HTMLElement>(null);
  const cb = useRef(onPush);
  cb.current = onPush;
  useEffect(() => {
    const el = ref.current;
    const frame = el?.closest<HTMLElement>(".vl-frame");
    if (!el || !frame || typeof window === "undefined") return;
    const phone = typeof window.matchMedia === "function" ? window.matchMedia(PHONE_QUERY) : null;
    const measure = () => {
      cb.current?.(phone?.matches ? clockPush(el.offsetTop, el.offsetHeight, frame.offsetHeight) : 0);
    };
    measure();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    ro?.observe(frame);
    phone?.addEventListener?.("change", measure);
    return () => {
      ro?.disconnect();
      phone?.removeEventListener?.("change", measure);
      cb.current?.(0);
    };
  }, []);
  return ref;
};

export const MoonDial = ({ className, onPush }: { className?: string; onPush?: (px: number) => void }) => {
  const { t } = useTranslation();
  const ref = useClockPush(onPush);
  return (
    <aside ref={ref} className={`moon-dial${className ? ` ${className}` : ""}`} aria-label={tr(t, "village.dial.aria", "Moon dial: tonight in Equilibrium")}>
      <BiologicClock className="moon-dial__clock" placement="card" place="village">
        <MoonFocusLine redirect="/village" />
      </BiologicClock>
    </aside>
  );
};

export default MoonDial;
