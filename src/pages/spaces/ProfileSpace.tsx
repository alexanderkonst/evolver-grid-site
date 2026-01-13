import ErrorBoundary from "@/components/ErrorBoundary";
import GameShellV2 from "@/components/game/GameShellV2";
import { ProfileOverviewContent } from "@/pages/spaces/sections/ProfileOverview";

const ProfileSpace = () => {
    return (
        <ErrorBoundary>
            <GameShellV2>
                <ProfileOverviewContent />
            </GameShellV2>
        </ErrorBoundary>
    );
};

export default ProfileSpace;
