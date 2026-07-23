/**
 * /communities — Community-host offer landing page.
 *
 * Pitch to community leaders: host a free Zone of Genius workshop for
 * their members, revenue share for them, zero work on their side.
 * Register mirrors /products/built (BuildContainer.tsx): parchment/
 * Cormorant/gold, single CTA to WhatsApp.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const WHATSAPP_URL =
  "https://wa.me/14157073432?text=" +
  encodeURIComponent("Hi Sasha! I want the Zone of Genius workshop for my community.");

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

const ceremonialCta: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "13px",
  background:
    "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%))",
  color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
  border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
  boxShadow:
    "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
};

const CommunityWebinar = () => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--skin-page-bg, #f6f1e7)" }}
    >
      <SEO
        title={t("hostpage.seoTitle")}
        description={t("hostpage.seoDescription")}
        path="/communities"
      />
      <div className="max-w-[680px] mx-auto px-5 py-14 sm:py-20">
        {/* Hero */}
        <header className="mb-12">
          <p style={eyebrowGold}>{t("hostpage.eyebrow")}</p>
          <h1
            className="text-[26px] sm:text-[34px] leading-[1.25] mt-3 mb-5"
            style={cormorantTitle}
          >
            {t("hostpage.h1")}
          </h1>
          <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
            {t("hostpage.intro")}
          </p>
        </header>

        {/* Your part */}
        <section className="rounded-2xl p-6 sm:p-7 mb-8" style={parchmentCard}>
          <p style={eyebrowGold}>{t("hostpage.yourPartLabel")}</p>
          <ul className="mt-3 space-y-2">
            {[
              t("hostpage.yourPart1"),
              t("hostpage.yourPart2"),
              t("hostpage.yourPart3"),
            ].map((line) => (
              <li
                key={line}
                className="text-[15px] sm:text-base"
                style={sourceSerifBody}
              >
                • {line}
              </li>
            ))}
          </ul>
        </section>

        {/* My part */}
        <section className="mb-12">
          <p style={eyebrowGold}>{t("hostpage.myPartLabel")}</p>
          <p className="text-[15px] sm:text-base mt-3" style={sourceSerifBody}>
            {t("hostpage.myPartBody")}
          </p>
        </section>

        {/* The economics */}
        <section className="rounded-2xl p-6 sm:p-7 mb-12" style={parchmentCard}>
          <p style={eyebrowGold}>{t("hostpage.economicsLabel")}</p>
          <p className="text-[15px] sm:text-base mt-3" style={sourceSerifBody}>
            {t("hostpage.economicsBody")}
          </p>
        </section>

        {/* No selling in the room */}
        <section className="mb-12">
          <p style={eyebrowGold}>{t("hostpage.noSellingLabel")}</p>
          <p className="text-[15px] sm:text-base mt-3" style={sourceSerifBody}>
            {t("hostpage.noSellingBody")}
          </p>
        </section>

        {/* Highlight card */}
        <section className="rounded-2xl p-6 sm:p-7 mb-14" style={parchmentCard}>
          <ul className="space-y-2">
            {[
              t("hostpage.highlight1"),
              t("hostpage.highlight2"),
              t("hostpage.highlight3"),
              t("hostpage.highlight4"),
            ].map((line) => (
              <li
                key={line}
                className="text-lg sm:text-xl"
                style={{ ...cormorantTitle, fontWeight: 600 }}
              >
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* The one CTA */}
        <section className="text-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={ceremonialCta}
          >
            {t("hostpage.cta")}
            <ArrowRight className="w-4 h-4 opacity-80" />
          </a>
          <p className="mt-10 text-base" style={{ ...cormorantTitle, fontWeight: 600 }}>
            Aleks
          </p>
        </section>

        <footer className="mt-16 text-center">
          <Link
            to="/data"
            className="text-[12px] underline underline-offset-4 decoration-[rgba(184,134,11,0.35)] hover:opacity-70 transition-opacity"
            style={{ ...sourceSerifBody, opacity: 0.55 }}
          >
            {t("hostpage.dataLink")}
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default CommunityWebinar;
