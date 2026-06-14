import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/i18n/format";
import { Pencil, Loader2, ArrowRight } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { Ornament } from "@/lib/landingDesign";
import { supabase } from "@/integrations/supabase/client";

/**
 * ProfileMissionSection — ME → Mission (/game/me/mission).
 *
 * Day 77 (Sasha 2026-05-20): rewritten to read the canonical
 * `mission_statement` + `mission_discovered_at` columns on `game_profiles`
 * (the source of truth the Day 66 wave-M Mission Discovery flow writes
 * to). The prior version read from the legacy `mission_participants`
 * table + localStorage, which was disconnected from the actual saved
 * mission and showed an empty card even when the user had saved a
 * mission seconds earlier.
 *
 * Visual register: matches `QualityOfLifeMapResults` and the rest of
 * the ME-space pages — Cormorant Garamond hero + Source Serif 4 body
 * + liquid-glass card on the cream wash supplied by `GameShellV2`.
 */

// Day 91 (Sasha 2026-06-09): ink consts tokenized for the dark skins.
// Const-applied colors are invisible to the class-based dark re-tones
// (the source never contains a literal class), so the page rendered
// navy-on-near-black under Aurum. Lapis keeps the exact literals via
// the var() fallbacks (--skin-ink is deliberately NOT defined at
// :root).
const INK = "var(--skin-ink, #0a1628)";
const INK_BODY = "var(--skin-ink-body, rgba(26,30,58,0.78))";
const INK_MUTED = "var(--skin-ink-muted, rgba(26,30,58,0.55))";
const HALO_DEEP =
    "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))";

const ProfileMissionSection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [missionStatement, setMissionStatement] = useState<string | null>(null);
    const [missionDiscoveredAt, setMissionDiscoveredAt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data: userRes } = await supabase.auth.getUser();
                if (!userRes.user?.id || cancelled) {
                    if (!cancelled) setIsLoading(false);
                    return;
                }
                const { data } = await (supabase as any)
                    .from("game_profiles")
                    .select("mission_statement, mission_discovered_at")
                    .eq("user_id", userRes.user.id)
                    .maybeSingle();
                if (cancelled) return;
                setMissionStatement(data?.mission_statement ?? null);
                setMissionDiscoveredAt(data?.mission_discovered_at ?? null);
            } catch (err) {
                // Silent — empty state is the safe default. Console-log
                // for ops visibility; toast would be noise on a passive
                // read.
                console.warn("[ProfileMissionSection] mission read failed:", err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <GameShellV2 hideLogo>
            <div className="max-w-2xl mx-auto px-5 py-10 sm:py-12">
                {/* Header — Cormorant editorial register, matches the
                    rest of the ME-space subpages. */}
                <header className="text-center mb-8 sm:mb-10">
                    <h1
                        className="leading-[1.1] tracking-[-0.01em] mb-3"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 700,
                            fontSize: "clamp(2rem, 5vw, 2.75rem)",
                            color: INK,
                            textShadow: HALO_DEEP,
                        }}
                    >{t("profileMission.heading")}</h1>
                    {missionDiscoveredAt && (
                        <p
                            className="italic"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontSize: "0.95rem",
                                color: INK_MUTED,
                            }}
                        >
                            {t("profileMission.savedOn", {
                                date: formatDate(missionDiscoveredAt, {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                }),
                            })}
                        </p>
                    )}
                    <Ornament className="my-6 sm:my-7" />
                </header>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: INK_MUTED }} />
                    </div>
                ) : missionStatement ? (
                    <>
                        {/* The mission — single Cormorant statement on a
                            liquid-glass-strong card with gold hairline.
                            Mirrors the Mission Discovery saved-state card. */}
                        <div
                            className="liquid-glass-strong rounded-2xl p-6 sm:p-8 text-center"
                            style={{ border: "1px solid rgba(212, 175, 55, 0.32)" }}
                        >
                            <p
                                className="text-[10px] uppercase tracking-[0.32em] font-medium mb-4"
                                style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                            >{t("profileMission.oneSentence")}</p>
                            <p
                                className="mx-auto max-w-[40ch]"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    fontSize: "clamp(1.15rem, 2.4vw, 1.5rem)",
                                    color: INK,
                                    lineHeight: 1.4,
                                    textShadow: HALO_DEEP,
                                }}
                            >
                                {missionStatement}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center mt-6">
                            <EditorialCta
                                variant="secondary"
                                label={t("profileMission.editMission")}
                                onClick={() => navigate("/mission-discovery")}
                                icon={<Pencil className="w-4 h-4" />}
                                rightIcon={null}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Empty state — mirror the ME-storage register
                            (Sasha's feedback memory `feedback_me_is_storage`:
                            ME pane items are populated or empty, never
                            locked with fog-of-war). */}
                        <div className="liquid-glass rounded-2xl p-8 text-center">
                            <p
                                className="italic mb-4"
                                style={{
                                    fontFamily: "'Source Serif 4', Georgia, serif",
                                    fontSize: "1.05rem",
                                    color: INK_BODY,
                                }}
                            >
                                You haven't discovered your mission yet.
                            </p>
                            <p
                                className="text-sm"
                                style={{
                                    fontFamily: "'Source Serif 4', Georgia, serif",
                                    color: INK_MUTED,
                                }}
                            >
                                One sentence. The one that lands.
                            </p>
                        </div>

                        <div className="flex justify-center mt-6">
                            <EditorialCta
                                variant="primary"
                                label={t("profileMission.discoverMission")}
                                onClick={() => navigate("/mission-discovery")}
                                rightIcon={<ArrowRight className="w-4 h-4" />}
                            />
                        </div>
                    </>
                )}
            </div>
        </GameShellV2>
    );
};

export default ProfileMissionSection;
