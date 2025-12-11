import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ExternalLink, Mail, ChevronRight, Users, Target, Zap, CheckCircle } from "lucide-react";

const GeniusLayerMatching = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const CALENDLY_URL = "https://www.calendly.com/konstantinov";

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl space-y-20">

                    {/* Hero Section */}
                    <section className="text-center space-y-6">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight">
                            Genius-Layer Matching for Founder Ecosystems
                        </h1>

                        <p className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto">
                            Stop guessing co-founder fit. Start matching on how people are actually built to play.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <a
                                href={CALENDLY_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
                                style={{
                                    backgroundColor: 'hsl(210, 70%, 15%)',
                                    color: 'white'
                                }}
                            >
                                Talk to Aleksandr about a pilot
                                <ExternalLink size={18} />
                            </a>
                        </div>

                        <a
                            href="#how-pilot-works"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                        >
                            Learn how the 3-way A/B pilot works
                        </a>
                    </section>

                    {/* Problem Section */}
                    <section className="space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                            Matching on ideas isn't enough
                        </h2>

                        <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
                            Most founder programs try to match people based on what they're building and what's on their CV. But what actually makes or breaks teams is how people <em>operate</em>: the roles they default to, how they decide, and what they become under pressure.
                        </p>
                    </section>

                    {/* Solution Section */}
                    <section className="space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                            Add a "genius layer" to your matching
                        </h2>

                        <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
                            We use a short <em>Zone-of-Genius</em> assessment to surface each founder's deep operating pattern – the role they're structurally built to excel at. Boardy (an AI matchmaker) then uses these high-signal snapshots to generate a concrete map of who should meet whom, and in what roles.
                        </p>
                    </section>

                    {/* Why It Matters Section */}
                    <section className="space-y-6 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                            Why this matters now
                        </h2>

                        <ul className="space-y-4">
                            {[
                                "Fewer mis-matched founder pairs and zombie teams",
                                "Faster trust and role-clarity in new teams",
                                'A differentiated "we actually see you" layer in your studio or accelerator'
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
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                                Run a fast, 3-way A/B pilot
                            </h2>
                            <p className="text-muted-foreground">
                                We keep it absurdly simple and data-honest.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    step: 1,
                                    title: "Exploratory call (30 minutes)",
                                    description: "Short call with Aleksandr to decide if a pilot makes sense for your context and sketch the 3-cell experiment design."
                                },
                                {
                                    step: 2,
                                    title: "Run the pilot (about 1–2 weeks, end-to-end)",
                                    description: "You select 5–10 founders from your ecosystem. They each take a short online Zone-of-Genius assessment (async)."
                                },
                                {
                                    step: 3,
                                    title: "Generate 3 kinds of matches",
                                    description: null,
                                    bullets: [
                                        "Group A: matches using your current way",
                                        "Group B: matches using Boardy with your usual founder data",
                                        "Group C: matches using the same info plus the genius snapshots"
                                    ]
                                },
                                {
                                    step: 4,
                                    title: "Measure what actually felt better",
                                    description: "Founders rate resonance and likelihood to continue the relationship. You get a short written debrief on what felt accurate, what didn't, and clear recommendations."
                                },
                                {
                                    step: 5,
                                    title: "Decide on rollout",
                                    description: 'If the signal is strong, we discuss weaving this "genius layer" into more of your programs. If not, you still walk away with clean data and sharper language for how you think about matching.'
                                }
                            ].map((item) => (
                                <div
                                    key={item.step}
                                    className="flex gap-4 p-5 rounded-2xl border border-border bg-card/60"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
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
                    <section className="space-y-6 max-w-3xl mx-auto">
                        <div className="text-center">
                            <p className="text-xs uppercase tracking-wider text-primary/70 mb-2">
                                Designed for serious ecosystem builders
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                                Cohorts, studios, accelerators
                            </h2>
                        </div>

                        <ul className="space-y-4">
                            {[
                                "You already curate strong founders, but matching still leans on vibes and guesswork",
                                "You care about reducing silent co-founder misalignment and team drift",
                                "You want a simple, time-bound experiment before committing to tooling changes"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-foreground/90">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* FAQ Section */}
                    <section className="space-y-8 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary">
                            FAQ
                        </h2>

                        <div className="space-y-6">
                            {[
                                {
                                    q: "How long does the pilot take?",
                                    a: "Typically 1–2 weeks end-to-end from selecting founders to getting the debrief."
                                },
                                {
                                    q: "How heavy is the lift on our side?",
                                    a: "You choose the founders and share existing basic info you already have. The assessment is short and async; we handle the matching logic and debrief."
                                },
                                {
                                    q: "What about pricing?",
                                    a: "The pilot is a one-time, fixed intro fee, sized so it's easy to approve as an experiment rather than a big platform decision."
                                },
                                {
                                    q: "What happens after the pilot?",
                                    a: 'If the signal is strong, we explore how a "genius layer" could plug into more of your programs. If not, you keep the insights and we part as friends.'
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
                    <section className="text-center space-y-6 py-12 px-6 rounded-3xl border-2 border-primary/30 bg-primary/5">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                            Run a genius-layer pilot with Aleksandr today
                        </h2>

                        <p className="text-base text-foreground/80 max-w-2xl mx-auto">
                            If you're running a founder ecosystem and want to see whether higher-fidelity "genius" signals actually improve your matching, this is the place to start.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href={CALENDLY_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
                                style={{
                                    backgroundColor: 'hsl(210, 70%, 15%)',
                                    color: 'white'
                                }}
                            >
                                Talk to Aleksandr about a pilot
                                <ExternalLink size={18} />
                            </a>

                            <a
                                href="mailto:alexanderkonst@gmail.com"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-full transition-all border border-border bg-card hover:bg-muted text-foreground"
                            >
                                <Mail size={18} />
                                Email Aleksandr
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
