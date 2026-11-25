import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { parseBirthdate } from "../lib/parseBirthdate";

interface BirthdayPromptProps {
  /** Currently-known BD from equilibrium_state. When null, the prompt renders. */
  birthday: string | null;
  /** True while initial fetch is in flight — prevents flashing the prompt before we know. */
  loading: boolean;
  /** Auth user ID — required to persist. Prompt is hidden when null. */
  userId: string | null;
  /** Called after a successful save so the hook can refresh state. */
  onSaved: (newBirthday: string) => void;
  /** Optional «Not now» (also closes on Escape). Every caller passes it, so the prompt never traps a player. */
  onDismiss?: () => void;
  /** Cover the whole viewport instead of offsetting for the Equilibrium page's side rails
   *  (the village clock sits outside that layout). */
  fullViewport?: boolean;
}

/**
 * Birthday-prompt modal for v2.
 *
 * v1.x had a vanilla-HTML overlay inside the standalone Vite app. v2 needs
 * its own React-native equivalent — the spec called for "reuse the existing
 * v1.x BD prompt overlay" but that overlay lives only in the standalone
 * /equilibrium/ static app, not in the React shell.
 *
 * Shows when: authed user + birthday is null + initial fetch resolved.
 *
 * Persists to **`equilibrium_state.birthday`** on save (YYYY-MM-DD).
 *
 * History: originally targeted `game_profiles.birthday` — but that column
 * doesn't exist (only `equilibrium_users.birthday` exists on the v1.x
 * Telegram-bot table). Moved to `equilibrium_state` 2026-05-16 since
 * birthday is v2-specific user state and that's where the v2 state lives.
 * Requires the migration in
 *   `supabase/migrations/20260516000000_add_birthday_to_equilibrium_state.sql`.
 */
export const BirthdayPrompt = ({
  birthday,
  loading,
  userId,
  onSaved,
  onDismiss,
  fullViewport = false,
}: BirthdayPromptProps) => {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Lock body scroll while open. Defensive cleanup (2026-05-16 round 7,
  // Sasha bug report): page wasn't scrolling after BD save. Root cause —
  // restoring `prev` could carry forward a stale "hidden" value captured
  // mid-cycle, leaving the body locked even after the prompt closed.
  // Fix: unconditionally CLEAR the inline overflow on cleanup so the body
  // returns to its CSS default (scrollable). The lock is purely a modal-
  // ergonomics concern; no other code in the app relies on us preserving
  // the previous inline value.
  useEffect(() => {
    if (loading || !userId || birthday) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading, userId, birthday]);

  // Escape closes the modal when the caller allows dismissing.
  useEffect(() => {
    if (loading || !userId || birthday || !onDismiss) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [loading, userId, birthday, onDismiss]);

  if (loading || !userId || birthday) return null;
  if (typeof document === "undefined") return null;

  const parsed = parseBirthdate(value);
  const showInvalid = value.trim().length >= 8 && !parsed;

  const save = async () => {
    if (!parsed || saving) return;
    const value = parsed;
    setSaving(true);

    // 1) ALWAYS write to localStorage first. This unblocks the user
    //    immediately — the cycle math reads from this on next render via
    //    useEquilibriumV2's localStorage fallback. The watch works even
    //    if the Supabase migration hasn't been applied yet (or fails for
    //    any other reason).
    try {
      window.localStorage.setItem(
        `equilibrium_v2_birthday:${userId}`,
        value,
      );
    } catch {
      /* localStorage unavailable; we'll still try the server. */
    }

    // 2) Try Supabase upsert. UPSERT pattern because equilibrium_state
    //    may not yet have a row for this user (it's lazily created the
    //    first time any v2 surface writes). `eqAny` cast because the
    //    generated types haven't been regenerated since the 2026-05-16
    //    migration that added the column.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eqAny = supabase as any;
    const { error: err } = await eqAny
      .from("equilibrium_state")
      .upsert(
        { user_id: userId, birthday: value, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    setSaving(false);

    if (err) {
      // Server save failed (likely: migration not yet applied, RLS
      // mismatch, or transient network issue). DON'T block the user —
      // localStorage already has the value and the watch will use it.
      // Log for debugging; user proceeds.
      console.warn(
        "[BirthdayPrompt] Supabase save failed; using localStorage fallback. Error:",
        err,
      );
    }

    // Proceed regardless — localStorage always has the value at this
    // point. Cross-device sync resumes once the column exists + an
    // upsert succeeds on a later session.
    onSaved(value);
  };

  // Portaled to <body>: an ancestor with transform/filter/contain (the village
  // MoonDial card) becomes the containing block for `fixed` and crushed the
  // modal to a ~75px column at 1440 (#415).
  return createPortal(
    <div
      className={cn(
        // Bounded to the 3rd pane on desktop — offset for SpacesRail
        // (280px) + SectionsPanel (260px) = 540px. On mobile the rails
        // collapse/overlay so we cover the full viewport. Sasha
        // 2026-05-16: modal should center within content pane, not full
        // window. `fullViewport` (village clock) skips the offset.
        "fixed top-0 right-0 bottom-0 left-0",
        !fullViewport && "lg:left-[540px]",
        "z-[100] flex items-center justify-center p-4",
      )}
      // Issue #443 (A5): a solid scrim, no backdrop-filter. A blurred layer is the one
      // thing that can stay painted after the portal unmounts ("Not now" left the blur up).
      style={{ background: "rgba(5, 6, 8, 0.86)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bd-prompt-title"
    >
      <div
        className="w-full max-w-sm rounded-md border border-white/15 bg-[#0b0c0f] p-8 text-center text-white/90"
      >
        <h2
          id="bd-prompt-title"
          className="mb-3 font-serif text-lg font-medium uppercase tracking-[0.22em] text-white/90"
        >
          When were you born?
        </h2>
        <p className="mb-6 text-sm text-white/60">
          Your birthday anchors your personal solar cycle. Stored privately —
          never shown.
        </p>

        {/* Onboarding QA (2026-10-21): was <input type="date">, which can't
            be pasted into and makes typing a full year fiddly. A text
            field parsed by parseBirthdate accepts typed or pasted dates
            (1990-03-25, 25.03.1990, 25/03/1990). */}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          placeholder="YYYY-MM-DD"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && parsed) void save();
          }}
          aria-invalid={showInvalid}
          aria-describedby={showInvalid ? "bd-prompt-hint" : undefined}
          autoFocus
          className="mb-2 w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-center font-mono text-base text-white outline-none placeholder:text-white/30 focus:border-white/60"
        />
        <p
          id="bd-prompt-hint"
          className="mb-2 min-h-[1.25rem] text-xs text-white/50"
          role={showInvalid ? "alert" : undefined}
        >
          {showInvalid
            ? "Use year-month-day, like 1990-03-25."
            : "Type or paste your full date."}
        </p>

        <button
          type="button"
          onClick={save}
          disabled={!parsed || saving}
          className="mt-2 w-full rounded-md border border-white/40 bg-transparent px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors hover:border-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="mt-3 min-h-[44px] font-mono text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            Not now
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default BirthdayPrompt;
