import { useTranslation } from "react-i18next";

/**
 * SaveErrorToastBody — Issue #50 (Sasha 2026-10-14), item 1.
 *
 * Users must never read a raw PostgREST line like
 * `[PGRST204] Could not find the 'output_language' column…` in a toast.
 * This renders a short, friendly, localized line and tucks the raw
 * diagnostic (`[code] message — details`) behind a small, collapsed
 * `<details>` disclosure. The raw payload also stays in `console.error`
 * at the call site (see `supabaseErrorFields`), so prod debugging keeps
 * the full picture.
 *
 * Works as a ReactNode inside both the shadcn toast (`description`) and the
 * sonner toast (`toast.error(<SaveErrorToastBody … />)`), so every ZoG +
 * Mission save path can share one friendly-error surface.
 */
export function SaveErrorToastBody({
  detail,
  isSchemaDrift,
}: {
  /** The raw, already-formatted diagnostic string. Hidden by default. */
  detail: string;
  /** Schema-drift failures (missing column/table) get their own line. */
  isSchemaDrift: boolean;
}) {
  const { t } = useTranslation();

  const friendly = isSchemaDrift
    ? t("errors.schemaDriftBody")
    : t("errors.saveGenericBody");

  // Only show the disclosure when there's a meaningful detail to reveal.
  const hasDetail = Boolean(detail && detail.trim());

  return (
    <div className="space-y-1.5">
      <p>{friendly}</p>
      {hasDetail && (
        <details className="group">
          <summary className="cursor-pointer select-none text-[11px] uppercase tracking-wide opacity-60 transition-opacity hover:opacity-90">
            {t("errors.detailsLabel")}
          </summary>
          <code className="mt-1 block whitespace-pre-wrap break-words font-mono text-[11px] leading-snug opacity-70">
            {detail}
          </code>
        </details>
      )}
    </div>
  );
}
