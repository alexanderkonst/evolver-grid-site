import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { trackCTAClick } from "@/lib/funnelAnalytics";

type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ── Save my read (permalink by email) ───────────────────────────────────
// Shared across every result variant (v1 read, EXT read, not-yet, peer).
// Degrades silently: no id yet (save-quiz-result hasn't returned) means
// nothing renders.
//
// Day 139 (Sasha 2026-07-30): "Save my read" asks for an email and sends
// the permalink there. 2026-08-17 audit: as a quiet text link buried on one
// variant it produced 1 email out of 277 completions, so the field is now
// open by default with one line of reason above it, on every variant. The
// read itself stays completely free — the invitation is louder, nothing is
// gated.
export function SaveMyRead({
  t,
  resultId,
  stage,
}: {
  t: (k: string, o?: Record<string, unknown>) => unknown;
  resultId: string | null;
  stage: Stage | null;
}) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const [emailValue, setEmailValue] = useState("");
  const [sent, setSent] = useState(false);

  if (!resultId || typeof window === "undefined") return null;

  const permalink = `${window.location.origin}/quiz/r/${resultId}`;

  const handleSend = () => {
    const trimmed = emailValue.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;
    trackCTAClick("quiz_permalink_saved", "save_my_read_email");
    // Fire-and-forget, same graceful contract as the map email capture.
    supabase.functions
      .invoke("save-quiz-email", {
        body: { email: trimmed, stage, locale, source: `save_read:${resultId}` },
      })
      .catch(() => {});
    // Data hygiene #22: the email belongs on the same row as the read it
    // came from, not only in the separate signups table.
    supabase.functions
      .invoke("save-quiz-result", { body: { id: resultId, email: trimmed } })
      .catch(() => {});
    setSent(true);
  };

  return (
    <div className="tq-save-read" style={{ marginTop: 18 }}>
      {!sent && (
        <>
          <p className="tq-sub tq-quiet-line" style={{ marginBottom: 8 }}>
            {t("quiz.saveRead.invite") as string}
          </p>
          <div className="tq-email-row">
            <input
              type="email"
              className="tq-email-input"
              value={emailValue}
              placeholder={t("quiz.notYet.settled.emailPlaceholder") as string}
              onChange={(e) => setEmailValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button type="button" className="tq-email-cta" onClick={handleSend}>
              {t("quiz.saveRead.sendCta") as string}
            </button>
          </div>
        </>
      )}
      {sent && (
        <p className="tq-sub tq-quiet-line">
          {t("quiz.saveRead.sentConfirmation") as string}{" "}
          <a className="tq-link-quiet" href={permalink}>
            {t("quiz.saveRead.orOpenLink") as string}
          </a>
        </p>
      )}
    </div>
  );
}

export default SaveMyRead;
