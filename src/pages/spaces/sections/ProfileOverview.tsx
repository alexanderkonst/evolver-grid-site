import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import SoulDodecahedron from "@/components/SoulDodecahedron";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { useDeepProfileActivated } from "@/hooks/useDeepProfileActivated";
import { useJourneyCompletion, type CompletionMap } from "@/hooks/useJourneyCompletion";
import {
    JOURNEY_ITEM_COMPLETED_EVENT,
    JOURNEY_LAST_SEEN_KEY,
    JOURNEY_SEQUENCE,
    type JourneyItemId,
} from "@/data/journeySequence";
import { useLocalizedDomains } from "@/modules/quality-of-life-map/qolConfig";
import { QOL_MAX_STAGE } from "@/lib/characterSheet";
import { formatNumber } from "@/i18n/format";

/**
 * ProfileOverview — the Character Sheet: the save file made visible.
 *
 * Design source: docs/02-strategy/game_of_being_you.md §13, 13.1, 13.2.
 * No new modules, no new tables. Every module already writes its data; this
 * page only shows it: character (photo, top talent, soul-color crystal,
 * mission), level (real QoL, private), inventory (assets) and the first
 * quest chain (journeySequence.ts completion predicates).
 *
 * Taste: a cult game. No XP, points, badges or leaderboards.
 */

const FALLBACK_ACCENT = "#8460ea";

/** i18n key per journey item (the labels in journeySequence.ts are numbered funnel copy). */
const QUEST_KEY: Record<JourneyItemId, string> = {
    "find-top-talent": "findTopTalent",
    "take-playbook": "takePlaybook",
    "see-path": "seePath",
    "see-dashboard": "seeDashboard",
    "map-assets": "mapAssets",
    "assess-qol": "assessQol",
    "build-business": "buildBusiness",
    "discover-mission": "discoverMission",
};

/** Existing locked-hint copy, shared with the rest of the journey UI. */
const LOCKED_HINT_KEY: Partial<Record<JourneyItemId, string>> = {
    "build-business": "journey.buildBusiness.lockedHint",
    "discover-mission": "journey.discoverMission.lockedHint",
};

const readLastSeen = (): Partial<CompletionMap> | null => {
    try {
        const raw = window.localStorage.getItem(JOURNEY_LAST_SEEN_KEY);
        return raw ? (JSON.parse(raw) as Partial<CompletionMap>) : null;
    } catch {
        return null;
    }
};

const writeLastSeen = (map: CompletionMap) => {
    try {
        window.localStorage.setItem(JOURNEY_LAST_SEEN_KEY, JSON.stringify(map));
    } catch {
        // Storage unavailable: the glow just won't replay across visits.
    }
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{children}</h2>
);

const InviteLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
        to={to}
        className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
    >
        {children}
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
    </Link>
);

const ProfileOverviewContent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const domains = useLocalizedDomains();
    const sheet = useCharacterSheet();
    const { data, reload } = sheet;
    const { activated: deepActivated } = useDeepProfileActivated();
    const { completion, isLoading: completionLoading, recheck } = useJourneyCompletion();

    const [glowIds, setGlowIds] = useState<ReadonlySet<JourneyItemId>>(new Set());
    const lastDone = useRef<CompletionMap | null>(null);

    const accents = data.soulColors ?? [FALLBACK_ACCENT];
    const accentFor = (index: number) => accents[index % accents.length];

    // A committed mission has no predicate in journeySequence.ts; the sheet
    // already knows it, so the "discover your mission" slot lights with it.
    const done = useMemo<CompletionMap>(
        () => ({ ...completion, "discover-mission": completion["discover-mission"] || !!data.missionTitle }),
        [completion, data.missionTitle],
    );

    // Sticky after the first load: a recheck (completion event) flips the
    // hooks' isLoading again, and the sheet must not blink back to the loader.
    const loadedOnce = useRef(false);
    if (!sheet.isLoading && !completionLoading) loadedOnce.current = true;
    const ready = loadedOnce.current;

    // Seam: re-evaluate when any module reports a finished quest.
    useEffect(() => {
        const onCompleted = () => {
            recheck();
            reload();
        };
        window.addEventListener(JOURNEY_ITEM_COMPLETED_EVENT, onCompleted);
        return () => window.removeEventListener(JOURNEY_ITEM_COMPLETED_EVENT, onCompleted);
    }, [recheck, reload]);

    // Glow once for slots that flipped to done: since the last render of this
    // sheet, or since the player's previous visit (localStorage last-seen).
    // No stored state yet = first visit, nothing glows.
    useEffect(() => {
        if (!ready) return;
        const previous = lastDone.current ?? readLastSeen();
        const fresh = previous
            ? JOURNEY_SEQUENCE.filter((item) => done[item.id] && !previous[item.id]).map((item) => item.id)
            : [];
        lastDone.current = done;
        writeLastSeen(done);
        if (fresh.length > 0) setGlowIds((prev) => new Set([...prev, ...fresh]));
    }, [done, ready]);

    if (!ready) {
        return (
            <div className="p-6 lg:p-8 max-w-2xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="text-white/30 animate-pulse text-sm">{t("profileOverview.loading")}</div>
            </div>
        );
    }

    const displayName =
        `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() ||
        data.email?.split("@")[0] ||
        t("characterSheet.playerFallback");

    const weakestScore = data.qol?.level ?? null;

    return (
        <div className="px-4 py-6 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6 sm:space-y-8">
            {/* 1. Character */}
            <section aria-label={t("characterSheet.eyebrow")} className="text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40 mb-5">
                    {t("characterSheet.eyebrow")}
                </p>

                <div className="flex justify-center">
                    {data.avatarUrl ? (
                        <img
                            src={data.avatarUrl}
                            alt={displayName}
                            className="w-24 h-24 rounded-full object-cover ring-1 ring-white/20"
                            style={{ boxShadow: `0 0 0 3px ${accentFor(0)}33` }}
                        />
                    ) : data.userId ? (
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-sm text-white/50">{t("characterSheet.character.photoInvite")}</p>
                            <ProfilePictureUpload
                                userId={data.userId}
                                avatarUrl={data.avatarUrl}
                                displayName={displayName}
                                size={96}
                                onUpload={sheet.setAvatarUrl}
                            />
                        </div>
                    ) : null}
                </div>

                <h1 className="mt-4 text-2xl font-semibold text-white break-words">{displayName}</h1>

                <div className="character-sheet-crystal mt-4 flex justify-center">
                    <SoulDodecahedron
                        soulColors={data.soulColors ?? undefined}
                        size="md"
                        onClick={() => navigate("/game/me/zone-of-genius")}
                    />
                </div>

                <dl className="mt-5 space-y-3">
                    <div>
                        <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                            {t("characterSheet.character.talentLabel")}
                        </dt>
                        <dd className="mt-1">
                            {data.archetypeTitle ? (
                                <span className="text-lg text-white">{data.archetypeTitle}</span>
                            ) : (
                                <span className="text-sm text-white/50">
                                    {t("characterSheet.character.talentEmpty")} ·{" "}
                                    <InviteLink to="/zone-of-genius/entry">
                                        {t("characterSheet.character.talentCta")}
                                    </InviteLink>
                                </span>
                            )}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                            {t("characterSheet.character.missionLabel")}
                        </dt>
                        <dd className="mt-1">
                            {data.missionTitle ? (
                                <span className="text-base text-white/90">{data.missionTitle}</span>
                            ) : (
                                <span className="text-sm text-white/50">
                                    {t("characterSheet.character.missionEmpty")} ·{" "}
                                    <InviteLink to="/game/me/mission">
                                        {t("characterSheet.character.missionCta")}
                                    </InviteLink>
                                </span>
                            )}
                        </dd>
                    </div>
                </dl>
            </section>

            {/* 2. Level: real QoL, weakest domain. PRIVATE: this page only. */}
            <section className="rounded-2xl liquid-glass ring-1 ring-white/10 p-5 sm:p-6 space-y-4">
                <div className="flex items-baseline justify-between gap-3">
                    <SectionLabel>{t("characterSheet.level.title")}</SectionLabel>
                    <span className="inline-flex items-center gap-1.5 text-xs text-white/50">
                        <Lock className="w-3 h-3" aria-hidden="true" />
                        {t("characterSheet.level.private")}
                    </span>
                </div>

                {data.qol && weakestScore !== null ? (
                    <>
                        <div>
                            <p className="text-4xl font-light text-white tabular-nums">
                                {t("characterSheet.level.value", {
                                    value: formatNumber(weakestScore, {
                                        minimumFractionDigits: 1,
                                        maximumFractionDigits: 1,
                                    }),
                                })}
                            </p>
                            <p className="mt-1 text-xs text-white/50">
                                {t("characterSheet.level.weakest", {
                                    domain: domains.find((d) => d.id === data.qol?.weakest)?.name ?? data.qol.weakest,
                                })}
                            </p>
                        </div>
                        <ul className="space-y-2.5">
                            {data.qol.domains.map((d) => {
                                const isWeakest = d.id === data.qol?.weakest;
                                return (
                                    <li key={d.id} className="grid grid-cols-[6.5rem_1fr_2rem] sm:grid-cols-[8rem_1fr_2rem] items-center gap-3">
                                        <span className={`text-xs truncate ${isWeakest ? "text-white" : "text-white/50"}`}>
                                            {domains.find((x) => x.id === d.id)?.name ?? d.id}
                                        </span>
                                        <span className="h-1.5 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
                                            <span
                                                className="block h-full rounded-full"
                                                style={{
                                                    width: `${(d.score / QOL_MAX_STAGE) * 100}%`,
                                                    backgroundColor: isWeakest ? accentFor(0) : "rgba(255,255,255,0.35)",
                                                }}
                                            />
                                        </span>
                                        <span className={`text-xs text-right tabular-nums ${isWeakest ? "text-white" : "text-white/50"}`}>
                                            {formatNumber(d.score)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                ) : (
                    <p className="text-sm text-white/50">
                        {t("characterSheet.level.empty")} ·{" "}
                        <InviteLink to="/quality-of-life-map/assessment">{t("characterSheet.level.cta")}</InviteLink>
                    </p>
                )}
            </section>

            {/* 3. Inventory: assets */}
            <section className="rounded-2xl liquid-glass ring-1 ring-white/10 p-5 sm:p-6 space-y-3">
                <SectionLabel>{t("characterSheet.inventory.title")}</SectionLabel>
                {data.assetCount > 0 ? (
                    <>
                        <p className="text-sm text-white/70">
                            {t("characterSheet.inventory.summary", { total: formatNumber(data.assetCount) })}
                        </p>
                        <ul className="flex flex-wrap gap-2">
                            {data.topAssets.map((asset) => (
                                <li
                                    key={asset.id}
                                    className="max-w-full truncate rounded-full ring-1 ring-white/15 px-3 py-1 text-xs text-white/80"
                                >
                                    {asset.title}
                                </li>
                            ))}
                        </ul>
                        <InviteLink to="/game/me/assets">{t("characterSheet.inventory.open")}</InviteLink>
                    </>
                ) : (
                    <p className="text-sm text-white/50">
                        {t("characterSheet.inventory.empty")} ·{" "}
                        <InviteLink to="/asset-mapping">{t("characterSheet.inventory.cta")}</InviteLink>
                    </p>
                )}
            </section>

            {/* 4. Unlocked: the first quest chain */}
            <section className="space-y-3">
                <SectionLabel>{t("characterSheet.quests.title")}</SectionLabel>
                <ol className="space-y-2">
                    {JOURNEY_SEQUENCE.map((item, index) => {
                        const isDone = done[item.id];
                        const accent = accentFor(index);
                        const lockedHintKey = LOCKED_HINT_KEY[item.id];
                        const isLocked =
                            !isDone &&
                            !!item.lockedHint &&
                            (item.id === "build-business" ? !deepActivated : true);
                        const label = t(`characterSheet.quests.${QUEST_KEY[item.id]}`);

                        if (isDone) {
                            const glowing = glowIds.has(item.id);
                            return (
                                <li
                                    key={item.id}
                                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${glowing ? "character-sheet-slot-glow" : ""}`}
                                    style={
                                        {
                                            "--slot-accent": accent,
                                            backgroundColor: `${accent}14`,
                                            borderColor: `${accent}66`,
                                        } as React.CSSProperties
                                    }
                                    onAnimationEnd={() =>
                                        setGlowIds((prev) => {
                                            const next = new Set(prev);
                                            next.delete(item.id);
                                            return next;
                                        })
                                    }
                                >
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ backgroundColor: accent }}
                                        aria-hidden="true"
                                    />
                                    <span className="text-sm text-white">{label}</span>
                                    <span className="sr-only">{t("characterSheet.quests.unlocked")}</span>
                                </li>
                            );
                        }

                        if (isLocked) {
                            return (
                                <li
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 px-4 py-3 opacity-60"
                                >
                                    <Lock className="w-3 h-3 shrink-0 text-white/40" aria-hidden="true" />
                                    <span className="min-w-0 text-sm text-white/50">
                                        {label}
                                        <span className="block text-xs text-white/40">
                                            {lockedHintKey ? t(lockedHintKey) : item.lockedHint}
                                        </span>
                                    </span>
                                </li>
                            );
                        }

                        return (
                            <li key={item.id}>
                                <Link
                                    to={item.path}
                                    className="group flex items-center gap-3 rounded-xl border border-dashed border-white/15 px-4 py-3 hover:border-white/30 transition-colors"
                                >
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/25" aria-hidden="true" />
                                    <span className="min-w-0 flex-1 text-sm text-white/60 group-hover:text-white transition-colors">
                                        {label}
                                    </span>
                                    <ArrowRight
                                        className="w-3.5 h-3.5 shrink-0 text-white/30 group-hover:text-white/70 transition-colors"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </li>
                        );
                    })}
                </ol>
            </section>
        </div>
    );
};

const ProfileOverview = () => (
    <GameShellV2>
        <ProfileOverviewContent />
    </GameShellV2>
);

export { ProfileOverviewContent };
export default ProfileOverview;
