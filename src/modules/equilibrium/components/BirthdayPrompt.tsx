import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BirthdayPromptProps {
  /** Currently-known BD from game_profiles. When null, the prompt renders. */
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
 * Persists to game_profiles.birthday on save (YYYY-MM-DD).
 */
export const BirthdayPrompt = ({
  birthday,
  loading,
  userId,
  onSaved,
}: BirthdayPromptProps) => {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll while open.
  useEffect(() => {
    if (loading || !userId || birthday) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [loading, userId, birthday]);

  if (loading || !userId || birthday) return null;

  const save = async () => {
    if (!value || saving) return;
    setSaving(true);
    setError(null);
    const { error: err } = await supabase
      .from("game_profiles")
      .update({ birthday: value })
      .eq("user_id", userId);
    setSaving(false);
    if (err) {
      setError("Couldn't save — try again.");
      return;
    }
    onSaved(value);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
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

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

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
