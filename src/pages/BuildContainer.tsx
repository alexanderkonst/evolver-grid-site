/**
 * /products/pmf — PMF (formerly the BUILT container): "Early signal of Product-Market Fit in One
 * Moon Cycle, Guaranteed". Moon/neon look shared with /products/vector.
 * Visual tokens and shared classes live in TheVector.css (scoped to `.vector-page`);
 * BuildContainer.css holds only what is specific to this page.
 * Copy source of truth: docs/04-products/the_build_container.md.
 */
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { ExpandableTestimonial } from "@/components/ExpandableTestimonial";
import { useTestimonials } from "@/hooks/useTestimonials";
import { MoonDivider, MoonEyebrow, MoonStar } from "@/components/products/MoonNeon";
import { igniteLogo } from "@/lib/landingDesign";
import "./TheVector.css";
import "./BuildContainer.css";

const WHATSAPP_URL = "https://wa.me/14157073432?text=" +
  encodeURIComponent("Hi Aleksandr Konstantinov! PMF lands for me, and I wanted to get in touch.");

const WEEKS = [1, 2, 3, 4] as const;
const GROUP_PRICE = "$1,111";
const INDIVIDUAL_PRICE = "$4,444";

const BuildContainer = () => {
  const { t } = useTranslation();
  const testimonials = useTestimonials();
  const cta = (label: string, arrow = true) => (
    <>
      <span>{label}</span>
      {arrow && <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />}
    </>
  );
  const whatsapp = (
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="vector-cta">
      {cta(t("thebuild.cta"))}
    </a>
  );
  const eligibility = (
    <Link to="/quiz" className="vector-cta">
      {cta(t("thebuild.eligibilityCta"))}
    </Link>
  );

  return (
    <>
      <SEO title={t("thebuild.seoTitle")} description={t("thebuild.seoDescription")} path="/products/pmf" />
      <main className="product-landing vector-page build-page relative min-h-dvh font-sans">
        <div className="vector-sky" aria-hidden="true" />
        <div className="vector-inner relative max-w-2xl mx-auto px-5 md:px-6 py-16 space-y-14">
          <header className="text-center space-y-6 pt-2 pb-2">
            <img src={igniteLogo} alt={t("ignite.logoAlt")} width={140} height={106} decoding="async"
              className="build-hero-star mx-auto" />
            <p className="build-eyebrow">{t("thebuild.eyebrow")}</p>
            <h1 className="vector-title build-hero-title">{t("thebuild.h1")}</h1>
            <p className="vector-body build-sauce max-w-md mx-auto">{t("thebuild.sauce")}</p>
            <MoonDivider />
            <div className="flex flex-col items-center gap-4 pt-1">
              {whatsapp}
              <ul className="build-hero-prices" aria-label={t("thebuild.priceLabel")}>
                <li>
                  <span className="build-hero-amount">{GROUP_PRICE}</span>
                  <span className="build-hero-tier">{t("thebuild.groupLabel")}</span>
                </li>
                <li>
                  <span className="build-hero-amount">{INDIVIDUAL_PRICE}</span>
                  <span className="build-hero-tier">{t("thebuild.individualLabel")}</span>
                </li>
              </ul>
            </div>
          </header>

          <section className="max-w-lg mx-auto">
            <ol className="build-weeks">
              {WEEKS.map(week => (
                <li key={week} className="vector-card">
                  <p className="build-eyebrow build-week-label">{t(`thebuild.w${week}Label`)}</p>
                  <h2 className="vector-title vector-block-title">{t(`thebuild.w${week}Title`)}</h2>
                  <p className="vector-body">{t(`thebuild.w${week}Body`)}</p>
                </li>
              ))}
            </ol>
          </section>

          <MoonDivider />

          <section className="max-w-md mx-auto space-y-5">
            <MoonEyebrow heading>{t("thebuild.storiesEyebrow")}</MoonEyebrow>
            <p className="vector-body">{t("thebuild.storyFounder")}</p>
            <p className="vector-body">{t("thebuild.storyCoach")}</p>
          </section>

          {/* Same expandable one-line quotes as /ignite (shared hook, same data). */}
          <section className="max-w-md mx-auto text-left" id="testimonials" aria-label={t("thebuild.storiesEyebrow")}>
            <div className="moon-testimonials">
              {testimonials.map((item, i) => (
                <ExpandableTestimonial key={i} t={item} variant="moon" compact />
              ))}
            </div>
          </section>

          <MoonDivider />

          <section className="max-w-md mx-auto">
            <p className="vector-body">{t("thebuild.noScratch")}</p>
          </section>

          <MoonDivider />

          <section className="vector-card space-y-7 text-center">
            <MoonEyebrow heading>{t("thebuild.formatLabel")}</MoonEyebrow>
            <ul className="vector-list space-y-3 text-left max-w-md mx-auto">
              {[1, 2, 3].map(i => (
                <li key={i}>
                  <MoonStar className="vector-bullet" />
                  <span className="vector-body">{t(`thebuild.format${i}`)}</span>
                </li>
              ))}
            </ul>

            <MoonDivider />

            <div className="space-y-5">
              <MoonEyebrow heading>{t("thebuild.priceLabel")}</MoonEyebrow>
              <p className="vector-body max-w-md mx-auto">{t("thebuild.priceBody")}</p>
              <div className="build-price-grid">
                <div className="build-price-card vector-card">
                  <p className="build-eyebrow">{t("thebuild.groupLabel")}</p>
                  <p className="vector-price">{GROUP_PRICE}</p>
                  {whatsapp}
                </div>
                <div className="build-price-card vector-card">
                  <p className="build-eyebrow">{t("thebuild.individualLabel")}</p>
                  <p className="vector-price">{INDIVIDUAL_PRICE}</p>
                  {eligibility}
                </div>
              </div>
            </div>

            <div className="build-promise max-w-md mx-auto space-y-4 text-left">
              <p className="vector-body">{t("thebuild.promise")}</p>
              <p className="build-eyebrow">{t("thebuild.guaranteeLabel")}</p>
              <p className="vector-body">{t("thebuild.guarantee")}</p>
            </div>
            <p className="vector-title build-closing">{t("thebuild.closing")}</p>
          </section>

          <footer className="text-center space-y-6 pb-8">
            <p className="vector-body text-sm italic max-w-md mx-auto">
              {t("thebuild.routerBefore")}{" "}
              <Link to="/ignite" className="vector-link">{t("thebuild.routerLink")}</Link>
              {t("thebuild.routerAfter")}
            </p>
            <MoonDivider />
            <Link to="/data" className="vector-link inline-flex items-center justify-center min-h-11 text-xs">
              {t("thebuild.dataLink")}
            </Link>
          </footer>
        </div>
      </main>
    </>
  );
};

export default BuildContainer;
