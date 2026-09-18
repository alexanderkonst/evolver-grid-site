/** /products/crossing — the two-month transition program, styled to match Ignite. */
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { ProductCta, ProductEyebrow, ProductHero, ProductLanding, ProductList } from "@/components/products/ProductLanding";
import { Ornament } from "@/lib/landingDesign";

const TELEGRAM_CONVERSATION = "https://t.me/integralevolution";

// Sessions 6 and 7 share one block (s6); there is no s7 translation key.
const SESSION_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s8"] as const;

const TheCrossing = () => {
  const { t } = useTranslation();
  const contact = <ProductCta href={TELEGRAM_CONVERSATION} external breathe>{t("crossing.cta")}</ProductCta>;

  return (
    <>
      <SEO title={t("crossing.title")} description={t("crossing.seoDescription")} path="/products/crossing" />
      <ProductLanding>
        <ProductHero eyebrow={t("crossing.eyebrow")} title={t("crossing.heading")} subtitle={t("crossing.subheading")}>
          <Ornament />
          <div className="flex flex-col items-center gap-3 pt-2">
            {contact}
            <p className="product-body text-xs">{t("crossing.priceLine")}</p>
          </div>
        </ProductHero>

        <section className="max-w-md mx-auto space-y-6">
          <p className="product-body text-base text-center">{t("crossing.essence")}</p>
          <ProductEyebrow heading className="text-center">{t("crossing.formatHeading")}</ProductEyebrow>
          <ProductList items={["f1", "f2", "f3", "f4", "f5"].map(key => t(`crossing.${key}`))} />
        </section>

        <Ornament />

        <section className="max-w-lg mx-auto space-y-8">
          <div className="text-center space-y-4">
            <ProductEyebrow heading>{t("crossing.sequenceHeading")}</ProductEyebrow>
            <p className="product-body text-base italic max-w-md mx-auto">{t("crossing.sequenceIntro")}</p>
          </div>
          <ol className="product-timeline space-y-8">
            {SESSION_KEYS.map(key => (
              <li key={key}>
                <h3 className="product-title text-2xl mb-3">{t(`crossing.${key}.title`)}</h3>
                <p className="product-body text-base">{t(`crossing.${key}.body`)}</p>
              </li>
            ))}
          </ol>
        </section>

        <Ornament />

        <section className="liquid-glass-strong rounded-[2.5rem] p-7 md:p-9 text-center space-y-6">
          <ProductEyebrow heading>{t("crossing.priceHeading")}</ProductEyebrow>
          <p className="product-price">{t("crossing.priceLine")}</p>
          <p className="product-body text-base max-w-md mx-auto">{t("crossing.paymentLine")}</p>
          <Ornament />
          <div className="pt-2">{contact}</div>
        </section>

        <section className="text-center max-w-md mx-auto space-y-4 pb-8">
          <ProductEyebrow heading>{t("crossing.afterHeading")}</ProductEyebrow>
          <p className="product-body text-base">{t("crossing.afterBody")}</p>
        </section>
      </ProductLanding>
    </>
  );
};

export default TheCrossing;
