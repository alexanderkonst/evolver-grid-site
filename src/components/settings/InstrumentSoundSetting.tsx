import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { instrumentSound } from "@/lib/instrument/sound";

/**
 * InstrumentSoundSetting — the one mute for the navigation instrument's sound
 * (docs/specs/navigation-instrument/architecture.md §5.4). On by default and quiet; switching it off is
 * remembered in this browser (`SOUND_MUTED_KEY`). The switch is the player's own gesture, so turning
 * the sound back on lets it play at once.
 */
const InstrumentSoundSetting = () => {
  const { t } = useTranslation();
  const sound = instrumentSound();
  const muted = useSyncExternalStore(sound.subscribe, () => sound.muted, () => false);

  return (
    <div
      className="mt-6 flex items-center justify-between gap-4 rounded-2xl p-5 sm:p-6"
      style={{
        background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
        border: "1px solid var(--skin-hairline, hsla(228, 30%, 18%, 0.10))",
      }}
      data-testid="instrument-sound-setting"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Volume2 className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "var(--select-accent)" }} aria-hidden="true" />
        <div className="min-w-0">
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "15px",
              color: "var(--skin-text-primary, #0a1628)",
            }}
          >
            {t("instrument.sound.label")}
          </p>
          <p
            className="mt-1 text-xs leading-relaxed"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "var(--skin-text-muted, rgba(26,30,58,0.65))" }}
          >
            {t("instrument.sound.hint")}
          </p>
        </div>
      </div>
      <Switch
        checked={!muted}
        onCheckedChange={(on) => {
          // The click is a gesture: tell the sound so a player who turns it on hears the next tone.
          sound.noteGesture();
          sound.setMuted(!on);
        }}
        aria-label={t("instrument.sound.ariaLabel")}
      />
    </div>
  );
};

export default InstrumentSoundSetting;
