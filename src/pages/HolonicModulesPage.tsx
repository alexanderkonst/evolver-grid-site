import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { modules } from "@/data/modules";
import { Module } from "@/types/module";
import Navigation from "@/components/Navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

/* ──────────────────────────────────────────────
   Space taxonomy — each ring of the holonic map
   ────────────────────────────────────────────── */
interface SpaceRing {
    id: string;
    label: string;
    tagline: string;
    color: string;          // accent gradient start
    colorEnd: string;       // accent gradient end
    glowColor: string;      // radial glow
    ringRadius: number;     // SVG radius
}

const SPACES: SpaceRing[] = [
    {
        id: "ME",
        label: "ME",
        tagline: "Know yourself",
        color: "#8460ea",
        colorEnd: "#6894d0",
        glowColor: "rgba(132,96,234,0.15)",
        ringRadius: 90,
    },
    {
        id: "BUILD",
        label: "BUILD",
        tagline: "Create your offer",
        color: "#29549f",
        colorEnd: "#1e4374",
        glowColor: "rgba(41,84,159,0.15)",
        ringRadius: 160,
    },
    {
        id: "MEET",
        label: "MEET",
        tagline: "Find your people",
        color: "#a7cbd4",
        colorEnd: "#6894d0",
        glowColor: "rgba(167,203,212,0.15)",
        ringRadius: 230,
    },
    {
        id: "LEARN",
        label: "LEARN",
        tagline: "Evolve through practice",
        color: "#2B2342",
        colorEnd: "#8460ea",
        glowColor: "rgba(43,35,66,0.12)",
        ringRadius: 295,
    },
];

/* ──────────────────────────────────────────
   Map each module to its space
   ────────────────────────────────────────── */
function getModuleSpace(m: Module): string {
    if (m.space) return m.space;
    // Fallback heuristics
    if (m.category === "Tools") return "ME";
    if (m.category === "Business" || m.category === "AI") return "BUILD";
    if (m.category === "Ceremonies") return "MEET";
    return "LEARN";
}

function getModuleLink(m: Module): string {
    return `/modules/${m.slug}`;
}

/* ──────────────────────────────────────────
   Position modules around their ring
   ────────────────────────────────────────── */
function positionModules(
    mods: Module[],
    ring: SpaceRing,
    centerX: number,
    centerY: number,
): Array<{ module: Module; x: number; y: number }> {
    const count = mods.length;
    if (count === 0) return [];

    // Spread modules evenly starting from top
    const startAngle = -Math.PI / 2;
    const angleStep = (2 * Math.PI) / Math.max(count, 1);
    const radius = ring.ringRadius;

    return mods.map((module, i) => {
        const angle = startAngle + i * angleStep;
        return {
            module,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };
    });
}

/* ══════════════════════════════════════════
   MODULE NODE — single module dot on the map
   ══════════════════════════════════════════ */
interface ModuleNodeProps {
    module: Module;
    x: number;
    y: number;
    space: SpaceRing;
    isHovered: boolean;
    onHover: (slug: string | null) => void;
    isMobile: boolean;
}

const ModuleNode = ({ module, x, y, space, isHovered, onHover, isMobile }: ModuleNodeProps) => {
    const r = isHovered ? 28 : 20;
    const isComingSoon = module.status === "Coming Soon";

    return (
        <g
            className="cursor-pointer"
            onMouseEnter={() => onHover(module.slug)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onHover(isHovered ? null : module.slug)}
        >
            {/* Glow ring on hover */}
            {isHovered && (
                <circle
                    cx={x}
                    cy={y}
                    r={r + 12}
                    fill="none"
                    stroke={space.color}
                    strokeWidth="2"
                    opacity="0.3"
                    className="animate-pulse"
                />
            )}

            {/* Module dot */}
            <circle
                cx={x}
                cy={y}
                r={r}
                fill={`url(#grad-${space.id})`}
                opacity={isComingSoon ? 0.4 : 0.9}
                className="transition-all duration-300"
                style={{ filter: isHovered ? `drop-shadow(0 0 12px ${space.color})` : "none" }}
            />

            {/* Status dot */}
            {!isComingSoon && (
                <circle
                    cx={x + r * 0.6}
                    cy={y - r * 0.6}
                    r={4}
                    fill="#22c55e"
                    stroke="#fff"
                    strokeWidth="1.5"
                />
            )}

            {/* Label — only when hovered or on mobile */}
            {(isHovered || isMobile) && (
                <foreignObject
                    x={x - 70}
                    y={y + r + 6}
                    width={140}
                    height={50}
                    className="pointer-events-none"
                >
                    <div className="text-center">
                        <p className="text-[10px] sm:text-xs font-semibold text-white leading-tight drop-shadow-md">
                            {module.title.length > 24
                                ? module.title.slice(0, 22) + "…"
                                : module.title}
                        </p>
                    </div>
                </foreignObject>
            )}
        </g>
    );
};

/* ══════════════════════════════════════════
   HOLONIC MAP — the full SVG constellation
   ══════════════════════════════════════════ */
const HolonicMap = () => {
    const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const viewSize = 700;
    const cx = viewSize / 2;
    const cy = viewSize / 2;

    // Group modules by space
    const bySpace: Record<string, Module[]> = {};
    modules.forEach((m) => {
        const sp = getModuleSpace(m);
        if (!bySpace[sp]) bySpace[sp] = [];
        bySpace[sp].push(m);
    });

    // Position ALL modules
    const allPositioned = SPACES.flatMap((ring) =>
        positionModules(bySpace[ring.id] || [], ring, cx, cy),
    );

    return (
        <div ref={containerRef} className="relative w-full max-w-[700px] mx-auto">
            <svg
                viewBox={`0 0 ${viewSize} ${viewSize}`}
                className="w-full h-auto"
                aria-label="Holonic module map"
            >
                {/* Gradient definitions */}
                <defs>
                    {SPACES.map((sp) => (
                        <radialGradient key={sp.id} id={`grad-${sp.id}`}>
                            <stop offset="0%" stopColor={sp.color} />
                            <stop offset="100%" stopColor={sp.colorEnd} />
                        </radialGradient>
                    ))}
                    {/* Background radial glow */}
                    <radialGradient id="bg-glow">
                        <stop offset="0%" stopColor="rgba(132,96,234,0.15)" />
                        <stop offset="60%" stopColor="rgba(41,84,159,0.05)" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>

                {/* Background glow */}
                <circle cx={cx} cy={cy} r={340} fill="url(#bg-glow)" />

                {/* Concentric orbit rings */}
                {SPACES.map((ring) => (
                    <circle
                        key={ring.id}
                        cx={cx}
                        cy={cy}
                        r={ring.ringRadius}
                        fill="none"
                        stroke={ring.color}
                        strokeWidth="1"
                        opacity="0.15"
                        strokeDasharray="4 6"
                    />
                ))}

                {/* Space labels on rings */}
                {SPACES.map((ring) => (
                    <text
                        key={`label-${ring.id}`}
                        x={cx}
                        y={cy - ring.ringRadius - 8}
                        textAnchor="middle"
                        fill={ring.color}
                        opacity="0.5"
                        fontSize="10"
                        fontWeight="600"
                        letterSpacing="0.15em"
                    >
                        {ring.label}
                    </text>
                ))}

                {/* Center "YOU" */}
                <circle cx={cx} cy={cy} r={22} fill="url(#grad-ME)" opacity="0.25" />
                <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="700"
                    letterSpacing="0.1em"
                >
                    YOU
                </text>

                {/* Connection lines from center to each module */}
                {allPositioned.map(({ module, x, y }) => (
                    <line
                        key={`line-${module.slug}`}
                        x1={cx}
                        y1={cy}
                        x2={x}
                        y2={y}
                        stroke="white"
                        strokeWidth="0.5"
                        opacity={hoveredSlug === module.slug ? 0.3 : 0.06}
                        className="transition-opacity duration-300"
                    />
                ))}

                {/* Module nodes — rendered after lines so they sit on top */}
                {allPositioned.map(({ module, x, y }) => {
                    const space = SPACES.find((s) => s.id === getModuleSpace(module))!;
                    return (
                        <Link key={module.slug} to={getModuleLink(module)}>
                            <ModuleNode
                                module={module}
                                x={x}
                                y={y}
                                space={space}
                                isHovered={hoveredSlug === module.slug}
                                onHover={setHoveredSlug}
                                isMobile={isMobile}
                            />
                        </Link>
                    );
                })}
            </svg>
        </div>
    );
};

/* ══════════════════════════════════════════
   DETAIL CARD — appears when a module is
   hovered (desktop) or tapped (mobile)
   ══════════════════════════════════════════ */
interface DetailCardProps {
    module: Module;
}

const DetailCard = ({ module }: DetailCardProps) => {
    const space = SPACES.find((s) => s.id === getModuleSpace(module));
    const isComingSoon = module.status === "Coming Soon";

    return (
        <Link
            to={getModuleLink(module)}
            className="block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all duration-300 group"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                            style={{
                                background: `linear-gradient(135deg, ${space?.color || "#8460ea"}, ${space?.colorEnd || "#6894d0"})`,
                                color: "white",
                            }}
                        >
                            {space?.label || "—"}
                        </span>
                        {isComingSoon ? (
                            <span className="text-[10px] uppercase tracking-wider text-white/40">Coming Soon</span>
                        ) : (
                            <span className="text-[10px] uppercase tracking-wider text-emerald-400">● Live</span>
                        )}
                    </div>
                    <h3 className="text-lg font-display font-semibold text-white leading-tight mb-1 group-hover:text-[#a7cbd4] transition-colors">
                        {module.title}
                    </h3>
                    <p className="text-sm text-white/60 line-clamp-2">{module.tagline}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0 mt-1" />
            </div>
        </Link>
    );
};

/* ══════════════════════════════════════════
   PAGE — /modules (All Modules holonic view)
   ══════════════════════════════════════════ */
const HolonicModulesPage = () => {
    const heroAnim = useScrollAnimation(0.1);
    const mapAnim = useScrollAnimation(0.15);
    const listAnim = useScrollAnimation(0.2);

    // Group modules by space for the list section
    const grouped: Record<string, Module[]> = {};
    SPACES.forEach((s) => {
        grouped[s.id] = modules.filter((m) => getModuleSpace(m) === s.id);
    });

    useEffect(() => {
        document.title = "All Modules — Evolver";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-dvh bg-[#0e1525]">
            <Navigation />

            {/* ─── Hero ─── */}
            <section
                ref={heroAnim.ref}
                className={`relative pt-32 pb-12 px-6 text-center ${heroAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
            >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(132,96,234,0.12)_0%,transparent_60%)]" />
                <div className="relative container mx-auto max-w-3xl">
                    <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <Sparkles className="w-4 h-4 text-[#a7cbd4]" />
                        <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#a7cbd4]">
                            Holonic Platform
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-white leading-[1.1] mb-5 tracking-tight">
                        The Evolver System
                    </h1>
                    <p className="text-lg sm:text-xl text-white/55 leading-relaxed max-w-2xl mx-auto">
                        Every module is a part of you. Together they form a living system for
                        self-knowledge, creation, and connection.
                    </p>
                </div>
            </section>

            {/* ─── Interactive Holonic Map ─── */}
            <section
                ref={mapAnim.ref}
                className={`relative py-8 px-4 ${mapAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
            >
                <HolonicMap />

                {/* Ring legend below the map */}
                <div className="flex flex-wrap justify-center gap-6 mt-8">
                    {SPACES.map((s) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: `linear-gradient(135deg, ${s.color}, ${s.colorEnd})` }}
                            />
                            <span className="text-xs text-white/50 font-medium uppercase tracking-wider">
                                {s.label}
                            </span>
                            <span className="text-xs text-white/30">— {s.tagline}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Grid List by Space ─── */}
            <section
                ref={listAnim.ref}
                className={`py-20 px-6 ${listAnim.isVisible ? "fade-in-section" : "opacity-0"}`}
            >
                <div className="container mx-auto max-w-4xl space-y-14">
                    {SPACES.map((space) => {
                        const spaceModules = grouped[space.id] || [];
                        if (spaceModules.length === 0) return null;

                        return (
                            <div key={space.id}>
                                {/* Space header */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div
                                        className="w-2 h-8 rounded-full"
                                        style={{ background: `linear-gradient(to bottom, ${space.color}, ${space.colorEnd})` }}
                                    />
                                    <div>
                                        <h2 className="text-xl font-display font-semibold text-white">
                                            {space.label}
                                        </h2>
                                        <p className="text-sm text-white/40">{space.tagline}</p>
                                    </div>
                                </div>

                                {/* Module cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {spaceModules.map((mod) => (
                                        <DetailCard key={mod.slug} module={mod} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ─── Final CTA ─── */}
            <section className="relative py-24 px-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(132,96,234,0.1)_0%,transparent_60%)]" />
                <div className="relative container mx-auto max-w-2xl">
                    <h2 className="text-3xl sm:text-4xl font-display font-semibold text-white mb-4">
                        Start with what calls you
                    </h2>
                    <p className="text-lg text-white/50 mb-8">
                        Every module is an entry point. Pick one, begin, and the system meets you where you are.
                    </p>
                    <Link
                        to="/start"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(132,96,234,0.4)]"
                        style={{
                            background: "linear-gradient(135deg, #8460ea 0%, #6894d0 100%)",
                            boxShadow: "0 4px 20px rgba(132, 96, 234, 0.3)",
                        }}
                    >
                        Begin Your Journey
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HolonicModulesPage;
