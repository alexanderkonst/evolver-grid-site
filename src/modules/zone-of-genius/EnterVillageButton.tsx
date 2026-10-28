import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CTA_SMALL_CAPS_STYLE, igniteLogo } from "@/lib/landingDesign";

/**
 * WP-7a: the one primary button on the Top Talent reveal. The player has just
 * earned their character; this takes them into the village. Same primary CTA
 * style as the ZoG entry button.
 */
const EnterVillageButton = () => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center">
      <Link
        to="/village"
        className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3.5 max-w-full text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
          backgroundImage:
            "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
          boxShadow:
            "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
          textShadow:
            "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
        }}
      >
        <img
          src={igniteLogo}
          alt=""
          aria-hidden="true"
          className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100"
          style={{ filter: "drop-shadow(0 0 6px rgba(244, 212, 114, 0.45))" }}
          draggable={false}
        />
        <span style={CTA_SMALL_CAPS_STYLE}>{t("zogEntry.enterVillage")}</span>
        <ArrowRight
          aria-hidden="true"
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
};

export default EnterVillageButton;
