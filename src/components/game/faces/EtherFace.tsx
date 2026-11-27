/**
 * The ether face of the navigation instrument: Path (docs/specs/navigation-instrument/architecture.md §6,
 * GoBY §25: ether = the path, the one next move). A lens, never a map: it shows the one next move and
 * nothing else. Choosing it closes the instrument and draws one ink line to the glowing place, then the
 * line fades (`InkLine.tsx`, phase 3).
 *
 * It reads the same `nextMove` the map card, the rail glow and the top bar read (`usePlayerNextMove`), so
 * the four never disagree. The constellation (known steps bright, heard-of steps faint) is phase 8 and waits
 * on the path v1 review: its slot below stays empty and renders nothing.
 */
import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Route, X } from "lucide-react";
import { QuarterSign } from "@/components/game/QuarterSign";
import { usePlayerNextMove } from "@/hooks/usePlayerNextMove";
import type { FaceProps } from "@/lib/instrument/faces";
import type { NextMove } from "@/lib/placeState";
import { tr } from "@/lib/villageCopy";

const ACCENT = "#bcd7e6";
const INK = "#e8eef2";
const MUTED = "#9fb2bd";
const PANEL = "#0b0e13";
const RAISED = "#121820";
const HAIRLINE = "rgba(188,215,230,0.18)";
const SERIF = "'Cormorant Garamond', serif";
const EASE = "cubic-bezier(0.22, 0.8, 0.24, 1)";

type ViewProps = Omit<FaceProps, "ownerId"> & {
  /** The one next move, or null (not loaded, or nothing open to offer). */
  move: NextMove | null;
  /** Its words in the reader's language: `nextMoveCopy`. */
  copy: { place: string; title: string; result: string } | null;
  /** The save has loaded; until then the face waits instead of saying there is nothing to point to. */
  ready?: boolean;
};

/** The face itself, from a move. `EtherFace` below feeds it the player's own. */
export const EtherFaceView = ({ move, copy, ready = true, reduced, closeMs, active, onBack, onClose, onShowWay }: ViewProps) => {
  const { t } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Once the face is forward, focus moves in.
  useEffect(() => {
    if (active) panelRef.current?.focus();
  }, [active]);

  // Choosing the move closes the instrument and asks the host for the line.
  const choose = () => {
    if (onShowWay) onShowWay();
    else onClose();
  };

  return (
    <div
      ref={panelRef}
      role="region"
      aria-labelledby={titleId}
      aria-busy={!ready}
      tabIndex={-1}
      data-face-root="ether"
      className="pointer-events-auto relative flex max-h-full w-full flex-col gap-3 overflow-y-auto rounded-2xl p-4 outline-none sm:w-[26rem]"
      style={{
        backgroundColor: PANEL,
        border: `1px solid ${HAIRLINE}`,
        boxShadow: "0 28px 60px -14px rgba(0,0,0,0.75)",
        color: INK,
        transformOrigin: "bottom right",
        opacity: active ? 1 : 0,
        transform: active || reduced ? "none" : "translateY(28px) scale(0.9)",
        transition: `opacity ${closeMs}ms ${EASE}, transform ${closeMs}ms ${EASE}`,
      }}
    >
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("instrument.back")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]"
          style={{ color: MUTED }}
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </button>
        <span aria-hidden="true" className="block">
          <QuarterSign element="ether" lit size={40} />
        </span>
        <h2 id={titleId} className="min-w-0 flex-1 text-xl leading-tight" style={{ fontFamily: SERIF, fontWeight: 600, color: INK }}>
          {tr(t, "etherFace.title", "Path")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("instrument.close")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]"
          style={{ color: MUTED }}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      {ready && !move && (
        <p className="rounded-xl p-3 text-[13px]" style={{ backgroundColor: RAISED, color: MUTED }}>
          {tr(t, "etherFace.none", "Nothing to point to yet.")}
        </p>
      )}

      {move && copy && (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[12px] uppercase tracking-[0.14em]" style={{ color: MUTED }}>
            {tr(t, "etherFace.label", "Your next move")}
          </p>
          <button
            type="button"
            data-testid="ether-next-move"
            data-place={move.place.key}
            onClick={choose}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]"
            style={{ backgroundColor: RAISED, border: `1px solid ${HAIRLINE}`, color: INK }}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold leading-tight">{copy.title}</span>
              <span className="mt-0.5 block text-[13px] leading-snug" style={{ color: MUTED }}>
                {copy.place} · {copy.result}
              </span>
              <span className="mt-1 block text-[12px]" style={{ color: ACCENT }}>
                {tr(t, "etherFace.go", "Show me the way")}
              </span>
            </span>
            <Route aria-hidden="true" className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
          </button>
        </div>
      )}

      {/* Phase 8: the constellation (known steps bright, heard-of steps faint) fills this slot after the path v1 review. Empty on purpose. */}
    </div>
  );
};

/** The face registered in the ether slot (`src/lib/instrument/faces.ts`): the view over the player's own next move. */
const EtherFace = (face: FaceProps) => {
  const { move, copy, ready } = usePlayerNextMove();
  return <EtherFaceView move={move} copy={copy} ready={ready} {...face} />;
};

export default EtherFace;
