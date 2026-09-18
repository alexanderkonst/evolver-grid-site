/**
 * /products/built — the BUILT container, in Ignite's editorial visual language.
 * Copy remains verbatim: docs/04-products/the_build_container.md.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { ProductCta, ProductEyebrow, ProductHero, ProductLanding, ProductList } from "@/components/products/ProductLanding";
import { Ornament } from "@/lib/landingDesign";

const WHATSAPP_URL = "https://wa.me/14157073432?text=" +
  encodeURIComponent("Hi Sasha! The BUILT container lands for me, and I wanted to get in touch.");

const BuildContainer = () => {
  const { t } = useTranslation();
  const contact = <ProductCta href={WHATSAPP_URL} external breathe>{t("thebuild.cta")}</ProductCta>;

  return (
    <>
      <SEO title={t("thebuild.seoTitle")} description={t("thebuild.seoDescription")} path="/products/built" />
      <ProductLanding>
        <ProductHero eyebrow={t("thebuild.eyebrow")} title={t("thebuild.h1")} subtitle={t("thebuild.sauce")}>
          <Ornament />
          <div className="flex flex-col items-center gap-3 pt-2">
            {contact}
            <p className="product-body text-xs">$1,111</p>
          </div>
        </ProductHero>

        <section className="max-w-lg mx-auto">
          <ol className="product-timeline space-y-8">
            {[1, 2, 3].map(week => (
              <li key={week}>
                <ProductEyebrow>{t(`thebuild.w${week}Label`)}</ProductEyebrow>
                <h2 className="product-title text-2xl mt-2 mb-3">{t(`thebuild.w${week}Title`)}</h2>
                <p className="product-body text-base">{t(`thebuild.w${week}Body`)}</p>
              </li>
            ))}
          </ol>
        </section>

        <Ornament />

        <section className="max-w-md mx-auto space-y-5">
          <ProductEyebrow heading className="text-center">{t("thebuild.storiesEyebrow")}</ProductEyebrow>
          <p className="product-body text-base">{t("thebuild.storyFounder")}</p>
          <p className="product-body text-base">{t("thebuild.storyCoach")}</p>
          <p className="product-body text-sm italic text-center">
            {t("thebuild.testimonialsBefore")}{" "}
            <Link to="/ignite" className="product-quiet-link">{t("thebuild.testimonialsLink")}</Link>
          </p>
          <p className="product-body text-base pt-2">{t("thebuild.noScratch")}</p>
        </section>

        <Ornament />

        <section className="liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 text-center space-y-6">
          <ProductEyebrow heading>{t("thebuild.formatLabel")}</ProductEyebrow>
          <div className="max-w-md mx-auto">
            <ProductList items={[1, 2, 3].map(i => t(`thebuild.format${i}`))} />
          </div>
          <Ornament />
          <div className="space-y-3">
            <ProductEyebrow heading>{t("thebuild.priceLabel")}</ProductEyebrow>
            <p className="product-price">$1,111</p>
            <p className="product-body text-base max-w-md mx-auto">{t("thebuild.priceBody")}</p>
          </div>
          <p className="product-body text-base max-w-md mx-auto rounded-xl border p-4"
            style={{ borderColor: "var(--skin-ornament-rule, rgba(26,30,58,0.16))" }}>
            {t("thebuild.promise")}
          </p>
          <p className="product-title text-xl italic">{t("thebuild.closing")}</p>
          <div className="pt-2">{contact}</div>
        </section>

        <footer className="text-center space-y-6 pb-8">
          <p className="product-body text-sm italic max-w-md mx-auto">
            {t("thebuild.routerBefore")}{" "}
            <Link to="/ignite" className="product-quiet-link">{t("thebuild.routerLink")}</Link>
            {t("thebuild.routerAfter")}
          </p>
          <p className="product-title text-base">Aleks</p>
          <Ornament />
          <Link to="/data" className="product-quiet-link inline-flex items-center justify-center min-h-11 text-xs">
            {t("thebuild.dataLink")}
          </Link>
        </footer>
      </ProductLanding>
    </>
  );
};

export default BuildContainer;
