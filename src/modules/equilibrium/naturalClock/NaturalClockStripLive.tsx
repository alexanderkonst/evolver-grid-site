import { useCallback, useState } from "react";
import { BirthdayPrompt } from "../components/BirthdayPrompt";
import { NaturalClockStrip } from "./NaturalClockStrip";
import { NaturalClockDialog } from "./NaturalClockDialog";
import { useNaturalClock } from "./useNaturalClock";
import { useNaturalSky } from "./useNaturalSky";
import { useStoredBirthday } from "./useStoredBirthday";

/**
 * The live strip: clock + the player's birthday + the full face on tap + the
 * sky following the light. Only ever loaded through `NaturalClockStripGate`.
 */
export const NaturalClockStripLive = ({ className }: { className?: string }) => {
  const { userId, birthday, loading, refresh } = useStoredBirthday();
  const { clock, locationStatus, requestLocation } = useNaturalClock(birthday);
  const [open, setOpen] = useState(false);
  const [askingBirthday, setAskingBirthday] = useState(false);

  useNaturalSky(clock.sky, true);

  const closeFace = useCallback(() => setOpen(false), []);
  const openBirthday = useCallback(() => {
    setOpen(false);
    setAskingBirthday(true);
  }, []);

  return (
    <>
      <NaturalClockStrip
        clock={clock}
        onOpen={() => setOpen(true)}
        // Signed-out players have nowhere to save a birthday; the chip opens the face.
        onAskBirthday={userId ? openBirthday : undefined}
        className={className}
      />
      {open && (
        <NaturalClockDialog
          clock={clock}
          locationStatus={locationStatus}
          onRequestLocation={requestLocation}
          onAskBirthday={userId ? openBirthday : undefined}
          onClose={closeFace}
        />
      )}
      {askingBirthday && (
        <BirthdayPrompt
          birthday={birthday}
          loading={loading}
          userId={userId}
          onSaved={() => {
            setAskingBirthday(false);
            refresh();
          }}
          onDismiss={() => setAskingBirthday(false)}
        />
      )}
    </>
  );
};

export default NaturalClockStripLive;
