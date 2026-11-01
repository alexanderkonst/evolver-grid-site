import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { NaturalClockFace } from "./NaturalClockFace";
import type { NaturalClockState } from "./naturalClock";
import type { LocationStatus } from "./useNaturalClock";
import { CLOCK_INK, CLOCK_MONO } from "./NaturalClockMoon";

interface NaturalClockDialogProps {
  clock: NaturalClockState;
  locationStatus: LocationStatus;
  onRequestLocation: () => void;
  onAskBirthday?: () => void;
  onClose: () => void;
}

/** The full face in a sheet over the page. Esc and the backdrop close it. */
export const NaturalClockDialog = ({
  clock,
  locationStatus,
  onRequestLocation,
  onAskBirthday,
  onClose,
}: NaturalClockDialogProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Natural clock"
    >
      <button
        type="button"
        aria-label="Close natural clock"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(5, 8, 12, 0.72)" }}
      />
      <div
        className="relative max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl"
        style={{
          background: "rgba(14, 20, 28, 0.96)",
          border: "1px solid rgba(230, 235, 242, 0.14)",
          color: CLOCK_INK,
          fontFamily: CLOCK_MONO,
        }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5ec8bd]"
        >
          <X size={18} aria-hidden="true" />
        </button>
        <NaturalClockFace
          clock={clock}
          locationStatus={locationStatus}
          onRequestLocation={onRequestLocation}
          onAskBirthday={onAskBirthday}
          className="pt-4"
        />
      </div>
    </div>
  );
};

export default NaturalClockDialog;
