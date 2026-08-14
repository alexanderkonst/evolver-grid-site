/**
 * /products/founder-read — The Founder Read landing page (Day 155).
 *
 * An investor-facing instrument: reads and measures a founder's degree of
 * founder-market-fit and their exact chapter on the entrepreneur's hero's
 * journey. Register borrowed from TheCrossing / ProductsPage: parchment/
 * Cormorant/gold-eyebrow editorial. One CTA (Telegram to Sasha).
 */
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const TELEGRAM_CONVERSATION = "https://t.me/integralevolution";

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

const FounderRead = () => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--skin-page-bg, #f6f1e7)" }}
    >
      <SEO
        title={t("founderRead.title")}
        description={t("founderRead.seoDescription")}
        path="/products/founder-read"
      />
      <div className="max-w-[680px] mx-auto px-5 py-14 sm:py-20">
        {/* Hero */}
        <header className="mb-12">
          <p style={eyebrowGold}>{t("founderRead.eyebrow")}</p>
          <h1
            className="text-[26px] sm:text-[34px] leading-[1.25] mt-3 mb-5"
            style={cormorantTitle}
          >
            {t("founderRead.heading")}
          </h1>
          <p className="text-[15px] sm:text-base italic" style={sourceSerifBody}>
            {t("founderRead.subheading")}
          </p>
        </header>

        {/* The problem */}
        <section className="mb-12">
          <p style={eyebrowGold}>{t("founderRead.problemHeading")}</p>
          <p className="text-[15px] sm:text-base mt-3" style={sourceSerifBody}>
            {t("founderRead.problemBody")}
          </p>
        </section>

        {/* What it is */}
        <section className="mb-12">
          <p style={eyebrowGold}>{t("founderRead.whatHeading")}</p>
          <p className="text-[15px] sm:text-base mt-3" style={sourceSerifBody}>
            {t("founderRead.whatBody")}
          </p>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <p style={eyebrowGold}>{t("founderRead.howHeading")}</p>
          <p className="text-[15px] sm:text-base mt-3" style={sourceSerifBody}>
            {t("founderRead.howBody")}
          </p>
        </section>

        {/* What you get */}
        <section className="rounded-2xl p-6 sm:p-7 mb-14" style={parchmentCard}>
          <p style={eyebrowGold}>{t("founderRead.getHeading")}</p>
          <ul className="mt-3 space-y-2">
            {[
              t("founderRead.get1"),
              t("founderRead.get2"),
              t("founderRead.get3"),
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

        {/* The one CTA */}
        <section className="text-center">
          <a
            href={TELEGRAM_CONVERSATION}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={ceremonialCta}
          >
            {t("founderRead.cta")}
            <ArrowRight className="w-4 h-4 opacity-80" />
          </a>
        </section>
      </div>
    </div>
  );
};

export default FounderRead;
