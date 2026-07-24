/**
 * /terms — Terms of Service v1 (Day 133, July 23, 2026).
 *
 * LEAN v1: no imported boilerplate, no arbitration/class-action/venue
 * clauses. Section 5 (the open-method section) is the differentiator and
 * is written warmly on purpose — do not tighten it into standard legalese.
 * Register mirrors /products/built and /communities.
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

const parchmentCard: React.CSSProperties = {
  background: "var(--skin-card-fill, rgba(255, 252, 245, 0.92))",
  border: "0.5px solid rgba(212, 175, 55, 0.55)",
  boxShadow:
    "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.22)",
};

const SECTION_KEYS = [
  "who",
  "guidance",
  "results",
  "payments",
  "content",
  "conduct",
  "liability",
  "changes",
  "contact",
] as const;

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-dvh"
      style={{
        backgroundColor: "var(--skin-page-bg, #f7f3ea)",
        backgroundImage:
          "linear-gradient(rgba(248, 245, 238, 0.08), rgba(248, 245, 238, 0.08)), url('/images/evolution-portal-atmosphere.png')",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <SEO
        title={t("termsofservice.seoTitle")}
        description={t("termsofservice.seoDescription")}
        path="/terms"
      />
      <div className="max-w-[680px] mx-auto px-5 py-14 sm:py-20">
        <header className="mb-10">
          <p style={eyebrowGold}>{t("termsofservice.eyebrow")}</p>
          <h1
            className="text-[26px] sm:text-[34px] leading-[1.25] mt-3 mb-4"
            style={cormorantTitle}
          >
            {t("termsofservice.h1")}
          </h1>
          <p className="text-[13px] italic" style={{ ...sourceSerifBody, opacity: 0.75 }}>
            {t("termsofservice.lastUpdated")}
          </p>
          <p className="text-[15px] sm:text-base mt-4" style={sourceSerifBody}>
            {t("termsofservice.intro")}
          </p>
        </header>

        <section className="space-y-5 mb-8">
          {SECTION_KEYS.filter((k) => k !== "openMethod").map((key) => (
            <div key={key} className="rounded-2xl p-6 sm:p-7" style={parchmentCard}>
              <h2 className="text-lg sm:text-xl mb-2" style={cormorantTitle}>
                {t(`termsofservice.${key}Title`)}
              </h2>
              <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
                {t(`termsofservice.${key}Body`)}
              </p>
            </div>
          ))}
        </section>

        {/* The open-method section: the differentiator, set apart in a card */}
        <section className="rounded-2xl p-6 sm:p-7 mb-14" style={parchmentCard}>
          <p style={eyebrowGold}>{t("termsofservice.openMethodEyebrow")}</p>
          <h2 className="text-lg sm:text-xl mt-2 mb-2" style={cormorantTitle}>
            {t("termsofservice.openMethodTitle")}
          </h2>
          <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
            {t("termsofservice.openMethodBody")}
          </p>
        </section>

        <footer className="text-center">
          <p className="text-[13px] sm:text-sm" style={{ ...sourceSerifBody, opacity: 0.85 }}>
            <Link
              to="/data"
              className="underline underline-offset-4 decoration-[rgba(184,134,11,0.5)] hover:opacity-70 transition-opacity"
            >
              {t("termsofservice.backToData")}
            </Link>
            {" · "}
            <Link
              to="/privacy"
              className="underline underline-offset-4 decoration-[rgba(184,134,11,0.5)] hover:opacity-70 transition-opacity"
            >
              {t("termsofservice.viewPrivacy")}
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
