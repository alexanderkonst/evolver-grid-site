/**
 * /products/crossing — The Crossing landing page (Day 146, August 5, 2026).
 *
 * A 2-month transition program, $2,222. Register borrowed from
 * ProductsPage / BuildContainer: parchment/Cormorant/gold-eyebrow editorial.
 * One CTA (Telegram to Sasha).
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

// Rendered session order. Sessions 6 and 7 share one combined block (s6);
// there is no s7 key. Numbers below are display labels, not i18n keys.
const SESSION_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s8"] as const;

const Session = ({
  index,
  title,
  body,
  last,
}: {
  index: number;
  title: string;
  body: string;
  last?: boolean;
}) => (
  <div className="relative pl-8 sm:pl-10">
    <span
      className="absolute left-0 top-[7px] w-[11px] h-[11px] rounded-full"
      style={{
        background: "var(--skin-accent-gold, #b8860b)",
        boxShadow: "0 0 10px rgba(212, 175, 55, 0.55)",
      }}
    />
    {!last && (
      <span
        className="absolute left-[5px] top-[22px] bottom-[-28px] w-px"
        style={{ background: "rgba(212, 175, 55, 0.45)" }}
      />
    )}
    <h3 className="text-xl sm:text-2xl mb-2" style={cormorantTitle}>
      {title}
    </h3>
    <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
      {body}
    </p>
  </div>
);

const TheCrossing = () => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--skin-page-bg, #f6f1e7)" }}
    >
      <SEO
        title={t("crossing.title")}
        description={t("crossing.seoDescription")}
        path="/products/crossing"
      />
      <div className="max-w-[680px] mx-auto px-5 py-14 sm:py-20">
        {/* Hero */}
        <header className="mb-12">
          <p style={eyebrowGold}>{t("crossing.eyebrow")}</p>
          <h1
            className="text-[26px] sm:text-[34px] leading-[1.25] mt-3 mb-5"
            style={cormorantTitle}
          >
            {t("crossing.heading")}
          </h1>
          <p className="text-[15px] sm:text-base italic mb-5" style={sourceSerifBody}>
            {t("crossing.subheading")}
          </p>
          <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
            {t("crossing.essence")}
          </p>
        </header>

        {/* Format */}
        <section className="rounded-2xl p-6 sm:p-7 mb-12" style={parchmentCard}>
          <p style={eyebrowGold}>{t("crossing.formatHeading")}</p>
          <ul className="mt-3 space-y-2">
            {[
              t("crossing.f1"),
              t("crossing.f2"),
              t("crossing.f3"),
              t("crossing.f4"),
              t("crossing.f5"),
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

        {/* The sequence */}
        <section className="mb-14">
          <p style={eyebrowGold}>{t("crossing.sequenceHeading")}</p>
          <p className="text-[15px] sm:text-base italic mt-3 mb-8" style={sourceSerifBody}>
            {t("crossing.sequenceIntro")}
          </p>
          <div className="space-y-10">
            {SESSION_KEYS.map((key, i) => (
              <Session
                key={key}
                index={i + 1}
                title={t(`crossing.${key}.title`)}
                body={t(`crossing.${key}.body`)}
                last={i === SESSION_KEYS.length - 1}
              />
            ))}
          </div>
        </section>

        {/* Price */}
        <section className="rounded-2xl p-6 sm:p-7 mb-12" style={parchmentCard}>
          <p style={eyebrowGold}>{t("crossing.priceHeading")}</p>
          <p
            className="text-3xl sm:text-4xl mt-2 mb-3"
            style={{ ...cormorantTitle, color: "var(--skin-accent-gold, #8a6508)" }}
          >
            {t("crossing.priceLine")}
          </p>
          <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
            {t("crossing.paymentLine")}
          </p>
        </section>

        {/* What comes after */}
        <section className="mb-12">
          <p style={eyebrowGold}>{t("crossing.afterHeading")}</p>
          <p className="text-[15px] sm:text-base mt-3" style={sourceSerifBody}>
            {t("crossing.afterBody")}
          </p>
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
            {t("crossing.cta")}
            <ArrowRight className="w-4 h-4 opacity-80" />
          </a>
        </section>
      </div>
    </div>
  );
};

export default TheCrossing;
