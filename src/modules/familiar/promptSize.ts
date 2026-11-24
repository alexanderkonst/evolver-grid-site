/**
 * «About N words» for the hand-over: a size the player can feel, not a count to the character.
 * English prose runs about six characters a word with the space; the number is rounded so it
 * does not pretend to be exact (tens under a thousand, hundreds above).
 */
const CHARS_PER_WORD = 6;

export const approxWords = (chars: number): number => {
  const words = Math.max(0, chars) / CHARS_PER_WORD;
  const step = words >= 1000 ? 100 : 10;
  return Math.max(step, Math.round(words / step) * step);
};
