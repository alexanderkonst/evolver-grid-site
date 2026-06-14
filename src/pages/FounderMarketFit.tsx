import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./FounderMarketFit.css";

const CAL_LINK = "https://cal.com/aleksandrkonstantinov/fmf";

const FounderMarketFit = () => {
    const { t } = useTranslation();
    useEffect(() => {
        document.title = "Founder-Market Fit | Alexander Konstantinov";
        document.documentElement.classList.add("dark");

        // SEO meta tags
        const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
        const origDesc = metaDesc.getAttribute('content') || '';
        metaDesc.setAttribute('name', 'description');
        metaDesc.setAttribute('content', 'Find the structural match between who you are and what you build. 90-minute diagnostic for founders between ventures. $197.');
        if (!metaDesc.parentNode) document.head.appendChild(metaDesc);

        // OG tags — update existing or create new
        const ogTags: Record<string, string> = {
            'og:title': 'Founder-Market Fit | Alexander Konstantinov',
            'og:description': 'You\'ve already been building it. You just can\'t see it yet. 90-minute diagnostic for founders between ventures.',
            'og:type': 'website',
            'og:url': 'https://evolver.team/fmf',
            'twitter:card': 'summary_large_image',
            'twitter:title': 'Founder-Market Fit | Alexander Konstantinov',
            'twitter:description': 'The pattern you keep seeing. The problem you can\'t stop working on. That\'s not a detour — that\'s the business.',
        };
        const originals: Record<string, string | null> = {};
        const createdElements: HTMLMetaElement[] = [];
        Object.entries(ogTags).forEach(([property, content]) => {
            const existing = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
            if (existing) {
                originals[property] = existing.getAttribute('content');
                existing.setAttribute('content', content);
            } else {
                const el = document.createElement('meta');
                el.setAttribute('property', property);
                el.setAttribute('content', content);
                document.head.appendChild(el);
                createdElements.push(el);
            }
        });

        return () => {
            document.documentElement.classList.remove("dark");
            // Restore originals
            Object.entries(originals).forEach(([property, origContent]) => {
                const el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
                if (el && origContent !== null) el.setAttribute('content', origContent);
            });
            createdElements.forEach(el => el.remove());
            metaDesc.setAttribute('content', origDesc);
        };
    }, []);

    return (
        <div className="fmf-page">
            {/* ===== 1. HERO — recognition, not diagnosis ===== */}
            <section className="fmf-hero">
                <div className="fmf-hero-bg" aria-hidden="true">
                    <div className="fmf-orb fmf-orb-1" />
                    <div className="fmf-orb fmf-orb-2" />
                    <div className="fmf-orb fmf-orb-3" />
                </div>
                <div className="fmf-container fmf-hero-content">
                    <p className="fmf-eyebrow">{t('founderMarketFit.heroEyebrow')}</p>
                    <h1 className="fmf-h1">
                        {t('founderMarketFit.heroH1Line1')}
                        <br />
                        <span className="fmf-gradient-text">{t('founderMarketFit.heroH1Line2')}</span>
                    </h1>
                    <p className="fmf-hero-sub">
                        {t('founderMarketFit.heroSub')}
                    </p>
                    <a href="#book" className="fmf-cta-primary">
                        {t('founderMarketFit.heroCta')}
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <p className="fmf-hero-context">{t('founderMarketFit.heroContext')}</p>
                </div>
            </section>

            {/* ===== 2. PAIN — their own words ===== */}
            <section className="fmf-section fmf-problem">
                <div className="fmf-container">
                    <h2 className="fmf-h2">{t('founderMarketFit.painHeading')}</h2>
                    <ul className="fmf-pain-list">
                        <li>{t('founderMarketFit.painItem1Before')}<strong>{t('founderMarketFit.painItem1Strong')}</strong>{t('founderMarketFit.painItem1After')}</li>
                        <li>{t('founderMarketFit.painItem2Before')}<strong>{t('founderMarketFit.painItem2Strong')}</strong>{t('founderMarketFit.painItem2After')}</li>
                        <li>{t('founderMarketFit.painItem3')}</li>
                        <li>{t('founderMarketFit.painItem4')}</li>
                        <li>{t('founderMarketFit.painItem5')}</li>
                    </ul>
                    <div className="fmf-reframe">
                        <p>
                            {t('founderMarketFit.painReframeBefore')}<strong>{t('founderMarketFit.painReframeStrong')}</strong>{t('founderMarketFit.painReframeAfter')}
                        </p>
                        <p>
                            {t('founderMarketFit.painReframeP2')}
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 2b. THE MYTH — what the startup world gets wrong ===== */}
            <section className="fmf-section fmf-myth">
                <div className="fmf-container">
                    <h2 className="fmf-h2">{t('founderMarketFit.mythHeading')}</h2>
                    <div className="fmf-reframe">
                        <p>
                            {t('founderMarketFit.mythP1')}
                        </p>
                        <p>
                            {t('founderMarketFit.mythP2')}
                        </p>
                        <p>
                            <strong>{t('founderMarketFit.mythP3Strong')}</strong>{t('founderMarketFit.mythP3After')}
                        </p>
                        <p>
                            {t('founderMarketFit.mythP4Before')}"<strong>{t('founderMarketFit.mythP4Strong')}</strong>"
                        </p>
                        <p>
                            {t('founderMarketFit.mythP5')}
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 3. DIAGNOSIS — here's why ===== */}
            <section className="fmf-section fmf-revelation">
                <div className="fmf-container">
                    <div className="fmf-fmf-reveal">
                        <p className="fmf-reveal-before">{t('founderMarketFit.revealBefore')}</p>
                        <h3 className="fmf-reveal-headline">{t('founderMarketFit.revealHeadline')}</h3>
                        <p className="fmf-reveal-after">
                            {t('founderMarketFit.revealAfter1')}
                        </p>
                        <p className="fmf-reveal-after">
                            {t('founderMarketFit.revealAfter2Before')}<em>{t('founderMarketFit.revealAfter2Em')}</em>{t('founderMarketFit.revealAfter2After')}
                        </p>
                    </div>
                    <div className="fmf-reframe">
                        <p>
                            <strong>{t('founderMarketFit.revealReframeStrong')}</strong>{t('founderMarketFit.revealReframeAfter')}
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 4. COMPASSION — not your fault, until it's obvious ===== */}
            <section className="fmf-section fmf-compassion">
                <div className="fmf-container">
                    <h2 className="fmf-h2">{t('founderMarketFit.compassionHeading')}</h2>
                    <div className="fmf-reframe">
                        <p className="fmf-core-belief">
                            {t('founderMarketFit.compassionP1Before')}<strong>{t('founderMarketFit.compassionP1Strong')}</strong>
                        </p>
                        <p>
                            {t('founderMarketFit.compassionP2Before')}<strong>{t('founderMarketFit.compassionP2Strong')}</strong>
                        </p>
                        <p>
                            {t('founderMarketFit.compassionP3')}
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 4b. FILTER — who this is / isn't for ===== */}
            <section className="fmf-section fmf-filter">
                <div className="fmf-container">
                    <div className="fmf-filter-grid">
                        <div className="fmf-filter-col">
                            <h3 className="fmf-h3">{t('founderMarketFit.filterYesHeading')}</h3>
                            <ul className="fmf-filter-list fmf-filter-yes">
                                <li>{t('founderMarketFit.filterYes1')}</li>
                                <li>{t('founderMarketFit.filterYes2')}</li>
                                <li>{t('founderMarketFit.filterYes3')}</li>
                                <li>{t('founderMarketFit.filterYes4')}</li>
                            </ul>
                        </div>
                        <div className="fmf-filter-col">
                            <h3 className="fmf-h3">{t('founderMarketFit.filterNoHeading')}</h3>
                            <ul className="fmf-filter-list fmf-filter-no">
                                <li>{t('founderMarketFit.filterNo1')}</li>
                                <li>{t('founderMarketFit.filterNo2')}</li>
                                <li>{t('founderMarketFit.filterNo3')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 5. METHOD — see yours in 90 minutes ===== */}
            <section className="fmf-section fmf-solution">
                <div className="fmf-container">
                    <h2 className="fmf-h2">{t('founderMarketFit.methodHeading')}</h2>
                    <div className="fmf-steps">
                        <div className="fmf-step">
                            <div className="fmf-step-num">1</div>
                            <h3 className="fmf-step-title">{t('founderMarketFit.methodStep1Title')}</h3>
                            <p className="fmf-step-desc">
                                {t('founderMarketFit.methodStep1Desc')}
                            </p>
                        </div>
                        <div className="fmf-step-arrow" aria-hidden="true">→</div>
                        <div className="fmf-step">
                            <div className="fmf-step-num">2</div>
                            <h3 className="fmf-step-title">{t('founderMarketFit.methodStep2Title')}</h3>
                            <p className="fmf-step-desc">
                                {t('founderMarketFit.methodStep2DescBefore')}<em>{t('founderMarketFit.methodStep2DescEm')}</em>{t('founderMarketFit.methodStep2DescAfter')}
                            </p>
                        </div>
                        <div className="fmf-step-arrow" aria-hidden="true">→</div>
                        <div className="fmf-step">
                            <div className="fmf-step-num">3</div>
                            <h3 className="fmf-step-title">{t('founderMarketFit.methodStep3Title')}</h3>
                            <p className="fmf-step-desc">
                                {t('founderMarketFit.methodStep3Desc')}
                            </p>
                        </div>
                    </div>

                    <div className="fmf-deliverables">
                        <h3 className="fmf-h3">{t('founderMarketFit.deliverablesHeading')}</h3>
                        <div className="fmf-deliverable-grid">
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>{t('founderMarketFit.deliverable1Strong')}</strong>{t('founderMarketFit.deliverable1After')}
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>{t('founderMarketFit.deliverable2Strong')}</strong>{t('founderMarketFit.deliverable2After')}
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>{t('founderMarketFit.deliverable3Strong')}</strong>{t('founderMarketFit.deliverable3After')}
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>{t('founderMarketFit.deliverable4Strong')}</strong>{t('founderMarketFit.deliverable4After')}
                            </div>
                        </div>
                    </div>

                    <p className="fmf-method-footnote">
                        {t('founderMarketFit.methodFootnote')}
                    </p>
                </div>
            </section>

            {/* ===== 6. PROOF — others trusted this ===== */}
            <section className="fmf-section fmf-proof">
                <div className="fmf-container">
                    <div className="fmf-credentials">
                        <div className="fmf-credential">
                            <span className="fmf-credential-num">250+</span>
                            <span className="fmf-credential-label">{t('founderMarketFit.credential1Label')}</span>
                        </div>
                        <div className="fmf-credential-divider" aria-hidden="true" />
                        <div className="fmf-credential">
                            <span className="fmf-credential-num">10+</span>
                            <span className="fmf-credential-label">{t('founderMarketFit.credential2Label')}</span>
                        </div>
                        <div className="fmf-credential-divider" aria-hidden="true" />
                        <div className="fmf-credential">
                            <span className="fmf-credential-num">MIT</span>
                            <span className="fmf-credential-label">{t('founderMarketFit.credential3Label')}</span>
                        </div>
                    </div>

                    <div className="fmf-testimonials">
                        <div className="fmf-testimonial">
                            <p className="fmf-testimonial-quote">
                                {t('founderMarketFit.testimonial1Before')}<strong>{t('founderMarketFit.testimonial1Strong')}</strong>"
                            </p>
                            <div className="fmf-testimonial-author">
                                <span className="fmf-testimonial-name">Alexey</span>
                                <span className="fmf-testimonial-result">{t('founderMarketFit.testimonial1Result')}</span>
                            </div>
                        </div>
                        <div className="fmf-testimonial">
                            <p className="fmf-testimonial-quote">
                                {t('founderMarketFit.testimonial2Before')}<strong>{t('founderMarketFit.testimonial2Strong')}</strong>"
                            </p>
                            <div className="fmf-testimonial-author">
                                <span className="fmf-testimonial-name">Tshatiqua</span>
                                <span className="fmf-testimonial-result">{t('founderMarketFit.testimonial2Result')}</span>
                            </div>
                        </div>
                        <div className="fmf-testimonial">
                            <p className="fmf-testimonial-quote">
                                {t('founderMarketFit.testimonial3Before')}<strong>{t('founderMarketFit.testimonial3Strong')}</strong>"
                            </p>
                            <div className="fmf-testimonial-author">
                                <span className="fmf-testimonial-name">Simba</span>
                                <span className="fmf-testimonial-result">{t('founderMarketFit.testimonial3Result')}</span>
                            </div>
                        </div>
                        <div className="fmf-testimonial">
                            <p className="fmf-testimonial-quote">
                                {t('founderMarketFit.testimonial4Before')}<strong>{t('founderMarketFit.testimonial4Strong')}</strong>"
                            </p>
                            <div className="fmf-testimonial-author">
                                <span className="fmf-testimonial-name">Laura</span>
                                <span className="fmf-testimonial-result">{t('founderMarketFit.testimonial4Result')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 7a. OBJECTIONS — quick answers ===== */}
            <section className="fmf-section fmf-objections">
                <div className="fmf-container">
                    <div className="fmf-objection-grid">
                        <div className="fmf-objection">
                            <h4 className="fmf-objection-q">{t('founderMarketFit.objection1Q')}</h4>
                            <p>{t('founderMarketFit.objection1ABefore')}<em>{t('founderMarketFit.objection1AEm')}</em>{t('founderMarketFit.objection1AAfter')}</p>
                        </div>
                        <div className="fmf-objection">
                            <h4 className="fmf-objection-q">{t('founderMarketFit.objection2Q')}</h4>
                            <p>{t('founderMarketFit.objection2A')}</p>
                        </div>
                        <div className="fmf-objection">
                            <h4 className="fmf-objection-q">{t('founderMarketFit.objection3Q')}</h4>
                            <p>{t('founderMarketFit.objection3A')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 7b. CTA — do it ===== */}
            <section className="fmf-section fmf-book" id="book">
                <div className="fmf-container fmf-book-inner">
                    <h2 className="fmf-h2">{t('founderMarketFit.bookHeading')}</h2>
                    <p className="fmf-urgency">
                        {t('founderMarketFit.bookUrgency')}
                    </p>
                    <div className="fmf-book-details">
                        <div className="fmf-book-detail">
                            <span className="fmf-book-icon">📅</span>
                            <span>{t('founderMarketFit.bookDetailFormat')}</span>
                        </div>
                        <div className="fmf-book-detail">
                            <span className="fmf-book-icon">💰</span>
                            <span><s className="fmf-original-price">$397</s> <strong className="fmf-pilot-price">$197</strong> <span className="fmf-pilot-label">{t('founderMarketFit.bookFoundingRate')}</span></span>
                        </div>
                    </div>
                    <a
                        href={CAL_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fmf-cta-primary fmf-cta-large"
                    >
                        {t('founderMarketFit.bookCta')}
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <div className="fmf-guarantee">
                        <span className="fmf-guarantee-icon" aria-hidden="true">🛡️</span>
                        <p>{t('founderMarketFit.bookGuarantee')}</p>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="fmf-footer">
                <div className="fmf-container fmf-footer-inner">
                    <p>© {new Date().getFullYear()} Alexander Konstantinov</p>
                    <div className="fmf-footer-links">
                        <a href="mailto:sasha@evolver.team">sasha@evolver.team</a>
                        <a href="https://linkedin.com/in/aleksandrkonstantinov" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FounderMarketFit;
