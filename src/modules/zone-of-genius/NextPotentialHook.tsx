import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { readPotentialHook, type AppleseedData } from "./appleseedGenerator";
import { acceptMicroQuest } from "./saveToDatabase";

/**
 * A4 (docs/02-strategy/game_launch_spec.md): the hook after the reveal card, before «Enter the village».
 *
 *   YOUR NEXT POTENTIAL IS  →  <next_potential.title> + <next_potential.line>
 *   YOUR FIRST MICRO-QUEST …  →  <micro_quest>
 *   [Accept the quest]  →  the Quest Board (/game/journey)
 *
 * Renders nothing for a reveal saved before A4 (no `next_potential` / `micro_quest`), so old
 * reveals look exactly as they did. The reveal card itself is untouched.
 */

type Props = {
  appleseed: AppleseedData;
  /** Called with the reveal that now carries the accepted flag, so the page state matches what was saved. */
  onAccepted?: (next: AppleseedData) => void;
};

const NextPotentialHook = ({ appleseed, onAccepted }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const hook = readPotentialHook(appleseed.topTalentProfile);
  if (!hook) return null;

  const accepted = Boolean(appleseed.topTalentProfile?.micro_quest_accepted_at);
  const muted = { color: "var(--skin-text-muted, rgba(122,81,8,0.85))" };
  const strong = { fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: "var(--skin-text-primary, #0a1628)" };

  const accept = async () => {
    setStatus("saving");
    const result = await acceptMicroQuest(appleseed);
    if (result.success && result.appleseed) {
      setStatus("idle");
      onAccepted?.(result.appleseed);
      navigate("/game/journey");
    } else {
      setStatus("error");
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-5 pb-6" data-testid="next-potential-hook">
      <div className="rounded-2xl liquid-glass p-6 sm:p-8 text-center" style={{ border: "1px solid rgba(26,30,58,0.12)" }}>
        <p className="text-xs uppercase tracking-[0.18em] mb-2" style={muted}>
          {t("zogEntry.hookNextPotentialEyebrow")}
        </p>
        <h3 className="text-2xl sm:text-3xl leading-[1.15]" style={strong}>
          {hook.next_potential.title}
        </h3>
        <p className="mt-3 text-base sm:text-lg" style={{ color: "var(--skin-text-primary, #0a1628)" }}>
          {hook.next_potential.line}
        </p>

        <p className="mt-8 text-xs uppercase tracking-[0.18em] mb-2" style={muted}>
          {t("zogEntry.hookMicroQuestEyebrow")}
        </p>
        <p className="text-xl sm:text-2xl leading-[1.25]" style={strong}>
          {hook.micro_quest}
        </p>

        <div className="mt-6 flex flex-col items-center gap-2">
          {accepted ? (
            <>
              <p role="status" className="text-sm" style={muted}>
                {t("zogEntry.hookAccepted")}
              </p>
              <Link to="/game/journey" className="underline text-base" style={strong}>
                {t("zogEntry.hookOpenBoard")} →
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={accept}
                disabled={status === "saving"}
                className="rounded-full px-6 py-3 text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60"
                style={{ ...strong, border: "1px solid rgba(26,30,58,0.3)" }}
              >
                {status === "saving" ? t("zogEntry.hookAccepting") : t("zogEntry.hookAccept")}
              </button>
              {status === "error" ? (
                <p role="alert" className="text-sm text-red-700">
                  {t("zogEntry.hookAcceptFailed")}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default NextPotentialHook;
