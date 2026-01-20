import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";

const SOUNDCLOUD_TRACK_URL = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/275657185&color=%2374747c&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false";

interface ArtAudioContextType {
    isPlaying: boolean;
    toggleAudio: () => void;
}

const ArtAudioContext = createContext<ArtAudioContextType | null>(null);

export const useArtAudio = () => {
    const ctx = useContext(ArtAudioContext);
    if (!ctx) throw new Error("useArtAudio must be used within ArtAudioProvider");
    return ctx;
};

/**
 * Persistent audio provider that wraps all art routes.
 * The SoundCloud iframe lives at this level so it persists across page navigations.
 */
export const ArtAudioProvider = ({ children }: { children: ReactNode }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const widgetRef = useRef<any>(null);
    const [widgetReady, setWidgetReady] = useState(false);

    useEffect(() => {
        // Load SoundCloud Widget API
        const existingScript = document.querySelector('script[src="https://w.soundcloud.com/player/api.js"]');
        if (existingScript) {
            // Script already loaded - just init widget
            if ((window as any).SC && iframeRef.current) {
                const scWidget = (window as any).SC.Widget(iframeRef.current);
                widgetRef.current = scWidget;
                scWidget.bind((window as any).SC.Widget.Events.READY, () => {
                    setWidgetReady(true);
                });
                scWidget.bind((window as any).SC.Widget.Events.FINISH, () => {
                    setIsPlaying(false);
                });
            }
            return;
        }

        const script = document.createElement("script");
        script.src = "https://w.soundcloud.com/player/api.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (iframeRef.current && (window as any).SC) {
                const scWidget = (window as any).SC.Widget(iframeRef.current);
                widgetRef.current = scWidget;

                scWidget.bind((window as any).SC.Widget.Events.READY, () => {
                    setWidgetReady(true);
                });
                scWidget.bind((window as any).SC.Widget.Events.FINISH, () => {
                    setIsPlaying(false);
                });
            }
        };

        // Don't remove the script on unmount - we want it to persist
    }, []);

    const toggleAudio = () => {
        if (widgetRef.current && widgetReady) {
            if (isPlaying) {
                widgetRef.current.pause();
            } else {
                widgetRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <ArtAudioContext.Provider value={{ isPlaying, toggleAudio }}>
            {/* Hidden SoundCloud iframe - lives at provider level to persist */}
            <iframe
                ref={iframeRef}
                width="0"
                height="0"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={SOUNDCLOUD_TRACK_URL}
                className="hidden"
                title="Background Music"
            />
            {children}
        </ArtAudioContext.Provider>
    );
};

/**
 * Audio toggle button to use on art pages.
 * Uses the shared context so state persists across navigation.
 */
export const ArtAudioButton = () => {
    const { isPlaying, toggleAudio } = useArtAudio();

    return (
        <button
            onClick={toggleAudio}
            className="fixed top-6 right-6 md:top-8 md:right-8 text-[hsl(210,70%,15%)] hover:opacity-60 transition-opacity p-2 z-50"
            aria-label={isPlaying ? "Mute audio" : "Play audio"}
        >
            {isPlaying ? (
                <Volume2 className="w-6 h-6" strokeWidth={1.5} />
            ) : (
                <VolumeX className="w-6 h-6" strokeWidth={1.5} />
            )}
        </button>
    );
};
