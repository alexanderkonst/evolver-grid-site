import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, ArrowRight, Play, Compass } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import Panel3Actions from "@/components/game/Panel3Actions";
import { useSuggestedPractices } from "@/hooks/useSuggestedPractices";
import { VideoCard, VideoModal, TITLE_STYLE, BODY_STYLE, EYEBROW_STYLE } from "@/pages/Library";
import { type LibraryItem } from "@/modules/library/libraryContent";
import { GOLD_TEXT_STYLE } from "@/lib/landingDesign";

/**
 * Today's Practice — personalized daily recommendation (Day 128).
 * Reads the user's latest QoL snapshot and surfaces the #1 suggestion
 * from getSuggestedPractices (src/lib/practiceSystem.ts) as a hero card,
 * with up to 2 alternates below. Graceful states shared with the
 * "Recommended for you" block on the practice picker (src/pages/Library.tsx):
 *   - no session      → GameShellV2/RequireAuth already gates this route
 *   - session, no QoL  → quiet invite card linking to the QoL assessment
 *   - snapshot present → hero + alternates
 */
const TodaysPractice = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { status, practices } = useSuggestedPractices();
    const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

    const [hero, ...alternates] = practices;

    return (
        <GameShellV2>
            <div className="p-6 pb-24 lg:p-8 lg:pb-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-6 h-6 text-foreground" />
                            <h1 className="text-2xl font-bold text-foreground">{t('todaysPractice.title')}</h1>
                        </div>
                        <p className="text-muted-foreground">{t('todaysPractice.subtitle')}</p>
                    </div>
                    <Panel3Actions
                        primaryLabel={t('todaysPractice.goToNextMove')}
                        primaryAction={() => navigate("/game")}
                        primaryIcon={<ArrowRight className="w-4 h-4" />}
                    />
                </div>

                {status === "loading" && (
                    <div className="rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-6 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                        <p className="text-muted-foreground">{t('todaysPractice.loading')}</p>
                    </div>
                )}

                {status === "no-snapshot" && (
                    <button
                        onClick={() => navigate("/game/learn/qol-assessment")}
                        className="w-full flex items-center gap-4 rounded-2xl liquid-glass p-6 text-left hover:scale-[1.01] transition-all duration-300"
                        style={{ boxShadow: "0 0 0 1px rgba(212, 175, 55, 0.18)" }}
                    >
                        <Compass className="w-6 h-6 flex-shrink-0" style={{ color: "rgba(160, 109, 8, 0.85)" }} />
                        <p className="text-sm italic" style={BODY_STYLE}>
                            {t('library.qolInvite')}
                        </p>
                    </button>
                )}

                {status === "ready" && !hero && (
                    <div className="rounded-xl border border-border bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm p-6 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                        <p className="text-muted-foreground">{t('todaysPractice.emptyState')}</p>
                    </div>
                )}

                {status === "ready" && hero && (
                    <>
                        {/* Hero recommendation */}
                        <button
                            onClick={() => setSelectedItem(hero)}
                            className="w-full flex flex-col rounded-2xl liquid-glass-strong text-left group hover:scale-[1.008] transition-all duration-300 overflow-hidden mb-8"
                            style={{
                                boxShadow: "0 16px 44px -14px rgba(10,22,40,0.28), 0 0 0 1px rgba(212,175,55,0.4)",
                            }}
                        >
                            <div className="relative w-full aspect-video overflow-hidden">
                                <img
                                    src={`https://img.youtube.com/vi/${hero.youtubeId}/hqdefault.jpg`}
                                    alt={hero.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                                        <Play className="w-7 h-7 text-white ml-0.5" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col gap-2">
                                <div className="text-[10.5px]" style={EYEBROW_STYLE}>
                                    {t('todaysPractice.heroEyebrow')}
                                </div>
                                <div className="text-xl font-semibold" style={{ ...TITLE_STYLE, fontWeight: 600 }}>
                                    <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                                        {hero.title}
                                    </span>
                                </div>
                                {hero.teacher && (
                                    <div className="text-sm italic" style={BODY_STYLE}>
                                        {t('library.guidedBy', { teacher: hero.teacher })}
                                    </div>
                                )}
                                {(hero.durationLabel || hero.durationMinutes) && (
                                    <div className="text-xs" style={{ ...BODY_STYLE, opacity: 0.75 }}>
                                        {hero.durationLabel ?? t('library.durationMinutes', { count: hero.durationMinutes })}
                                    </div>
                                )}
                            </div>
                        </button>

                        {/* Alternates */}
                        {alternates.length > 0 && (
                            <div>
                                <div className="text-[10.5px] mb-3" style={EYEBROW_STYLE}>
                                    {t('todaysPractice.alternatesTitle')}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {alternates.map((item) => (
                                        <VideoCard key={item.id} item={item} onSelect={setSelectedItem} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedItem && (
                <VideoModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </GameShellV2>
    );
};

export default TodaysPractice;
