import { useTranslation } from "react-i18next";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { stallParts, STALL_SHELF_MAX } from "@/lib/myStall";
import "./MyStall.css";

/**
 * MyStall (WP-12): the player's own stall at the top of the Market.
 * Design: docs/02-strategy/game_of_being_you.md §14.12.
 *
 * Every part is read from the Character Sheet; nothing is typed twice, nothing is written.
 * A part without data is a faint outline in the closed-state tokens: no words about it.
 * Public visibility for other players is not built here; the header line is copy only.
 */

const MyStall = () => {
    const { t } = useTranslation();
    const sheet = useCharacterSheet();

    // A guest never reaches the Market (RequireAuth); an unloaded sheet draws nothing yet.
    if (sheet.isLoading || !sheet.userId) return null;

    const stall = stallParts(sheet);

    return (
        <section className="ms" data-open={stall.open ? "true" : "false"} aria-label={t("market.stall.label")}>
            <p className="ms__header">{stall.open ? t("market.stall.headerOpen") : t("market.stall.headerPrivate")}</p>

            <div className="ms__stall">
                <div className={`ms__banner${stall.banner ? "" : " ms__faint"}`} aria-hidden={stall.banner ? undefined : true}>
                    {stall.banner && (
                        <>
                            <span className="ms__cap">{t("market.stall.banner")}</span>
                            <span className="ms__banner-line">{stall.banner}</span>
                        </>
                    )}
                </div>

                <div className={`ms__name${stall.name ? "" : " ms__faint"}`} aria-hidden={stall.name ? undefined : true}>
                    {stall.name && (
                        <>
                            <span className="ms__cap">{t("market.stall.name")}</span>
                            <h2 className="ms__name-line">{stall.name}</h2>
                        </>
                    )}
                </div>

                <div className="ms__frame">
                    <div className={`ms__post${stall.post ? "" : " ms__faint"}`} aria-hidden={stall.post ? undefined : true}>
                        {stall.post && (
                            <>
                                <span className="ms__cap">{t("market.stall.post")}</span>
                                <span className="ms__post-line">{stall.post}</span>
                            </>
                        )}
                    </div>

                    <div className="ms__shelf">
                        {stall.shelves.length > 0 && <span className="ms__cap">{t("market.stall.shelves")}</span>}
                        <ul className="ms__objects">
                            {Array.from({ length: STALL_SHELF_MAX }, (_, i) => {
                                const title = stall.shelves[i];
                                return title ? (
                                    <li key={i} className="ms__object">
                                        {title}
                                    </li>
                                ) : (
                                    <li key={i} className="ms__object ms__faint" aria-hidden="true" />
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <div
                    className={`ms__signboard${stall.signboard ? "" : " ms__faint"}`}
                    aria-hidden={stall.signboard ? undefined : true}
                >
                    {stall.signboard && (
                        <>
                            <span className="ms__cap">{t("market.stall.signboard")}</span>
                            <span className="ms__signboard-line">{stall.signboard}</span>
                        </>
                    )}
                </div>

                <div
                    className={`ms__lamp${stall.lampLit ? " ms__lamp--lit" : ""}`}
                    role="img"
                    aria-label={stall.lampLit ? t("market.stall.lampLit") : t("market.stall.lampUnlit")}
                />
            </div>
        </section>
    );
};

export default MyStall;
