import { useState } from "react";
import { useTranslation } from "react-i18next";
import { readGuestTopTalentPayload } from "@/lib/firstVisit";
import { tr } from "@/lib/villageCopy";
import TopTalentAuthGate from "@/modules/zone-of-genius/TopTalentAuthGate";

/**
 * SaveCharacterCta — «Save your character» for a guest who holds a finished Top Talent reading
 * on this device (WP-7b). One button; it opens the same inline save the village door and the
 * Reception reveal use (`TopTalentAuthGate inline`). Renders nothing when the device holds no reading.
 */

type Props = {
  /** Class of the button, so each surface keeps its own look (`vl-enter vl-newcomer`, `mf__go`). */
  buttonClassName?: string;
  /** Class of the wrapper around the opened save form. */
  formClassName?: string;
};

const SaveCharacterCta = ({ buttonClassName, formClassName }: Props) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const payload = readGuestTopTalentPayload();
  if (!payload) return null;
  const title = tr(t, "village.saveCharacter", "Save your character");
  return saving ? (
    <div className={formClassName}>
      <TopTalentAuthGate inline resultPayload={payload} assessmentVersion="ai-v1" title={title} />
    </div>
  ) : (
    <button type="button" className={buttonClassName} onClick={() => setSaving(true)}>
      {title}
    </button>
  );
};

export default SaveCharacterCta;
