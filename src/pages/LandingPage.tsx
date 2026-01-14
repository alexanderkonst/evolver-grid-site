import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Wabi-sabi + Apple aesthetic landing page
 * Soft pastels, bokeh-style depth, ultra-minimal, high-trust institutional feel
 */

const LandingPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const navigate = useNavigate();
    const totalSlides = 9;

    const slides = [
        // Slide 0: Hero
        {
            audienceTag: null,
            problem: null,
            headline: "Planetary OS",
            headlineHero: true,
            tagline: "Coordination infrastructure for human potential",
            things: [
                { icon: "◎", label: "Discover", desc: "Your unique genius" },
                { icon: "⬡", label: "Map", desc: "Your life & assets" },
                { icon: "∞", label: "Connect", desc: "Your complementary people" },
            ],
            cta: "For individuals. For communities. For Network States.",
            footer: "→ Navigate to explore",
            gradient: "from-[#8460ea] via-[#a4a3d0] to-[#a7cbd4]",
        },
        // Slide 1: Individual
        {
            audienceTag: "For You",
            problem: "You know you're meant for more. You just can't name it yet.",
            headline: "Know Your Genius.\nFind Your Path.\nMeet Your People.",
            tagline: "15 minutes to clarity. One week to direction.",
            things: [
                { icon: "◎", label: "Your Unique Gift", desc: "Words for what makes you, you" },
                { icon: "◈", label: "Your Life Map", desc: "Where you are. Where to go." },
                { icon: "∞", label: "Your People", desc: "Matched by complementary genius" },
            ],
            cta: "There's always a next move. We'll tell you what it is.",
            gradient: "from-[#c8b7d8] via-[#cea4ae] to-[#cec9b0]",
        },
        // Slide 2: Community Leaders
        {
            audienceTag: "For Community Leaders",
            problem: "You can't coordinate what you can't see.",
            headline: "See Every Talent.\nMatch Every Need.\nScale Your Attention.",
            tagline: "The operating system your community is missing.",
            things: [
                { icon: "◎", label: "Talent Visibility", desc: "Every member's genius, mapped" },
                { icon: "⬡", label: "Auto-Matching", desc: "AI connects complementary people" },
                { icon: "↑", label: "Growth Path", desc: "61 modules keep members engaged" },
            ],
            cta: "Your community. Fully coordinated. Finally.",
            gradient: "from-[#a7ccce] via-[#b1c9b6] to-[#cec9b0]",
        },
        // Slide 3: Network States
        {
            audienceTag: "For Network States",
            problem: "Network States need citizens who know their value",
            headline: "The Member Portal\nfor Network States",
            tagline: "AI-powered clarity. Human connection. Daily action.",
            things: [
                { icon: "◎", label: "Legible Citizens", desc: "Every talent visible, searchable" },
                { icon: "⬡", label: "Asset Registry", desc: "Skills, network, resources mapped" },
                { icon: "∞", label: "Coordination Layer", desc: "Right people find right projects" },
            ],
            cta: "Working prototype. Ready to deploy.",
            gradient: "from-[#1e4374] via-[#29549f] to-[#6894d0]",
        },
        // Slide 4: Venture Studios
        {
            audienceTag: "For Venture Studios",
            problem: "You're betting on founders you don't fully understand",
            headline: "See Founder DNA\nBefore You Invest",
            tagline: "Genius profiles. Co-founder matching. Team composition.",
            things: [
                { icon: "◎", label: "Founder Profiles", desc: "Zone of Genius for every applicant" },
                { icon: "⚡", label: "Gap Analysis", desc: "What's missing in the team?" },
                { icon: "∞", label: "Co-Founder Match", desc: "Find the complementary genius" },
            ],
            cta: "De-risk your bets. Match your founders.",
            gradient: "from-[#2c3150] via-[#342c48] to-[#8460ea]",
        },
        // Slide 5: Regen Communities
        {
            audienceTag: "For Regenerative Communities",
            problem: "Your community has everything it needs. It just can't see it.",
            headline: "Map Your Commons.\nMatch Needs to Gifts.",
            tagline: "Every skill. Every resource. Every connection. Visible.",
            things: [
                { icon: "◎", label: "Gift Mapping", desc: "What each member brings" },
                { icon: "⬡", label: "Asset Commons", desc: "Tools, land, skills, networks" },
                { icon: "∞", label: "Need ↔ Offer", desc: "Automatic matching, gift economy" },
            ],
            cta: "Regeneration starts with coordination.",
            gradient: "from-[#b1c9b6] via-[#a7cbd4] to-[#e7e9e5]",
        },
        // Slide 6: DAOs
        {
            audienceTag: "For DAOs & Web3",
            problem: "You have token holders. You need contributors.",
            headline: "From Wallets\nto Working Groups",
            tagline: "Know who should build what. Together.",
            things: [
                { icon: "◎", label: "Contributor Profiles", desc: "Beyond Discord roles" },
                { icon: "⬡", label: "Skill Staking", desc: "Commit talents, not just tokens" },
                { icon: "∞", label: "Squad Formation", desc: "Auto-compose balanced teams" },
            ],
            cta: "Coordination infrastructure for the decentralized age.",
            gradient: "from-[#6894d0] via-[#a4a3d0] to-[#c2b9e1]",
        },
        // Slide 7: Conscious Communities
        {
            audienceTag: "For Conscious Communities",
            problem: "Awakening is personal. But the work is collective.",
            headline: "Growth as Infrastructure.\nConnection as Practice.",
            tagline: "A shared developmental path for your community.",
            things: [
                { icon: "◎", label: "Inner Journey", desc: "Body, Emotions, Mind, Spirit, Genius" },
                { icon: "◈", label: "Shared Path", desc: "61 modules, one community" },
                { icon: "∞", label: "Soul Matches", desc: "Find your mirrors, find your complements" },
            ],
            cta: "The portal for communities that grow together.",
            gradient: "from-[#cdaed2] via-[#c8b7d8] to-[#a4a3d0]",
        },
        // Slide 8: CTA
        {
            audienceTag: null,
            problem: "The prototype is live.",
            headline: "Ready to See\nYour Genius?",
            tagline: "15 minutes. Free. Forever yours.",
            things: null,
            cta: null,
            isCTA: true,
            gradient: "from-[#e7e9e5] via-[#dcdde2] to-[#a4a3d0]",
        },
    ];

    const menuItems = [
        "Home",
        "For Individuals",
        "For Community Leaders",
        "For Network States",
        "For Venture Studios",
        "For Regen Communities",
        "For DAOs & Web3",
        "For Conscious Communities",
        "Get Started",
    ];

    const nextSlide = useCallback(() => {
        setHasInteracted(true);
        setCurrentSlide((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
    }, []);

    const prevSlide = useCallback(() => {
        setHasInteracted(true);
        setCurrentSlide((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
    }, []);

    const goToSlide = (n: number) => {
        setHasInteracted(true);
        setCurrentSlide(n);
        setMenuOpen(false);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                nextSlide();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                prevSlide();
            }
            if (e.key === "Escape") {
                setMenuOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Touch swipe
    useEffect(() => {
        let touchStartX = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX;
        };
        const handleTouchEnd = (e: TouchEvent) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? nextSlide() : prevSlide();
            }
        };
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchend", handleTouchEnd);
        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [nextSlide, prevSlide]);

    const slide = slides[currentSlide];

    // Determine if this is a dark slide (Network States, Venture Studios)
    const isDarkSlide = currentSlide === 3 || currentSlide === 4;

    return (
        <div className="min-h-dvh font-['Inter',sans-serif] overflow-hidden relative">
            {/* Gradient Background with soft bokeh-like blur */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-700 ease-out`}
            />

            {/* Soft overlay for wabi-sabi texture feel */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.2)_0%,transparent_50%)]" />

            {/* Slide Content */}
            <div
                key={currentSlide}
                className="relative min-h-dvh flex flex-col justify-center items-center px-6 md:px-16 py-16 text-center animate-fade-in"
            >
                <div className="max-w-[1000px] w-full">
                    {slide.audienceTag && (
                        <div className={`text-xs font-semibold tracking-[0.2em] uppercase mb-8 ${isDarkSlide ? "text-[#a7cbd4]" : "text-[#29549f]"
                            }`}>
                            {slide.audienceTag}
                        </div>
                    )}

                    {slide.problem && (
                        <div className={`text-base md:text-lg font-light tracking-wide mb-8 ${isDarkSlide ? "text-white/60" : "text-[#2c3150]/60"
                            }`}>
                            {slide.problem}
                        </div>
                    )}

                    <h1
                        className={`font-bold leading-[1.1] mb-10 whitespace-pre-line ${isDarkSlide ? "text-white" : "text-[#2c3150]"
                            } ${slide.headlineHero ? "text-4xl md:text-6xl lg:text-7xl" : "text-3xl md:text-5xl lg:text-6xl"
                            }`}
                    >
                        {slide.headline}
                    </h1>

                    <p className={`text-lg md:text-xl font-light mb-14 ${isDarkSlide ? "text-white/70" : "text-[#2c3150]/70"
                        }`}>
                        {slide.tagline}
                    </p>

                    {slide.things && (
                        <div className="flex justify-center gap-8 md:gap-16 mb-14 flex-wrap">
                            {slide.things.map((thing, i) => (
                                <div key={i} className="text-center min-w-[130px] md:min-w-[160px]">
                                    <div className={`text-3xl md:text-4xl mb-3 ${isDarkSlide ? "text-[#a7cbd4]" : "text-[#8460ea]"
                                        }`}>{thing.icon}</div>
                                    <div className={`text-sm md:text-base font-semibold mb-1 ${isDarkSlide ? "text-white" : "text-[#2c3150]"
                                        }`}>{thing.label}</div>
                                    <div className={`text-xs md:text-sm ${isDarkSlide ? "text-white/50" : "text-[#2c3150]/50"
                                        }`}>{thing.desc}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {slide.cta && (
                        <p className={`text-base md:text-lg font-medium tracking-wide ${isDarkSlide ? "text-[#a7cbd4]" : "text-[#29549f]"
                            }`}>
                            {slide.cta}
                        </p>
                    )}

                    {slide.isCTA && (
                        <div className="mt-8">
                            <button
                                onClick={() => navigate("/start")}
                                className="inline-block px-10 py-4 text-base font-semibold text-white bg-[#29549f] rounded-2xl cursor-pointer transition-all duration-300 hover:bg-[#1e4374] hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(41,84,159,0.3)]"
                            >
                                Enter the Portal
                            </button>
                            <br />
                            <button
                                onClick={() => navigate("/contact")}
                                className="inline-block mt-6 text-sm text-[#2c3150]/60 hover:text-[#29549f] transition-colors"
                            >
                                Or: Deploy for your community →
                            </button>
                        </div>
                    )}
                </div>

                {slide.footer && (
                    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.15em] uppercase ${isDarkSlide ? "text-white/30" : "text-[#2c3150]/30"
                        }`}>
                        {slide.footer}
                    </div>
                )}
            </div>

            {/* Slide Counter */}
            <div className={`fixed bottom-10 left-8 text-xs z-50 ${isDarkSlide ? "text-white/40" : "text-[#2c3150]/40"
                }`}>
                {currentSlide + 1} / {totalSlides}
            </div>

            {/* Dots Navigation */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 hidden md:flex gap-2 z-50">
                {Array.from({ length: totalSlides }).map((_, i) => (
                    <div
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${i === currentSlide
                            ? "w-6 bg-[#29549f]"
                            : `w-2 ${isDarkSlide ? "bg-white/20 hover:bg-white/40" : "bg-[#2c3150]/20 hover:bg-[#2c3150]/40"}`
                            }`}
                    />
                ))}
            </div>

            {/* Nav Buttons - Glassmorphism */}
            <div className="fixed bottom-8 right-8 flex gap-3 z-50">
                <button
                    onClick={prevSlide}
                    className={`w-11 h-11 backdrop-blur-md rounded-xl text-lg transition-all border ${isDarkSlide
                        ? "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
                        : "bg-white/40 border-white/60 text-[#2c3150]/70 hover:bg-white/60 hover:text-[#29549f]"
                        } ${!hasInteracted ? "animate-pulse" : ""}`}
                >
                    ←
                </button>
                <button
                    onClick={nextSlide}
                    className={`w-11 h-11 backdrop-blur-md rounded-xl text-lg transition-all border ${isDarkSlide
                        ? "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
                        : "bg-white/40 border-white/60 text-[#2c3150]/70 hover:bg-white/60 hover:text-[#29549f]"
                        } ${!hasInteracted ? "animate-pulse" : ""}`}
                >
                    →
                </button>
            </div>

            {/* Menu Toggle - Glassmorphism */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`fixed top-8 right-8 w-11 h-11 backdrop-blur-md rounded-xl text-xl z-[200] transition-all border ${isDarkSlide
                    ? "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white"
                    : "bg-white/40 border-white/60 text-[#2c3150]/70 hover:bg-white/60 hover:text-[#29549f]"
                    }`}
            >
                ☰
            </button>

            {/* Menu Drawer - Glassmorphism */}
            <div
                className={`fixed top-0 h-full w-[280px] backdrop-blur-xl bg-white/80 border-l border-white/40 pt-20 px-6 z-[150] transition-all duration-300 overflow-y-auto ${menuOpen ? "right-0" : "-right-[300px]"
                    }`}
            >
                {menuItems.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`block w-full p-3 mb-2 rounded-xl text-left text-sm cursor-pointer transition-all ${i === currentSlide
                            ? "bg-[#29549f]/10 text-[#29549f] font-medium"
                            : "text-[#2c3150]/70 hover:bg-[#29549f]/5 hover:text-[#29549f]"
                            }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* Click outside to close menu */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-[140]"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
        </div>
    );
};

export default LandingPage;
