/**
 * /zone-of-genius/articulation — product page for the Zone of Genius
 * Articulation session, in Ignite's editorial visual language.
 *
 * Why not bare /zone-of-genius: that route is the live free Top Talent
 * entry (ZoneOfGeniusEntry) that the quiz, auth callbacks and result
 * emails depend on. External listings link here instead.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { ProductCta, ProductEyebrow, ProductHero, ProductLanding, ProductList } from "@/components/products/ProductLanding";
import { Ornament } from "@/lib/landingDesign";

// Same contact mechanism as the sibling paid product page (/products/built).
const WHATSAPP_URL = "https://wa.me/14157073432?text=" +
  encodeURIComponent("Hi Sasha! I'd like to book the Zone of Genius Articulation session.");

const ZoneOfGeniusArticulation = () => {
  const { t } = useTranslation();
  const contact = <ProductCta href={WHATSAPP_URL} external breathe>{t("zogSession.cta")}</ProductCta>;

  return (
    <>
      <SEO title={t("zogSession.seoTitle")} description={t("zogSession.seoDescription")} path="/zone-of-genius/articulation" />
      <ProductLanding>
        <ProductHero eyebrow={t("zogSession.eyebrow")} title={t("zogSession.h1")} subtitle={t("zogSession.promise")}>
          <Ornament />
          <div className="flex flex-col items-center gap-3 pt-2">
            {contact}
            <p className="product-body text-xs">{t("zogSession.priceLine")}</p>
          </div>
        </ProductHero>

        <section className="max-w-md mx-auto space-y-5">
          <ProductEyebrow heading className="text-center">{t("zogSession.leaveLabel")}</ProductEyebrow>
          <ProductList items={[1, 2, 3, 4].map(i => t(`zogSession.leave${i}`))} />
        </section>

        <Ornament />

        <section className="max-w-md mx-auto space-y-4 text-center">
          <ProductEyebrow heading>{t("zogSession.proofLabel")}</ProductEyebrow>
          <p className="product-body text-base">{t("zogSession.proof")}</p>
        </section>

        <section className="liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 text-center space-y-6">
          <ProductEyebrow heading>{t("zogSession.formatLabel")}</ProductEyebrow>
          <p className="product-body text-base max-w-md mx-auto">{t("zogSession.format")}</p>
          <Ornament />
          <div className="space-y-3">
            <ProductEyebrow heading>{t("zogSession.priceLabel")}</ProductEyebrow>
            <p className="product-price">$333</p>
          </div>
          <div className="pt-2">{contact}</div>
        </section>

        <footer className="text-center space-y-5 pb-8">
          <p className="product-body text-sm italic max-w-md mx-auto">
            {t("zogSession.quizBefore")}{" "}
            <Link to="/quiz" className="product-quiet-link">{t("zogSession.quizLink")}</Link>
          </p>
          <Ornament />
          <p className="product-body text-sm italic max-w-md mx-auto">
            {t("zogSession.nextBefore")}{" "}
            <Link to="/ignite" className="product-quiet-link">{t("zogSession.nextLink")}</Link>
          </p>
        </footer>
      </ProductLanding>
    </>
  );
};

export default ZoneOfGeniusArticulation;
