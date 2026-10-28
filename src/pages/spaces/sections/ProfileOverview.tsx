import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { PlaceState, PlaceStateTag } from "@/components/game/PlaceState";
import SoulDodecahedron from "@/components/SoulDodecahedron";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { useSoulColors } from "@/hooks/useSoulColors";
import { useLocalizedDomains } from "@/modules/quality-of-life-map/qolConfig";
import type { JourneyItemId } from "@/data/journeySequence";
import {
    badgeResult,
    houseBadges,
    houseRooms,
    nextHouseRoom,
    type HouseRoom,
    type HouseRoomId,
} from "@/lib/houseRooms";
import { placeSaveFromSheet } from "@/lib/placeState";
import "./CharacterSheet.css";

/**
 * Character Sheet — "Your House" at night, the save file made visible
 * (docs/02-strategy/game_of_being_you.md §13, 13.2, §14.7, §14.12). Route:
 * /game/me/overview (and the Profile space). WP-8.
 *
 * ONE sheet (§14.7 q3): the crystal in your soul colors with your real photo at its heart
 * (q1), then the rooms in Journey order (q2): top talent, mission, soul colors, private level,
 * assets, your offer, victories. Each room unfolds in place and has one button to its module.
 * A room that is not open yet is faded with its «Opens when… Inside: …» line and the next
 * room glows (q6, §14.3); there is no separate empty state. The victories room is the badge
 * shelf (q4, §14.12): one badge per Journey step, carrying its result and the decision.
 *
 * Reads only: every module already writes its data (see useCharacterSheet). The room list,
 * states and badges are `src/lib/houseRooms.ts`. Colors and the scene follow the skin through
 * tokens (q8, principle 8); Lunar paints earned rooms and badges with the soul colors.
 *
 * PRIVACY (q5): the private level shows only here, to its owner. The 1–10 ratings are kept
 * and never shown; choices and asset details never leave this screen. Keep all of it off
 * every public profile, matchmaking and marketplace surface (§13.2).
 */

// Same families as GameTitle's FONTS_HREF. Keep the two in sync.
const FONTS_HREF =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&display=swap";

const SCENE_SRC = "/game/village/house.webp";

const STEP_KEYS: Record<JourneyItemId, string> = {
    "find-top-talent": "findTopTalent",
    "take-playbook": "takePlaybook",
    "see-path": "seePath",
    "see-dashboard": "seeDashboard",
    "map-assets": "mapAssets",
    "assess-qol": "assessQol",
    "build-business": "buildBusiness",
    "discover-mission": "discoverMission",
};

type Sheet = ReturnType<typeof useCharacterSheet>;

const HouseSheet = ({ sheet }: { sheet: Sheet }) => {
    const { t } = useTranslation();
    const domains = useLocalizedDomains();
    // Until Spectrum Reading exists the colors are the top-talent archetype's (§14.7 q7).
    const soul = useSoulColors(sheet.soulColors, sheet.topTalent);

    const save = useMemo(
        () => placeSaveFromSheet({ chain: sheet.chain, offerSaved: sheet.offerSaved }),
        [sheet.chain, sheet.offerSaved],
    );
    const rooms = useMemo(() => houseRooms(save), [save]);
    const badges = useMemo(() => houseBadges(save), [save]);

    // The next room starts open, and the shelf: the two things a returning player looks for.
    const [open, setOpen] = useState<Set<HouseRoomId>>(() => {
        const next = nextHouseRoom(rooms);
        return new Set<HouseRoomId>(next ? ["victories", next.id] : ["victories"]);
    });
    const toggle = (id: HouseRoomId) =>
        setOpen((s) => {
            const next = new Set(s);
            if (!next.delete(id)) next.add(id);
            return next;
        });

    const name = sheet.firstName ?? t("characterSheet.playerFallback");
    const domainName = (id: string) => domains.find((d) => d.id === id)?.name ?? id;
    // Silver in Lunar until earned (`--soul-*` on <html>), the skin accent elsewhere.
    const crystalColors = soul.colors ?? [
        "var(--soul-1, var(--cs-accent))",
        "var(--soul-2, var(--cs-accent))",
        "var(--soul-3, var(--cs-accent))",
    ];
    const accent = (i: number): CSSProperties | undefined =>
        soul.colors ? ({ "--slot-accent": soul.colors[i % soul.colors.length] } as CSSProperties) : undefined;

    const label = (room: HouseRoom): string => {
        switch (room.id) {
            case "talent":
                return t("characterSheet.character.talentLabel");
            case "mission":
                return t("characterSheet.character.missionLabel");
            case "colors":
                return t("characterSheet.rooms.colors.title");
            case "level":
                return t("characterSheet.level.title");
            case "assets":
                return t("characterSheet.inventory.title");
            case "offer":
                return t("characterSheet.rooms.offer.title");
            case "victories":
                return t("characterSheet.victories.title");
        }
    };

    /** What the room says at a glance, in its own words. */
    const summary = (room: HouseRoom): ReactNode => {
        const empty = (text: string) => <p className="cs-value cs-value--empty">{text}</p>;
        switch (room.id) {
            case "talent":
                return sheet.topTalent ? <p className="cs-value">{sheet.topTalent}</p> : empty(t("characterSheet.character.talentEmpty"));
            case "mission":
                return sheet.missionTitle ? <p className="cs-value">{sheet.missionTitle}</p> : empty(t("characterSheet.character.missionEmpty"));
            case "level":
                return sheet.qol ? (
                    <p className="cs-value cs-value--level">
                        {sheet.qol.level} <span>/ 10</span>
                    </p>
                ) : (
                    empty(t("characterSheet.level.empty"))
                );
            case "assets":
                return sheet.assets.count > 0
                    ? <p className="cs-value">{t("characterSheet.inventory.summary", { total: sheet.assets.count })}</p>
                    : empty(t("characterSheet.inventory.empty"));
            case "offer":
                return room.state === "done"
                    ? <p className="cs-value">{t("characterSheet.rooms.offer.saved")}</p>
                    : empty(t("characterSheet.rooms.offer.empty"));
            default:
                return null;
        }
    };

    /** What unfolds: the detail, then the one button to the module. */
    const detail = (room: HouseRoom): ReactNode => {
        if (room.id === "level") {
            return (
                <>
                    <p className="cs-mono cs-private">{t("characterSheet.level.private")}</p>
                    {sheet.qol && (
                        <>
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
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </>
            );
        }
        if (room.id === "assets" && sheet.assets.count > 0) {
            return (
                <ul className="cs-list cs-list--assets">
                    {sheet.assets.top.map((a) => (
                        <li key={a.id}>
                            <div className="cs-item">
                                <span className="cs-item__label cs-item__label--lit">{a.title}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            );
        }
        return null;
    };

    const buttonText = (room: HouseRoom): string => {
        const done = room.state === "done";
        switch (room.id) {
            case "talent":
                return done ? t("characterSheet.rooms.talent.again") : t("characterSheet.character.talentCta");
            case "mission":
                return done ? t("characterSheet.rooms.mission.again") : t("characterSheet.character.missionCta");
            case "level":
                return done ? t("characterSheet.rooms.level.again") : t("characterSheet.level.cta");
            case "assets":
                return done ? t("characterSheet.inventory.open") : t("characterSheet.inventory.cta");
            case "offer":
                return done ? t("characterSheet.rooms.offer.again") : t("characterSheet.rooms.offer.start");
            default:
                return "";
        }
    };

    const renderRoom = (room: HouseRoom, i: number) => {
        const closed = room.state === "closed";
        const panelId = `cs-room-${room.id}`;
        const isOpen = open.has(room.id);

        if (closed) {
            return (
                <PlaceState
                    key={room.id}
                    as="li"
                    state="closed"
                    className="cs-room"
                    tag={false}
                    scene={<p className="cs-mono cs-room__label">{label(room)}</p>}
                >
                    <p className="cs-room__line">{room.line}</p>
                    <PlaceStateTag state="closed" />
                </PlaceState>
            );
        }

        return (
            <PlaceState key={room.id} as="li" state={room.state} className="cs-room" style={accent(i)} tag={false}>
                <h2 className="cs-room__h">
                    <button
                        type="button"
                        className="cs-room__toggle"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggle(room.id)}
                    >
                        <span className="cs-room__top">
                            <span className="cs-mono cs-room__label">{label(room)}</span>
                            <PlaceStateTag state={room.state} />
                            <span className="cs-room__chev" aria-hidden="true">{isOpen ? "–" : "+"}</span>
                        </span>
                        {summary(room)}
                    </button>
                </h2>
                <div id={panelId} className="cs-room__panel" hidden={!isOpen}>
                    {room.id === "victories" ? (
                        renderShelf()
                    ) : (
                        <>
                            {detail(room)}
                            {room.to && (
                                <Link
                                    className="cs-link"
                                    to={room.state === "done" ? room.to.again : room.to.start}
                                >
                                    <span className="cs-cur" aria-hidden="true">▸</span>
                                    {buttonText(room)} →
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </PlaceState>
        );
    };

    /** The badge shelf: one badge per Journey step, earned ones carry the player's own words. */
    const renderShelf = () => {
        const earned = badges.filter((b) => b.state === "done").length;
        return (
            <>
                <p className="cs-sec__note">
                    {earned > 0 ? t("characterSheet.badges.note") : t("characterSheet.victories.empty")}
                </p>
                <ul className="cs-shelf">
                    {badges.map((b, i) => {
                        const result = badgeResult(b.step, sheet);
                        const choice = sheet.choices[b.step];
                        const earnedBadge = b.state === "done";
                        return (
                            <PlaceState
                                key={b.step}
                                as="li"
                                state={b.state}
                                className="cs-badge"
                                style={accent(i)}
                                tag={false}
                                line={b.state === "closed" ? b.line : undefined}
                                scene={<span className="cs-badge__emblem" aria-hidden="true">◆</span>}
                            >
                                <p className="cs-mono cs-badge__name">
                                    {t(`characterSheet.badges.names.${STEP_KEYS[b.step]}`)}
                                </p>
                                {earnedBadge && result && <p className="cs-badge__result">{result}</p>}
                                {earnedBadge && b.step === "assess-qol" && (
                                    <p className="cs-mono cs-badge__private">{t("characterSheet.level.private")}</p>
                                )}
                                {earnedBadge && choice && (
                                    <p className="cs-badge__choice">{t("characterSheet.badges.chose", { text: choice })}</p>
                                )}
                            </PlaceState>
                        );
                    })}
                </ul>
            </>
        );
    };

    return (
        <div className="cs-inner">
            {/* The character is you: the crystal in your colors, your real face at its heart */}
            <header className="cs-hero">
                <p className="cs-mono">{t("characterSheet.eyebrow")}</p>
                <div className="cs-crystal">
                    <SoulDodecahedron soulColors={crystalColors} size="lg" />
                    {sheet.avatarUrl && (
                        <div
                            className="cs-heart"
                            style={{ "--heart-glow": crystalColors[0] } as CSSProperties}
                        >
                            <img src={sheet.avatarUrl} alt={name} decoding="async" />
                        </div>
                    )}
                </div>
                {sheet.userId && !sheet.avatarUrl && (
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
                )}
                <h1 className="cs-name">{name}</h1>
            </header>

            <ol className="cs-rooms">{rooms.map(renderRoom)}</ol>
        </div>
    );
};

const ProfileOverviewContent = () => {
    const { t } = useTranslation();
    const sheet = useCharacterSheet();

    // Fonts are scoped to this page, as on the title screen.
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = FONTS_HREF;
        document.head.appendChild(link);
        return () => link.remove();
    }, []);

    return (
        <div className="cs-root">
            <div className="cs-scene" aria-hidden="true">
                <img className="scene-art" src={SCENE_SRC} alt="" decoding="async" />
            </div>
            <div className="cs-grain" aria-hidden="true" />
            {sheet.isLoading ? (
                <div className="cs-inner">
                    <p className="cs-mono" aria-live="polite">{t("profileOverview.loading")}</p>
                </div>
            ) : (
                // Mounted once the save has loaded, so the open rooms start from the real state.
                <HouseSheet sheet={sheet} />
            )}
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
