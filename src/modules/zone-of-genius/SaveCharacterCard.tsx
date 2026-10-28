import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import SignupModal from "@/components/auth/SignupModal";
import { CTA_SMALL_CAPS_STYLE } from "@/lib/landingDesign";

type SaveCharacterCardProps = {
    /** Fires after the guest has an account (SignupModal already migrated the guest buffers). */
    onAccount: () => void | Promise<void>;
};

/**
 * «Save your character» — WP-7a (game_of_being_you.md §14.2 J1, §14.5 row J1).
 *
 * Shown to a guest UNDER the reveal. This is the only place the test asks for an account:
 * the reveal itself is never walled. The save still needs an account, so the SignupModal
 * is the gate, then `onAccount` persists the result and the caller sends the player to
 * `/village`.
 */
const SaveCharacterCard = ({ onAccount }: SaveCharacterCardProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <div className="w-full max-w-md mx-auto px-5 py-6 text-center space-y-3">
            <p
                className="text-sm sm:text-base italic"
                style={{
                    color: "var(--skin-text-muted, rgba(26,30,58,0.78))",
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    textShadow: "var(--skin-text-halo-deep)",
                }}
            >
                {t("zogEntry.saveCharacterLine")}
            </p>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-5 sm:px-7 py-3 max-w-full text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
                style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: "var(--skin-cta-text)",
                    backgroundImage: "var(--skin-cta-bg)",
                    boxShadow: "var(--skin-cta-shadow)",
                    textShadow: "var(--skin-cta-text-shadow)",
                }}
            >
                <span style={CTA_SMALL_CAPS_STYLE}>{t("zogEntry.saveCharacterCta")}</span>
                <ArrowRight
                    aria-hidden="true"
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
            </button>
            <SignupModal
                open={open}
                onOpenChange={setOpen}
                title={t("zogEntry.saveCharacterModalTitle")}
                description={t("zogEntry.saveCharacterModalDesc")}
                onSuccess={() => {
                    void onAccount();
                }}
            />
        </div>
    );
};

export default SaveCharacterCard;
