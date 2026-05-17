import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface BirthdayPromptProps {
  /** Currently-known BD from equilibrium_state. When null, the prompt renders. */
  birthday: string | null;
  /** True while initial fetch is in flight — prevents flashing the prompt before we know. */
  loading: boolean;
  /** Auth user ID — required to persist. Prompt is hidden when null. */
  userId: string | null;
  /** Called after a successful save so the hook can refresh state. */
  onSaved: (newBirthday: string) => void;
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

  if (loading || !userId || birthday) return null;

  const save = async () => {
    if (!value || saving) return;
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

  return (
    <div
      className={cn(
        // Bounded to the 3rd pane on desktop — offset for SpacesRail
        // (280px) + SectionsPanel (260px) = 540px. On mobile the rails
        // collapse/overlay so we cover the full viewport. Sasha
        // 2026-05-16: modal should center within content pane, not full
        // window.
        "fixed top-0 right-0 bottom-0 left-0 lg:left-[540px]",
        "z-[100] flex items-center justify-center p-4",
      )}
      style={{
        background: "rgba(10, 22, 40, 0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bd-prompt-title"
    >
      <div
        className="liquid-glass-strong w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          background: "rgba(255,255,255,0.55)",
        }}
      >
        <h2
          id="bd-prompt-title"
          className="eq-text-halo mb-2 font-serif text-2xl font-semibold text-[#0a1628]"
        >
          When were you born?
        </h2>
        <p className="eq-text-halo mb-6 text-sm text-[#0a1628]/95">
          Your birthday anchors your personal solar cycle. Stored privately —
          never shown.
        </p>

        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          min="1900-01-01"
          autoFocus
          className="mb-4 w-full rounded-xl border border-[#0a1628]/15 bg-white/85 px-4 py-3 text-center text-base text-[#0a1628] outline-none focus:border-[#0a1628]/40"
          style={{
            boxShadow:
              "inset 0 2px 4px rgba(10,22,40,0.08), inset 0 -1px 0 rgba(255,255,255,0.8)",
          }}
        />

        <button
          type="button"
          onClick={save}
          disabled={!value || saving}
          className="liquid-glass-dark mt-2 w-full rounded-full px-6 py-3 font-semibold text-white transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default BirthdayPrompt;
