import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ExternalLink, ChevronRight, CheckCircle, Target } from "lucide-react";

// Bionic text component - bolds first half of each word
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
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const CALENDLY_URL = "https://www.calendly.com/konstantinov";
    const PILOT_PRICE = "$500";

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-3xl space-y-16">

                    {/* Hero Section */}
                    <section className="text-center space-y-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight uppercase tracking-wide">
                            <BionicText>Genius-Layer Matching for Founder Ecosystems</BionicText>
                        </h1>

                        <p className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto">
                            <BionicText>Stop guessing co-founder fit. Start matching on how people are actually built to play.</BionicText>
                        </p>

                        <div className="flex flex-col gap-4 justify-center pt-4">
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
                                <BionicText>Talk to Aleksandr about a pilot</BionicText>
                                <ExternalLink size={18} />
                            </a>
                        </div>

                        <div className="pt-6">
                            <a
                                href="#how-pilot-works"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                            >
                                <BionicText>Learn how the 3-way A/B pilot works</BionicText>
                            </a>
                        </div>
                    </section>

                    {/* Problem Section */}
                    <section className="text-center space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-primary uppercase tracking-wide">
                            <BionicText>Matching on Ideas Isn't Enough</BionicText>
                        </h2>

                        <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
                            <BionicText>Most founder programs try to match people based on what they're building and what's on their CV. But what actually makes or breaks teams is how people operate: the roles they default to, how they decide, and what they become under pressure.</BionicText>
                        </p>
                    </section>

                    {/* Solution Section */}
                    <section className="text-center space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-primary uppercase tracking-wide">
                            <BionicText>Add a "Genius Layer" to Your Matching</BionicText>
                        </h2>

                        <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
                            <BionicText>We use a short Zone-of-Genius assessment to surface each founder's deep operating pattern – the role they're structurally built to excel at. Boardy (an AI matchmaker) then uses these high-signal snapshots to generate a concrete map of who should meet whom, and in what roles.</BionicText>
                        </p>
                    </section>

                    {/* Why It Matters Section */}
                    <section className="text-center space-y-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-primary uppercase tracking-wide">
                            <BionicText>Why This Matters Now</BionicText>
                        </h2>

                        <ul className="space-y-4 text-left max-w-xl mx-auto">
                            {[
                                "Fewer mis-matched founder pairs and zombie teams",
                                "Faster trust and role-clarity in new teams",
                                'A differentiated "we actually see you" layer in your studio or accelerator'
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-foreground/90"><BionicText>{item}</BionicText></span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* How The Pilot Works Section */}
                    <section id="how-pilot-works" className="space-y-8">
                        <div className="text-center space-y-3">
                            <h2 className="text-xl sm:text-2xl font-bold text-primary uppercase tracking-wide">
                                <BionicText>Run a Fast, 3-Way A/B Pilot</BionicText>
                            </h2>
                            <p className="text-muted-foreground">
                                <BionicText>We keep it absurdly simple and data-honest.</BionicText>
                            </p>
                            <p className="text-lg font-semibold text-primary">
                                <BionicText>Pilot fee: {PILOT_PRICE}</BionicText>
                            </p>
                        </div>

                        <div className="space-y-4">
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
                                    className="flex gap-4 p-4 sm:p-5 rounded-2xl border border-border bg-card/60"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base sm:text-lg">
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                                            <BionicText>{item.title}</BionicText>
                                        </h3>
                                        {item.description && (
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                <BionicText>{item.description}</BionicText>
                                            </p>
                                        )}
                                        {item.bullets && (
                                            <ul className="space-y-1.5 mt-2">
                                                {item.bullets.map((bullet, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                        <span><BionicText>{bullet}</BionicText></span>
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
                            <p className="text-xs uppercase tracking-wider text-primary/70 mb-2">
                                <BionicText>Designed for serious ecosystem builders</BionicText>
                            </p>
                            <h2 className="text-xl sm:text-2xl font-bold text-primary uppercase tracking-wide">
                                <BionicText>Venture Studios, Founder Ecosystems, Accelerators</BionicText>
                            </h2>
                        </div>

                        <ul className="space-y-4 text-left max-w-xl mx-auto">
                            {[
                                "You already curate strong founders, but matching still leans on vibes and guesswork",
                                "You care about reducing silent co-founder misalignment and team drift",
                                "You want a simple, time-bound experiment before committing to tooling changes"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-foreground/90"><BionicText>{item}</BionicText></span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* FAQ Section */}
                    <section className="space-y-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-center text-primary uppercase tracking-wide">
                            <BionicText>FAQ</BionicText>
                        </h2>

                        <div className="space-y-6 text-center">
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
                                    a: `The pilot is a one-time ${PILOT_PRICE} fee, sized so it's easy to approve as an experiment rather than a big platform decision.`
                                },
                                {
                                    q: "What happens after the pilot?",
                                    a: 'If the signal is strong, we explore how a "genius layer" could plug into more of your programs. If not, you keep the insights and we part as friends.'
                                }
                            ].map((faq, idx) => (
                                <div key={idx} className="space-y-2">
                                    <h3 className="font-semibold text-foreground"><BionicText>{faq.q}</BionicText></h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed"><BionicText>{faq.a}</BionicText></p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className="text-center space-y-6 py-10 px-6 rounded-3xl border-2 border-primary/30 bg-primary/5">
                        <h2 className="text-xl sm:text-2xl font-bold text-primary uppercase tracking-wide">
                            <BionicText>Run a Genius-Layer Pilot with Aleksandr Today</BionicText>
                        </h2>

                        <p className="text-base text-foreground/80 max-w-2xl mx-auto">
                            <BionicText>If you're running a founder ecosystem and want to see whether higher-fidelity "genius" signals actually improve your matching, this is the place to start.</BionicText>
                        </p>

                        <div className="flex justify-center">
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
                                <BionicText>Talk to Aleksandr about a pilot</BionicText>
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
