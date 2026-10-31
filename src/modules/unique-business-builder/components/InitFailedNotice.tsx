import { useUniqueBusiness } from "../UniqueBusinessContext";

/**
 * Shown by Workshop screens when the initial fetch failed or took over 8 s (#263).
 * One short line and «Try again»; never endless skeletons, never an empty canvas
 * that would read as «nothing made yet».
 */
export function InitFailedNotice() {
  const { retryInit } = useUniqueBusiness();
  return (
    <div className="mx-auto max-w-3xl space-y-3 py-8" role="alert">
      <p className="text-sm" style={{ color: "var(--skin-text-primary, #0b2a5a)" }}>
        Could not load your canvas.
      </p>
      <button
        type="button"
        onClick={retryInit}
        className="rounded-md border px-3 py-1.5 text-sm"
        style={{ borderColor: "var(--skin-text-primary, #0b2a5a)", color: "var(--skin-text-primary, #0b2a5a)" }}
      >
        Try again
      </button>
    </div>
  );
}
