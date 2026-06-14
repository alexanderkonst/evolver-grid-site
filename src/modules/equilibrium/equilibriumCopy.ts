/**
 * Canonical Equilibrium section info-popover copy.
 *
 * Single source of truth shared by EquilibriumV2Page (legacy liquid-glass)
 * and EquilibriumMDLSPage (Stage-8 matte-polymer). Extracted 2026-06-13
 * during the MDLS-default parity pass: the two pages had drifted (MDLS
 * carried short paraphrases or no info copy at all), which violated
 * Sasha's "exact copy is canonical / quote verbatim" rule. Both pages now
 * reference these constants, so the copy can never silently diverge again.
 *
 * Strings are verbatim from the V2 page as locked 2026-05-19. Edit HERE
 * and both surfaces update together.
 */
export const EQ_INFO_COPY = {
  mission:
    "One sentence at life scale — the chosen direction your action keeps taking. WHAT you're devoted to · BY WHAT MEANS · TOWARD WHAT. Example: 'Help humanity evolve into a consciously coordinated civilization by awakening individual genius, integrating consciousness with technology, and architecting systems that transform human potential into coherent collective flourishing.'",
  role:
    "One sentence — your current Top Talent in plain words. Rarely changes. Synced from Top Talent Discovery. The 'how I show up' that the Lifelong Dedication points through.",
  strategies:
    "The 1–3 directions translating your Lifelong Dedication into action. One sentence each, action verb first. Set when you have clarity.",
  workstreams:
    "The streams of work the strategies open. Up to 7. Drag to reorder. Capture during the Seeing phase (First Quarter) when the 'how' becomes obvious — write it down before clarity drifts.",
  goals:
    "The concrete moves under each workstream. Up to 7 per stream. Drag to reorder. Press DO NOW on a task to promote it into your active focus.",
  doNow:
    "The chosen action — everything above collapses into one move. Up to 3 tasks, ONE recommended. Promote tasks here with the DO NOW button on a workstream task. Check the box to complete; it cascades back to the workstream's done-pile.",
  harvest:
    "What you've reaped. A running celebration of completed tasks across all workstreams, grouped by day. Each entry shows the workstream it came from, how long it was in focus, and when you completed it. Hover the check to restore a task if you closed it by accident.",
} as const;
