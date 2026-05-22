/**
 * LockedCascadeDialog — Day 74 (Sasha 2026-05-22).
 *
 * After the user locks an artifact whose transitive downstream descendants
 * are also locked, this dialog asks: "Re-derive N downstream artifacts?"
 *
 * Yes → starts a Bulk Improve cascade on those descendants (topologically
 * ordered, with per-artifact accept/reject via the existing review drawer).
 * Not now → dismiss; the staleness banner remains for later.
 *
 * Driven by `lockedCascadePrompt` state in UniqueBusinessContext. Renders
 * nothing when that slice is null.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { ARTIFACT_LABELS } from "../constants";

export function LockedCascadeDialog() {
  const {
    lockedCascadePrompt,
    dismissLockedCascadePrompt,
    startBulkImprove,
  } = useUniqueBusiness();

  const open = !!lockedCascadePrompt;
  const prompt = lockedCascadePrompt;

  // Pre-compute display data before the early-return branch so we don't
  // re-render the dialog with stale labels mid-close.
  const lockedLabel = prompt ? ARTIFACT_LABELS[prompt.lockedKey] : "";
  const candidates = prompt?.candidates ?? [];
  const n = candidates.length;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) dismissLockedCascadePrompt();
      }}
    >
      <AlertDialogContent
        className="liquid-glass-dark sm:max-w-[480px]"
        style={{
          background: "rgba(10, 18, 34, 0.85)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          color: "rgba(245, 241, 232, 0.94)",
          border: "0.5px solid rgba(212, 175, 55, 0.32)",
          boxShadow:
            "inset 0 1px 0 0 rgba(255, 255, 255, 0.18), 0 24px 60px -18px rgba(10, 22, 40, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.18)",
        }}
      >
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle asChild>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                style={{
                  color: "#f4d472",
                  textShadow: "0 0 14px rgba(244,212,114,0.7)",
                  fontSize: "18px",
                }}
              >
                ✦
              </span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "22px",
                  letterSpacing: "-0.005em",
                  color: "rgba(245, 241, 232, 0.96)",
                }}
              >
                Re-derive {n} downstream?
              </span>
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontSize: "14px",
                color: "rgba(245, 241, 232, 0.74)",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ fontStyle: "normal", fontWeight: 600 }}>
                {lockedLabel}
              </strong>{" "}
              just locked. {n === 1 ? "One artifact derives" : `${n} artifacts derive`} from
              it and {n === 1 ? "may be" : "may all be"} stale. Improve them now to carry
              the change downstream — you'll review each one.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {candidates.length > 0 && (
          <ul
            className="mt-3 max-h-[180px] space-y-1 overflow-y-auto rounded-lg p-3"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "0.5px solid rgba(255, 255, 255, 0.10)",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "12.5px",
              color: "rgba(245, 241, 232, 0.82)",
            }}
          >
            {candidates.map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  style={{ color: "rgba(244, 212, 114, 0.8)", fontSize: "9px" }}
                >
                  ●
                </span>
                <span>{ARTIFACT_LABELS[k]}</span>
              </li>
            ))}
          </ul>
        )}

        <AlertDialogFooter className="mt-4 flex-row justify-end gap-2">
          <AlertDialogCancel
            className="rounded-full px-4 py-2 transition-all"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.03em",
              color: "rgba(245, 241, 232, 0.78)",
              background: "rgba(255, 255, 255, 0.06)",
              border: "0.5px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            Not now
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (prompt) startBulkImprove(prompt.candidates);
              dismissLockedCascadePrompt();
            }}
            className="rounded-full px-4 py-2 transition-all"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.03em",
              color: "#3a2c08",
              background: "linear-gradient(135deg, #f4d472, #d4af37)",
              border: "0.5px solid rgba(212, 175, 55, 0.65)",
              boxShadow: "0 4px 14px -4px rgba(212, 175, 55, 0.5)",
            }}
          >
            Re-derive all {n}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
