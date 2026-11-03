import { useEffect, useState, type CSSProperties } from "react";
import "./ColouringImage.css";

/**
 * ColouringImage — the colouring mechanic (issue #313, docs/templates/module-form.md §12.5a).
 *
 * The player colours the game: a module's Landing image is greyscale; when the person gets the
 * result, the SAME image comes to full colour on the Final screen. One component, two modes:
 *
 *   mode="grey"    Landing. Greyscale + a slight dim so the headline reads.
 *   mode="arrive"  Final. Greyscale → full colour once, washing outward from `origin`
 *                  (the crystal). Plain fade where CSS masks are missing; colour at once under
 *                  `prefers-reduced-motion`.
 *
 * It paints an absolutely positioned layer (`inset: 0`) behind its parent, which must be
 * `position: relative` (`.cb-landing`, `.cb-hero`) and give the stacking context.
 *
 * `done` (from `useColouringArrival`): the wash already played in this visit, so a re-render or
 * a remount shows the colour without playing it again («once on arrival»).
 */

/** Top Talent: a moonlit courtyard, a crystal casting one golden ray into one open door. */
export const TOP_TALENT_COURTYARD = "/images/modules/top-talent-courtyard.webp";
/** Where the colour starts from in that image: the crystal, centred, about a fifth down. */
export const TOP_TALENT_COURTYARD_ORIGIN = { x: 50, y: 22 } as const;

const played = new Set<string>();

/**
 * True when `key` has already arrived in colour earlier in this visit. It is read once, at
 * mount, and marked after mount (a pure initialiser, so StrictMode's double render is safe).
 */
export const useColouringArrival = (key: string): boolean => {
  const [done] = useState(() => played.has(key));
  useEffect(() => {
    played.add(key);
  }, [key]);
  return done;
};

/** Test hook: forget what has played. */
export const resetColouringArrivals = () => played.clear();

type Props = {
  mode: "grey" | "arrive";
  image?: string;
  origin?: { x: number; y: number };
  /** `arrive` only: the wash already played, show colour straight away. */
  done?: boolean;
  /** Length of the wash in ms. The brief: about 2.5–3 s. */
  durationMs?: number;
};

const ColouringImage = ({
  mode,
  image = TOP_TALENT_COURTYARD,
  origin = TOP_TALENT_COURTYARD_ORIGIN,
  done = false,
  durationMs = 2800,
}: Props) => {
  const [ready, setReady] = useState(false);
  const style = {
    "--cb-ox": `${origin.x}%`,
    "--cb-oy": `${origin.y}%`,
    "--cb-dur": `${durationMs}ms`,
  } as CSSProperties;

  if (mode === "grey") {
    return (
      <div className="cb-art cb--grey" style={style} aria-hidden="true">
        <img className="cb-art__img cb-art__img--grey" src={image} alt="" decoding="async" draggable={false} />
        <div className="cb-art__scrim" />
      </div>
    );
  }

  return (
    <div className={`cb-art cb--arrive${done ? " cb--done" : ""}`} style={style} aria-hidden="true">
      <img className="cb-art__img cb-art__img--grey" src={image} alt="" decoding="async" draggable={false} />
      <img
        className="cb-art__img cb-art__img--colour"
        src={image}
        alt=""
        decoding="async"
        draggable={false}
        data-ready={done ? undefined : ready}
        onLoad={() => setReady(true)}
        // A cached image can finish before React attaches `onLoad`.
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) setReady(true);
        }}
      />
      <div className="cb-art__scrim" />
    </div>
  );
};

export default ColouringImage;
