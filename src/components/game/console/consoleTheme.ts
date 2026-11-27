/** The instrument's design tokens, as the Console uses them (same values as YourAiInstrument.tsx). */
export const ACCENT = "#bcd7e6";
export const INK = "#e8eef2";
export const MUTED = "#9fb2bd";
export const PANEL = "#0b0e13";
export const RAISED = "#121820";
export const HAIRLINE = "rgba(188,215,230,0.18)";
export const SERIF = "'Cormorant Garamond', serif";

export const PILL =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]";

/** Small-caps subheadings in a card: the accent tone, solid (no opacity), so they read on the raised card at AA or better. */
export const SUBHEAD = ACCENT;

const channel = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};
/** WCAG 2.x contrast ratio of two opaque #rrggbb colours. */
export const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
