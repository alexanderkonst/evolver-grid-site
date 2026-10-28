import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useVillagePresencePrefs } from "@/hooks/useVillagePresence";

/**
 * VillagePresenceSettings — the two switches for multiplayer presence (WP-21).
 *
 * «Show me in the village» is on by default for everyone (a guest's switch is kept in
 * this browser). «Show my first name in the village» is off by default and needs an
 * account. Nothing else about a player is ever shown. Design:
 * docs/02-strategy/game_of_being_you.md §15.2.
 */

const VillagePresenceSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const prefs = useVillagePresencePrefs();

  const failed = () =>
    toast({
      title: t("settings.couldntSaveTitle"),
      description: t("settings.tryAgain"),
      variant: "destructive",
    });

  const onPresence = async (next: boolean) => {
    if (!(await prefs.setPresenceOn(next))) failed();
  };
  const onName = async (next: boolean) => {
    if (!(await prefs.setShowName(next))) failed();
  };

  const row = "flex items-center justify-between gap-4 rounded-xl p-4";
  const rowStyle = {
    background: "rgba(212, 175, 55, 0.06)",
    border: "0.5px solid rgba(212, 175, 55, 0.30)",
  };
  const labelStyle = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    fontSize: "15px",
    color: "var(--skin-text-primary, #0a1628)",
  };
  const hintStyle = {
    fontFamily: "'Source Serif 4', Georgia, serif",
    color: "var(--skin-text-muted, rgba(26,30,58,0.65))",
  };

  return (
    <div
      className="mt-6 rounded-2xl p-5 sm:p-6 space-y-4"
      style={{
        background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
        border: "1px solid var(--skin-hairline, hsla(228, 30%, 18%, 0.10))",
      }}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(40 70% 45%)" }} aria-hidden="true" />
        <div>
          <h2
            className="text-xl leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              color: "var(--skin-text-primary, #0a1628)",
            }}
          >
            {t("villagePresence.heading")}
          </h2>
          <p className="text-sm mt-1 leading-relaxed" style={hintStyle}>
            {t("villagePresence.description")}
          </p>
        </div>
      </div>

      <div className={row} style={rowStyle}>
        <div className="min-w-0">
          <p style={labelStyle}>{t("villagePresence.showMeLabel")}</p>
          <p className="text-xs mt-1 leading-relaxed" style={hintStyle}>
            {t("villagePresence.showMeHint")}
          </p>
        </div>
        <Switch
          checked={prefs.presenceOn}
          onCheckedChange={onPresence}
          disabled={!prefs.ready}
          aria-label={t("villagePresence.showMeAriaLabel")}
        />
      </div>

      <div className={row} style={rowStyle}>
        <div className="min-w-0">
          <p style={labelStyle}>{t("villagePresence.showNameLabel")}</p>
          <p className="text-xs mt-1 leading-relaxed" style={hintStyle}>
            {prefs.ready && !prefs.signedIn
              ? t("villagePresence.showNameSignInHint")
              : t("villagePresence.showNameHint")}
          </p>
        </div>
        <Switch
          checked={prefs.showName}
          onCheckedChange={onName}
          disabled={!prefs.ready || !prefs.signedIn}
          aria-label={t("villagePresence.showNameAriaLabel")}
        />
      </div>
    </div>
  );
};

export default VillagePresenceSettings;
