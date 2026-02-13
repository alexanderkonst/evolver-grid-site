import { useEffect } from "react";
import "./FounderMarketFit.css";

const CAL_LINK = "https://cal.com/aleksandrkonstantinov/fmf";

const FounderMarketFit = () => {
    useEffect(() => {
        document.title = "Founder-Market Fit | Alexander Konstantinov";
        // Force dark mode for this page
        document.documentElement.classList.add("dark");
        return () => {
            document.documentElement.classList.remove("dark");
        };
    }, []);

    return (
        <div className="fmf-page">
            {/* ===== HERO ===== */}
            <section className="fmf-hero">
                <div className="fmf-hero-bg" aria-hidden="true">
                    <div className="fmf-orb fmf-orb-1" />
                    <div className="fmf-orb fmf-orb-2" />
                    <div className="fmf-orb fmf-orb-3" />
                </div>
                <div className="fmf-container fmf-hero-content">
                    <p className="fmf-eyebrow">For founders &amp; aspiring founders</p>
                    <h1 className="fmf-h1">
                        Before Product-Market Fit,
                        <br />
                        <span className="fmf-gradient-text">There's Founder-Market Fit.</span>
                    </h1>
                    <p className="fmf-hero-sub">
                        Find the venture that's built on who you actually are — not who you think you should be.
                    </p>
                    <a href="#book" className="fmf-cta-primary">
                        Find Your Fit
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>
            </section>

            {/* ===== PROBLEM ===== */}
            <section className="fmf-section fmf-problem">
                <div className="fmf-container">
                    <h2 className="fmf-h2">Does this sound like you?</h2>
                    <ul className="fmf-pain-list">
                        <li>You have talent, drive, and ideas — but you can't tell which venture is <strong>the one</strong>.</li>
                        <li>You've started things you believe in, then abandoned them when the energy died.</li>
                        <li>Your business works, but it <strong>drains you</strong>. Something fundamental is off.</li>
                        <li>You keep hearing "just pick one thing" — but nothing feels like <strong>the thing</strong>.</li>
                        <li>You're chasing product-market fit — but you haven't answered the question before it.</li>
                    </ul>
                    <div className="fmf-reframe">
                        <p>
                            It's not a strategy problem. It's not a motivation problem. It's an <strong>alignment problem</strong>.
                        </p>
                        <p>
                            <strong>Founder-Market Fit</strong> is the match between who you are at a structural level and what you're building.
                            When it's off: burnout, endless pivots, mediocre traction.
                            When it's on: <em>unfair advantage</em> — the venture compounds because it's built on who you actually are.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== SOLUTION ===== */}
            <section className="fmf-section fmf-solution">
                <div className="fmf-container">
                    <h2 className="fmf-h2">Find yours in 90 minutes.</h2>
                    <div className="fmf-steps">
                        <div className="fmf-step">
                            <div className="fmf-step-num">1</div>
                            <h3 className="fmf-step-title">Map</h3>
                            <p className="fmf-step-desc">
                                We map your unique genius — the patterns, strengths, and edges that make you <em>you</em>.
                            </p>
                        </div>
                        <div className="fmf-step-arrow" aria-hidden="true">→</div>
                        <div className="fmf-step">
                            <div className="fmf-step-num">2</div>
                            <h3 className="fmf-step-title">Match</h3>
                            <p className="fmf-step-desc">
                                We cross-reference with market reality — where does your genius create the most value?
                            </p>
                        </div>
                        <div className="fmf-step-arrow" aria-hidden="true">→</div>
                        <div className="fmf-step">
                            <div className="fmf-step-num">3</div>
                            <h3 className="fmf-step-title">Move</h3>
                            <p className="fmf-step-desc">
                                We design the direction — what to build, who it's for, and your next 3 concrete moves.
                            </p>
                        </div>
                    </div>

                    <div className="fmf-deliverables">
                        <h3 className="fmf-h3">What you walk out with</h3>
                        <div className="fmf-deliverable-grid">
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <div>
                                    <strong>Founder-Market Fit Statement</strong>
                                    <p>One sentence that names your alignment</p>
                                </div>
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <div>
                                    <strong>Venture Direction</strong>
                                    <p>The shape of the business that makes sense for you</p>
                                </div>
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <div>
                                    <strong>Next 3 Moves</strong>
                                    <p>Concrete steps for this week</p>
                                </div>
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <div>
                                    <strong>Session Recording</strong>
                                    <p>So you can revisit the insights</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOR / NOT FOR ===== */}
            <section className="fmf-section fmf-filter">
                <div className="fmf-container">
                    <div className="fmf-filter-grid">
                        <div className="fmf-filter-col">
                            <h3 className="fmf-h3 fmf-yes">This is for you if</h3>
                            <ul>
                                <li>You're a founder, aspiring founder, or builder ready to go all-in — on the <strong>right thing</strong></li>
                                <li>You've felt the gap between your potential and your traction</li>
                                <li>You want structural clarity, not motivational pep talks</li>
                            </ul>
                        </div>
                        <div className="fmf-filter-col">
                            <h3 className="fmf-h3 fmf-no">This is not for you if</h3>
                            <ul>
                                <li>You want someone to hand you a business plan</li>
                                <li>You're not ready to look honestly at who you are</li>
                                <li>You want comfort, not clarity</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== ABOUT ===== */}
            <section className="fmf-section fmf-about">
                <div className="fmf-container">
                    <div className="fmf-about-inner">
                        <div className="fmf-about-text">
                            <h2 className="fmf-h2">About</h2>
                            <p>
                                <strong>Alexander Konstantinov</strong> builds integrative systems that help founders see the architecture of their genius.
                                He built this method on himself first — mapped his own Founder-Market Fit, designed the offer, launched the system.
                                What he offers is the documented, repeatable process.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== BOOK ===== */}
            <section className="fmf-section fmf-book" id="book">
                <div className="fmf-container fmf-book-inner">
                    <h2 className="fmf-h2">Ready to find your Founder-Market Fit?</h2>
                    <div className="fmf-book-details">
                        <div className="fmf-book-detail">
                            <span className="fmf-book-icon">📅</span>
                            <span>90 minutes · 1-on-1 · Zoom or in-person</span>
                        </div>
                        <div className="fmf-book-detail">
                            <span className="fmf-book-icon">💰</span>
                            <span><s className="fmf-original-price">$397</s> <strong className="fmf-pilot-price">$197</strong> <span className="fmf-pilot-label">pilot rate</span></span>
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
                    <p className="fmf-micro">No pitch. No upsell pressure. Just 90 minutes of structural clarity about what you should be building.</p>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="fmf-footer">
                <div className="fmf-container">
                    <p>© {new Date().getFullYear()} Alexander Konstantinov</p>
                </div>
            </footer>
        </div>
    );
};

export default FounderMarketFit;
