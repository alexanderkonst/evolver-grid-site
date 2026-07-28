/**
 * /products/evolution-portal/karime — personalized proposal page for
 * Karime, built from a working session on her actual scope (2026-07-27).
 *
 * Clone of EvolutionPortal.tsx's visual system (same background image,
 * same parchment/Cormorant/gold-eyebrow style objects, same CTA
 * pattern) with the copy replaced entirely by Karime's own scope:
 * the Protocol Journey + the Library, derived verbatim from what she
 * said she needs.
 *
 * Private proposal page for one person: noindex, kept out of the
 * sitemap generator (scripts/generate-sitemap.ts is an explicit
 * allowlist, so simply not adding this route keeps it out).
 *
 * CTA: single WhatsApp button to Aleks (Sasha), prefilled "Let's build
 * the portal.", same click-to-chat pattern used on KarimeOffer.tsx.
 */
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { trackPageView, trackCTAClick } from "@/lib/funnelAnalytics";
import { useEffect } from "react";

const WHATSAPP_URL =
  "https://wa.me/14157073432?text=Let%27s%20build%20the%20portal.";

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
  lineHeight: 1.6,
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
  fontSize: "12px",
  background:
    "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%))",
  color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
  border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
  boxShadow:
    "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
};

const sectionEyebrow: React.CSSProperties = {
  ...eyebrowGold,
  fontSize: "10px",
  letterSpacing: "0.22em",
};

const EvolutionPortalKarime = () => {
  const { t } = useTranslation();

  useEffect(() => {
    trackPageView("evolution_portal_karime_view");
  }, []);

  const BuildCta = ({ ctaId }: { ctaId: string }) => (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px]"
      style={ceremonialCta}
      onClick={() => trackCTAClick("booking_click", ctaId)}
    >
      {t("evolutionPortalKarime.ctaLabel")}
      <ArrowRight className="w-3.5 h-3.5" />
    </a>
  );

  return (
    <>
      <SEO
        title="Proposal for Karime — Client Evolution Portal"
        description="A personalized proposal: the Protocol Journey and the Library, built from Karime's own practices."
        path="/products/evolution-portal/karime"
        noIndex
      />
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
        <div className="mx-auto px-4 md:px-6 py-16 md:py-20 space-y-14">
          {/* HERO */}
          <header className="max-w-3xl mx-auto text-center space-y-5">
            <p style={eyebrowGold}>{t("evolutionPortalKarime.eyebrow")}</p>
            <h1
              style={{
                ...cormorantTitle,
                lineHeight: 1.05,
                fontSize: "clamp(2.1rem, 5vw, 3.1rem)",
              }}
            >
              {t("evolutionPortalKarime.headline")}
            </h1>
            <p
              className="max-w-xl mx-auto"
              style={{ ...sourceSerifBody, fontSize: "16.5px" }}
            >
              {t("evolutionPortalKarime.subhead")}
            </p>
            <div className="pt-2">
              <BuildCta ctaId="hero-cta" />
            </div>
          </header>

          {/* WHAT THIS ACTUALLY IS */}
          <section className="max-w-3xl mx-auto rounded-2xl overflow-hidden" style={parchmentCard}>
            <div className="p-6 md:p-8 space-y-3">
              <p style={sectionEyebrow}>{t("evolutionPortalKarime.whatEyebrow")}</p>
              <p style={{ ...sourceSerifBody, fontSize: "15.5px" }}>
                {t("evolutionPortalKarime.whatBody")}
              </p>
            </div>
          </section>

          {/* WHAT YOU SAID YOU NEED */}
          <section className="max-w-3xl mx-auto space-y-5">
            <p className="text-center" style={sectionEyebrow}>
              {t("evolutionPortalKarime.heardEyebrow")}
            </p>
            <div className="space-y-4">
              {["heard1", "heard2", "heard3"].map((key) => (
                <div key={key} className="rounded-2xl overflow-hidden" style={parchmentCard}>
                  <div className="p-5 md:p-6">
                    <p
                      style={{
                        ...sourceSerifBody,
                        fontSize: "15.5px",
                        fontStyle: "italic",
                      }}
                    >
                      {t(`evolutionPortalKarime.${key}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* THE TWO THINGS IT DOES */}
          <section className="max-w-3xl mx-auto space-y-5">
            <p className="text-center" style={sectionEyebrow}>
              {t("evolutionPortalKarime.twoThingsEyebrow")}
            </p>
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden" style={parchmentCard}>
                <div className="p-6 md:p-8 space-y-2">
                  <h3 style={{ ...cormorantTitle, fontSize: "22px" }}>
                    {t("evolutionPortalKarime.protocolTitle")}
                  </h3>
                  <p
                    style={{
                      ...sourceSerifBody,
                      fontSize: "13px",
                      fontStyle: "italic",
                      opacity: 0.8,
                    }}
                  >
                    {t("evolutionPortalKarime.protocolSubtitle")}
                  </p>
                  <p style={{ ...sourceSerifBody, fontSize: "15px" }}>
                    {t("evolutionPortalKarime.protocolBody")}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden" style={parchmentCard}>
                <div className="p-6 md:p-8 space-y-2">
                  <h3 style={{ ...cormorantTitle, fontSize: "22px" }}>
                    {t("evolutionPortalKarime.libraryTitle")}
                  </h3>
                  <p
                    style={{
                      ...sourceSerifBody,
                      fontSize: "13px",
                      fontStyle: "italic",
                      opacity: 0.8,
                    }}
                  >
                    {t("evolutionPortalKarime.librarySubtitle")}
                  </p>
                  <p style={{ ...sourceSerifBody, fontSize: "15px" }}>
                    {t("evolutionPortalKarime.libraryBody")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* WHAT IT CHANGES */}
          <section className="max-w-3xl mx-auto space-y-5">
            <p className="text-center" style={sectionEyebrow}>
              {t("evolutionPortalKarime.changesEyebrow")}
            </p>
            <div className="rounded-2xl overflow-hidden" style={parchmentCard}>
              <div className="p-6 md:p-8 space-y-3">
                {["changes1", "changes2", "changes3"].map((key) => (
                  <div key={key} className="flex items-baseline gap-3">
                    <span
                      style={{
                        color: "var(--skin-accent-gold, #b8860b)",
                        fontSize: "14px",
                      }}
                    >
                      &rarr;
                    </span>
                    <p style={{ ...sourceSerifBody, fontSize: "15px" }}>
                      {t(`evolutionPortalKarime.${key}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* WHAT'S INCLUDED */}
          <section className="max-w-3xl mx-auto space-y-5">
            <p className="text-center" style={sectionEyebrow}>
              {t("evolutionPortalKarime.includedEyebrow")}
            </p>
            <div className="rounded-2xl overflow-hidden" style={parchmentCard}>
              <div className="p-6 md:p-8 space-y-3">
                {["included1", "included2", "included3", "included4", "included5"].map(
                  (key) => (
                    <div key={key} className="flex items-baseline gap-3">
                      <span
                        style={{
                          color: "var(--skin-accent-gold, #b8860b)",
                          fontSize: "14px",
                        }}
                      >
                        &rarr;
                      </span>
                      <p style={{ ...sourceSerifBody, fontSize: "15px" }}>
                        {t(`evolutionPortalKarime.${key}`)}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* HOW THIS COMPARES */}
          <section className="max-w-4xl mx-auto space-y-5">
            <div className="text-center space-y-1.5">
              <p style={sectionEyebrow}>{t("evolutionPortalKarime.compareEyebrow")}</p>
              <p
                style={{
                  ...sourceSerifBody,
                  fontSize: "14px",
                  fontStyle: "italic",
                  opacity: 0.8,
                }}
              >
                {t("evolutionPortalKarime.compareIntro")}
              </p>
            </div>
            <div
              className="rounded-2xl overflow-x-auto"
              style={parchmentCard}
            >
              <table className="w-full border-collapse" style={{ minWidth: "640px" }}>
                <thead>
                  <tr>
                    <th
                      className="text-left p-3 md:p-4 align-bottom"
                      style={{ ...sourceSerifBody, fontSize: "12px", opacity: 0.75 }}
                    />
                    {(["compareCol1", "compareCol2", "compareCol3", "compareCol4", "compareCol5"] as const).map(
                      (key, i) => (
                        <th
                          key={key}
                          className="text-center p-3 md:p-4 align-bottom"
                          style={{
                            ...cormorantTitle,
                            fontSize: "14.5px",
                            fontWeight: 600,
                            ...(i === 4
                              ? {
                                  color: "var(--skin-accent-gold, #b8860b)",
                                  background: "rgba(212, 175, 55, 0.10)",
                                  borderBottom: "2px solid rgba(212, 175, 55, 0.55)",
                                  borderLeft: "1px solid rgba(212, 175, 55, 0.35)",
                                  borderRight: "1px solid rgba(212, 175, 55, 0.35)",
                                }
                              : {
                                  borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
                                }),
                          }}
                        >
                          {t(`evolutionPortalKarime.${key}`)}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((row, rowIdx, arr) => (
                    <tr key={row}>
                      <td
                        className="p-3 md:p-4"
                        style={{
                          ...sourceSerifBody,
                          fontSize: "13px",
                          fontWeight: 600,
                          borderBottom:
                            rowIdx < arr.length - 1 ? "1px solid rgba(212, 175, 55, 0.18)" : "none",
                        }}
                      >
                        {t(`evolutionPortalKarime.compareRow${row}Label`)}
                      </td>
                      {[1, 2, 3, 4, 5].map((col) => (
                        <td
                          key={col}
                          className="text-center p-3 md:p-4"
                          style={{
                            ...sourceSerifBody,
                            fontSize: "13px",
                            borderBottom:
                              rowIdx < arr.length - 1
                                ? "1px solid rgba(212, 175, 55, 0.18)"
                                : "none",
                            ...(col === 5
                              ? {
                                  fontWeight: 600,
                                  background: "rgba(212, 175, 55, 0.08)",
                                  borderLeft: "1px solid rgba(212, 175, 55, 0.35)",
                                  borderRight: "1px solid rgba(212, 175, 55, 0.35)",
                                }
                              : {}),
                          }}
                        >
                          {t(`evolutionPortalKarime.compareRow${row}Col${col}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p
              className="text-center max-w-2xl mx-auto"
              style={{ ...sourceSerifBody, fontSize: "14px", fontStyle: "italic", opacity: 0.85 }}
            >
              {t("evolutionPortalKarime.compareClosing")}
            </p>
          </section>

          {/* COMING NEXT */}
          <section className="max-w-3xl mx-auto space-y-5">
            <p className="text-center" style={sectionEyebrow}>
              {t("evolutionPortalKarime.nextEyebrow")}
            </p>
            <div className="space-y-4">
              {["next1", "next2"].map((key) => (
                <div key={key} className="rounded-2xl overflow-hidden" style={parchmentCard}>
                  <div className="p-5 md:p-6">
                    <p style={{ ...sourceSerifBody, fontSize: "15px" }}>
                      {t(`evolutionPortalKarime.${key}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* INVESTMENT */}
          <section className="max-w-[560px] mx-auto text-center">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "0.5px solid rgba(212, 175, 55, 0.55)",
                background: "var(--skin-card-fill, rgba(255, 252, 245, 0.92))",
              }}
            >
              <div className="p-6 md:p-8 space-y-3">
                <p style={sectionEyebrow}>{t("evolutionPortalKarime.investmentEyebrow")}</p>
                <p
                  style={{
                    ...sourceSerifBody,
                    fontSize: "14px",
                    opacity: 0.85,
                  }}
                >
                  {t("evolutionPortalKarime.investmentFairValue")}
                </p>
                <p
                  style={{
                    ...cormorantTitle,
                    color: "var(--skin-accent-gold, #b8860b)",
                    fontSize: "19px",
                  }}
                >
                  {t("evolutionPortalKarime.investmentPrice")}
                </p>
                <p
                  style={{
                    ...sourceSerifBody,
                    fontSize: "13.5px",
                    fontStyle: "italic",
                    opacity: 0.85,
                  }}
                >
                  {t("evolutionPortalKarime.investmentMonthly")}
                </p>
              </div>
            </div>
          </section>

          {/* WHAT I NEED FROM YOU */}
          <section className="max-w-3xl mx-auto rounded-2xl overflow-hidden" style={parchmentCard}>
            <div className="p-6 md:p-8 space-y-3">
              <p style={sectionEyebrow}>{t("evolutionPortalKarime.needEyebrow")}</p>
              <p style={{ ...sourceSerifBody, fontSize: "15.5px" }}>
                {t("evolutionPortalKarime.needBody")}
              </p>
            </div>
          </section>

          {/* CLOSING CTA */}
          <section className="text-center space-y-4 pt-2">
            <BuildCta ctaId="closing-cta" />
            <p
              style={{
                ...sourceSerifBody,
                fontSize: "14px",
                fontStyle: "italic",
              }}
            >
              {t("evolutionPortalKarime.signoff")}
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default EvolutionPortalKarime;
