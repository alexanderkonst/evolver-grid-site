import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import BoldText from "@/components/BoldText";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import profilePhoto from "@/assets/profile-photo.png";
import BackButton from "@/components/BackButton";

const Destiny = () => {
  const { t } = useTranslation();
  const sectionIds = ['hero', 'is-this-you', 'how-it-works', 'about', 'start'];
  const activeSection = useScrollSpy(sectionIds);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll animations for sections
  const isThisYouAnimation = useScrollAnimation(0.2);
  const promiseAnimation = useScrollAnimation(0.2);
  const methodAnimation = useScrollAnimation(0.2);
  const qualificationAnimation = useScrollAnimation(0.2);
  const containerAnimation = useScrollAnimation(0.2);
  const aboutAnimation = useScrollAnimation(0.2);
  const finalCtaAnimation = useScrollAnimation(0.2);

  return (
    <div className="min-h-dvh">
      <Navigation />
      
      {/* Back Button - Left Aligned */}
      <div className="pt-24 pb-4 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
        <div className="container mx-auto max-w-4xl">
          <BackButton
            to="/"
            label={<BoldText>{t('destiny.nav.back')}</BoldText>}
            className="text-white/60 hover:text-white transition-colors font-semibold"
          />
        </div>
      </div>
      
      {/* Sticky Top Nav */}
      <nav className="fixed top-20 left-0 right-0 z-overlay bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-3 sm:gap-6 py-4 overflow-x-auto scrollbar-hide">
            {[
              { labelKey: "destiny.nav.home", id: "hero" },
              { labelKey: "destiny.nav.isThisYou", id: "is-this-you" },
              { labelKey: "destiny.nav.howItWorks", id: "how-it-works" },
              { labelKey: "destiny.nav.about", id: "about" },
              { labelKey: "destiny.nav.start", id: "start" }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                  activeSection === link.id 
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={activeSection === link.id ? { color: 'hsl(var(--destiny-gold-dark))' } : {}}
              >
                <BoldText>{t(link.labelKey)}</BoldText>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section - Deep Charcoal/Midnight Indigo */}
      <section 
        id="hero" 
        className="min-h-dvh flex items-center justify-center pt-32 pb-20 px-6"
        style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          {/* Central Orb / Spotlight Visual */}
          <div className="mb-8 flex justify-center">
            <div 
              className="w-32 h-32 rounded-full orb-pulse"
              style={{
                backgroundColor: 'hsl(var(--destiny-gold))',
              }}
            />
          </div>

          {/* Offer Name Overline */}
          <p className="text-sm uppercase  mb-6 text-white/60">
            <BoldText>{t('destiny.hero.overline')}</BoldText>
          </p>

          {/* Hero Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-6 text-white">
            <BoldText>{t('destiny.hero.headline')}</BoldText>
          </h1>

          {/* Hero Subheadline */}
          <p className="text-xl sm:text-2xl mb-8 text-white/80 max-w-3xl mx-auto leading-relaxed">
            {t('destiny.hero.subheadlineBefore')}<span style={{ color: 'hsl(45, 100%, 65%)' }}>{t('destiny.hero.subheadlineEmphasis')}</span>{t('destiny.hero.subheadlineAfter')}
          </p>
          
          {/* Hero Bullets */}
          <div className="space-y-3 mb-12 max-w-2xl mx-auto">
            {[
              "destiny.hero.bullet1",
              "destiny.hero.bullet2",
              "destiny.hero.bullet3"
            ].map((bulletKey, i) => (
              <div key={i} className="flex items-start gap-3 text-left">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(45, 100%, 65%)' }} />
                <p className="text-white/70 text-base">{t(bulletKey)}</p>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <Button 
            size="lg"
            onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
            className="destiny-cta-button text-lg px-12 py-6 rounded-full shadow-lg mb-4"
            style={{ 
              backgroundColor: 'hsl(var(--destiny-gold))', 
              color: 'hsl(var(--destiny-dark))',
            }}
          >
            <BoldText>{t('destiny.cta.book')}</BoldText>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {/* Subtext under button */}
          <p className="text-sm text-white/50">
            {t('destiny.hero.ctaSubtext')}
          </p>
        </div>
      </section>

      {/* Is This You? Section - Warm Off-White */}
      <section 
        id="is-this-you" 
        ref={isThisYouAnimation.ref}
        className={`py-24 px-6 ${isThisYouAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-center">
            <BoldText>{t('destiny.isThisYou.heading')}</BoldText>
          </h2>

          <div className="space-y-6 text-lg text-foreground/80 max-w-3xl mx-auto">
            <p className="text-xl font-medium">
              {t('destiny.isThisYou.intro')}
            </p>

            <div className="space-y-4 pl-6 border-l-2" style={{ borderColor: 'hsl(45, 100%, 65%)' }}>
              <p>
                {t('destiny.isThisYou.bullet1')}
              </p>
              <p>
                {t('destiny.isThisYou.bullet2')}
              </p>
              <p>
                {t('destiny.isThisYou.bullet3')}
              </p>
              <p>
                {t('destiny.isThisYou.bullet4')}
              </p>
              <p>
                {t('destiny.isThisYou.bullet5')}
              </p>
            </div>

            <p className="text-xl font-semibold text-center pt-6" style={{ color: 'hsl(var(--destiny-gold-dark))' }}>
              {t('destiny.isThisYou.closer')}
            </p>

            {/* Mid-Page CTA */}
            <div className="flex justify-center mt-12">
              <Button 
                size="lg"
                onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
                className="destiny-cta-button text-lg px-12 py-6 rounded-full shadow-lg"
                style={{ 
                  backgroundColor: 'hsl(var(--destiny-gold))', 
                  color: 'hsl(var(--destiny-dark))',
                }}
              >
                <BoldText>{t('destiny.cta.book')}</BoldText>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Promise Section - Deep Charcoal */}
      <section 
        id="how-it-works" 
        ref={promiseAnimation.ref}
        className={`py-24 px-6 ${promiseAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-dark))' }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-center text-white">
            <BoldText>{t('destiny.promise.heading')}</BoldText>
          </h2>

          <div className="space-y-6 text-lg text-white/80 max-w-3xl mx-auto">
            <p className="text-xl">
              {t('destiny.promise.p1')}
            </p>

            <p className="text-xl">
              {t('destiny.promise.p2')}
            </p>

            <div className="space-y-4 pl-6 border-l-2" style={{ borderColor: 'hsl(var(--destiny-gold))' }}>
              <p>{t('destiny.promise.bullet1')}</p>
              <p>{t('destiny.promise.bullet2')}</p>
              <p>{t('destiny.promise.bullet3')}</p>
              <p>{t('destiny.promise.bullet4')}</p>
            </div>

            <p className="text-xl font-semibold text-center pt-6" style={{ color: 'hsl(var(--destiny-gold))' }}>
              {t('destiny.promise.closer')}
            </p>
          </div>
        </div>
      </section>

      {/* Excalibur Method Section - Warm Off-White */}
      <section 
        ref={methodAnimation.ref}
        className={`py-24 px-6 ${methodAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
      >
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-4 text-center">
            <BoldText>{t('destiny.method.heading')}</BoldText>
          </h2>

          <p className="text-xl text-center mb-16 text-muted-foreground">
            {t('destiny.method.subheading')}
          </p>
          
          <div className="relative space-y-12">
            {/* Connecting Line */}
            <div 
              className="absolute left-8 top-16 bottom-16 w-0.5 z-underlay"
              style={{ backgroundColor: 'hsl(var(--destiny-gold))' }}
            />

            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 hover:scale-110 hover:shadow-lg z-above"
                style={{ backgroundColor: 'hsl(var(--destiny-gold))', color: 'hsl(var(--destiny-dark))' }}
              >
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-bold mb-3">
                  <BoldText>{t('destiny.method.step1.title')}</BoldText>
                </h3>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  {t('destiny.method.step1.body')}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 hover:scale-110 hover:shadow-lg z-above"
                style={{ backgroundColor: 'hsl(var(--destiny-gold))', color: 'hsl(var(--destiny-dark))' }}
              >
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-bold mb-3">
                  <BoldText>{t('destiny.method.step2.title')}</BoldText>
                </h3>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  {t('destiny.method.step2.body')}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 hover:scale-110 hover:shadow-lg z-above"
                style={{ backgroundColor: 'hsl(var(--destiny-gold))', color: 'hsl(var(--destiny-dark))' }}
              >
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-bold mb-3">
                  <BoldText>{t('destiny.method.step3.title')}</BoldText>
                </h3>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  {t('destiny.method.step3.body')}
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 items-start">
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 hover:scale-110 hover:shadow-lg z-above"
                style={{ backgroundColor: 'hsl(var(--destiny-gold))', color: 'hsl(var(--destiny-dark))' }}
              >
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-bold mb-3">
                  <BoldText>{t('destiny.method.step4.title')}</BoldText>
                </h3>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  {t('destiny.method.step4.body')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For / Not For Section - Deep Charcoal */}
      <section 
        ref={qualificationAnimation.ref}
        className={`py-24 px-6 ${qualificationAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-dark))' }}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Who This Is For */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-white">
                <BoldText>{t('destiny.forWhom.forHeading')}</BoldText>
              </h2>
              <div className="space-y-4">
                {[
                  "destiny.forWhom.for1",
                  "destiny.forWhom.for2",
                  "destiny.forWhom.for3",
                  "destiny.forWhom.for4"
                ].map((itemKey, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--destiny-gold))' }} />
                    <p className="text-white/70 text-base leading-relaxed">{t(itemKey)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Who This Is Not For */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-white">
                <BoldText>{t('destiny.forWhom.notForHeading')}</BoldText>
              </h2>
              <div className="space-y-4">
                {[
                  "destiny.forWhom.notFor1",
                  "destiny.forWhom.notFor2",
                  "destiny.forWhom.notFor3",
                  "destiny.forWhom.notFor4"
                ].map((itemKey, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 flex-shrink-0 mt-0.5 text-white/40">✕</div>
                    <p className="text-white/70 text-base leading-relaxed">{t(itemKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work Together Section - Warm Off-White */}
      <section 
        ref={containerAnimation.ref}
        className={`py-24 px-6 ${containerAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-center">
            <BoldText>{t('destiny.howWeWork.heading')}</BoldText>
          </h2>

          <div className="space-y-6 text-lg text-foreground/80 max-w-3xl mx-auto">
            <p>
              {t('destiny.howWeWork.intro')}
            </p>
            <ul className="list-none space-y-2 pl-6">
              <li>{t('destiny.howWeWork.item1')}</li>
              <li>{t('destiny.howWeWork.item2')}</li>
              <li>{t('destiny.howWeWork.item3')}</li>
            </ul>

            <p className="pt-4">
              {t('destiny.howWeWork.beforeAfter')}
            </p>

            <div className="pt-8 border-t border-border">
              <h3 className="text-2xl font-serif font-bold mb-4">
                <BoldText>{t('destiny.howWeWork.valueHeading')}</BoldText>
              </h3>
              <ul className="list-none space-y-2">
                <li>{t('destiny.howWeWork.value1')}</li>
                <li>{t('destiny.howWeWork.value2')}</li>
                <li>{t('destiny.howWeWork.value3')}</li>
              </ul>
              <p className="pt-4 text-xl font-semibold" style={{ color: 'hsl(var(--destiny-gold-dark))' }}>
                {t('destiny.howWeWork.valueCloser')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Deep Charcoal */}
      <section 
        id="about" 
        ref={aboutAnimation.ref}
        className={`py-24 px-6 ${aboutAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-dark))' }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-12 text-center text-white">
            <BoldText>{t('destiny.about.heading')}</BoldText>
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-center max-w-3xl mx-auto">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <img 
                src={profilePhoto} 
                alt="Aleksandr Konstantinov"
                loading="lazy"
                className="w-48 h-48 rounded-full object-cover"
                style={{ 
                  border: '3px solid hsl(var(--destiny-gold))',
                  boxShadow: '0 0 30px hsla(var(--destiny-gold), 0.3)'
                }}
              />
            </div>
            
            {/* Bio Text */}
            <div className="space-y-6 text-lg text-white/80 flex-1">
              <p>
                {t('destiny.about.bio1')}
              </p>

              <p>
                {t('destiny.about.bio2')}
              </p>

              <p>
                {t('destiny.about.bio3')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Warm Off-White */}
      <section 
        id="start" 
        ref={finalCtaAnimation.ref}
        className={`py-24 px-6 ${finalCtaAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8">
            <BoldText>{t('destiny.finalCta.heading')}</BoldText>
          </h2>

          <div className="space-y-6 text-lg text-foreground/80 max-w-3xl mx-auto mb-12">
            <p>
              {t('destiny.finalCta.p1')}
            </p>

            <p>
              {t('destiny.finalCta.p2')}
            </p>
          </div>

          <Button 
            size="lg"
            onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
            className="destiny-cta-button text-lg px-12 py-6 rounded-full shadow-lg mb-4"
            style={{ 
              backgroundColor: 'hsl(var(--destiny-gold))', 
              color: 'hsl(var(--destiny-dark))',
            }}
          >
            <BoldText>{t('destiny.cta.book')}</BoldText>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {t('destiny.finalCta.subtext')}
          </p>
        </div>
      </section>

      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Sticky Mobile CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-3 pb-safe-4 shadow-lg z-modal">
        <button
          onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
          className="w-full py-3 rounded-full font-bold transition-all text-sm shadow-[0_0_20px_rgba(45,100,165,0.4)]"
          style={{ 
            backgroundColor: 'hsl(var(--destiny-gold))', 
            color: 'hsl(var(--destiny-dark))',
          }}
        >
          <BoldText>{t('destiny.cta.bookShort')}</BoldText>
        </button>
      </div>
    </div>
  );
};

export default Destiny;
