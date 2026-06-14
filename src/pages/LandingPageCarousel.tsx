import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Wabi-sabi + Apple aesthetic landing page
 * Fonts: Fraunces (headlines) + Inter (body)
 * Premium effects: gradients, particles, grain, animations
 */

const LandingPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const totalSlides = 9;

    const slides = [
        {
            audienceTag: null,
            problem: null,
            headline: t("landingCarousel.slide0.headline"),
            headlineHero: true,
            tagline: t("landingCarousel.slide0.tagline"),
            things: [
                { icon: "◎", label: t("landingCarousel.slide0.thing0.label"), desc: t("landingCarousel.slide0.thing0.desc") },
                { icon: "⬡", label: t("landingCarousel.slide0.thing1.label"), desc: t("landingCarousel.slide0.thing1.desc") },
                { icon: "∞", label: t("landingCarousel.slide0.thing2.label"), desc: t("landingCarousel.slide0.thing2.desc") },
            ],
            cta: t("landingCarousel.slide0.cta"),
            gradient: "from-[#8460ea] via-[#a4a3d0] to-[#a7cbd4]",
        },
        {
            audienceTag: t("landingCarousel.slide1.audienceTag"),
            problem: t("landingCarousel.slide1.problem"),
            headline: t("landingCarousel.slide1.headline"),
            tagline: t("landingCarousel.slide1.tagline"),
            things: [
                { icon: "◎", label: t("landingCarousel.slide1.thing0.label"), desc: t("landingCarousel.slide1.thing0.desc") },
                { icon: "◈", label: t("landingCarousel.slide1.thing1.label"), desc: t("landingCarousel.slide1.thing1.desc") },
                { icon: "∞", label: t("landingCarousel.slide1.thing2.label"), desc: t("landingCarousel.slide1.thing2.desc") },
            ],
            cta: t("landingCarousel.slide1.cta"),
            gradient: "from-[#c8b7d8] via-[#cea4ae] to-[#cec9b0]",
        },
        {
            audienceTag: t("landingCarousel.slide2.audienceTag"),
            problem: t("landingCarousel.slide2.problem"),
            headline: t("landingCarousel.slide2.headline"),
            tagline: t("landingCarousel.slide2.tagline"),
            things: [
                { icon: "◎", label: t("landingCarousel.slide2.thing0.label"), desc: t("landingCarousel.slide2.thing0.desc") },
                { icon: "⬡", label: t("landingCarousel.slide2.thing1.label"), desc: t("landingCarousel.slide2.thing1.desc") },
                { icon: "↑", label: t("landingCarousel.slide2.thing2.label"), desc: t("landingCarousel.slide2.thing2.desc") },
            ],
            cta: t("landingCarousel.slide2.cta"),
            gradient: "from-[#a7ccce] via-[#b1c9b6] to-[#cec9b0]",
        },
        {
            audienceTag: t("landingCarousel.slide3.audienceTag"),
            problem: t("landingCarousel.slide3.problem"),
            headline: t("landingCarousel.slide3.headline"),
            tagline: t("landingCarousel.slide3.tagline"),
            things: [
                { icon: "◎", label: t("landingCarousel.slide3.thing0.label"), desc: t("landingCarousel.slide3.thing0.desc") },
                { icon: "⬡", label: t("landingCarousel.slide3.thing1.label"), desc: t("landingCarousel.slide3.thing1.desc") },
                { icon: "∞", label: t("landingCarousel.slide3.thing2.label"), desc: t("landingCarousel.slide3.thing2.desc") },
            ],
            cta: t("landingCarousel.slide3.cta"),
            gradient: "from-[#1e4374] via-[#29549f] to-[#6894d0]",
        },
        {
            audienceTag: t("landingCarousel.slide4.audienceTag"),
            problem: t("landingCarousel.slide4.problem"),
            headline: t("landingCarousel.slide4.headline"),
            tagline: t("landingCarousel.slide4.tagline"),
            things: [
                { icon: "◎", label: t("landingCarousel.slide4.thing0.label"), desc: t("landingCarousel.slide4.thing0.desc") },
                { icon: "⚡", label: t("landingCarousel.slide4.thing1.label"), desc: t("landingCarousel.slide4.thing1.desc") },
                { icon: "∞", label: t("landingCarousel.slide4.thing2.label"), desc: t("landingCarousel.slide4.thing2.desc") },
            ],
            cta: t("landingCarousel.slide4.cta"),
            gradient: "from-[#2c3150] via-[#342c48] to-[#8460ea]",
        },
        {
            audienceTag: t("landingCarousel.slide5.audienceTag"),
            problem: t("landingCarousel.slide5.problem"),
            headline: t("landingCarousel.slide5.headline"),
            tagline: t("landingCarousel.slide5.tagline"),
            things: [
                { icon: "◎", label: t("landingCarousel.slide5.thing0.label"), desc: t("landingCarousel.slide5.thing0.desc") },
                { icon: "⬡", label: t("landingCarousel.slide5.thing1.label"), desc: t("landingCarousel.slide5.thing1.desc") },
                { icon: "∞", label: t("landingCarousel.slide5.thing2.label"), desc: t("landingCarousel.slide5.thing2.desc") },
            ],
            cta: t("landingCarousel.slide5.cta"),
            gradient: "from-[#b1c9b6] via-[#a7cbd4] to-[#e7e9e5]",
        },
        {
            audienceTag: t("landingCarousel.slide6.audienceTag"),
            problem: t("landingCarousel.slide6.problem"),
            headline: t("landingCarousel.slide6.headline"),
            tagline: t("landingCarousel.slide6.tagline"),
            things: [
                { icon: "◎", label: t("landingCarousel.slide6.thing0.label"), desc: t("landingCarousel.slide6.thing0.desc") },
                { icon: "⬡", label: t("landingCarousel.slide6.thing1.label"), desc: t("landingCarousel.slide6.thing1.desc") },
                { icon: "∞", label: t("landingCarousel.slide6.thing2.label"), desc: t("landingCarousel.slide6.thing2.desc") },
            ],
            cta: t("landingCarousel.slide6.cta"),
            gradient: "from-[#6894d0] via-[#a4a3d0] to-[#c2b9e1]",
        },
        {
            audienceTag: t("landingCarousel.slide7.audienceTag"),
            problem: t("landingCarousel.slide7.problem"),
            headline: t("landingCarousel.slide7.headline"),
            tagline: t("landingCarousel.slide7.tagline"),
            things: [
                { icon: "◎", label: t("landingCarousel.slide7.thing0.label"), desc: t("landingCarousel.slide7.thing0.desc") },
                { icon: "◈", label: t("landingCarousel.slide7.thing1.label"), desc: t("landingCarousel.slide7.thing1.desc") },
                { icon: "∞", label: t("landingCarousel.slide7.thing2.label"), desc: t("landingCarousel.slide7.thing2.desc") },
            ],
            cta: t("landingCarousel.slide7.cta"),
            gradient: "from-[#cdaed2] via-[#c8b7d8] to-[#a4a3d0]",
        },
        {
            audienceTag: null,
            problem: null,
            headline: t("landingCarousel.slide8.headline"),
            tagline: t("landingCarousel.slide8.tagline"),
            things: null,
            cta: null,
            isCTA: true,
            gradient: "from-[#e7e9e5] via-[#dcdde2] to-[#a4a3d0]",
        },
    ];

    const menuItems = [
        t("landingCarousel.menu.home"),
        t("landingCarousel.menu.individuals"),
        t("landingCarousel.menu.communityLeaders"),
        t("landingCarousel.menu.networkStates"),
        t("landingCarousel.menu.ventureStudios"),
        t("landingCarousel.menu.regenCommunities"),
        t("landingCarousel.menu.daosWeb3"),
        t("landingCarousel.menu.consciousCommunities"),
        t("landingCarousel.menu.getStarted"),
    ];

    const changeSlide = useCallback((newSlide: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setHasInteracted(true);
        if (autoAdvanceRef.current) {
            clearTimeout(autoAdvanceRef.current);
            autoAdvanceRef.current = null;
        }
        setTimeout(() => {
            setCurrentSlide(newSlide);
            setTimeout(() => setIsTransitioning(false), 100);
        }, 150);
    }, [isTransitioning]);

    const nextSlide = useCallback(() => {
        changeSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
    }, [currentSlide, changeSlide]);

    const prevSlide = useCallback(() => {
        changeSlide(currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1);
    }, [currentSlide, changeSlide]);

    const goToSlide = (n: number) => {
        changeSlide(n);
        setMenuOpen(false);
    };

    // Auto-advance on hero
    useEffect(() => {
        if (currentSlide === 0 && !hasInteracted) {
            autoAdvanceRef.current = setTimeout(() => nextSlide(), 5000);
        }
        return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); };
    }, [currentSlide, hasInteracted, nextSlide]);

    // Keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); nextSlide(); }
            if (e.key === "ArrowLeft") { e.preventDefault(); prevSlide(); }
            if (e.key === "Escape") setMenuOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Touch
    useEffect(() => {
        let touchStartX = 0;
        const start = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; };
        const end = (e: TouchEvent) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
        };
        window.addEventListener("touchstart", start);
        window.addEventListener("touchend", end);
        return () => { window.removeEventListener("touchstart", start); window.removeEventListener("touchend", end); };
    }, [nextSlide, prevSlide]);

    const slide = slides[currentSlide];
    const isDarkSlide = currentSlide === 3 || currentSlide === 4;
    const progressPercent = ((currentSlide + 1) / totalSlides) * 100;

    return (
        <div className="min-h-dvh font-['Inter',sans-serif] overflow-hidden relative cursor-default">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-700 ease-out ${isTransitioning ? "blur-sm scale-105" : ""}`} />

            {/* Bokeh overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.2)_0%,transparent_50%)]" />

            {/* Grain */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
            />

            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`absolute rounded-full ${isDarkSlide ? "bg-white/10" : "bg-[#8460ea]/10"}`}
                        style={{
                            width: `${4 + (i % 3) * 3}px`, height: `${4 + (i % 3) * 3}px`,
                            left: `${10 + i * 7}%`, top: `${15 + (i % 4) * 20}%`,
                            animation: `float-${i % 3} ${18 + i * 2}s ease-in-out infinite`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div key={currentSlide} className={`relative min-h-dvh flex flex-col justify-center items-center px-6 md:px-12 py-6 text-center transition-all duration-300 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                <div className="max-w-[1200px] w-full">
                    {slide.audienceTag && (
                        <div className={`text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-4 animate-fade-in ${isDarkSlide ? "text-[#a7cbd4]" : "text-[#29549f]"}`}>
                            {slide.audienceTag}
                        </div>
                    )}

                    {slide.problem && (
                        <div className={`text-base md:text-lg lg:text-xl font-light tracking-wide mb-4 animate-fade-in ${isDarkSlide ? "text-white/60" : "text-[#2c3150]/60"}`}>
                            {slide.problem}
                        </div>
                    )}

                    <h1 className={`font-display font-semibold leading-[1.1] mb-6 whitespace-pre-line animate-fade-in tracking-wide ${isDarkSlide ? "text-white" : "text-[#2c3150]"} ${slide.headlineHero ? "text-4xl md:text-6xl lg:text-7xl" : "text-3xl md:text-5xl lg:text-6xl"}`}
                        style={{ textShadow: isDarkSlide ? "0 0 60px rgba(255,255,255,0.3)" : "0 0 40px rgba(41,84,159,0.1)" }}>
                        {slide.headline}
                    </h1>

                    <p className={`text-lg md:text-xl lg:text-2xl font-light mb-8 animate-fade-in ${isDarkSlide ? "text-white/70" : "text-[#2c3150]/70"}`}>
                        {slide.tagline}
                    </p>

                    {/* Get Started button - RIGHT AFTER tagline, BEFORE icons */}
                    {!slide.isCTA && !slide.headlineHero && (
                        <button onClick={() => navigate("/start")}
                            className={`mb-8 inline-block px-10 py-4 text-base font-semibold rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-95 ${isDarkSlide ? "bg-white/20 text-white hover:bg-white/30 hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)]" : "bg-[#29549f] text-white hover:bg-[#1e4374] hover:shadow-[0_20px_60px_rgba(41,84,159,0.4)]"}`}>
                            {t("landingCarousel.cta.discover")}
                        </button>
                    )}

                    {/* Hero slide (slide 0) - Get Started after tagline */}
                    {slide.headlineHero && (
                        <button onClick={() => navigate("/start")}
                            className="mb-8 inline-block px-10 py-4 text-base font-semibold text-white bg-[#29549f] rounded-2xl cursor-pointer transition-all duration-300 hover:bg-[#1e4374] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(41,84,159,0.4)] active:scale-95">
                            {t("landingCarousel.cta.discover")}
                        </button>
                    )}

                    {slide.things && (
                        <div className="flex justify-center gap-8 md:gap-12 mb-8 flex-wrap">
                            {slide.things.map((thing, i) => (
                                <div key={i} className="text-center min-w-[140px] md:min-w-[180px] animate-fade-in">
                                    <div className={`text-4xl md:text-5xl mb-3 animate-breathe ${isDarkSlide ? "text-[#a7cbd4]" : "text-[#8460ea]"}`}>{thing.icon}</div>
                                    <div className={`text-base md:text-lg font-semibold mb-1 ${isDarkSlide ? "text-white" : "text-[#2c3150]"}`}>{thing.label}</div>
                                    <div className={`text-sm md:text-base ${isDarkSlide ? "text-white/50" : "text-[#2c3150]/50"}`}>{thing.desc}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer tagline only (no button) for slides with icons */}
                    {slide.cta && (
                        <div className="mt-6 animate-fade-in">
                            <p className={`text-lg md:text-xl lg:text-2xl font-medium tracking-wide ${isDarkSlide ? "text-[#a7cbd4]" : "text-[#29549f]"}`}>
                                {slide.cta}
                            </p>
                        </div>
                    )}

                    {slide.isCTA && (
                        <div className="mt-6 animate-fade-in">
                            <button onClick={() => navigate("/start")}
                                className="inline-block px-10 py-4 text-base font-semibold text-white bg-[#29549f] rounded-2xl cursor-pointer transition-all duration-300 hover:bg-[#1e4374] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(41,84,159,0.4)] active:scale-95">
                                {t("landingCarousel.cta.discover")}
                            </button>
                            <br />
                            <button onClick={() => navigate("/contact")} className="inline-block mt-5 text-sm text-[#2c3150]/60 hover:text-[#29549f] transition-colors">
                                {t("landingCarousel.cta.deploy")}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-[2px] bg-black/5 z-50">
                <div className="h-full bg-[#29549f] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>

            {/* Slide Counter */}
            <div className={`fixed bottom-10 left-8 text-xs z-50 ${isDarkSlide ? "text-white/40" : "text-[#2c3150]/40"}`}>
                {currentSlide + 1} / {totalSlides}
            </div>

            {/* Dots */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 hidden md:flex gap-2 z-50">
                {Array.from({ length: totalSlides }).map((_, i) => (
                    <div key={i} onClick={() => goToSlide(i)}
                        className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${i === currentSlide ? "w-6 bg-[#29549f]" : `w-2 ${isDarkSlide ? "bg-white/20 hover:bg-white/40" : "bg-[#2c3150]/20 hover:bg-[#2c3150]/40"}`}`}
                    />
                ))}
            </div>

            {/* Nav Buttons */}
            <div className="fixed bottom-8 right-8 flex gap-3 z-50">
                <button onClick={prevSlide}
                    className={`w-11 h-11 backdrop-blur-md rounded-xl text-lg transition-all border ${isDarkSlide ? "bg-white/10 border-white/20 text-white/70 hover:bg-white/20" : "bg-white/40 border-white/60 text-[#2c3150]/70 hover:bg-white/60 hover:text-[#29549f]"} ${!hasInteracted ? "animate-pulse" : ""}`}>
                    ←
                </button>
                <button onClick={nextSlide}
                    className={`w-11 h-11 backdrop-blur-md rounded-xl text-lg transition-all border ${isDarkSlide ? "bg-white/10 border-white/20 text-white/70 hover:bg-white/20" : "bg-white/40 border-white/60 text-[#2c3150]/70 hover:bg-white/60 hover:text-[#29549f]"} ${!hasInteracted ? "animate-pulse" : ""}`}>
                    →
                </button>
            </div>

            {/* Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)}
                className={`fixed top-8 right-8 w-11 h-11 backdrop-blur-md rounded-xl text-xl z-[200] transition-all border ${isDarkSlide ? "bg-white/10 border-white/20 text-white/70 hover:bg-white/20" : "bg-white/40 border-white/60 text-[#2c3150]/70 hover:bg-white/60 hover:text-[#29549f]"}`}>
                ☰
            </button>

            {/* Menu Drawer */}
            <div className={`fixed top-0 h-full w-[280px] backdrop-blur-xl bg-white/80 border-l border-white/40 pt-20 px-6 z-[150] transition-all duration-300 overflow-y-auto ${menuOpen ? "right-0" : "-right-[300px]"}`}>
                {menuItems.map((item, i) => (
                    <button key={i} onClick={() => goToSlide(i)}
                        className={`block w-full p-3 mb-2 rounded-xl text-left text-sm cursor-pointer transition-all ${i === currentSlide ? "bg-[#29549f]/10 text-[#29549f] font-medium" : "text-[#2c3150]/70 hover:bg-[#29549f]/5 hover:text-[#29549f]"}`}>
                        {item}
                    </button>
                ))}
            </div>

            {menuOpen && <div className="fixed inset-0 z-[140]" onClick={() => setMenuOpen(false)} />}

            <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .animate-breathe { animation: breathe 3s ease-in-out infinite; }
        @keyframes float-0 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, -20px); } }
        @keyframes float-1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-15px, 15px); } }
        @keyframes float-2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(10px, 25px); } }
      `}</style>
        </div>
    );
};

export default LandingPage;
