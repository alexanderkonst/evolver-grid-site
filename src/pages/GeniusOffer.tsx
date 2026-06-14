import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import BoldText from "@/components/BoldText";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";

const GeniusOffer = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const testimonials = [
    {
      boldLine: t('geniusOffer.testimonial1Bold'),
      rest: t('geniusOffer.testimonial1Rest'),
      name: "Alexey"
    },
    {
      boldLine: t('geniusOffer.testimonial2Bold'),
      rest: t('geniusOffer.testimonial2Rest'),
      name: "Laura"
    },
    {
      boldLine: t('geniusOffer.testimonial3Bold'),
      rest: t('geniusOffer.testimonial3Rest'),
      name: "Simba"
    },
    {
      boldLine: t('geniusOffer.testimonial4Bold'),
      rest: t('geniusOffer.testimonial4Rest'),
      name: "Tshatiqua"
    }
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navigation />
      <ScrollToTop />

      {/* Back Button */}
      <div className="pt-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <BackButton
            to="/"
            label={<BoldText>{t('geniusOffer.back')}</BoldText>}
            className="text-muted-foreground hover:text-foreground transition-colors font-semibold"
          />
        </div>
      </div>

      {/* Hero Section - Centered */}
      <section className="pt-8 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight">
            <BoldText>{t('geniusOffer.heroTitle')}</BoldText>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t('geniusOffer.heroSubtitleBefore')}<strong>{t('geniusOffer.heroSubtitleEmphasis')}</strong>{t('geniusOffer.heroSubtitleAfter')}
          </p>

          {/* Prominent Price */}
          <div className="py-4">
            <span className="text-4xl md:text-5xl font-serif font-bold text-accent">$111</span>
            <span className="text-muted-foreground ml-2">{t('geniusOffer.priceUnit')}</span>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => window.open('https://buy.stripe.com/dRm9ATbMEayn8id5iUdEs0t', '_blank')}
            >
              <BoldText>{t('geniusOffer.ctaButton')}</BoldText>
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              <Link to="/genius-offer-intake" className="underline hover:text-foreground transition-colors">
                {t('geniusOffer.alreadyPaidLink')}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-10 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif mb-6 text-center">
            <BoldText>{t('geniusOffer.whoForTitle')}</BoldText>
          </h2>
          <ul className="space-y-3 max-w-2xl mx-auto">
            {[
              t('geniusOffer.whoFor1'),
              t('geniusOffer.whoFor2'),
              t('geniusOffer.whoFor3'),
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif mb-6 text-center">
            <BoldText>{t('geniusOffer.whatGetTitle')}</BoldText>
          </h2>
          <ul className="space-y-3 max-w-2xl mx-auto">
            {[
              t('geniusOffer.whatGet1'),
              t('geniusOffer.whatGet2'),
              t('geniusOffer.whatGet3'),
              t('geniusOffer.whatGet4'),
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif mb-8 text-center">
            <BoldText>{t('geniusOffer.howWorksTitle')}</BoldText>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: t('geniusOffer.step1Title'),
                description: t('geniusOffer.step1Desc'),
              },
              {
                step: "2",
                title: t('geniusOffer.step2Title'),
                description: t('geniusOffer.step2Desc'),
              },
              {
                step: "3",
                title: t('geniusOffer.step3Title'),
                description: t('geniusOffer.step3Desc'),
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-serif font-bold text-lg flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h3 className="font-serif font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase  text-primary/70 text-center mb-4">
            {t('geniusOffer.testimonialsEyebrow')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border bg-card/60 shadow-sm"
              >
                <p className="text-sm text-foreground mb-2">
                  <span className="font-semibold">"{testimonial.boldLine}"</span> {testimonial.rest}
                </p>
                <p className="text-xs font-semibold text-primary mt-3">
                  — {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4 bg-secondary/30">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-serif">
            <BoldText>{t('geniusOffer.finalCtaTitle')}</BoldText>
          </h2>

          <div className="py-2">
            <span className="text-3xl font-serif font-bold text-accent">$111</span>
            <span className="text-muted-foreground ml-2">{t('geniusOffer.priceUnit')}</span>
          </div>

          <Button
            size="lg"
            className="text-lg px-8"
            onClick={() => window.open('https://buy.stripe.com/dRm9ATbMEayn8id5iUdEs0t', '_blank')}
          >
            <BoldText>{t('geniusOffer.ctaButton')}</BoldText>
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-sm text-muted-foreground">
            <Link to="/genius-offer-intake" className="underline hover:text-foreground transition-colors">
              {t('geniusOffer.alreadyPaidLink')}
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GeniusOffer;
