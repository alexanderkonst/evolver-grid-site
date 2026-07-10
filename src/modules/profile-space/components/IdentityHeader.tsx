import { useTranslation } from "react-i18next";
import { formatDate } from "@/i18n/format";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import type { ProfileIdentity, ZogSnapshotLite } from "@/modules/profile-space/types";
import { cormorantTitle, legibleHeadlineHalo, legibleItalicEcho } from "./styles";

interface IdentityHeaderProps {
    identity: ProfileIdentity | null;
    zogLatest: ZogSnapshotLite | null;
}

const IdentityHeader = ({ identity, zogLatest }: IdentityHeaderProps) => {
    const { t } = useTranslation();

    const fullName = [identity?.firstName, identity?.lastName].filter(Boolean).join(" ").trim();
    const displayName = fullName || t("profileSpace.identity.nameFallback");
    const initial = (identity?.firstName?.[0] || identity?.lastName?.[0] || "?").toUpperCase();

    return (
        <header className="text-center mb-6">
            <div className="flex justify-center mb-4">
                {identity?.avatarUrl ? (
                    <img
                        src={identity.avatarUrl}
                        alt={displayName}
                        className="w-20 h-20 rounded-full object-cover"
                        style={{ border: "1.5px solid rgba(212, 175, 55, 0.55)" }}
                    />
                ) : (
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                            background: "rgba(212, 175, 55, 0.12)",
                            border: "1.5px solid rgba(212, 175, 55, 0.55)",
                        }}
                    >
                        <span
                            style={{
                                ...cormorantTitle,
                                fontSize: "28px",
                                fontWeight: 700,
                            }}
                        >
                            {initial}
                        </span>
                    </div>
                )}
            </div>

            <h1
                className="text-3xl sm:text-4xl leading-[1.1] tracking-[-0.018em]"
                style={{ ...cormorantTitle, fontWeight: 700, textShadow: legibleHeadlineHalo }}
            >
                {displayName}
            </h1>

            {zogLatest?.archetypeTitle && (
                <p
                    className="mt-2 bg-clip-text text-transparent inline-block"
                    style={{ ...GOLD_TEXT_STYLE, fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 600 }}
                >
                    {zogLatest.archetypeTitle}
                </p>
            )}

            {identity?.memberSince && (
                <p className="italic mt-1" style={{ ...legibleItalicEcho, fontSize: "13px" }}>
                    {t("profileSpace.identity.memberSince", {
                        date: formatDate(identity.memberSince, { month: "long", day: "numeric", year: "numeric" }),
                    })}
                </p>
            )}

            <Ornament className="mt-5" />
        </header>
    );
};

export default IdentityHeader;
