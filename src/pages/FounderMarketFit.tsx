import { useEffect } from "react";
import "./FounderMarketFit.css";

const CAL_LINK = "https://cal.com/aleksandrkonstantinov/fmf";

const FounderMarketFit = () => {
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
                    <p className="fmf-eyebrow">For founders between ventures</p>
                    <h1 className="fmf-h1">
                        You've already been building it.
                        <br />
                        <span className="fmf-gradient-text">You just can't see it yet.</span>
                    </h1>
                    <p className="fmf-hero-sub">
                        The pattern you keep seeing. The problem you can't stop working on.
                        That's not a detour — that's the business.
                    </p>
                    <a href="#book" className="fmf-cta-primary">
                        See What You've Been Building
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <p className="fmf-hero-context">90-min diagnostic · $197 founding rate</p>
                </div>
            </section>

            {/* ===== 2. PAIN — their own words ===== */}
            <section className="fmf-section fmf-problem">
                <div className="fmf-container">
                    <h2 className="fmf-h2">Sound familiar?</h2>
                    <ul className="fmf-pain-list">
                        <li>"I just need to figure out the right thing to <strong>go all-in</strong> on."</li>
                        <li>"I've been in this transition <strong>for too long</strong>."</li>
                        <li>"I'm so much more capable than my results show."</li>
                        <li>"Something fundamental is off but I can't see what."</li>
                        <li>"I feel like I'm drilling hoping I'm almost through the wall."</li>
                    </ul>
                    <div className="fmf-reframe">
                        <p>
                            This isn't a strategy problem. It's not a motivation problem.
                            It's a <strong>recognition</strong> problem. The business you're looking
                            for is already inside the thing you can't stop doing. The pattern you keep
                            seeing, the problem you keep circling — that's not scattered energy.
                            That's signal.
                        </p>
                        <p>
                            You just need someone who can see the pattern from outside the loop.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 2b. THE MYTH — what the startup world gets wrong ===== */}
            <section className="fmf-section fmf-myth">
                <div className="fmf-container">
                    <h2 className="fmf-h2">What the startup world gets wrong</h2>
                    <div className="fmf-reframe">
                        <p>
                            Everyone tells you to find product-market fit through iteration.
                            Test. Pivot. Talk to customers. Try keys in locks until one fits.
                        </p>
                        <p>
                            But what if the key is already inside you?
                        </p>
                        <p>
                            <strong>Founder-Market Fit</strong> is the match between who you are
                            at your core and what you build. When it's off: endless pivots,
                            mediocre traction, burnout. When it's on: the venture compounds
                            because it's built on who you actually are.
                        </p>
                        <p>
                            Most founders skip this step. They jump to "what should I build?"
                            before answering "<strong>who am I when I'm at my brightest?</strong>"
                        </p>
                        <p>
                            No amount of execution excellence fixes an inverted sequence.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 3. DIAGNOSIS — here's why ===== */}
            <section className="fmf-section fmf-revelation">
                <div className="fmf-container">
                    <div className="fmf-fmf-reveal">
                        <p className="fmf-reveal-before">Before Product-Market Fit —</p>
                        <h3 className="fmf-reveal-headline">there's Founder-Market Fit.</h3>
                        <p className="fmf-reveal-after">
                            The structural match between who you are and what you build.
                            Without it, every venture feels like pushing uphill.
                            The breakthrough stays "right around the corner" — and the corner keeps moving.
                        </p>
                        <p className="fmf-reveal-after">
                            With it — unfair advantage. The thing that makes the hard parts feel like <em>your</em> hard parts.
                        </p>
                    </div>
                    <div className="fmf-reframe">
                        <p>
                            <strong>You don't have yours yet.</strong> That's the whole problem.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 4. COMPASSION — not your fault, until it's obvious ===== */}
            <section className="fmf-section fmf-compassion">
                <div className="fmf-container">
                    <h2 className="fmf-h2">This isn't a character flaw.</h2>
                    <div className="fmf-reframe">
                        <p className="fmf-core-belief">
                            I believe every founder has one venture that's structurally theirs.
                            Most never find it — not because they're not good enough,
                            but because <strong>Founder-Market Fit is invisible from the inside.</strong>
                        </p>
                        <p>
                            You can't read the label from inside the bottle.
                            It's not about working harder, networking more, or finding
                            the right co-founder. It's about seeing the one thing you can't see alone:
                            <strong> where your genius meets the market.</strong>
                        </p>
                        <p>
                            Once someone maps it for you, it becomes obvious. The kind of obvious
                            that makes you wonder how you missed it.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 4b. FILTER — who this is / isn't for ===== */}
            <section className="fmf-section fmf-filter">
                <div className="fmf-container">
                    <div className="fmf-filter-grid">
                        <div className="fmf-filter-col">
                            <h3 className="fmf-h3">This is for you if:</h3>
                            <ul className="fmf-filter-list fmf-filter-yes">
                                <li>You're a founder or builder who's been in transition too long</li>
                                <li>You sense the gap between your potential and your traction</li>
                                <li>You want structural clarity, not motivational pep talks</li>
                                <li>You've done inner work and want it to connect to outer results</li>
                            </ul>
                        </div>
                        <div className="fmf-filter-col">
                            <h3 className="fmf-h3">This is NOT for you if:</h3>
                            <ul className="fmf-filter-list fmf-filter-no">
                                <li>You want someone to hand you a business plan</li>
                                <li>You're not ready to look honestly at who you are</li>
                                <li>You want comfort, not recognition</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 5. METHOD — see yours in 90 minutes ===== */}
            <section className="fmf-section fmf-solution">
                <div className="fmf-container">
                    <h2 className="fmf-h2">See yours in 90 minutes.</h2>
                    <div className="fmf-steps">
                        <div className="fmf-step">
                            <div className="fmf-step-num">1</div>
                            <h3 className="fmf-step-title">Map</h3>
                            <p className="fmf-step-desc">
                                We map your unique gift: the patterns, strengths, and edges that make you irreplaceable.
                            </p>
                        </div>
                        <div className="fmf-step-arrow" aria-hidden="true">→</div>
                        <div className="fmf-step">
                            <div className="fmf-step-num">2</div>
                            <h3 className="fmf-step-title">Match</h3>
                            <p className="fmf-step-desc">
                                We cross-reference with market reality: where does your gift meet a need that's urgent <em>now</em>?
                            </p>
                        </div>
                        <div className="fmf-step-arrow" aria-hidden="true">→</div>
                        <div className="fmf-step">
                            <div className="fmf-step-num">3</div>
                            <h3 className="fmf-step-title">Move</h3>
                            <p className="fmf-step-desc">
                                We design your first moves: what to build, who it's for, and your concrete next steps.
                            </p>
                        </div>
                    </div>

                    <div className="fmf-deliverables">
                        <h3 className="fmf-h3">What you walk out with</h3>
                        <div className="fmf-deliverable-grid">
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>Your Founder-Market Fit</strong> — the one sentence that names your alignment
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>Your venture direction</strong> — the shape of the business that makes structural sense for you
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>Your next 3 moves</strong> — concrete steps for this week, not someday
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>Session recording</strong> — so you can revisit the insights
                            </div>
                        </div>
                    </div>

                    <p className="fmf-method-footnote">
                        No pitch. No upsell. Just 90 minutes of someone seeing what you can't see from inside the loop.
                    </p>
                </div>
            </section>

            {/* ===== 6. PROOF — others trusted this ===== */}
            <section className="fmf-section fmf-proof">
                <div className="fmf-container">
                    <div className="fmf-credentials">
                        <div className="fmf-credential">
                            <span className="fmf-credential-num">250+</span>
                            <span className="fmf-credential-label">Founders mapped</span>
                        </div>
                        <div className="fmf-credential-divider" aria-hidden="true" />
                        <div className="fmf-credential">
                            <span className="fmf-credential-num">10+</span>
                            <span className="fmf-credential-label">Years in career transformation</span>
                        </div>
                        <div className="fmf-credential-divider" aria-hidden="true" />
                        <div className="fmf-credential">
                            <span className="fmf-credential-num">MIT</span>
                            <span className="fmf-credential-label">Alum · AI & Human Potential</span>
                        </div>
                    </div>

                    <div className="fmf-testimonials">
                        <div className="fmf-testimonial">
                            <p className="fmf-testimonial-quote">
                                "This is a miracle of miracles. Other tools come at this half-baked and shallow;
                                they've got no depth. Your approach, though — <strong>a tool that just plain works.</strong>"
                            </p>
                            <div className="fmf-testimonial-author">
                                <span className="fmf-testimonial-name">Alexey</span>
                                <span className="fmf-testimonial-result">Found Results</span>
                            </div>
                        </div>
                        <div className="fmf-testimonial">
                            <p className="fmf-testimonial-quote">
                                "Truly profound. I am so inspired to lean into my talents
                                and <strong>share them globally.</strong>"
                            </p>
                            <div className="fmf-testimonial-author">
                                <span className="fmf-testimonial-name">Tshatiqua</span>
                                <span className="fmf-testimonial-result">Found Purpose</span>
                            </div>
                        </div>
                        <div className="fmf-testimonial">
                            <p className="fmf-testimonial-quote">
                                "I got into my zone of genius and <strong>launched my blockchain
                                    wellness education project.</strong>"
                            </p>
                            <div className="fmf-testimonial-author">
                                <span className="fmf-testimonial-name">Simba</span>
                                <span className="fmf-testimonial-result">Launched Project</span>
                            </div>
                        </div>
                        <div className="fmf-testimonial">
                            <p className="fmf-testimonial-quote">
                                "Getting unstuck. This is very valuable.
                                Inspires & informs <strong>BRILLIANTLY!!</strong>"
                            </p>
                            <div className="fmf-testimonial-author">
                                <span className="fmf-testimonial-name">Laura</span>
                                <span className="fmf-testimonial-result">Found Clarity</span>
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
                            <h4 className="fmf-objection-q">"What if I already have an idea?"</h4>
                            <p>Then we stress-test it against your genius map. You'll know in 90 minutes if it's <em>the one</em> or a distraction.</p>
                        </div>
                        <div className="fmf-objection">
                            <h4 className="fmf-objection-q">"What if I'm not ready to commit?"</h4>
                            <p>This isn't a commitment to a venture. It's 90 minutes of clarity. You decide what to do with it after.</p>
                        </div>
                        <div className="fmf-objection">
                            <h4 className="fmf-objection-q">"How is this different from coaching?"</h4>
                            <p>Coaching is ongoing. This is a one-time diagnostic — a map, not a subscription.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 7b. CTA — do it ===== */}
            <section className="fmf-section fmf-book" id="book">
                <div className="fmf-container fmf-book-inner">
                    <h2 className="fmf-h2">See yours.</h2>
                    <p className="fmf-urgency">
                        Every month without Founder-Market Fit is a month of compounding in the wrong direction.
                    </p>
                    <div className="fmf-book-details">
                        <div className="fmf-book-detail">
                            <span className="fmf-book-icon">📅</span>
                            <span>90 minutes · 1-on-1 · Zoom or in-person</span>
                        </div>
                        <div className="fmf-book-detail">
                            <span className="fmf-book-icon">💰</span>
                            <span><s className="fmf-original-price">$397</s> <strong className="fmf-pilot-price">$197</strong> <span className="fmf-pilot-label">founding rate</span></span>
                        </div>
                    </div>
                    <a
                        href={CAL_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fmf-cta-primary fmf-cta-large"
                    >
                        Book Your Session
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <div className="fmf-guarantee">
                        <span className="fmf-guarantee-icon" aria-hidden="true">🛡️</span>
                        <p>Clarity or your money back.</p>
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
