import BiologicClock from "@/components/game/BiologicClock";
import MoonFocusLine from "@/components/game/MoonFocusLine";

/**
 * The clock in the character sheet header: the same BiologicClock as the village watch, with the
 * player's Moon Focus under the Moon block (view 2 onward) and its own remembered view.
 */
export const ProfileClock = ({ className }: { className?: string }) => (
  <BiologicClock className={className} place="profile">
    <MoonFocusLine redirect="/game/me/overview" />
  </BiologicClock>
);

export default ProfileClock;
