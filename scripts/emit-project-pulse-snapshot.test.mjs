import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readPulseEvents } from "./emit-project-pulse-snapshot.mjs";

describe("Project Pulse snapshot emitter", () => {
  it("parses both full cards and compact list-style YAML events", () => {
    const markdown = `## Log

\`\`\`yaml
date: 2026-07-10
title: Full card
what_happened: A full event happened.
\`\`\`

\`\`\`yaml
- date: 2026-07-15
  pulse: compact_event_slug
  what_happened: >
    A compact event happened and must not disappear.
  next_action: Follow through.
\`\`\`
`;

    expect(readPulseEvents(markdown)).toEqual([
      expect.objectContaining({ date: "2026-07-10", title: "Full card" }),
      expect.objectContaining({
        date: "2026-07-15",
        title: "compact_event_slug",
        what_happened: "A compact event happened and must not disappear.",
      }),
    ]);
  });

  it("keeps the current compact offer movements in the generated corpus", () => {
    const markdown = readFileSync("docs/09-logs/project_pulse_log.md", "utf8");
    const events = readPulseEvents(markdown);

    expect(events.some((event) => event.title === "patricia_555_proposal_sent_omtm_plus_one")).toBe(true);
    expect(events.some((event) => event.title === "warm_base_batch_complete_25_sent")).toBe(true);
  });
});
