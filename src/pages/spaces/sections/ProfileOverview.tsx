import { useEffect, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import SoulDodecahedron from "@/components/SoulDodecahedron";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";
import { useCharacterSheet, type CharacterSheetSlot } from "@/hooks/useCharacterSheet";
import { useModuleChoices } from "@/hooks/useModuleChoice";
import { choiceDate } from "@/data/journeyChoices";
import { useLocalizedDomains } from "@/modules/quality-of-life-map/qolConfig";
import type { JourneyItemId } from "@/data/journeySequence";
import { journeyStepRows } from "@/lib/journeyLabels";
import "./CharacterSheet.css";

/**
 * Character Sheet — "Your House" at night, the save file made visible
 * (docs/02-strategy/game_of_being_you.md §13, 13.2, 13.4). Route:
 * /game/me/overview (and the Profile space).
 *
 * Reads only: every module already writes its data (see useCharacterSheet).
 * Visual rules follow src/pages/GameTitle.tsx: same fonts, dark cinematic
 * world, the crystal as centrepiece, hairlines instead of cards, no XP,
 * points, badges or leaderboards.
 *
 * PRIVACY: the QoL level is shown only here, to its owner. Keep it off every
 * public profile, matchmaking and marketplace surface (§13.2).
 */

// Same families as GameTitle's FONTS_HREF. Keep the two in sync.
const FONTS_HREF =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&display=swap";

const SCENE_SRC = "/game/village/house.webp";

const QUEST_KEYS: Record<JourneyItemId, string> = {
    "find-top-talent": "findTopTalent",
    "take-playbook": "takePlaybook",
    "see-path": "seePath",
    "see-dashboard": "seeDashboard",
    "map-assets": "mapAssets",
    "assess-qol": "assessQol",
    "build-business": "buildBusiness",
    "discover-mission": "discoverMission",
};

const pad = (n: number) => String(n).padStart(2, "0");

const ProfileOverviewContent = () => {
    const { t } = useTranslation();
    const sheet = useCharacterSheet();
    const domains = useLocalizedDomains();
    // WP-19: the decision each badge carries. Private to the player; absent for a guest.
    const decisions = useModuleChoices();

    // Fonts are scoped to this page, as on the title screen.
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = FONTS_HREF;
        document.head.appendChild(link);
        return () => link.remove();
    }, []);

    const domainName = (id: string) => domains.find((d) => d.id === id)?.name ?? id;
    const soulColor = (i: number) =>
        sheet.soulColors ? sheet.soulColors[i % sheet.soulColors.length] : undefined;
    const accentStyle = (i: number): CSSProperties | undefined => {
        const color = soulColor(i);
        return color ? ({ "--slot-accent": color } as CSSProperties) : undefined;
    };
    // WP-4: the first quest chain is the Journey list, the same rows (labels, order,
    // «optional» marks) as the title screen, `/ignite` and the Quest Board pane.
    // `sheet.chain` is `JOURNEY_MAIN` in order, so rows line up with slots by index.
    const stepRows = journeyStepRows(t);
    const stepRow = (slot: CharacterSheetSlot, i: number) =>
        stepRows[i] ?? { label: slot.label, optional: null };

    if (sheet.isLoading) {
        return (
            <div className="cs-root">
                <div className="cs-scene" aria-hidden="true">
                    <img src={SCENE_SRC} alt="" decoding="async" />
                </div>
                <div className="cs-inner">
                    <p className="cs-mono" aria-live="polite">{t("profileOverview.loading")}</p>
                </div>
            </div>
        );
    }

    const doneSlots = sheet.chain.filter((s) => s.done);
    const nextSlot = sheet.chain.find((s) => !s.done && !s.locked);
    const name = sheet.firstName ?? t("characterSheet.playerFallback");

    return (
        <div className="cs-root">
            <div className="cs-scene" aria-hidden="true">
                <img src={SCENE_SRC} alt="" decoding="async" />
            </div>
            <div className="cs-grain" aria-hidden="true" />

            <div className="cs-inner">
                {/* Character: crystal first, then the real face and the name */}
                <header className="cs-hero">
                    <p className="cs-mono">{t("characterSheet.eyebrow")}</p>
                    <div className="cs-crystal">
                        <SoulDodecahedron soulColors={sheet.soulColors ?? undefined} size="lg" />
                    </div>
                    {sheet.userId && (
                        sheet.avatarUrl ? (
                            <div className="cs-photo">
                                <img src={sheet.avatarUrl} alt={name} decoding="async" />
                            </div>
                        ) : (
                            <>
                                <div className="cs-photo">
                                    <ProfilePictureUpload
                                        userId={sheet.userId}
                                        displayName={name}
                                        size={72}
                                        onUpload={() => sheet.refresh()}
                                    />
                                </div>
                                <p className="cs-mono cs-photo-invite">{t("characterSheet.character.photoInvite")}</p>
                            </>
                        )
                    )}
                    <h1 className="cs-name">{name}</h1>
                </header>

                <section className="cs-sec cs-hero" aria-labelledby="cs-talent-h">
                    <p className="cs-mono" id="cs-talent-h">{t("characterSheet.character.talentLabel")}</p>
                    {sheet.topTalent ? (
                        <p className="cs-value">{sheet.topTalent}</p>
                    ) : (
                        <>
                            <p className="cs-value cs-value--empty">{t("characterSheet.character.talentEmpty")}</p>
                            <Link className="cs-link" to="/zone-of-genius/entry">
                                <span className="cs-cur" aria-hidden="true">▸</span>
                                {t("characterSheet.character.talentCta")} →
                            </Link>
                        </>
                    )}
                </section>

                <section className="cs-sec cs-hero" aria-labelledby="cs-mission-h">
                    <p className="cs-mono" id="cs-mission-h">{t("characterSheet.character.missionLabel")}</p>
                    {sheet.missionTitle ? (
                        <p className="cs-value">{sheet.missionTitle}</p>
                    ) : (
                        <>
                            <p className="cs-value cs-value--empty">{t("characterSheet.character.missionEmpty")}</p>
                            <Link className="cs-link" to="/game/me/mission">
                                <span className="cs-cur" aria-hidden="true">▸</span>
                                {t("characterSheet.character.missionCta")} →
                            </Link>
                        </>
                    )}
                </section>

                <hr className="cs-rule" />

                {/* Level: the weakest of the 8 domains. Private, never rendered publicly. */}
                <section className="cs-sec cs-level" aria-labelledby="cs-level-h">
                    <p className="cs-mono" id="cs-level-h">{t("characterSheet.level.title")}</p>
                    {sheet.qol ? (
                        <>
                            <p className="cs-level__num">
                                {sheet.qol.level} <span>/ 10</span>
                            </p>
                            <p className="cs-mono cs-level__private">{t("characterSheet.level.private")}</p>
                            <p className="cs-level__why">
                                {t("characterSheet.level.weakest", { domain: domainName(sheet.qol.weakest) })}
                            </p>
                            <ul className="cs-domains">
                                {sheet.qol.domains.map((d) => (
                                    <li key={d.id} className={d.id === sheet.qol?.weakest ? "is-weakest" : undefined}>
                                        <span>{domainName(d.id)}</span>
                                        <span className="cs-bar" aria-hidden="true">
                                            <i style={{ width: `${d.score * 10}%` }} />
                                        </span>
                                        <span className="cs-score">{d.score}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <>
                            <p className="cs-value cs-value--empty">{t("characterSheet.level.empty")}</p>
                            <p className="cs-mono cs-level__private">{t("characterSheet.level.private")}</p>
                            <Link className="cs-link" to="/quality-of-life-map/assessment">
                                <span className="cs-cur" aria-hidden="true">▸</span>
                                {t("characterSheet.level.cta")} →
                            </Link>
                        </>
                    )}
                </section>

                <hr className="cs-rule" />

                {/* Inventory = assets */}
                <section className="cs-sec cs-hero" aria-labelledby="cs-inv-h">
                    <p className="cs-mono" id="cs-inv-h">{t("characterSheet.inventory.title")}</p>
                    {sheet.assets.count > 0 ? (
                        <>
                            <p className="cs-value">{t("characterSheet.inventory.summary", { total: sheet.assets.count })}</p>
                            <ul className="cs-list" style={{ width: "100%", marginTop: 20 }}>
                                {sheet.assets.top.map((a) => (
                                    <li key={a.id}>
                                        <div className="cs-item">
                                            <span className="cs-item__label" style={{ color: "var(--cs-ink)" }}>{a.title}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <Link className="cs-link" to="/game/me/assets">
                                <span className="cs-cur" aria-hidden="true">▸</span>
                                {t("characterSheet.inventory.open")}
                            </Link>
                        </>
                    ) : (
                        <>
                            <p className="cs-value cs-value--empty">{t("characterSheet.inventory.empty")}</p>
                            <Link className="cs-link" to="/asset-mapping">
                                <span className="cs-cur" aria-hidden="true">▸</span>
                                {t("characterSheet.inventory.cta")} →
                            </Link>
                        </>
                    )}
                </section>

                <hr className="cs-rule" />

                {/* First quest chain: lit when done, a quiet empty slot when not */}
                <section className="cs-sec" aria-labelledby="cs-chain-h">
                    <p className="cs-mono" id="cs-chain-h">{t("characterSheet.quests.title")}</p>
                    <ol className="cs-list">
                        {sheet.chain.map((slot, i) => {
                            const lit = slot.done ? sheet.chain.slice(0, i + 1).filter((s) => s.done).length - 1 : 0;
                            const locked = slot.locked;
                            const cls = ["cs-slot", slot.done && "is-lit", slot.justCompleted && "is-fresh"]
                                .filter(Boolean)
                                .join(" ");
                            return (
                                <li key={slot.id} className={cls} style={slot.done ? accentStyle(lit) : undefined}>
                                    <div className="cs-item">
                                        <span className="cs-mono cs-item__no">{pad(i + 1)}</span>
                                        {locked ? (
                                            <span className="cs-item__label">{stepRow(slot, i).label}</span>
                                        ) : (
                                            <Link className="cs-item__label" to={slot.path}>
                                                {stepRow(slot, i).label}
                                            </Link>
                                        )}
                                        {stepRow(slot, i).optional && (
                                            <span className="cs-mono cs-item__tag">{stepRow(slot, i).optional}</span>
                                        )}
                                        {slot.done && (
                                            <span className="cs-mono cs-item__tag">{t("characterSheet.quests.unlocked")}</span>
                                        )}
                                    </div>
                                    {locked && (
                                        <p className="cs-item__hint">
                                            {t(`journeySteps.locked.${slot.id}`, { defaultValue: slot.lockedHint })}
                                        </p>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </section>

                <hr className="cs-rule" />

                {/* Victories: completed steps, read-only (§13.4) */}
                <section className="cs-sec" aria-labelledby="cs-vic-h">
                    <p className="cs-mono" id="cs-vic-h">{t("characterSheet.victories.title")}</p>
                    {doneSlots.length > 0 ? (
                        <>
                            <p className="cs-sec__note">{t("characterSheet.victories.note")}</p>
                            <ul className="cs-list">
                                {doneSlots.map((slot, i) => {
                                    const decision = decisions.available ? decisions.forStep(slot.id) : null;
                                    return (
                                        <li key={slot.id} className="cs-slot cs-victory" style={accentStyle(i)}>
                                            <div className="cs-item">
                                                <span className="cs-mono cs-item__no" aria-hidden="true">◆</span>
                                                <span className="cs-item__label">
                                                    {t(`characterSheet.victories.${QUEST_KEYS[slot.id]}`)}
                                                </span>
                                            </div>
                                            {decision ? (
                                                <p className="cs-sec__note cs-victory__choice">
                                                    {decision.choice_text}
                                                    <time className="cs-mono cs-victory__date" dateTime={decision.created_at}>
                                                        {" "}
                                                        {choiceDate(decision.created_at)}
                                                    </time>
                                                </p>
                                            ) : null}
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    ) : (
                        <div className="cs-hero">
                            <p className="cs-value cs-value--empty">{t("characterSheet.victories.empty")}</p>
                            {nextSlot && (
                                <Link className="cs-link" to={nextSlot.path}>
                                    <span className="cs-cur" aria-hidden="true">▸</span>
                                    {t("characterSheet.victories.cta")} →
                                </Link>
                            )}
                        </div>
                    )}
                </section>
            </div>
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
