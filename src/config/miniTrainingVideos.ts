/**
 * Mini-training videos: one optional YouTube id per micro-module (issue #392).
 *
 * Paste the 11-character id (the part after `v=`) next to the micro-module number.
 * While an id is empty the page shows nothing for that slot: no frame, no broken embed.
 * No video is produced until Sasha says yes (spec, status line).
 */
export const MINI_TRAINING_VIDEOS: Record<string, Record<number, string>> = {
  "ai-as-a-mirror": {
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
  },
};
