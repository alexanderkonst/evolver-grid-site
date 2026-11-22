import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({}),
    functions: { invoke: async () => ({ data: null, error: null }) },
  },
}));

import AiAsAMirrorPage from "../AiAsAMirrorPage";

const render = (url: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <AiAsAMirrorPage />
    </MemoryRouter>,
  );

describe("AiAsAMirrorPage", () => {
  const html = render("/mini-trainings/ai-as-a-mirror?demo=1");

  it("renders all 8 micro-module cards (9 buttons: module 7 has two)", () => {
    for (let i = 1; i <= 8; i += 1) expect(html).toContain(`data-testid="mirror-module-${i}"`);
    expect(html.match(/data-testid="prompt-card-/g)).toHaveLength(9);
  });

  it("drops the label lines for the demo profile's empty fields", () => {
    expect(html).toContain("My top talents:");
    expect(html).not.toContain("What I do best"); // no mastery action in the demo profile
    expect(html).not.toContain("My weakest life area now"); // tie: left out
  });

  it("gives every card the four controls (the microphone only where the browser supports it)", () => {
    for (const key of ["1", "2", "3", "4", "5", "6", "7a", "7b", "8"]) {
      expect(html).toContain(`data-testid="prompt-send-${key}"`);
      expect(html).toContain(`data-testid="prompt-edit-${key}"`);
      expect(html).toContain(`data-testid="prompt-copy-${key}"`);
    }
  });

  it("marks the AI call as a stub", () => {
    expect(html).toContain('data-testid="stub-banner"');
  });

  it("holds #6 and the second #7 button back until their inputs exist", () => {
    expect(html).toContain("Tap a line above first.");
    expect(html).toContain("Send the first button first, then this one.");
  });

  it("never shows a stand-in or a raw placeholder", () => {
    expect(html).not.toMatch(/undefined|\{first_name\}|\{mission\}|\[object/);
  });
});
