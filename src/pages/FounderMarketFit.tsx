import { useEffect } from "react";
import "./FounderMarketFit.css";

const CAL_LINK = "https://cal.com/aleksandrkonstantinov/fmf";

const FounderMarketFit = () => {
    useEffect(() => {
        document.title = "Founder-Market Fit | Alexander Konstantinov";
        document.documentElement.classList.add("dark");
        return () => {
            document.documentElement.classList.remove("dark");
        };
    }, []);

    return (
        <div className="fmf-page">
            {/* ===== 1. HERO — you're seen ===== */}
            <section className="fmf-hero">
                <div className="fmf-hero-bg" aria-hidden="true">
                    <div className="fmf-orb fmf-orb-1" />
                    <div className="fmf-orb fmf-orb-2" />
                    <div className="fmf-orb fmf-orb-3" />
                </div>
                <div className="fmf-container fmf-hero-content">
                    <p className="fmf-eyebrow">For founders between ventures</p>
                    <h1 className="fmf-h1">
                        You know you're capable.
                        <br />
                        <span className="fmf-gradient-text">So why is this transition taking so long?</span>
                    </h1>
                    <p className="fmf-hero-sub">
                        You've got the skills, the vision, the drive. But somehow the breakthrough
                        keeps being "right around the corner" — and the corner keeps moving.
                    </p>
                    <a href="#book" className="fmf-cta-primary">
                        End the Guessing
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <p className="fmf-hero-context">90-min diagnostic · $197</p>
                </div>
            </section>

            {/* ===== 2. PAIN — it hurts, and it's getting worse ===== */}
            <section className="fmf-section fmf-problem">
                <div className="fmf-container">
                    <h2 className="fmf-h2">If this is you, keep reading.</h2>
                    <ul className="fmf-pain-list">
                        <li>"I've been in this transition <strong>for too long</strong>."</li>
                        <li>"I keep starting things that don't gain traction fast enough."</li>
                        <li>"I can't figure out which venture to <strong>go all-in</strong> on."</li>
                        <li>"I'm so much more capable than my results show."</li>
                        <li>"Something fundamental is off — but I can't see what."</li>
                    </ul>
                    <div className="fmf-reframe">
                        <p>
                            Every month this drags on costs you the compounding that month
                            would have generated. The savings shrink. The conversations at home
                            shift. The dream doesn't die — it gets <strong>shelved</strong>.
                        </p>
                        <p className="fmf-cost-kicker">
                            <em>"I'll come back to it when things settle down."</em>
                            <br />
                            You know how that ends.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 3. DIAGNOSIS — here's why ===== */}
            <section className="fmf-section fmf-revelation">
                <div className="fmf-container">
                    <h2 className="fmf-h2">You're not lost. You're in orbit.</h2>
                    <div className="fmf-reframe">
                        <p>
                            You can see the opportunities. You've circled a few. Some looked right for a while.
                            But you haven't landed — because you've been choosing ventures from the outside,
                            based on what looks promising, instead of from the inside, based on who you are.
                        </p>
                    </div>
                    <div className="fmf-fmf-reveal">
                        <p className="fmf-reveal-before">Before Product-Market Fit —</p>
                        <h3 className="fmf-reveal-headline">there's Founder-Market Fit.</h3>
                        <p className="fmf-reveal-after">
                            The structural match between who you are and what you build.
                            When it's off, everything grinds. When it's on — unfair advantage.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== 4. COMPASSION — not your fault, until it's obvious ===== */}
            <section className="fmf-section fmf-compassion">
                <div className="fmf-container">
                    <h2 className="fmf-h2">This isn't a character flaw.</h2>
                    <div className="fmf-reframe">
                        <p>
                            Founder-Market Fit is invisible from the inside. You can't see it
                            the same way you can't read the label from inside the bottle.
                        </p>
                        <p>
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

            {/* ===== 5. METHOD — I got you ===== */}
            <section className="fmf-section fmf-solution">
                <div className="fmf-container">
                    <h2 className="fmf-h2">Find yours in 90 minutes.</h2>
                    <div className="fmf-steps">
                        <div className="fmf-step">
                            <div className="fmf-step-num">1</div>
                            <h3 className="fmf-step-title">Map</h3>
                            <p className="fmf-step-desc">
                                Your genius — mapped. Brilliance, energy, and market demand in one picture.
                            </p>
                        </div>
                        <div className="fmf-step-arrow" aria-hidden="true">→</div>
                        <div className="fmf-step">
                            <div className="fmf-step-num">2</div>
                            <h3 className="fmf-step-title">Match</h3>
                            <p className="fmf-step-desc">
                                Tested against market reality — where your genius meets money <em>now</em>.
                            </p>
                        </div>
                        <div className="fmf-step-arrow" aria-hidden="true">→</div>
                        <div className="fmf-step">
                            <div className="fmf-step-num">3</div>
                            <h3 className="fmf-step-title">Move</h3>
                            <p className="fmf-step-desc">
                                A direction, a first offer, and your next 3 moves — Monday-ready.
                            </p>
                        </div>
                    </div>

                    <div className="fmf-deliverables">
                        <h3 className="fmf-h3">What you walk out with</h3>
                        <div className="fmf-deliverable-grid">
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>Founder-Market Fit Statement</strong>
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>Zone of Genius Card</strong>
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>30-Day Action Plan</strong>
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <strong>Session Recording</strong>
                            </div>
                        </div>
                    </div>

                    <p className="fmf-method-footnote">
                        I'm Alexander Konstantinov. I designed this diagnostic on myself first,
                        then ran it 250 more times. Same result every time.
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

            {/* ===== 7. CTA — do it ===== */}
            <section className="fmf-section fmf-book" id="book">
                <div className="fmf-container fmf-book-inner">
                    <h2 className="fmf-h2">Find yours.</h2>
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
