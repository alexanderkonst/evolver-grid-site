/**
 * /products/build — The BUILD Container landing page (Day 121, July 11, 2026).
 *
 * The copy IS the first-ever BUILD offer as sent (Day 120), de-personalized
 * only by removing the recipient's name. Canonical source:
 * docs/04-products/the_build_container.md. Do not "improve" the copy here;
 * it was woven from harvested client threshold language and is load-bearing.
 *
 * One CTA (WhatsApp to Sasha). Quiet router to /ignite for pre-session
 * visitors. Register: parchment/Cormorant/gold, borrowed from ProductsPage.
 * Signature visual: a slim gold connector line down the three weeks
 * (one direction, continuous motion).
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const WHATSAPP_URL =
  "https://wa.me/14157073432?text=" +
  encodeURIComponent("Hi Sasha! The BUILD container lands. I'd like to start.");

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

const Week = ({
  label,
  title,
  body,
  last,
}: {
  label: string;
  title: string;
  body: string;
  last?: boolean;
}) => (
  <div className="relative pl-8 sm:pl-10">
    {/* The one-direction connector: dot + line down the left margin. */}
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
    <p style={eyebrowGold}>{label}</p>
    <h2 className="text-xl sm:text-2xl mt-1 mb-2" style={cormorantTitle}>
      {title}
    </h2>
    <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
      {body}
    </p>
  </div>
);

const BuildContainer = () => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--skin-page-bg, #f6f1e7)" }}
    >
      <SEO
        title={t("thebuild.seoTitle")}
        description={t("thebuild.seoDescription")}
        path="/products/build"
      />
      <div className="max-w-[680px] mx-auto px-5 py-14 sm:py-20">
        {/* Hero */}
        <header className="mb-12">
          <p style={eyebrowGold}>{t("thebuild.eyebrow")}</p>
          <h1
            className="text-[26px] sm:text-[34px] leading-[1.25] mt-3 mb-5"
            style={cormorantTitle}
          >
            {t("thebuild.h1")}
          </h1>
          <p className="text-[15px] sm:text-base italic" style={sourceSerifBody}>
            {t("thebuild.sauce")}
          </p>
        </header>

        {/* The three weeks */}
        <section className="space-y-10 mb-14">
          <Week
            label={t("thebuild.w1Label")}
            title={t("thebuild.w1Title")}
            body={t("thebuild.w1Body")}
          />
          <Week
            label={t("thebuild.w2Label")}
            title={t("thebuild.w2Title")}
            body={t("thebuild.w2Body")}
          />
          <Week
            label={t("thebuild.w3Label")}
            title={t("thebuild.w3Title")}
            body={t("thebuild.w3Body")}
            last
          />
        </section>

        {/* Format */}
        <section className="rounded-2xl p-6 sm:p-7 mb-8" style={parchmentCard}>
          <p style={eyebrowGold}>{t("thebuild.formatLabel")}</p>
          <ul className="mt-3 space-y-2">
            {[t("thebuild.format1"), t("thebuild.format2"), t("thebuild.format3")].map(
              (line) => (
                <li
                  key={line}
                  className="text-[15px] sm:text-base"
                  style={sourceSerifBody}
                >
                  • {line}
                </li>
              ),
            )}
          </ul>
        </section>

        {/* Price */}
        <section className="rounded-2xl p-6 sm:p-7 mb-12" style={parchmentCard}>
          <p style={eyebrowGold}>{t("thebuild.priceLabel")}</p>
          <p
            className="text-3xl sm:text-4xl mt-2 mb-3"
            style={{ ...cormorantTitle, color: "var(--skin-accent-gold, #8a6508)" }}
          >
            $1,111
          </p>
          <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
            {t("thebuild.priceBody")}
          </p>
        </section>

        {/* The one CTA */}
        <section className="text-center">
          <p className="text-lg sm:text-xl mb-5 italic" style={cormorantTitle}>
            {t("thebuild.closing")}
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={ceremonialCta}
          >
            {t("thebuild.cta")}
            <ArrowRight className="w-4 h-4 opacity-80" />
          </a>
          <p className="mt-6 text-[13px] italic" style={{ ...sourceSerifBody, opacity: 0.75 }}>
            {t("thebuild.routerBefore")}{" "}
            <Link
              to="/ignite"
              className="underline underline-offset-4 decoration-[rgba(184,134,11,0.5)] hover:opacity-70 transition-opacity"
            >
              {t("thebuild.routerLink")}
            </Link>
            {t("thebuild.routerAfter")}
          </p>
          <p className="mt-10 text-base" style={{ ...cormorantTitle, fontWeight: 600 }}>
            Aleks
          </p>
        </section>
      </div>
    </div>
  );
};

export default BuildContainer;
