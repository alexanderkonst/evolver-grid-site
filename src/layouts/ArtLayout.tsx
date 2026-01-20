import { Outlet } from "react-router-dom";
import { ArtAudioProvider, ArtAudioButton } from "@/components/art/ArtAudioContext";

/**
 * Layout wrapper for all /art routes.
 * Provides persistent audio playback across art subpages.
 */
const ArtLayout = () => {
    return (
        <ArtAudioProvider>
            <ArtAudioButton />
            <Outlet />
        </ArtAudioProvider>
    );
};

export default ArtLayout;
