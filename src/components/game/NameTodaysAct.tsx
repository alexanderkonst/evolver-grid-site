import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useStreakActs } from "@/hooks/useStreakActs";
import { ACT_TEXT_MAX, type StreakSource } from "@/lib/streak";

/**
 * NameTodaysAct — the one-line «Name today's act» input (spec row A13, issue #368).
 *
 * Sits where a real act completes: the practice done screen, ModuleOutro (a Journey step), the
 * reveal's micro-quest done screen. The player names what they really did in their own words
 * («wrote to a client»); that named act, never an app open, extends the streak on Your House.
 *
 * It never blocks the screen's own button, and it renders nothing for a guest, while the
 * `streak_acts` table is missing, or while loading. Once today's act is named it becomes one quiet
 * line with the words. No shame: skipping it costs nothing.
 *
 * `scene` wears the Journey form's classes (ModuleForm.css); `plain` is for Tailwind screens.
 */

type Props = {
  source: StreakSource;
  variant?: "scene" | "plain";
  className?: string;
};

const NameTodaysAct = ({ source, variant = "scene", className }: Props) => {
  const { t } = useTranslation();
  const { available, loading, todayText, nameAct } = useStreakActs();
  const labelId = useId();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (!available || loading) return null;

  const scene = variant === "scene";

  if (todayText) {
    return (
      <p
        className={
          scene
            ? `mf__rate-note${className ? ` ${className}` : ""}`
            : `text-sm text-white/80${className ? ` ${className}` : ""}`
        }
        role="status"
      >
        {t("streak.named", { text: todayText, defaultValue: "Today's act: {{text}}" })}
      </p>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setNote(null);
    const res = await nameAct(source, draft);
    setSaving(false);
    if (res.ok === false) setNote(res.message);
  };

  const label = t("streak.nameToday", { defaultValue: "Name today's act" });
  const placeholder = t("streak.placeholder", { defaultValue: "e.g. wrote to a client" });
  const button = t("streak.nameIt", { defaultValue: "Name it" });
  const noteId = `${labelId}-note`;

  return (
    <form
      className={
        scene
          ? `mf__choice${className ? ` ${className}` : ""}`
          : `flex flex-col items-center gap-2 w-full max-w-md mx-auto${className ? ` ${className}` : ""}`
      }
      onSubmit={submit}
      aria-describedby={note ? noteId : undefined}
    >
      <label
        htmlFor={`${labelId}-act`}
        className={scene ? "mf__choice-q" : "text-sm font-medium text-white"}
      >
        {label}
      </label>
      <input
        id={`${labelId}-act`}
        type="text"
        className={
          scene
            ? "mf__choice-input"
            : "w-full rounded-xl border border-white/40 bg-white/20 px-4 py-3 text-white placeholder:text-white/60 focus-visible:outline-none focus-visible:border-white"
        }
        style={scene ? { minHeight: 0 } : undefined}
        maxLength={ACT_TEXT_MAX}
        placeholder={placeholder}
        value={draft}
        disabled={saving}
        autoComplete="off"
        onChange={(e) => setDraft(e.target.value)}
      />
      <button
        type="submit"
        className={
          scene
            ? "mf__choice-btn"
            : "px-6 py-2 rounded-xl bg-white/20 text-white text-sm border border-white/30 hover:bg-white/30 transition-all disabled:opacity-50"
        }
        disabled={saving || draft.trim().length === 0}
      >
        {button}
      </button>
      <p className={scene ? "mf__rate-note" : "text-xs text-white/80"} id={noteId} role="status">
        {note}
      </p>
    </form>
  );
};

export default NameTodaysAct;
