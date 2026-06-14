import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ExternalLink, ChevronRight, CheckCircle, Target } from "lucide-react";

// Bionic text component - bolds first half of each word (for headings only)
const BionicText = ({ children, className = "" }: { children: string; className?: string }) => {
    const words = children.split(" ");
    return (
        <span className={className}>
            {words.map((word, i) => {
                const midpoint = Math.ceil(word.length * 0.5);
                const firstHalf = word.slice(0, midpoint);
                const secondHalf = word.slice(midpoint);
                return (
                    <span key={i}>
                        <span className="font-bold">{firstHalf}</span>
                        <span className="font-normal">{secondHalf}</span>
                        {i < words.length - 1 ? " " : ""}
                    </span>
                );
            })}
        </span>
    );
};

const GeniusLayerMatching = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const CALENDLY_URL = "https://www.calendly.com/konstantinov";

    return (
        <div className="min-h-dvh flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-3xl space-y-16">

                    {/* Hero Section */}
                    <section className="text-center space-y-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl text-primary leading-tight uppercase ">
                            <BionicText>{t('geniusLayerMatching.heroTitle')}</BionicText>
                        </h1>

                        <p className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto">
                            {t('geniusLayerMatching.heroSubtitle')}
                        </p>

                        <div className="flex flex-col gap-4 justify-center pt-4">
                            <a
                                href={CALENDLY_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
                                style={{
                                    backgroundColor: 'hsl(210, 70%, 15%)',
                                    color: 'white'
                                }}
                            >
                                {t('geniusLayerMatching.ctaTalkToAleksandr')}
                                <ExternalLink size={18} />
                            </a>
                        </div>

                        <div className="pt-6">
                            <a
                                href="#how-pilot-works"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                            >
                                {t('geniusLayerMatching.heroLearnHow')}
                            </a>
                        </div>
                    </section>

                    {/* Problem Section */}
                    <section className="text-center space-y-4">
                        <h2 className="text-xl sm:text-2xl text-primary uppercase ">
                            <BionicText>{t('geniusLayerMatching.problemTitle')}</BionicText>
                        </h2>

                        <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
                            {t('geniusLayerMatching.problemBodyBefore')}<em>{t('geniusLayerMatching.problemBodyEm')}</em>{t('geniusLayerMatching.problemBodyAfter')}
                        </p>
                    </section>

                    {/* Solution Section */}
                    <section className="text-center space-y-4">
                        <h2 className="text-xl sm:text-2xl text-primary uppercase ">
                            <BionicText>{t('geniusLayerMatching.solutionTitle')}</BionicText>
                        </h2>

                        <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
                            {t('geniusLayerMatching.solutionBodyBefore')}<em>{t('geniusLayerMatching.solutionBodyEm')}</em>{t('geniusLayerMatching.solutionBodyAfter')}
                        </p>
                    </section>

                    {/* Why It Matters Section */}
                    <section className="text-center space-y-6">
                        <h2 className="text-xl sm:text-2xl text-primary uppercase ">
                            <BionicText>{t('geniusLayerMatching.whyTitle')}</BionicText>
                        </h2>

                        <ul className="space-y-4 text-left max-w-xl mx-auto">
                            {[
                                t('geniusLayerMatching.whyItem1'),
                                t('geniusLayerMatching.whyItem2'),
                                t('geniusLayerMatching.whyItem3')
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-foreground/90">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* How The Pilot Works Section */}
                    <section id="how-pilot-works" className="space-y-8">
                        <div className="text-center space-y-3">
                            <h2 className="text-xl sm:text-2xl text-primary uppercase ">
                                <BionicText>{t('geniusLayerMatching.pilotTitle')}</BionicText>
                            </h2>
                            <p className="text-muted-foreground">
                                {t('geniusLayerMatching.pilotSubtitle')}
                            </p>
                            <div className="text-lg font-semibold text-primary space-y-1">
                                <p>{t('geniusLayerMatching.pilotPrice5')}</p>
                                <p>{t('geniusLayerMatching.pilotPrice10')}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    step: 1,
                                    title: t('geniusLayerMatching.step1Title'),
                                    description: t('geniusLayerMatching.step1Desc')
                                },
                                {
                                    step: 2,
                                    title: t('geniusLayerMatching.step2Title'),
                                    description: t('geniusLayerMatching.step2Desc')
                                },
                                {
                                    step: 3,
                                    title: t('geniusLayerMatching.step3Title'),
                                    description: null,
                                    bullets: [
                                        t('geniusLayerMatching.step3Bullet1'),
                                        t('geniusLayerMatching.step3Bullet2'),
                                        t('geniusLayerMatching.step3Bullet3')
                                    ]
                                },
                                {
                                    step: 4,
                                    title: t('geniusLayerMatching.step4Title'),
                                    description: t('geniusLayerMatching.step4Desc')
                                },
                                {
                                    step: 5,
                                    title: t('geniusLayerMatching.step5Title'),
                                    description: t('geniusLayerMatching.step5Desc')
                                }
                            ].map((item) => (
                                <div
                                    key={item.step}
                                    className="flex gap-4 p-4 sm:p-5 rounded-2xl border border-border bg-card/60"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base sm:text-lg">
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                                            {item.title}
                                        </h3>
                                        {item.description && (
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {item.description}
                                            </p>
                                        )}
                                        {item.bullets && (
                                            <ul className="space-y-1.5 mt-2">
                                                {item.bullets.map((bullet, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Who It's For Section */}
                    <section className="text-center space-y-6">
                        <div>
                            <p className="text-xs uppercase  text-primary/70 mb-2">
                                {t('geniusLayerMatching.whoEyebrow')}
                            </p>
                            <h2 className="text-xl sm:text-2xl text-primary uppercase ">
                                <BionicText>{t('geniusLayerMatching.whoTitle')}</BionicText>
                            </h2>
                        </div>

                        <ul className="space-y-4 text-left max-w-xl mx-auto">
                            {[
                                t('geniusLayerMatching.whoItem1'),
                                t('geniusLayerMatching.whoItem2'),
                                t('geniusLayerMatching.whoItem3')
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-foreground/90">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* FAQ Section */}
                    <section className="space-y-8">
                        <h2 className="text-xl sm:text-2xl text-center text-primary uppercase ">
                            <BionicText>{t('geniusLayerMatching.faqTitle')}</BionicText>
                        </h2>

                        <div className="space-y-6 text-center">
                            {[
                                {
                                    q: t('geniusLayerMatching.faq1Q'),
                                    a: t('geniusLayerMatching.faq1A')
                                },
                                {
                                    q: t('geniusLayerMatching.faq2Q'),
                                    a: t('geniusLayerMatching.faq2A')
                                },
                                {
                                    q: t('geniusLayerMatching.faq3Q'),
                                    a: t('geniusLayerMatching.faq3A')
                                },
                                {
                                    q: t('geniusLayerMatching.faq4Q'),
                                    a: t('geniusLayerMatching.faq4A')
                                }
                            ].map((faq, idx) => (
                                <div key={idx} className="space-y-2">
                                    <h3 className="font-semibold text-foreground">{faq.q}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className="text-center space-y-6 py-10 px-6 rounded-3xl border-2 border-primary/30 bg-primary/5">
                        <h2 className="text-xl sm:text-2xl text-primary uppercase ">
                            <BionicText>{t('geniusLayerMatching.finalCtaTitle')}</BionicText>
                        </h2>

                        <p className="text-base text-foreground/80 max-w-2xl mx-auto">
                            {t('geniusLayerMatching.finalCtaBody')}
                        </p>

                        <div className="flex justify-center">
                            <a
                                href={CALENDLY_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
                                style={{
                                    backgroundColor: 'hsl(210, 70%, 15%)',
                                    color: 'white'
                                }}
                            >
                                {t('geniusLayerMatching.ctaTalkToAleksandr')}
                                <ExternalLink size={18} />
                            </a>
                        </div>
                    </section>

                </div>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default GeniusLayerMatching;
