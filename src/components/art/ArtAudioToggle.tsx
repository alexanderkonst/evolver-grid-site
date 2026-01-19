import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

const SOUNDCLOUD_TRACK_URL = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/275657185&color=%2374747c&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false";

const ArtAudioToggle = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [widget, setWidget] = useState<any>(null);

  useEffect(() => {
    // Load SoundCloud Widget API
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (iframeRef.current && (window as any).SC) {
        const scWidget = (window as any).SC.Widget(iframeRef.current);
        setWidget(scWidget);

        scWidget.bind((window as any).SC.Widget.Events.FINISH, () => {
          setIsPlaying(false);
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const toggleAudio = () => {
    if (widget) {
      if (isPlaying) {
        widget.pause();
      } else {
        widget.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {/* Hidden SoundCloud iframe */}
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

      {/* Audio Toggle Button */}
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
    </>
  );
};

export default ArtAudioToggle;
