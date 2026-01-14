import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

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

    return (
        <div className="min-h-dvh bg-black text-white font-['Inter',sans-serif] overflow-hidden relative">
            {/* Slide Content */}
            <div
                key={currentSlide}
                className="min-h-dvh flex flex-col justify-center items-center px-6 md:px-16 py-16 text-center animate-fade-in"
            >
                <div className="max-w-[1200px] w-full">
                    {slide.audienceTag && (
                        <div className="text-[0.85rem] font-semibold text-[#0A84FF] tracking-[0.15em] uppercase mb-8">
                            {slide.audienceTag}
                        </div>
                    )}

                    {slide.problem && (
                        <div className="text-lg md:text-xl font-light text-[#666] tracking-wide mb-10">
                            {slide.problem}
                        </div>
                    )}

                    <h1
                        className={`font-bold leading-[1.1] mb-12 bg-gradient-to-br from-white to-[#a0a0a0] bg-clip-text text-transparent whitespace-pre-line ${slide.headlineHero ? "text-4xl md:text-6xl lg:text-7xl" : "text-3xl md:text-5xl lg:text-6xl"
                            }`}
                    >
                        {slide.headline}
                    </h1>

                    <p className="text-lg md:text-2xl font-normal text-[#888] mb-16">{slide.tagline}</p>

                    {slide.things && (
                        <div className="flex justify-center gap-8 md:gap-16 mb-16 flex-wrap">
                            {slide.things.map((thing, i) => (
                                <div key={i} className="text-center min-w-[140px] md:min-w-[180px]">
                                    <div className="text-3xl md:text-4xl mb-4">{thing.icon}</div>
                                    <div className="text-base md:text-lg font-semibold text-white mb-2">{thing.label}</div>
                                    <div className="text-sm text-[#666]">{thing.desc}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {slide.cta && (
                        <p className="text-lg md:text-xl font-light text-[#0A84FF] tracking-wide">{slide.cta}</p>
                    )}

                    {slide.isCTA && (
                        <div className="mt-8">
                            <button
                                onClick={() => navigate("/start")}
                                className="inline-block px-12 py-5 text-lg font-semibold text-white bg-[#0A84FF] rounded-xl cursor-pointer transition-all duration-300 hover:bg-[#0070E0] hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(10,132,255,0.3)]"
                            >
                                Enter the Portal
                            </button>
                            <br />
                            <button
                                onClick={() => navigate("/contact")}
                                className="inline-block mt-6 text-base text-[#666] hover:text-[#888] transition-colors"
                            >
                                Or: Deploy for your community →
                            </button>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm text-[#444] tracking-[0.1em] uppercase">
                    {slide.footer || "Planetary OS"}
                </div>
            </div>

            {/* Slide Counter */}
            <div className="fixed bottom-10 left-8 text-sm text-[#444] z-50">
                {currentSlide + 1} / {totalSlides}
            </div>

            {/* Dots Navigation */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 hidden md:flex gap-2 z-50">
                {Array.from({ length: totalSlides }).map((_, i) => (
                    <div
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`h-2 rounded-full cursor-pointer transition-all duration-200 ${i === currentSlide ? "w-6 bg-[#0A84FF]" : "w-2 bg-[#333] hover:bg-[#555]"
                            }`}
                    />
                ))}
            </div>

            {/* Nav Buttons */}
            <div className="fixed bottom-8 right-8 flex gap-3 z-50">
                <button
                    onClick={prevSlide}
                    className={`w-12 h-12 border border-[#333] bg-black/80 text-[#888] text-xl rounded-lg transition-all hover:border-[#0A84FF] hover:text-[#0A84FF] ${!hasInteracted ? "animate-pulse" : ""
                        }`}
                >
                    ←
                </button>
                <button
                    onClick={nextSlide}
                    className={`w-12 h-12 border border-[#333] bg-black/80 text-[#888] text-xl rounded-lg transition-all hover:border-[#0A84FF] hover:text-[#0A84FF] ${!hasInteracted ? "animate-pulse" : ""
                        }`}
                >
                    →
                </button>
            </div>

            {/* Menu Toggle */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="fixed top-8 right-8 w-12 h-12 border border-[#333] bg-black/80 text-[#888] text-2xl rounded-lg z-[200] transition-all hover:border-[#0A84FF] hover:text-[#0A84FF]"
            >
                ☰
            </button>

            {/* Menu Drawer */}
            <div
                className={`fixed top-0 h-full w-[300px] bg-[rgba(10,10,10,0.98)] border-l border-[#222] pt-24 px-8 z-[150] transition-all duration-300 overflow-y-auto ${menuOpen ? "right-0" : "-right-[320px]"
                    }`}
            >
                {menuItems.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`block w-full p-4 mb-2 bg-transparent border rounded-lg text-left text-base cursor-pointer transition-all ${i === currentSlide
                                ? "border-[#0A84FF] text-[#0A84FF]"
                                : "border-[#222] text-[#888] hover:border-[#0A84FF] hover:text-white"
                            }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
        </div>
    );
};

export default LandingPage;
