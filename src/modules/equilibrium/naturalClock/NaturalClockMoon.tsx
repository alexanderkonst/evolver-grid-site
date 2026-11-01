import { moonLitPath } from "./moonShape";

interface NaturalClockMoonProps {
  /** Lit share of the disc, 0…1. */
  fraction: number;
  waxing: boolean;
  size?: number;
  className?: string;
}

/** Ink, teal and type of the Moon-world canon. */
export const CLOCK_INK = "#e6ebf2";
export const CLOCK_TEAL = "#5ec8bd";
export const CLOCK_SERIF = "'Cormorant Garamond', 'EB Garamond', Georgia, serif";
export const CLOCK_MONO = "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace";

/**
 * The moon as a silhouette: a dim disc with the lit part drawn on it from the
 * real illuminated fraction. No emoji, no photo.
 */
export const NaturalClockMoon = ({ fraction, waxing, size = 16, className }: NaturalClockMoonProps) => {
  const lit = moonLitPath(fraction, waxing, 46, 50, 50);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="50" cy="50" r="46" fill="rgba(230,235,242,0.10)" stroke="rgba(230,235,242,0.4)" strokeWidth="5" />
      {lit && <path d={lit} fill={CLOCK_INK} />}
    </svg>
  );
};

export default NaturalClockMoon;
