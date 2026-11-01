import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopTalentAuthGate from "@/modules/zone-of-genius/TopTalentAuthGate";

/**
 * KeepItLit: the guest's save, moved to after the reveal (cult spec §6 W5).
 *
 * Under the reveal card a guest sees one button, «Keep your light lit», and a quiet way on.
 * No email field is on screen until the player taps it, so the card is seen first and the
 * address is asked for second. The form itself is the same save as before
 * (`TopTalentAuthGate inline`, the `save-anonymous-zog` function and the magic link); only the
 * words changed.
 *
 * Callers render this for guests only. A signed-in player never reaches it: their reveal is
 * saved already, so the step is skipped.
 */

type Props = {
  resultPayload: Record<string, unknown>;
  assessmentVersion: string;
  /** True when the result is already in the player's account. */
  saved?: boolean;
  onSaved?: (email: string) => void;
};

const KeepItLit = ({ resultPayload, assessmentVersion, saved = false, onSaved }: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const title = t("zogEntry.saveCharacterModalTitle");

  if (open) {
    return (
      <TopTalentAuthGate
        inline
        saved={saved}
        resultPayload={resultPayload}
        assessmentVersion={assessmentVersion}
        title={title}
        onSaved={onSaved}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center" data-testid="keep-it-lit">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full max-w-sm rounded-full px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
        style={{
          backgroundImage: "linear-gradient(135deg, #a06d08 0%, #7a5108 100%)",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        {title}
      </button>
      <Link
        to="/village"
        className="text-sm underline underline-offset-4 transition-opacity hover:opacity-100"
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
          textDecorationColor: "rgba(26,30,58,0.3)",
          opacity: 0.9,
        }}
      >
        {t("zogEntry.keepLitNotNow")}
      </Link>
    </div>
  );
};

export default KeepItLit;
