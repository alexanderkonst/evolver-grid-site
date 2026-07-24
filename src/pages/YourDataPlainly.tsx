/**
 * /data — "Your Data, Plainly" (Day 133, July 23, 2026).
 *
 * The human page: what the site's data promise actually is, in one screen,
 * before the legal versions. Register mirrors /products/built and
 * /communities (parchment/Cormorant/gold). EN copy is verbatim per the
 * Day 133 build spec; RU/ES are translations in the same register.
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

const CARD_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;

const YourDataPlainly = () => {
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
        title={t("dataplainly.seoTitle")}
        description={t("dataplainly.seoDescription")}
        path="/data"
      />
      <div className="max-w-[680px] mx-auto px-5 py-14 sm:py-20">
        <header className="mb-12">
          <p style={eyebrowGold}>{t("dataplainly.eyebrow")}</p>
          <h1
            className="text-[26px] sm:text-[34px] leading-[1.25] mt-3 mb-5"
            style={cormorantTitle}
          >
            {t("dataplainly.h1")}
          </h1>
          <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
            {t("dataplainly.intro")}
          </p>
        </header>

        <section className="space-y-5 mb-14">
          {CARD_KEYS.map((n) => (
            <div key={n} className="rounded-2xl p-6 sm:p-7" style={parchmentCard}>
              <h2 className="text-lg sm:text-xl mb-2" style={cormorantTitle}>
                {t(`dataplainly.card${n}Title`)}
              </h2>
              <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
                {t(`dataplainly.card${n}Body`)}
              </p>
            </div>
          ))}
        </section>

        <footer className="text-center">
          <p className="text-[13px] sm:text-sm" style={{ ...sourceSerifBody, opacity: 0.85 }}>
            {t("dataplainly.footerPre")}{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-4 decoration-[rgba(184,134,11,0.5)] hover:opacity-70 transition-opacity"
            >
              {t("dataplainly.footerPrivacy")}
            </Link>
            {" · "}
            <Link
              to="/terms"
              className="underline underline-offset-4 decoration-[rgba(184,134,11,0.5)] hover:opacity-70 transition-opacity"
            >
              {t("dataplainly.footerTerms")}
            </Link>
            {". "}
            {t("dataplainly.footerQuestions")}{" "}
            <a
              href="https://t.me/integralevolution"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-[rgba(184,134,11,0.5)] hover:opacity-70 transition-opacity"
            >
              t.me/integralevolution
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default YourDataPlainly;
