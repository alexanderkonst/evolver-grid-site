/**
 * /privacy — Privacy Policy v1 (Day 133, July 23, 2026).
 *
 * The legal-register companion to /data ("Your Data, Plainly"). Register
 * mirrors /products/built and /communities (parchment/Cormorant/gold),
 * rendered as plain sections instead of cards since this is the reference
 * document, not the human summary.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";

const eyebrowGold: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "10.5px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--skin-accent-gold, #b8860b)",
};

const cormorantTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 700,
  letterSpacing: "-0.005em",
  color: "var(--skin-text-primary, #0b2a5a)",
};

const sourceSerifBody: React.CSSProperties = {
  fontFamily: "'Source Serif 4', serif",
  fontWeight: 500,
  color: "var(--skin-text-primary, #0b2a5a)",
  lineHeight: 1.65,
};

const SECTION_KEYS = [
  "collect",
  "use",
  "cookies",
  "disclosure",
  "rights",
  "retention",
  "children",
  "international",
  "changes",
  "contact",
] as const;

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--skin-page-bg, #f6f1e7)" }}
    >
      <SEO
        title={t("privacypolicy.seoTitle")}
        description={t("privacypolicy.seoDescription")}
        path="/privacy"
      />
      <div className="max-w-[680px] mx-auto px-5 py-14 sm:py-20">
        <header className="mb-10">
          <p style={eyebrowGold}>{t("privacypolicy.eyebrow")}</p>
          <h1
            className="text-[26px] sm:text-[34px] leading-[1.25] mt-3 mb-4"
            style={cormorantTitle}
          >
            {t("privacypolicy.h1")}
          </h1>
          <p className="text-[13px] italic" style={{ ...sourceSerifBody, opacity: 0.75 }}>
            {t("privacypolicy.lastUpdated")}
          </p>
          <p className="text-[15px] sm:text-base mt-4" style={sourceSerifBody}>
            {t("privacypolicy.intro")}
          </p>
        </header>

        <section className="space-y-8 mb-14">
          {SECTION_KEYS.map((key) => (
            <div key={key}>
              <h2 className="text-lg sm:text-xl mb-2" style={cormorantTitle}>
                {t(`privacypolicy.${key}Title`)}
              </h2>
              <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
                {t(`privacypolicy.${key}Body`)}
              </p>
            </div>
          ))}
        </section>

        <footer className="text-center">
          <p className="text-[13px] sm:text-sm" style={{ ...sourceSerifBody, opacity: 0.85 }}>
            <Link
              to="/data"
              className="underline underline-offset-4 decoration-[rgba(184,134,11,0.5)] hover:opacity-70 transition-opacity"
            >
              {t("privacypolicy.backToData")}
            </Link>
            {" · "}
            <Link
              to="/terms"
              className="underline underline-offset-4 decoration-[rgba(184,134,11,0.5)] hover:opacity-70 transition-opacity"
            >
              {t("privacypolicy.viewTerms")}
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
