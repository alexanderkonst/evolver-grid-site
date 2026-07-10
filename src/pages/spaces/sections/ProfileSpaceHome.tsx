import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import GameShellV2 from "@/components/game/GameShellV2";
import { Ornament } from "@/lib/landingDesign";
import { useProfileSpaceData } from "@/modules/profile-space/useProfileSpaceData";
import { buildHistoryEvents } from "@/modules/profile-space/changeLines";
import IdentityHeader from "@/modules/profile-space/components/IdentityHeader";
import TopTalentCard from "@/modules/profile-space/components/TopTalentCard";
import MissionCard from "@/modules/profile-space/components/MissionCard";
import AssetsCard from "@/modules/profile-space/components/AssetsCard";
import QolCard from "@/modules/profile-space/components/QolCard";
import CollaborationCard from "@/modules/profile-space/components/CollaborationCard";
import HistoryTimeline from "@/modules/profile-space/components/HistoryTimeline";
import LinkedInBlock from "@/modules/profile-space/components/LinkedInBlock";
import ExportBlock from "@/modules/profile-space/components/ExportBlock";
import { sourceSerifBody } from "@/modules/profile-space/components/styles";

/**
 * ProfileSpaceHome — ME → Profile (`/game/me/profile`, Day 119 spec:
 * docs/specs/profile-space/sow_and_dods.md). Built from scratch per
 * Sasha's brief — no composition reused from ProfileOverview.tsx,
 * Profile.tsx, or CharacterHub.tsx. MeGate is applied at the route
 * level by the caller; this page only renders content inside the
 * standard GameShellV2 shell, matching the ME-space subpage
 * convention (ProfileMissionSection.tsx / ProfileAssetsSection.tsx).
 */
const ProfileSpaceHomeContent = () => {
    const { t } = useTranslation();
    const data = useProfileSpaceData();
    const [linkedinPdfPath, setLinkedinPdfPath] = useState<string | null>(null);

    useEffect(() => {
        setLinkedinPdfPath(data.identity?.linkedinPdfUrl ?? null);
    }, [data.identity?.linkedinPdfUrl]);

    if (data.loading) {
        return (
            <div className="max-w-2xl mx-auto px-5 py-16 text-center">
                <p className="italic" style={{ ...sourceSerifBody, fontStyle: "italic", fontSize: "14px" }}>
                    {t("profileSpace.loading")}
                </p>
            </div>
        );
    }

    if (data.error) {
        return (
            <div className="max-w-2xl mx-auto px-5 py-16 text-center">
                <p className="italic" style={{ ...sourceSerifBody, fontStyle: "italic", fontSize: "14px" }}>
                    {t("profileSpace.errorLine")}
                </p>
            </div>
        );
    }

    const historyEvents = buildHistoryEvents(data);

    return (
        <div className="max-w-2xl mx-auto px-5 py-10 sm:py-12 space-y-5">
            <IdentityHeader identity={data.identity} zogLatest={data.zogLatest} />
            <Ornament className="mb-2" />

            <TopTalentCard zog={data.zogLatest} />
            <MissionCard mission={data.mission} />
            <AssetsCard assets={data.assets} />
            <QolCard qol={data.qolLatest} />
            <CollaborationCard requests={data.requests} />
            <HistoryTimeline events={historyEvents} />
            <LinkedInBlock
                userId={data.identity?.userId ?? null}
                pdfPath={linkedinPdfPath}
                onChange={(path) => {
                    setLinkedinPdfPath(path);
                    void data.reload();
                }}
            />
            <ExportBlock />
        </div>
    );
};

const ProfileSpaceHome = () => (
    <GameShellV2 hideLogo>
        <ProfileSpaceHomeContent />
    </GameShellV2>
);

export default ProfileSpaceHome;
