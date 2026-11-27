import { useSkin } from "@/contexts/SkinContext";
import { appIconSrc, type AppIconId } from "@/lib/appIcons";

interface AppIconProps {
  app: AppIconId;
  /** Side in CSS px. The 128 file serves up to 64 px at 2x; larger sizes take the 1024 file. */
  size?: number;
  className?: string;
}

/**
 * One app icon (v6, issue #559), picked by the active skin, lunar when the skin has none.
 * The PNGs are square: the rounded-square mask is CSS, no frame, no dial. Decorative (alt=""):
 * the app's name is always written beside it.
 */
const AppIcon = ({ app, size = 56, className = "" }: AppIconProps) => {
  const { skin } = useSkin();
  return (
    <img
      src={appIconSrc(app, skin, size > 64 ? 1024 : 128)}
      srcSet={`${appIconSrc(app, skin, 128)} 128w, ${appIconSrc(app, skin, 1024)} 1024w`}
      sizes={`${size}px`}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      decoding="async"
      data-app-icon={app}
      className={`flex-shrink-0 ${className}`.trim()}
      style={{ width: size, height: size, borderRadius: "22%", objectFit: "cover" }}
    />
  );
};

export default AppIcon;
