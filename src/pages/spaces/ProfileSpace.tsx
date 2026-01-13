import ProfileOverview from "@/pages/spaces/sections/ProfileOverview";
import ErrorBoundary from "@/components/ErrorBoundary";

const ProfileSpace = () => {
    return (
        <ErrorBoundary>
            <ProfileOverview />
        </ErrorBoundary>
    );
};

export default ProfileSpace;
