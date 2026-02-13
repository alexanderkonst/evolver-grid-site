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
                    <p className="fmf-eyebrow">For founders in transition</p>
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
                </div>
            </section>

            {/* ===== PROBLEM — THE WOUND ===== */}
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
                            You've probably blamed the usual suspects — resources, timing, the wrong team, not enough investment.
                        </p>
                        <p>
                            But the real problem is simpler and harder: <strong>you're building something that isn't structurally built on who you are.</strong>
                        </p>
                        <p>
                            That's why the energy dies. That's why traction stalls. That's why each new idea feels promising for a month then grinds to a halt.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== COST OF INACTION ===== */}
            <section className="fmf-section fmf-cost">
                <div className="fmf-container">
                    <h2 className="fmf-h2">The price of doing nothing</h2>
                    <div className="fmf-reframe">
                        <p>
                            Every month you stay scattered costs you the compounding that month would have generated.
                        </p>
                        <p>
                            In six months: savings hit the critical threshold. The relationship conversation
                            shifts from concern to ultimatum. The dream doesn't die — it gets <strong>shelved</strong>.
                        </p>
                        <p className="fmf-cost-kicker">
                            <em>"I'll come back to it when things settle down."</em>
                            <br />
                            You know how that ends.
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== THE SHIFT ===== */}
            <section className="fmf-section fmf-solution">
                <div className="fmf-container">
                    <h2 className="fmf-h2">
                        What if the problem isn't <em>which</em> venture —
                        <br />
                        but <em>whether</em> it's built on who you actually are?
                    </h2>
                    <p className="fmf-solution-intro">
                        That's Founder-Market Fit. Not a strategy exercise. A structural diagnosis.
                        In 90 minutes, we find the venture that's inevitable for you — because it's built on your genius, not someone else's playbook.
                    </p>
                    <div className="fmf-steps">
                        <div className="fmf-step">
                            <div className="fmf-step-num">1</div>
                            <h3 className="fmf-step-title">Map</h3>
                            <p className="fmf-step-desc">
                                We map your Zone of Genius — the intersection of what you're brilliant at, what energizes you, and what the world will pay for.
                            </p>
                        </div>
                        <div className="fmf-step-arrow" aria-hidden="true">→</div>
                        <div className="fmf-step">
                            <div className="fmf-step-num">2</div>
                            <h3 className="fmf-step-title">Match</h3>
                            <p className="fmf-step-desc">
                                We test against market reality. Not "what sounds cool" — but where your specific genius creates value people will pay for <em>now</em>.
                            </p>
                        </div>
                        <div className="fmf-step-arrow" aria-hidden="true">→</div>
                        <div className="fmf-step">
                            <div className="fmf-step-num">3</div>
                            <h3 className="fmf-step-title">Move</h3>
                            <p className="fmf-step-desc">
                                You leave with a direction, an offer, and your next 3 moves — not "think about it," but "do this Monday."
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
                                    <p>One sentence naming the venture that's structurally yours</p>
                                </div>
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <div>
                                    <strong>Zone of Genius Card</strong>
                                    <p>Your unique genius articulated — the seed everything grows from</p>
                                </div>
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <div>
                                    <strong>30-Day Action Plan</strong>
                                    <p>Not theory — the exact moves to make this week and next</p>
                                </div>
                            </div>
                            <div className="fmf-deliverable">
                                <span className="fmf-check" aria-hidden="true">✓</span>
                                <div>
                                    <strong>Session Recording</strong>
                                    <p>The breakthroughs on tape — revisit as many times as you need</p>
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
                                <li>You're in the <strong>transition</strong> — between what was and what's next</li>
                                <li>You've felt the gap between your capability and your results</li>
                                <li>You want structural clarity, not another motivational talk</li>
                                <li>You're ready to stop exploring and <strong>commit</strong> — to the right thing</li>
                            </ul>
                        </div>
                        <div className="fmf-filter-col">
                            <h3 className="fmf-h3 fmf-no">This is not for you if</h3>
                            <ul>
                                <li>You want someone to hand you a business plan</li>
                                <li>You're not willing to look honestly at who you are</li>
                                <li>You're looking for validation, not direction</li>
                                <li>You want comfort — this is about <strong>clarity</strong></li>
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
                            <h2 className="fmf-h2">Why I built this</h2>
                            <p>
                                I'm <strong>Alexander Konstantinov</strong>. I've been exactly where you are — capable,
                                driven, running out of runway, wondering if I'm drilling through the wall or in the wrong tunnel entirely.
                            </p>
                            <p>
                                I built this diagnostic on myself first. Mapped my own genius. Found where it meets the market.
                                Designed this session because I know the cost of staying scattered — and I know what changes
                                when you finally see the alignment.
                            </p>
                            <p>
                                This isn't theory. It's the same process that ended my own extended transition.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== BOOK ===== */}
            <section className="fmf-section fmf-book" id="book">
                <div className="fmf-container fmf-book-inner">
                    <h2 className="fmf-h2">Stop guessing. Start building what's yours.</h2>
                    <div className="fmf-book-details">
                        <div className="fmf-book-detail">
                            <span className="fmf-book-icon">📅</span>
                            <span>90 minutes · 1-on-1 · Zoom or in-person</span>
                        </div>
                        <div className="fmf-book-detail">
                            <span className="fmf-book-icon">💰</span>
                            <span><s className="fmf-original-price">$397</s> <strong className="fmf-pilot-price">$197</strong> <span className="fmf-pilot-label">founding rate · first 10 sessions</span></span>
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
                    <p className="fmf-micro">No pitch. No upsell pressure. Just 90 minutes of structural clarity about what you should be building — and the moves to start this week.</p>
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
