import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

/* ──────────────────────────────────────────────
   Module Taxonomy v2.2 — canonical source of truth
   from docs/02-strategy/module_taxonomy.md
   ────────────────────────────────────────────── */

type VersionStage = "Concept" | "Prototype" | "PoC" | "Alpha" | "MVP" | "Commercial";

interface TaxonomyModule {
    id: string;
    // name, masterResult, dependencies copy live in i18n keyed by id
    version: string;
    stage: VersionStage;
    route?: string;        // start route, if navigable
    hasDependencies?: boolean;
    submoduleCount?: number;
}

interface SpaceDefinition {
    id: string;
    // label + tagline copy live in i18n keyed by id
    emoji: string;
    color: string;
    colorEnd: string;
    modules: TaxonomyModule[];
}

/* ─── i18n copy resolvers (keyed by stable id) ─── */
const spaceLabel = (t: TFunction, id: string) =>
    t(`holonicModules.spaces.${id}.label`);
const spaceTagline = (t: TFunction, id: string) =>
    t(`holonicModules.spaces.${id}.tagline`);
const moduleName = (t: TFunction, id: string) =>
    t(`holonicModules.modules.${id}.name`);
const moduleMasterResult = (t: TFunction, id: string) =>
    t(`holonicModules.modules.${id}.masterResult`);
const moduleDependencies = (t: TFunction, id: string) =>
    t(`holonicModules.modules.${id}.dependencies`);

/* ─── Spaces + Modules (from module_taxonomy.md v2.2) ─── */
const SPACES: SpaceDefinition[] = [
    {
        id: "ME",
        emoji: "🪞",
        color: "#8460ea",
        colorEnd: "#6894d0",
        modules: [
            { id: "zog", version: "0.9", stage: "MVP", route: "/zone-of-genius/entry", submoduleCount: 14 },
            { id: "qol", version: "0.9", stage: "MVP", route: "/quality-of-life-map/assessment", submoduleCount: 4 },
            { id: "mission", version: "0.7", stage: "Alpha", route: "/mission-discovery", hasDependencies: true, submoduleCount: 4 },
            { id: "resources", version: "0.7", stage: "Alpha", route: "/game/me/assets", submoduleCount: 4 },
            { id: "personality", version: "0.5", stage: "PoC", route: "/resources/personality-tests", submoduleCount: 4 },
        ],
    },
    {
        id: "LEARN",
        emoji: "✨",
        color: "#6894d0",
        colorEnd: "#a7cbd4",
        modules: [
            { id: "daily-loop", version: "0.7", stage: "Alpha", route: "/game/next-move", hasDependencies: true, submoduleCount: 4 },
            { id: "library", version: "0.7", stage: "Alpha", route: "/library", submoduleCount: 6 },
            { id: "growth-paths", version: "0.7", stage: "Alpha", route: "/game/learn/paths", hasDependencies: true, submoduleCount: 48 },
            { id: "skill-trees", version: "0.3", stage: "Prototype", route: "/game/skill-trees", hasDependencies: true },
        ],
    },
    {
        id: "MEET",
        emoji: "🎉",
        color: "#a7cbd4",
        colorEnd: "#6894d0",
        modules: [
            { id: "events", version: "0.9", stage: "MVP", route: "/game/meet", submoduleCount: 4 },
            { id: "mens-circle", version: "1.0", stage: "Commercial", route: "/mens-circle", submoduleCount: 3 },
        ],
    },
    {
        id: "COLLABORATE",
        emoji: "👥",
        color: "#29549f",
        colorEnd: "#6894d0",
        modules: [
            { id: "matchmaking", version: "0.7", stage: "Alpha", route: "/game/collaborate", hasDependencies: true, submoduleCount: 5 },
            { id: "connections", version: "0.5", stage: "PoC", route: "/game/collaborate/connections", hasDependencies: true },
        ],
    },
    {
        id: "BUILD",
        emoji: "🛠️",
        color: "#1e4374",
        colorEnd: "#29549f",
        modules: [
            { id: "genius-business", version: "0.7", stage: "Alpha", route: "/game/me/genius-business", hasDependencies: true, submoduleCount: 4 },
            { id: "product-builder", version: "0.7", stage: "Alpha", route: "/game/build/product-builder", hasDependencies: true, submoduleCount: 7 },
            { id: "business-incubator", version: "0.3", stage: "Prototype", route: "/game/build", hasDependencies: true },
        ],
    },
    {
        id: "BUYSELL",
        emoji: "🏪",
        color: "#2B2342",
        colorEnd: "#8460ea",
        modules: [
            { id: "marketplace", version: "0.5", stage: "PoC", route: "/game/marketplace/browse", hasDependencies: true, submoduleCount: 3 },
        ],
    },
    {
        id: "SPECIAL",
        emoji: "🗺️",
        color: "#4a3f6b",
        colorEnd: "#6894d0",
        modules: [
            { id: "onboarding", version: "0.7", stage: "Alpha", route: "/start", submoduleCount: 5 },
            { id: "tour", version: "0.5", stage: "PoC", hasDependencies: true, submoduleCount: 3 },
        ],
    },
    {
        id: "STANDALONE",
        emoji: "🎨",
        color: "#3a3050",
        colorEnd: "#6894d0",
        modules: [
            { id: "equilibrium", version: "0.9", stage: "MVP" },
            { id: "art", version: "0.5", stage: "PoC", route: "/art", submoduleCount: 5 },
            { id: "transcriber", version: "0.5", stage: "PoC", route: "/transcriber" },
            { id: "clock", version: "0.1", stage: "Concept" },
        ],
    },
];

/* ──────────────────────────────────────────
   Visual helpers
   ────────────────────────────────────────── */

const stageColors: Record<VersionStage, { bg: string; text: string }> = {
    Concept: { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.3)" },
    Prototype: { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.4)" },
    PoC: { bg: "rgba(104,148,208,0.1)", text: "#6894d0" },
    Alpha: { bg: "rgba(132,96,234,0.1)", text: "#8460ea" },
    MVP: { bg: "rgba(34,197,94,0.1)", text: "#22c55e" },
    Commercial: { bg: "rgba(250,204,21,0.1)", text: "#facc15" },
};

const allModulesCount = SPACES.reduce((acc, s) => acc + s.modules.length, 0);
const allSubmodulesCount = SPACES.reduce(
    (acc, s) => acc + s.modules.reduce((a, m) => a + (m.submoduleCount || 0), 0),
    0,
);

/* ──────────────────────────────────────────
   SVG Constellation Map
   ────────────────────────────────────────── */

const HolonicMap = () => {
    const { t } = useTranslation();
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const viewSize = 740;
    const cx = viewSize / 2;
    const cy = viewSize / 2;

    // 6 main spaces get rings, Special + Standalone get outer orbit
    const mainSpaces = SPACES.filter(
        (s) => !["SPECIAL", "STANDALONE"].includes(s.id),
    );
    const outerSpaces = SPACES.filter((s) =>
        ["SPECIAL", "STANDALONE"].includes(s.id),
    );

    // Ring radii — concentric from center
    const ringRadii = [80, 140, 195, 245, 290, 328];

    // Position modules for a given space around its ring
    const positionOnRing = (
        mods: TaxonomyModule[],
        radius: number,
        angleOffset = -Math.PI / 2,
    ) => {
        const count = mods.length;
        const step = (2 * Math.PI) / Math.max(count, 1);
        return mods.map((m, i) => {
            const angle = angleOffset + i * step;
            return {
                module: m,
                x: cx + radius * Math.cos(angle),
                y: cy + radius * Math.sin(angle),
            };
        });
    };

    // Position main spaces
    const positioned = mainSpaces.flatMap((space, i) =>
        positionOnRing(space.modules, ringRadii[i]).map((p) => ({
            ...p,
            space,
        })),
    );

    // Outer orbit for Special + Standalone
    const outerModules = outerSpaces.flatMap((s) =>
        s.modules.map((m) => ({ module: m, space: s })),
    );
    const outerRadius = 356;
    const outerPositioned = outerModules.map((item, i) => {
        const angle =
            -Math.PI / 2 + (i * (2 * Math.PI)) / Math.max(outerModules.length, 1);
        return {
            ...item,
            x: cx + outerRadius * Math.cos(angle),
            y: cy + outerRadius * Math.sin(angle),
        };
    });

    const all = [...positioned, ...outerPositioned];

    return (
        <div className="relative w-full max-w-[740px] mx-auto">
            <svg
                viewBox={`0 0 ${viewSize} ${viewSize}`}
                className="w-full h-auto"
                aria-label={t("holonicModules.map.ariaLabel", { modules: allModulesCount, spaces: SPACES.length })}
            >
                <defs>
                    {SPACES.map((sp) => (
                        <radialGradient key={sp.id} id={`grad-${sp.id}`}>
                            <stop offset="0%" stopColor={sp.color} />
                            <stop offset="100%" stopColor={sp.colorEnd} />
                        </radialGradient>
                    ))}
                    <radialGradient id="bg-glow">
                        <stop offset="0%" stopColor="rgba(132,96,234,0.12)" />
                        <stop offset="50%" stopColor="rgba(41,84,159,0.04)" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>

                {/* Background glow */}
                <circle cx={cx} cy={cy} r={380} fill="url(#bg-glow)" />

                {/* Orbit rings for main spaces */}
                {mainSpaces.map((space, i) => (
                    <g key={`ring-${space.id}`}>
                        <circle
                            cx={cx}
                            cy={cy}
                            r={ringRadii[i]}
                            fill="none"
                            stroke={space.color}
                            strokeWidth="1"
                            opacity="0.12"
                            strokeDasharray="3 5"
                        />
                        <text
                            x={cx + ringRadii[i] + 6}
                            y={cy - 4}
                            fill={space.color}
                            opacity="0.35"
                            fontSize="8"
                            fontWeight="600"
                            letterSpacing="0.12em"
                        >
                            {spaceLabel(t, space.id)}
                        </text>
                    </g>
                ))}

                {/* Outer ring for Special/Standalone */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={outerRadius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                />

                {/* Center YOU */}
                <circle cx={cx} cy={cy} r={20} fill="url(#grad-ME)" opacity="0.2" />
                <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="700"
                    letterSpacing="0.12em"
                >
                    {t("holonicModules.map.center")}
                </text>

                {/* Connection lines */}
                {all.map(({ module, x, y }) => (
                    <line
                        key={`line-${module.id}`}
                        x1={cx}
                        y1={cy}
                        x2={x}
                        y2={y}
                        stroke="white"
                        strokeWidth="0.4"
                        opacity={hoveredId === module.id ? 0.25 : 0.04}
                        className="transition-opacity duration-300"
                    />
                ))}

                {/* Module nodes */}
                {all.map(({ module, x, y, space }) => {
                    const isHovered = hoveredId === module.id;
                    const r = isHovered ? 22 : 15;
                    const isEarlyStage = ["Concept", "Prototype"].includes(module.stage);

                    const nodeContent = (
                        <g
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredId(module.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            {/* Hover glow */}
                            {isHovered && (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={r + 10}
                                    fill="none"
                                    stroke={space.color}
                                    strokeWidth="1.5"
                                    opacity="0.35"
                                    className="animate-pulse"
                                />
                            )}

                            {/* Node circle */}
                            <circle
                                cx={x}
                                cy={y}
                                r={r}
                                fill={`url(#grad-${space.id})`}
                                opacity={isEarlyStage ? 0.3 : 0.85}
                                className="transition-all duration-300"
                                style={{
                                    filter: isHovered
                                        ? `drop-shadow(0 0 10px ${space.color})`
                                        : "none",
                                }}
                            />

                            {/* Version label inside node */}
                            <text
                                x={x}
                                y={y + 3}
                                textAnchor="middle"
                                fill="white"
                                fontSize="7"
                                fontWeight="600"
                                opacity={isEarlyStage ? 0.4 : 0.8}
                            >
                                v{module.version}
                            </text>

                            {/* Name label — always visible but stronger on hover */}
                            <foreignObject
                                x={x - 55}
                                y={y + r + 4}
                                width={110}
                                height={36}
                                className="pointer-events-none"
                            >
                                <div className="text-center">
                                    <p
                                        className="text-[9px] font-semibold leading-tight drop-shadow-md"
                                        style={{
                                            color: isHovered ? "white" : "rgba(255,255,255,0.5)",
                                            transition: "color 0.2s",
                                        }}
                                    >
                                        {moduleName(t, module.id)}
                                    </p>
                                </div>
                            </foreignObject>
                        </g>
                    );

                    // Wrap in Link only if the module has a route
                    if (module.route) {
                        return (
                            <Link key={module.id} to={module.route}>
                                {nodeContent}
                            </Link>
                        );
                    }
                    return <g key={module.id}>{nodeContent}</g>;
                })}
            </svg>
        </div>
    );
};

/* ──────────────────────────────────────────
   Module Card
   ────────────────────────────────────────── */

interface ModuleCardProps {
    module: TaxonomyModule;
    space: SpaceDefinition;
}

const ModuleCard = ({ module, space }: ModuleCardProps) => {
    const { t } = useTranslation();
    const sc = stageColors[module.stage];
    const isNavigable = !!module.route;

    const inner = (
        <div
            className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 transition-all duration-300 group ${isNavigable
                ? "hover:bg-white/[0.08] hover:border-white/20 cursor-pointer"
                : "opacity-70"
                }`}
        >
            {/* Top row — space badge + version */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                    className="text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
                    style={{
                        background: `linear-gradient(135deg, ${space.color}, ${space.colorEnd})`,
                        color: "white",
                    }}
                >
                    {spaceLabel(t, space.id)}
                </span>
                <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: sc.bg, color: sc.text }}
                >
                    v{module.version} · {module.stage}
                </span>
            </div>

            {/* Name + arrow */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-display font-semibold text-white leading-tight mb-1 group-hover:text-[#a7cbd4] transition-colors">
                        {moduleName(t, module.id)}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                        {moduleMasterResult(t, module.id)}
                    </p>
                </div>
                {isNavigable && (
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0 mt-1" />
                )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-3 text-[11px] text-white/30">
                {module.submoduleCount && (
                    <span>{t("holonicModules.card.submodules", { count: module.submoduleCount })}</span>
                )}
                {module.hasDependencies && (
                    <span>{t("holonicModules.card.requires", { deps: moduleDependencies(t, module.id) })}</span>
                )}
            </div>
        </div>
    );

    if (isNavigable) {
        return (
            <Link to={module.route!} className="block">
                {inner}
            </Link>
        );
    }
    return inner;
};

/* ══════════════════════════════════════════
   PAGE — /modules
   ══════════════════════════════════════════ */
const HolonicModulesPage = () => {
    const { t } = useTranslation();
    const heroAnim = useScrollAnimation(0.1);
    const mapAnim = useScrollAnimation(0.15);
    const listAnim = useScrollAnimation(0.1);

    useEffect(() => {
        document.title = "Modules | Find Your Top Talent";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-dvh bg-[#0e1525]">

            {/* ─── HERO ─── */}
            <section
                ref={heroAnim.ref}
                className={`relative pt-20 pb-10 px-6 text-center transition-all duration-1000 ${heroAnim.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                    }`}
            >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(132,96,234,0.12)_0%,transparent_60%)]" />
                <div className="relative container mx-auto max-w-3xl">
                    <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <Sparkles className="w-4 h-4 text-[#a7cbd4]" />
                        <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#a7cbd4]">
                            {t("holonicModules.hero.badge")}
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-white leading-[1.1] mb-5 tracking-tight">
                        {t("holonicModules.hero.title")}
                    </h1>
                    <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto mb-8">
                        {t("holonicModules.hero.stats", {
                            modules: allModulesCount,
                            submodules: allSubmodulesCount,
                            spaces: SPACES.length,
                        })}
                        <br />
                        {t("holonicModules.hero.subtitle")}
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap justify-center gap-5">
                        {SPACES.slice(0, 6).map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.03]"
                            >
                                <span className="text-sm">{s.emoji}</span>
                                <span className="text-xs text-white/50 font-medium uppercase tracking-wider">
                                    {spaceLabel(t, s.id)}
                                </span>
                                <span className="text-xs text-white/30">
                                    {s.modules.length}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOLONIC MAP ─── */}
            <section
                ref={mapAnim.ref}
                className={`relative py-4 px-4 transition-all duration-1000 ${mapAnim.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                    }`}
            >
                <HolonicMap />
            </section>

            {/* ─── VERSIONING LEGEND ─── */}
            <section className="py-8 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex flex-wrap justify-center gap-3">
                        {(Object.entries(stageColors) as [VersionStage, { bg: string; text: string }][]).map(
                            ([stage, colors]) => (
                                <div
                                    key={stage}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                    style={{ background: colors.bg }}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: colors.text }}
                                    />
                                    <span
                                        className="text-[11px] font-medium uppercase tracking-wider"
                                        style={{ color: colors.text }}
                                    >
                                        {stage}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </section>

            {/* ─── MODULE LIST BY SPACE ─── */}
            <section
                ref={listAnim.ref}
                className={`py-16 px-6 transition-all duration-1000 ${listAnim.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                    }`}
            >
                <div className="container mx-auto max-w-4xl space-y-14">
                    {SPACES.map((space) => (
                        <div key={space.id}>
                            {/* Space header */}
                            <div className="flex items-center gap-3 mb-5">
                                <div
                                    className="w-2 h-8 rounded-full"
                                    style={{
                                        background: `linear-gradient(to bottom, ${space.color}, ${space.colorEnd})`,
                                    }}
                                />
                                <div>
                                    <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                                        <span>{space.emoji}</span>
                                        {spaceLabel(t, space.id)}
                                        <span className="text-xs text-white/30 font-normal ml-1">
                                            {t("holonicModules.list.moduleCount", { count: space.modules.length })}
                                        </span>
                                    </h2>
                                    <p className="text-sm text-white/40">
                                        {spaceTagline(t, space.id)}
                                    </p>
                                </div>
                            </div>

                            {/* Module cards grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {space.modules.map((mod) => (
                                    <ModuleCard
                                        key={mod.id}
                                        module={mod}
                                        space={space}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── VERSION SCHEME ─── */}
            <section className="py-16 px-6 border-t border-white/5">
                <div className="container mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl font-display font-semibold text-white mb-2">
                        {t("holonicModules.versionScheme.title")}
                    </h2>
                    <p className="text-sm text-white/40 mb-6">
                        {t("holonicModules.versionScheme.subtitle")}
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-mono text-white/40">
                        <span className="px-2 py-1 rounded bg-white/5">{t("holonicModules.versionScheme.concept")}</span>
                        <span className="text-white/20">→</span>
                        <span className="px-2 py-1 rounded bg-white/5">{t("holonicModules.versionScheme.prototype")}</span>
                        <span className="text-white/20">→</span>
                        <span className="px-2 py-1 rounded bg-white/5">{t("holonicModules.versionScheme.poc")}</span>
                        <span className="text-white/20">→</span>
                        <span className="px-2 py-1 rounded bg-white/5">{t("holonicModules.versionScheme.alpha")}</span>
                        <span className="text-white/20">→</span>
                        <span className="px-2 py-1 rounded bg-white/5">{t("holonicModules.versionScheme.mvp")}</span>
                        <span className="text-white/20">→</span>
                        <span className="px-2 py-1 rounded bg-[rgba(250,204,21,0.1)] text-[#facc15]">
                            {t("holonicModules.versionScheme.commercial")}
                        </span>
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="relative py-24 px-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(132,96,234,0.1)_0%,transparent_60%)]" />
                <div className="relative container mx-auto max-w-2xl">
                    <h2 className="text-3xl sm:text-4xl font-display font-semibold text-white mb-4">
                        {t("holonicModules.cta.title")}
                    </h2>
                    <p className="text-lg text-white/45 mb-8">
                        {t("holonicModules.cta.body")}
                    </p>
                    <Link
                        to="/start"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(132,96,234,0.4)]"
                        style={{
                            background:
                                "linear-gradient(135deg, #8460ea 0%, #6894d0 100%)",
                            boxShadow: "0 4px 20px rgba(132, 96, 234, 0.3)",
                        }}
                    >
                        {t("holonicModules.cta.button")}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HolonicModulesPage;
