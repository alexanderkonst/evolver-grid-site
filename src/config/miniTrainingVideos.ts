/**
 * Mini-training videos: one optional YouTube id per micro-module (issue #392).
 *
 * Paste the 11-character id (the part after `v=`) next to the micro-module number.
 * While an id is empty the page shows nothing for that slot: no frame, no broken embed.
 * AI as a Mirror: NotebookLM Explainer videos, unlisted on Integral Evolution (2026-11-23).
 */
export const MINI_TRAINING_VIDEOS: Record<string, Record<number, string>> = {
  "ai-as-a-mirror": {
    1: "MsoVQX1z2D4",
    2: "I3MdPxcwk4U",
    3: "CSBlpTAdTGM",
    4: "92Wefc6zDUA",
    5: "sp4FwH1e6S4",
    6: "0Sxnu65XA9E",
    7: "lijw7X_w-_g",
    8: "SD4a3t9lYJE",
  },
  // AI That Knows You: no videos yet (texts await Sasha's signature).
  "ai-that-knows-you": {},
};
