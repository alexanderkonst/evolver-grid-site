import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Languages } from "lucide-react";
import { ZOG_RETAKE_PATH } from "./retake";

/**
 * LanguageMismatchNotice — Issue #50 (Sasha 2026-10-14), item 2;
 * broadened in Issue #52 (Sasha 2026-10-15), item 9.
 *
 * A saved ZoG reading carries the UI language it was generated in
 * (`zog_snapshots.output_language`). This renders a small, quiet label
 * naming the language the reading was written in — shown on every result
 * surface **whenever `output_language` is set**, not only on a mismatch
 * (item 9: the "Generated in…" line was invisible to same-language viewers,
 * so it read as "missing" on the Step-4 result and /game/me/zone-of-genius).
 *
 * When the snapshot's language differs from the current UI language, the
 * label is followed by a "Regenerate in {uiLang}" link — routes to the
 * canonical ZoG retake, which re-runs generation in `i18n.resolvedLanguage`
 * (see saveToDatabase.ts). On a match there is nothing to regenerate, so
 * only the label shows.
 *
 * Renders nothing only when the snapshot's language is unknown (older rows).
 *
 * Visual tone follows AiOsPage's aesthetic-palette / liquid-glass register:
 * a soft skin-token pill, no new palette.
 */

// Display names for the languages the app ships (en / ru / es). Kept here
// rather than in i18n resources so each name renders in its OWN language
// (endonym), which reads clearest in a "generated in X" label.
const LANGUAGE_ENDONYMS: Record<string, string> = {
  en: "English",
  ru: "Русский",
  es: "Español",
};

const displayLanguage = (code: string | null | undefined): string | null => {
  if (!code) return null;
  const base = code.split("-")[0].toLowerCase();
  return LANGUAGE_ENDONYMS[base] ?? code;
};

export function LanguageMismatchNotice({
  snapshotLanguage,
}: {
  snapshotLanguage: string | null | undefined;
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const uiLang = (i18n.resolvedLanguage ?? i18n.language ?? "en").split("-")[0].toLowerCase();
  const snapLang = snapshotLanguage?.split("-")[0].toLowerCase();

  // Nothing to say if we don't know the snapshot language (older rows).
  if (!snapLang) return null;

  const snapName = displayLanguage(snapshotLanguage);
  if (!snapName) return null;

  // Item 9: the "Generated in…" label shows whenever we know the language.
  // The regenerate link only appears when the reading's language differs
  // from the current UI — regenerating into the same language is a no-op.
  const isMismatch = snapLang !== uiLang;
  const uiName = displayLanguage(uiLang);

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-full px-4 py-2 text-[13px]"
      style={{
        background: "var(--skin-card-fill, rgba(255, 255, 255, 0.55))",
        border: "0.5px solid rgba(212, 175, 55, 0.4)",
        color: "var(--skin-text-muted, rgba(26, 30, 58, 0.72))",
      }}
    >
      <span className="inline-flex items-center gap-1.5">
        <Languages className="h-3.5 w-3.5" style={{ color: "var(--skin-accent-gold, #b8860b)" }} aria-hidden="true" />
        {t("zogLanguageNotice.label", { lang: snapName })}
      </span>
      {isMismatch && uiName && (
        <button
          type="button"
          onClick={() => navigate(ZOG_RETAKE_PATH)}
          className="underline underline-offset-4 transition-opacity duration-200 hover:opacity-80"
          style={{ color: "var(--skin-text-primary, #2c3150)" }}
        >
          {t("zogLanguageNotice.regenerate", { lang: uiName })}
        </button>
      )}
    </div>
  );
}
