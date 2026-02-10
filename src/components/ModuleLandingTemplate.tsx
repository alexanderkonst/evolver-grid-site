import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ModuleLandingData } from "@/types/module";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface ModuleLandingTemplateProps {
    data: ModuleLandingData;
    moduleTitle?: string;
    moduleSpace?: string;
}

/**
 * Universal landing page template for any module.
 * 8-section structure driven entirely by ModuleLandingData.
 * Follows Marketing Playbook section flow:
 * Hero → ForWhom → Pain → Solution → Outcomes → HowItWorks → Story → FinalCTA
 */
const ModuleLandingTemplate = ({ data, moduleTitle, moduleSpace }: ModuleLandingTemplateProps) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const heroAnim = useScrollAnimation(0.1);
    const forWhomAnim = useScrollAnimation(0.2);
    const painAnim = useScrollAnimation(0.2);
    const solutionAnim = useScrollAnimation(0.2);
    const outcomesAnim = useScrollAnimation(0.2);
    const howItWorksAnim = useScrollAnimation(0.2);
    const storyAnim = useScrollAnimation(0.2);
    const finalCtaAnim = useScrollAnimation(0.2);

    return (
        <div className="min-h-dvh">
            <Navigation />

            {/* ─── Section 1: Hero ─── */}
            <section
                ref={heroAnim.ref}
                className={`relative overflow-hidden pt-32 pb-24 px-6 ${heroAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
                style={{
                    background: "linear-gradient(135deg, #2B2342 0%, #29549f 40%, #6894d0 70%, #a7cbd4 100%)",
                }}
            >
                {/* Bokeh overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(132,96,234,0.25)_0%,transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(167,203,212,0.2)_0%,transparent_50%)]" />

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white/10"
                            style={{
                                width: `${3 + (i % 3) * 2}px`,
                                height: `${3 + (i % 3) * 2}px`,
                                left: `${12 + i * 10}%`,
                                top: `${20 + (i % 4) * 18}%`,
                                animation: `float ${16 + i * 3}s ease-in-out infinite`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative container mx-auto max-w-4xl text-center">
                    {/* Audience tag */}
                    <p className="text-sm font-medium tracking-[0.2em] uppercase mb-6 text-[#a7cbd4]">
                        {data.forAudience}
                    </p>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold leading-[1.1] mb-6 text-white tracking-tight">
                        {data.headline}
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-white/75 leading-relaxed mb-10 max-w-2xl mx-auto">
                        {data.subheadline}
                    </p>

                    {/* CTA */}
                    <Button
                        asChild
                        size="lg"
                        className="text-lg px-10 py-6 rounded-2xl shadow-lg btn-premium-hover"
                        style={{
                            background: "linear-gradient(135deg, #8460ea 0%, #6894d0 100%)",
                            color: "white",
                            boxShadow: "0 4px 20px rgba(132, 96, 234, 0.4)",
                        }}
                    >
                        <Link to={data.ctaButtonLink}>
                            {data.ctaButtonText}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* ─── Section 2: For Whom ─── */}
            <section
                ref={forWhomAnim.ref}
                className={`py-20 px-6 ${forWhomAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
                style={{ backgroundColor: "hsl(30, 15%, 96%)" }}
            >
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl sm:text-4xl font-display font-semibold text-center mb-12 text-[#2c3150]">
                        Is this for you?
                    </h2>
                    <ul className="space-y-5">
                        {data.forWhom.map((item, i) => (
                            <li
                                key={i}
                                className="flex items-start text-lg text-[#2c3150]/80 leading-relaxed"
                            >
                                <span className="mr-4 mt-1 flex-shrink-0 text-[#8460ea]">→</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ─── Section 3: Pain ─── */}
            <section
                ref={painAnim.ref}
                className={`py-20 px-6 ${painAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
                style={{ backgroundColor: "#2B2342" }}
            >
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl sm:text-4xl font-display font-semibold text-center mb-12 text-white">
                        {data.painSectionHeader}
                    </h2>
                    <ul className="space-y-6">
                        {data.painBullets.map((bullet, i) => (
                            <li
                                key={i}
                                className="flex items-start text-lg text-white/70 leading-relaxed"
                            >
                                <span
                                    className="mr-4 mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={{
                                        background: "rgba(132, 96, 234, 0.3)",
                                        color: "#c2b9e1",
                                    }}
                                >
                                    {i + 1}
                                </span>
                                <span>{bullet}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ─── Section 4: Solution ─── */}
            <section
                ref={solutionAnim.ref}
                className={`py-20 px-6 ${solutionAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
                style={{ backgroundColor: "hsl(30, 25%, 94%)" }}
            >
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl sm:text-4xl font-display font-semibold text-center mb-12 text-[#2c3150]">
                        {data.solutionSectionHeader}
                    </h2>
                    <ol className="space-y-6">
                        {data.solutionSteps.map((step, i) => (
                            <li key={i} className="flex items-start">
                                <span
                                    className="mr-5 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                                    style={{
                                        background: "linear-gradient(135deg, #8460ea 0%, #6894d0 100%)",
                                        color: "white",
                                    }}
                                >
                                    {i + 1}
                                </span>
                                <div>
                                    <span className="font-semibold text-lg text-[#2c3150]">{step.verb}</span>
                                    <span className="text-lg text-[#2c3150]/70"> — {step.description}</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ─── Section 5: Outcomes ─── */}
            <section
                ref={outcomesAnim.ref}
                className={`py-20 px-6 ${outcomesAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
                style={{ backgroundColor: "#1e293b" }}
            >
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl sm:text-4xl font-display font-semibold text-center mb-12 text-white">
                        What you walk away with
                    </h2>
                    <ul className="space-y-5">
                        {data.outcomes.map((outcome, i) => (
                            <li
                                key={i}
                                className="flex items-start text-lg text-white/80 leading-relaxed"
                            >
                                <CheckCircle2
                                    className="mr-4 mt-1 flex-shrink-0 h-5 w-5"
                                    style={{ color: "#a7cbd4" }}
                                />
                                <span>{outcome}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ─── Section 6: How It Works ─── */}
            <section
                ref={howItWorksAnim.ref}
                className={`py-20 px-6 ${howItWorksAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
                style={{ backgroundColor: "hsl(30, 15%, 96%)" }}
            >
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl sm:text-4xl font-display font-semibold text-center mb-14 text-[#2c3150]">
                        How it works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.howItWorks.map((item, i) => (
                            <div
                                key={i}
                                className="relative text-center p-6 rounded-2xl"
                                style={{
                                    background: "rgba(255, 255, 255, 0.85)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(164, 163, 208, 0.2)",
                                    boxShadow: "0 4px 16px rgba(44, 49, 80, 0.06)",
                                }}
                            >
                                {/* Step number */}
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
                                    style={{
                                        background: "linear-gradient(135deg, #8460ea 0%, #6894d0 100%)",
                                        color: "white",
                                    }}
                                >
                                    {i + 1}
                                </div>
                                <h3 className="font-semibold text-lg mb-2 text-[#2c3150]">{item.step}</h3>
                                <p className="text-[#2c3150]/70 mb-2">{item.description}</p>
                                {item.time && (
                                    <span className="text-sm font-medium text-[#8460ea]">{item.time}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Section 7: Story / Origin ─── */}
            <section
                ref={storyAnim.ref}
                className={`py-20 px-6 ${storyAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
                style={{ backgroundColor: "#2B2342" }}
            >
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl sm:text-4xl font-display font-semibold mb-10 text-white">
                        Why this exists
                    </h2>
                    <p className="text-lg text-white/70 leading-relaxed">
                        {data.story}
                    </p>
                </div>
            </section>

            {/* ─── Section 8: Final CTA ─── */}
            <section
                ref={finalCtaAnim.ref}
                className={`relative overflow-hidden py-24 px-6 ${finalCtaAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
                style={{
                    background: "linear-gradient(135deg, #8460ea 0%, #6894d0 50%, #a7cbd4 100%)",
                }}
            >
                {/* Subtle grain */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />

                <div className="relative container mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl sm:text-5xl font-display font-semibold mb-4 text-white leading-tight">
                        {data.finalCtaHeadline}
                    </h2>
                    <p className="text-lg sm:text-xl text-white/80 mb-10">
                        {data.finalCtaSubheadline}
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="text-lg px-10 py-6 rounded-2xl shadow-lg btn-premium-hover"
                        style={{
                            background: "white",
                            color: "#2c3150",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        <Link to={data.ctaButtonLink}>
                            {data.ctaButtonText}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ModuleLandingTemplate;
