import starImage from "@/assets/mc-glow-star.png";

/**
 * The art of the player's artifacts. The Star of Uniqueness is the pointed star the site
 * already uses (`mc-glow-star.png`, the six-pointed star with the light cube at its heart, the
 * Transition Quiz's stage marker). Its sibling `mc-cross-star.png` is the four-pointed
 * separator on the Men's Circle page; swapping the import below swaps the artifact everywhere.
 */
export const STAR_OF_UNIQUENESS_IMAGE = starImage;

export const StarOfUniqueness = ({ className, alt = "" }: { className?: string; alt?: string }) => (
  <img className={className} src={STAR_OF_UNIQUENESS_IMAGE} alt={alt} decoding="async" draggable={false} />
);
